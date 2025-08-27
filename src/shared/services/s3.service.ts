import { PutObjectCommand } from '@aws-sdk/client-s3';
import fs from 'fs';
import { File } from 'formidable';
import { nanoid } from 'nanoid';
import { config } from '../config/env';
import logger from '../config/logger';
import { r2Client } from '../api/r2Client';

export const uploadFileR2 = async (file: File, folder: string = ''): Promise<string> => {
  const filePath = file.filepath;
  if (!filePath) {
    throw new Error('No se pudo encontrar la ruta del archivo temporal.');
  }

  let fileStream;
  try {
    const timestamp = Date.now();
    fileStream = fs.createReadStream(filePath);

    const originalFilename = file.originalFilename || 'archivo-sin-nombre';
    const fileNameWithoutExt = originalFilename.split('.').slice(0, -1).join('.') || 'archivo';
    const extension = originalFilename.split('.').pop() || 'bin';

    // Preservar nombre original + timestamp para evitar duplicados
    const uniqueKey = `${folder ? folder + '/' : ''}${fileNameWithoutExt}_${timestamp}.${extension}`;

    const putCommand = new PutObjectCommand({
      Bucket: config.r2.bucket,
      Key: uniqueKey,
      Body: fileStream,
      ContentType: file.mimetype || undefined,
    });

    logger.info(`Subiendo archivo a R2 bucket: ${config.r2.bucket}, Key: ${uniqueKey}`);
    await r2Client.send(putCommand);

    const publicUrl = `${config.r2.publicUrl}/${uniqueKey}`;
    logger.info(`Archivo subido exitosamente a R2: ${publicUrl}`);

    return publicUrl;

  } catch (error) {
    logger.error('Error al subir archivo a R2:', error);
    if (fileStream && !fileStream.closed) {
      fileStream.destroy();
    }
    throw new Error('Error al subir el archivo a R2.');
  } finally {
    fs.unlink(filePath, (unlinkErr) => {
      if (unlinkErr) {
        logger.warn(`No se pudo eliminar el archivo temporal: ${filePath}`, unlinkErr);
      }
    });
  }
};
