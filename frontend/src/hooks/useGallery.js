import { useState, useEffect, useCallback } from 'react';
import {
  getGalleryImages,
  uploadGalleryImage as apiUploadGalleryImage,
  deleteGalleryImage as apiDeleteGalleryImage,
  subscribeToGalleryImages,
} from '@/services/gallery';

export function useGallery(patientId) {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(Boolean(patientId));
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    if (!patientId) {
      setImages([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: err } = await getGalleryImages(patientId);
      if (err) {
        setError(err);
      } else {
        setImages(data || []);
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

  useEffect(() => {
    if (!patientId) return undefined;

    const sub = subscribeToGalleryImages(patientId, () => {
      refresh();
    });

    return () => {
      sub.unsubscribe();
    };
  }, [patientId, refresh]);

  const upload = async ({ file, title }) => {
    if (!patientId) return { data: null, error: new Error('Patient ID missing') };
    const res = await apiUploadGalleryImage({ patientId, file, title });
    if (!res.error) refresh();
    return res;
  };

  const remove = async (imageId, storagePath) => {
    const res = await apiDeleteGalleryImage(imageId, storagePath);
    if (!res.error) refresh();
    return res;
  };

  return {
    images,
    loading,
    error,
    refresh,
    uploadImage: upload,
    deleteImage: remove,
  };
}
