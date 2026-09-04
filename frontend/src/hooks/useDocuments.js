import { useState, useEffect, useCallback } from 'react';
import {
  getDocuments,
  uploadDocument as apiUploadDocument,
  deleteDocument as apiDeleteDocument,
  getDocumentDownloadUrl,
} from '@/services/documents';

export function useDocuments(patientId) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(Boolean(patientId));
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    if (!patientId) {
      setDocuments([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: err } = await getDocuments(patientId);
      if (err) {
        setError(err);
      } else {
        setDocuments(data || []);
      }
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const upload = async ({ file, fileName, mimeType }) => {
    if (!patientId) return { data: null, error: new Error('Patient ID missing') };
    const res = await apiUploadDocument({ patientId, file, fileName, mimeType });
    if (!res.error) refresh();
    return res;
  };

  const remove = async (docId, storagePath) => {
    const res = await apiDeleteDocument(docId, storagePath);
    if (!res.error) refresh();
    return res;
  };

  const getDownloadUrl = async (storagePath) => {
    return getDocumentDownloadUrl(storagePath);
  };

  return {
    documents,
    loading,
    error,
    refresh,
    uploadDocument: upload,
    deleteDocument: remove,
    getDownloadUrl,
  };
}
