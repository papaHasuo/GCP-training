import { useRef, useState } from "react";
import { useImageUpload } from "../hooks/useImageUpload";

const MAX_FILE_SIZE = 1048576; // 1MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export default function ImageUpload() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const { uploadFile, loading, error } = useImageUpload();

  const handleFileSelect = async (file: File) => {
    setValidationError(null);

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setValidationError(`File size exceeds 1MB limit (${(file.size / 1024 / 1024).toFixed(2)}MB)`);
      return;
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      setValidationError(`Invalid file type. Allowed: JPG, PNG, WebP`);
      return;
    }

    // Upload file
    setUploadProgress(50);
    const success = await uploadFile(file);
    if (success) {
      setUploadProgress(100);
      setTimeout(() => setUploadProgress(null), 1000);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } else {
      setUploadProgress(null);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  return (
    <div style={styles.container}>
      <h2>Upload Image</h2>

      <div style={styles.dropZone} onDragOver={handleDragOver} onDrop={handleDrop}>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleInputChange}
          disabled={loading}
          style={styles.fileInput}
        />
        <p>Drag and drop your image here, or click to browse</p>
        <small>(Max 1MB, JPG/PNG/WebP)</small>
      </div>

      {uploadProgress !== null && (
        <div style={styles.progressBar}>
          <div
            style={{
              ...styles.progressFill,
              width: `${uploadProgress}%`,
            }}
          />
        </div>
      )}

      {loading && <p style={styles.loading}>Uploading...</p>}

      {validationError && <div style={styles.error}>{validationError}</div>}

      {error && <div style={styles.error}>{error}</div>}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: "20px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    marginBottom: "20px",
  },
  dropZone: {
    border: "2px dashed #ccc",
    borderRadius: "8px",
    padding: "40px",
    textAlign: "center",
    cursor: "pointer",
    transition: "border-color 0.3s",
  },
  fileInput: {
    display: "none",
  },
  progressBar: {
    marginTop: "10px",
    height: "8px",
    backgroundColor: "#eee",
    borderRadius: "4px",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#4CAF50",
    transition: "width 0.3s",
  },
  loading: {
    marginTop: "10px",
    color: "#666",
  },
  error: {
    marginTop: "10px",
    padding: "10px",
    backgroundColor: "#ffebee",
    color: "#c62828",
    borderRadius: "4px",
  },
};
