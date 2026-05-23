import ImageUpload from "../components/ImageUpload";
import ImageGallery from "../components/ImageGallery";

export default function ImagesPage() {
  return (
    <div style={styles.container}>
      <h1>Image Management</h1>
      <ImageUpload />
      <ImageGallery />
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "20px",
  },
};
