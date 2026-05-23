import { useState } from "react";
import { getIdToken } from "firebase/auth";
import { auth } from "../firebase";
import { getApiEndpoint } from "../config/apiConfig";

interface Upload {
  fileId: string;
  fileName: string;
  size: number;
  mimeType: string;
  uploadedAt: any;
  storagePath: string;
  signedUrl?: string; // ← 署名付き URL
}

export function useImageUpload() {
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = async (file: File): Promise<boolean> => {
    if (!auth.currentUser) {
      setError("Not authenticated");
      return false;
    }

    setError(null);
    setLoading(true);

    try {
      const token = await getIdToken(auth.currentUser, true);
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(getApiEndpoint("/upload"), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error || `Upload failed: ${response.status}`);
      }

      // Refresh uploads list
      await fetchUploads();
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const fetchUploads = async () => {
    if (!auth.currentUser) {
      return;
    }

    try {
      const token = await getIdToken(auth.currentUser, true);
      const response = await fetch(getApiEndpoint("/my_uploads"), {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch uploads: ${response.status}`);
      }

      const data = (await response.json()) as { uploads: Upload[] };
      setUploads(data.uploads || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
    }
  };

  const deleteUpload = async (fileId: string): Promise<boolean> => {
    if (!auth.currentUser) {
      setError("Not authenticated");
      return false;
    }

    setError(null);
    setLoading(true);

    try {
      const token = await getIdToken(auth.currentUser, true);
      const response = await fetch(getApiEndpoint(`/delete_upload?fileId=${fileId}`), {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error || `Delete failed: ${response.status}`);
      }

      // Refresh uploads list
      await fetchUploads();
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    uploads,
    loading,
    error,
    uploadFile,
    fetchUploads,
    deleteUpload,
    setError,
  };
}
