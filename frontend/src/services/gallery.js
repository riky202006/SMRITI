import { supabase, isSupabaseConfigured } from './supabase';

const GALLERY_BUCKET = 'gallery';
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

/**
 * Fetch all gallery images for a patient with signed/public URLs.
 */
export async function getGalleryImages(patientId) {
  if (!isSupabaseConfigured || !patientId) return { data: [], error: null };

  const { data, error } = await supabase
    .from('gallery_images')
    .select('*')
    .eq('patient_id', patientId)
    .order('created_at', { ascending: false });

  if (error || !data) return { data: [], error };

  // Resolve signed URLs for private bucket (or fallback to public URL)
  const imagesWithUrls = await Promise.all(
    data.map(async (img) => {
      let resolvedUrl = img.storage_path;

      if (img.storage_path && !img.storage_path.startsWith('http')) {
        try {
          const { data: signedData, error: signError } = await supabase.storage
            .from(GALLERY_BUCKET)
            .createSignedUrl(img.storage_path, 3600); // 1 hour validity

          if (!signError && signedData?.signedUrl) {
            resolvedUrl = signedData.signedUrl;
          } else {
            const { data: publicData } = supabase.storage
              .from(GALLERY_BUCKET)
              .getPublicUrl(img.storage_path);
            resolvedUrl = publicData?.publicUrl || img.storage_path;
          }
        } catch {
          const { data: publicData } = supabase.storage
            .from(GALLERY_BUCKET)
            .getPublicUrl(img.storage_path);
          resolvedUrl = publicData?.publicUrl || img.storage_path;
        }
      }

      return {
        ...img,
        url: resolvedUrl,
      };
    })
  );

  return { data: imagesWithUrls, error: null };
}

/**
 * Upload a memory photo to Supabase Storage and register in gallery_images table.
 */
export async function uploadGalleryImage({ patientId, file, title }) {
  if (!isSupabaseConfigured || !patientId) {
    return { data: null, error: new Error('Supabase is not configured or patient ID is missing.') };
  }

  if (!file) {
    return { data: null, error: new Error('Please select an image file to upload.') };
  }

  // Validate MIME type
  if (!ALLOWED_MIME_TYPES.includes(file.type.toLowerCase())) {
    return {
      data: null,
      error: new Error('Invalid file format. Please upload JPG, JPEG, PNG, or WEBP images only.'),
    };
  }

  // Validate File Size
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      data: null,
      error: new Error('Image size exceeds 5MB limit. Please choose a smaller photo.'),
    };
  }

  // Generate safe storage path: <patient_uuid>/<timestamp>_<clean_filename>
  const fileExt = file.name.split('.').pop() || 'jpg';
  const cleanBaseName = file.name.replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 30);
  const storagePath = `${patientId}/${Date.now()}_${cleanBaseName}.${fileExt}`;
  const displayName = title?.trim() || file.name.replace(/\.[^/.]+$/, '');

  // 1. Upload to storage bucket
  const { error: storageError } = await supabase.storage
    .from(GALLERY_BUCKET)
    .upload(storagePath, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type,
    });

  if (storageError) {
    // If bucket doesn't exist or permission denied
    if (storageError.message?.includes('Bucket not found') || storageError.statusCode === '404') {
      return {
        data: null,
        error: new Error(`Storage bucket "${GALLERY_BUCKET}" does not exist in your Supabase project. Please create the "gallery" bucket in Supabase Storage.`),
      };
    }
    return { data: null, error: storageError };
  }

  // 2. Insert record in gallery_images database table
  const { data, error: dbError } = await supabase
    .from('gallery_images')
    .insert([
      {
        patient_id: patientId,
        file_name: displayName,
        storage_path: storagePath,
      },
    ])
    .select()
    .single();

  if (dbError) {
    // Attempt rollback storage object if database insert fails
    await supabase.storage.from(GALLERY_BUCKET).remove([storagePath]);
    return { data: null, error: dbError };
  }

  return { data, error: null };
}

/**
 * Delete a gallery photo from Storage and Database.
 */
export async function deleteGalleryImage(imageId, storagePath) {
  if (!isSupabaseConfigured || !imageId) return { error: null };

  if (storagePath) {
    try {
      await supabase.storage.from(GALLERY_BUCKET).remove([storagePath]);
    } catch {}
  }

  const { error } = await supabase
    .from('gallery_images')
    .delete()
    .eq('id', imageId);

  return { error };
}

/**
 * Real-time subscription to gallery photos for a patient.
 */
export function subscribeToGalleryImages(patientId, callback) {
  if (!isSupabaseConfigured || !patientId) return { unsubscribe: () => {} };

  const channel = supabase
    .channel(`gallery_images:${patientId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'gallery_images',
        filter: `patient_id=eq.${patientId}`,
      },
      (payload) => callback(payload)
    )
    .subscribe();

  return {
    unsubscribe: () => {
      supabase.removeChannel(channel);
    },
  };
}
