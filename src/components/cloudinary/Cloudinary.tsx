import { useState } from "react";
import axios from "axios";
import styles from "../../pages/Product/Products.module.css";

// Definir el tipo de imagen que contiene url y public_id
export interface ImageData {
  url: string;
  public_id: string;
}

interface UploadImageProps {
    onUpload: (imageData: ImageData) => void;
}

export default function UploadImage({ onUpload }: UploadImageProps) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [isUploading, setIsUploading] = useState<boolean>(false);

  const clearForm = () => {
    setFile(null);
    setPreviewUrl("");
    
    // Limpiar el input file
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }
  };

  const handleUpload = async () => {
    if (!file) return alert("Selecciona una imagen");
    
    setIsUploading(true);
    
    try {
      // Opción 1: Intentar usar el backend primero
      const formData = new FormData();
      formData.append("image", file);

      try {
        const res = await axios.post("http://localhost:3000/api/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        console.log("Respuesta del backend:", res);
        console.log("Data de la respuesta:", res.data);

        let url, public_id;
        
        if (res.data.url && res.data.public_id) {
          url = res.data.url;
          public_id = res.data.public_id;
        } else if (res.data.data && res.data.data.url && res.data.data.public_id) {
          url = res.data.data.url;
          public_id = res.data.data.public_id;
        } else if (res.data.secure_url && res.data.public_id) {
          url = res.data.secure_url;
          public_id = res.data.public_id;
        } else {
          url = res.data.url || res.data.secure_url || res.data.imageUrl;
          public_id = res.data.public_id || res.data.publicId || "unknown";
        }

        if (!url) {
          throw new Error("No se pudo obtener la URL de la imagen desde el servidor");
        }

        setPreviewUrl(url);
        onUpload({ url, public_id });
        
        // Limpiar el formulario después de subir
        clearForm();
        return;

      } catch (backendError) {
        console.warn("Error al subir imagen:", backendError);
      }
    } catch (error) {
      console.error("Error al subir imagen:", error);
      
      if (axios.isAxiosError(error)) {
        console.error("Detalles del error:");
        console.error("- Status:", error.response?.status);
        console.error("- Status Text:", error.response?.statusText);
        console.error("- Response Data:", error.response?.data);
        
        alert(`Error: ${error.response?.data?.error || error.message}`);
      } else {
        alert(`Error al subir imagen: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);

    // Crear vista previa del archivo seleccionado
    if (selectedFile) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreviewUrl(event.target?.result as string);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setPreviewUrl("");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px", alignItems: "center" }}>
      <input 
        type="file" 
        accept="image/*"
        onChange={handleFileChange}
        disabled={isUploading}
        style={{
          padding: "8px",
          borderRadius: "4px",
          border: "1px solid #cca281",
          backgroundColor: "#2a2a35",
          color: "#cca281"
        }}
      />
      <button 
        onClick={handleUpload} 
        disabled={!file || isUploading}
        style={{
          padding: "10px 20px",
          backgroundColor: isUploading ? "#666" : "#cca281",
          color: isUploading ? "#ccc" : "#1D1D27",
          border: "none",
          borderRadius: "6px",
          cursor: isUploading ? "not-allowed" : "pointer",
          fontWeight: "600",
          transition: "all 0.3s ease"
        }}
      >
        {isUploading ? "Subiendo..." : "Subir Imagen"}
      </button>
      {previewUrl && (
        <div style={{ textAlign: "center" }}>
          <p style={{ color: "#cca281", marginBottom: "10px" }}>Vista previa:</p>
          <img 
            src={previewUrl} 
            alt="Vista previa" 
            className={styles.imagePreview}
          />
        </div>
      )}
    </div>
  );
}
