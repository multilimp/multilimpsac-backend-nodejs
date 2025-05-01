import { File } from 'formidable';
import { uploadFileR2 } from '@/shared/services/s3.service';

export const uploadFile = async (file: File, folder?: string): Promise<string> => {
  const publicUrl = await uploadFileR2(file, folder);
  return publicUrl;
};
