import { S3Client } from '@aws-sdk/client-s3';
import { config } from '../../shared/config/env';

export const r2Client = new S3Client({
  region: config.r2.region,
  endpoint: config.r2.endpoint,
  credentials: {
    accessKeyId: config.r2.accessKeyId,
    secretAccessKey: config.r2.secretAccessKey,
  },
  forcePathStyle: true,
});
