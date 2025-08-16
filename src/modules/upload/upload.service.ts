import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Configurar multer para almacenamiento de archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = 'uploads/profiles/';
    // Crear directorio si no existe
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generar nombre único con timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `profile-${uniqueSuffix}${ext}`);
  }
});

// Filtro para solo permitir imágenes
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos de imagen (JPEG, PNG, GIF)'));
  }
};

// Configuración de multer
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB máximo
  }
});

// Función para eliminar archivo anterior
export const deleteOldProfilePhoto = (photoPath: string) => {
  if (photoPath && fs.existsSync(photoPath)) {
    try {
      fs.unlinkSync(photoPath);
    } catch (error) {
      console.error('Error al eliminar foto anterior:', error);
    }
  }
};

// Función para obtener URL de la foto
export const getPhotoUrl = (filename: string): string => {
  return `/uploads/profiles/${filename}`;
};
