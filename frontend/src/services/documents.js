import { supabase, isSupabaseConfigured } from './supabase';

const DOCUMENTS_BUCKET = 'documents';

// =============================================================================
// 1. SUPABASE CLOUD DOCUMENTS DATA ACCESS LAYER
// =============================================================================

/**
 * Fetch list of medical documents for a patient from database.
 */
export async function getDocuments(patientId) {
  if (!isSupabaseConfigured || !patientId) return { data: [], error: null };

  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('patient_id', patientId)
    .order('created_at', { ascending: false });

  return { data: data || [], error };
}

/**
 * Upload a medical document to Supabase Storage and register in database.
 */
export async function uploadDocument({ patientId, file, fileName, mimeType = 'application/pdf' }) {
  if (!isSupabaseConfigured || !patientId) return { data: null, error: null };

  const cleanFileName = fileName || file.name || `doc_${Date.now()}.pdf`;
  const storagePath = `${patientId}/${Date.now()}_${cleanFileName}`;

  // 1. Upload to Supabase Storage
  const { error: storageError } = await supabase.storage
    .from(DOCUMENTS_BUCKET)
    .upload(storagePath, file, {
      contentType: mimeType,
      cacheControl: '3600',
      upsert: false,
    });

  if (storageError) {
    return { data: null, error: storageError };
  }

  // 2. Insert metadata into documents table
  const { data, error: dbError } = await supabase
    .from('documents')
    .insert([
      {
        patient_id: patientId,
        file_name: cleanFileName,
        storage_path: storagePath,
        mime_type: mimeType,
      },
    ])
    .select()
    .single();

  return { data, error: dbError };
}

/**
 * Create a secure signed download/view URL for a document.
 */
export async function getDocumentDownloadUrl(storagePath, expiresIn = 300) {
  if (!isSupabaseConfigured || !storagePath) return { url: null, error: null };

  const { data, error } = await supabase.storage
    .from(DOCUMENTS_BUCKET)
    .createSignedUrl(storagePath, expiresIn);

  return { url: data?.signedUrl || null, error };
}

/**
 * Delete a document from both storage and database.
 */
export async function deleteDocument(documentId, storagePath) {
  if (!isSupabaseConfigured || !documentId) return { error: null };

  if (storagePath) {
    await supabase.storage.from(DOCUMENTS_BUCKET).remove([storagePath]);
  }

  const { error } = await supabase
    .from('documents')
    .delete()
    .eq('id', documentId);

  return { error };
}

// =============================================================================
// 2. LOCAL INDEXEDDB STORAGE (Fallback / Offline Preservation)
// =============================================================================

const dbPromise = typeof window !== 'undefined' && 'indexedDB' in window
  ? new Promise((resolve, reject) => {
      const request = indexedDB.open('MemoryCareDB', 1);
      request.onupgradeneeded = (e) => {
        e.target.result.createObjectStore('documents');
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    })
  : Promise.resolve(null);

export async function storeDocumentFile(id, fileBlob) {
  const db = await dbPromise;
  if (!db) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('documents', 'readwrite');
    const store = tx.objectStore('documents');
    const req = store.put(fileBlob, id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function deleteDocumentFile(id) {
  const db = await dbPromise;
  if (!db) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('documents', 'readwrite');
    const store = tx.objectStore('documents');
    const req = store.delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function getDocumentFile(id) {
  const db = await dbPromise;
  if (!db) return Promise.resolve(null);
  return new Promise((resolve, reject) => {
    const tx = db.transaction('documents', 'readonly');
    const store = tx.objectStore('documents');
    const req = store.get(id);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
