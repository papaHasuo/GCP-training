import { useEffect } from "react";
import { useImageUpload } from "../hooks/useImageUpload";

export default function ImageGallery() {
  const { uploads, loading, error, fetchUploads, deleteUpload } = useImageUpload();

  useEffect(() => {
    fetchUploads();
  }, []);

  const handleDelete = async (fileId: string, fileName: string) => {
    if (confirm(`Delete "${fileName}"?`)) {
      await deleteUpload(fileId);
    }
  };

  const formatDate = (timestamp: any): string => {
    if (!timestamp) return "Unknown";
    const date = timestamp.toDate?.() || new Date(timestamp);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  const formatSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  if (loading && uploads.length === 0) {
    return <p>Loading images...</p>;
  }

  return (
    <div style={styles.container}>
      <h2>My Images ({uploads.length})</h2>

      {error && <div style={styles.error}>{error}</div>}

      {uploads.length === 0 ? (
        <p style={styles.empty}>No images uploaded yet</p>
      ) : (
        <div style={styles.gallery}>
          {uploads.map((upload) => (
            <div key={upload.fileId} style={styles.card}>
              <div style={styles.imageContainer}>
                <ImagePreview storagePath={upload.storagePath} />
              </div>
              <div style={styles.cardContent}>
                <h4 style={styles.fileName}>{upload.fileName}</h4>
                <p style={styles.meta}>
                  <small>
                    {formatSize(upload.size)} • {formatDate(upload.uploadedAt)}
                  </small>
                </p>
                <button
                  onClick={() => handleDelete(upload.fileId, upload.fileName)}
                  style={styles.deleteBtn}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

interface ImagePreviewProps {
  storagePath: string;
}

function ImagePreview({ storagePath }: ImagePreviewProps) {
  useEffect(() => {
    // Note: For production, generate a signed URL on backend instead
    // to avoid exposing bucket structure. For now, we use a simple approach
    // that relies on Storage Security Rules.
  }, [storagePath]);

  return (
    <div style={styles.imagePlaceholder}>
      <p style={{ color: "#999" }}>📷</p>
      <p style={{ fontSize: "12px", color: "#999" }}>{storagePath.split("/").pop()}</p>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: "20px",
    border: "1px solid #ddd",
    borderRadius: "8px",
  },
  error: {
    padding: "10px",
    backgroundColor: "#ffebee",
    color: "#c62828",
    borderRadius: "4px",
    marginBottom: "10px",
  },
  empty: {
    textAlign: "center",
    color: "#999",
    padding: "40px 20px",
  },
  gallery: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
    gap: "15px",
  },
  card: {
    border: "1px solid #eee",
    borderRadius: "8px",
    overflow: "hidden",
    backgroundColor: "#fafafa",
  },
  imageContainer: {
    width: "100%",
    paddingBottom: "100%",
    position: "relative",
    backgroundColor: "#f0f0f0",
  },
  imagePlaceholder: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
    height: "200px",
    backgroundColor: "#f5f5f5",
  },
  cardContent: {
    padding: "12px",
  },
  fileName: {
    margin: "0 0 8px 0",
    fontSize: "14px",
    whiteSpace: "nowrap" as const,
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  meta: {
    margin: "0 0 10px 0",
    color: "#999",
  },
  deleteBtn: {
    width: "100%",
    padding: "8px",
    backgroundColor: "#f44336",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "12px",
  },
};
