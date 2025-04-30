import AWS from 'aws-sdk';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import { File } from 'formidable'; // Importar el tipo File de formidable
import logger from '../../../config/logger'; // Asegúrate que la ruta al logger sea correcta

dotenv.config();

// Configuración de AWS - Asegúrate de tener las variables de entorno configuradas
AWS.config.update({
  region: process.env.AWS_REGION || 'us-east-2', // Usa variable de entorno o valor por defecto
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const s3 = new AWS.S3();
const S3_BUCKET = process.env.AWS_S3_BUCKET; // Nombre del bucket desde variables de entorno

if (!S3_BUCKET) {
  logger.error('Nombre del bucket S3 no configurado en variables de entorno (AWS_S3_BUCKET)');
  // Podrías lanzar un error aquí o manejarlo de otra forma
}

/**
 * Sube un archivo a AWS S3.
 * @param file - El objeto File de formidable.
 * @param folder - La carpeta dentro del bucket donde se guardará el archivo (ej. 'logos-empresa').
 * @returns La URL pública del archivo subido.
 */
export const uploadFileS3 = (file: File, folder: string): Promise<string> => {
  // Validar si el bucket está configurado
  if (!S3_BUCKET) {
    return Promise.reject(new Error('Bucket S3 no configurado.'));
  }

  // Validar si el archivo tiene la propiedad filepath (puede variar en formidable v3+)
  // En formidable v3+, se usa file.filepath en lugar de file.path
  const filePath = file.filepath || (file as any).path; // Compatibilidad
  if (!filePath) {
    return Promise.reject(new Error('No se pudo encontrar la ruta del archivo temporal.'));
  }

  try {
    const fileContent = fs.readFileSync(filePath);

    // Obtener extensión del nombre original o del nombre temporal si es necesario
    const originalFilename = file.originalFilename || file.newFilename || 'archivo-sin-nombre';
    const parsed = originalFilename.split('.');
    const extension = parsed.length > 1 ? parsed.pop() : 'bin'; // Extensión o 'bin' por defecto
    const Key = `${folder}/${uuidv4()}.${extension}`; // Incluir carpeta en la Key

    const params: AWS.S3.PutObjectRequest = {
      Bucket: S3_BUCKET, // Solo el nombre del bucket
      Key,
      Body: fileContent,
      ACL: 'public-read', // Asegúrate que el bucket permita ACLs públicos si usas esto
      ContentType: file.mimetype || undefined, // Usar mimetype si está disponible
    };

    return new Promise((resolve, reject) => {
      s3.upload(params, (err: Error, data: AWS.S3.ManagedUpload.SendData) => {
        // Limpiar archivo temporal después de leerlo
        fs.unlink(filePath, (unlinkErr) => {
          if (unlinkErr) {
            logger.warn(`No se pudo eliminar el archivo temporal: ${filePath}`, unlinkErr);
          }
        });

        if (err) {
          logger.error('Error subiendo archivo a S3:', err);
          return reject(err);
        }
        logger.info(`Archivo subido exitosamente a S3: ${data.Location}`);
        return resolve(data.Location); // URL del archivo subido
      });
    });
  } catch (readError) {
    logger.error(`Error leyendo el archivo temporal: ${filePath}`, readError);
    // Intentar limpiar archivo temporal incluso si la lectura falla
    fs.unlink(filePath, (unlinkErr) => {
      if (unlinkErr) logger.warn(`No se pudo eliminar el archivo temporal (tras error de lectura): ${filePath}`, unlinkErr);
    });
    return Promise.reject(readError);
  }
};
