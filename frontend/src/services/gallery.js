import { supabase, isSupabaseConfigured } from './supabase';

const GALLERY_BUCKET = 'gallery';

/**
 * Fetch all gallery images for a patient.
 */
export async function getGalleryImages(patientId) {
  if (!isSupabaseConfigured || !patientId) return { data: [], error: null };

  const { data, error } = await supabase
    .from('gallery_images')
    .select('*')
    .eq('patient_id', patientId)
    .order('created_at', { ascending: false });

  if (error || !data) return { data: [], error };

  // Attach public/signed URLs to image objects
  const imagesWithUrls = data.map((img) => {
    let url = img.storage_path;
    if (img.storage_path && !img.storage_path.startsWith('http')) {
      const { data: publicData } = supabase.storage.from(GALLERY_BUCKET).getPublicUrl(img.storage_path);
      url = publicData?.publicUrl || img.storage_path;
    }
    return {
      ...img,
      url,
    };
  });

  return { data: imagesWithUrls, error: null };
}

/**
 * Upload a new face/memory photo to Supabase Storage and register in database.
 */
export async function uploadGalleryImage({ patientId, file, fileName }) {
  if (!isSupabaseConfigured || !patientId) return { data: null, error: null };

  const cleanFileName = fileName || file.name || `photo_${Date.now()}.jpg`;
  const storagePath = `${patientId}/${Date.now()}_${cleanFileName}`;

  // 1. Upload to storage bucket
  const { error: storageError } = await supabase.storage
    .from(GALLERY_BUCKET)
    .upload(storagePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (storageError) {
    return { data: null, error: storageError };
  }

  // 2. Insert record in gallery_images table
  const { data, error: dbError } = await supabase
    .from('gallery_images')
    .insert([
      {
        patient_id: patientId,
        file_name: cleanFileName,
        storage_path: storagePath,
      },
    ])
    .select()
    .single();

  return { data, error: dbError };
}

/**
 * Delete a gallery photo from storage and database.
 */
export async function deleteGalleryImage(imageId, storagePath) {
  if (!isSupabaseConfigured || !imageId) return { error: null };

  if (storagePath) {
    await supabase.storage.from(GALLERY_BUCKET).remove([storagePath]);
  }

  const { error } = await supabase
    .from('gallery_images')
    .delete()
    .eq('id', imageId);

  return { error };
}
