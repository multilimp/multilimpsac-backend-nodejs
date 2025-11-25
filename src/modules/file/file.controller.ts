import { handleError } from '../../shared/middleware/handleError';
import { Request, Response } from 'express';
import formidable, { File } from 'formidable';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { uploadFile } from './file.service';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const tempUploadDir = path.resolve(__dirname, '../../../uploads/temp');
if (!fs.existsSync(tempUploadDir)) {
  try {
    fs.mkdirSync(tempUploadDir, { recursive: true });
  } catch (mkdirErr) {
    console.error(`CRITICAL: Error al crear directorio temporal ${tempUploadDir}:`, mkdirErr);
  }
}

export const uploadGenericFile = async (req: Request, res: Response) => {
  const form = formidable({
    multiples: false,
    uploadDir: tempUploadDir,
    keepExtensions: true,
    maxFileSize: 10 * 1024 * 1024,
  });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      return handleError({ res, error: err, msg: 'Error procesando el archivo subido durante el parseo' });
    }

    try {
      const fileArray = files.file;
      let file: File | undefined;

      if (Array.isArray(fileArray) && fileArray.length > 0) {
        file = fileArray[0];
      } else if (!Array.isArray(fileArray)) {
        file = fileArray;
      }

      if (!file) {
        return res.status(400).json({ message: 'No se proporcionó ningún archivo en el campo "file".' });
      }

      if (file.size === 0) {
        return res.status(400).json({ message: 'El archivo recibido está vacío.' });
      }

      if (!file.filepath) {
        throw new Error('Formidable no proporcionó la ruta del archivo temporal (filepath).');
      }

      if (!fs.existsSync(file.filepath)) {
        throw new Error('El archivo temporal no se encontró en el servidor después del parseo.');
      }

      const folder = typeof fields.folder === 'string' ? fields.folder : 'general-uploads';
      const publicUrl = await uploadFile(file, folder);
      res.status(200).json({ url: publicUrl });

    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error));
      console.error('Error en uploadGenericFile:', errorInstance);
      handleError({ res, error: errorInstance, msg: 'Error al subir el archivo' });
    }
  });
};
