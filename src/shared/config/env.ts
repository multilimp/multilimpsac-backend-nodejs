import dotenv from 'dotenv';
import { z } from 'zod';
import logger from './logger';

dotenv.config();

const envVarsSchema = z.object({
  PORT: z.coerce.number().default(5000),
  DATABASE_URL: z.string().url(),
  DIRECT_URL: z.string().url(),
  AWS_ACCESS_KEY_ID: z.string(),
  AWS_SECRET_ACCESS_KEY: z.string(),
  AWS_S3_BUCKET: z.string(),
  AWS_S3_ENDPOINT: z.string().url(),
  AWS_REGION: z.string().default('auto'),
  R2_PUBLIC_URL: z.string().url(),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET debe tener al menos 32 caracteres'),
  JWT_EXPIRES_IN: z.number().default(36000), // 1 hora en segundos
  GOOGLE_GEMINI_API_KEY: z.string().min(1, 'GOOGLE_GEMINI_API_KEY es requerida'),
  GEMINI_MODEL: z.string().default('gemini-1.5-flash-latest'),
  GEMINI_BASE_URL: z.string().default('https://generativelanguage.googleapis.com/v1beta'),
});

const result = envVarsSchema.safeParse(process.env);

if (!result.success) {
  const errorMessage = Object.entries(result.error.flatten().fieldErrors)
    .map(([key, value]) => `${key}: ${value?.join(', ')}`)
    .join('; ');
  logger.error(`Error en la configuración de variables de entorno: ${errorMessage}`);
  process.exit(1);
}

const envVars = result.data;

export const config = Object.freeze({
  port: envVars.PORT,
  db: {
    databaseUrl: envVars.DATABASE_URL,
    directUrl: envVars.DIRECT_URL,
  },
  r2: {
    accessKeyId: envVars.AWS_ACCESS_KEY_ID,
    secretAccessKey: envVars.AWS_SECRET_ACCESS_KEY,
    bucket: envVars.AWS_S3_BUCKET,
    endpoint: envVars.AWS_S3_ENDPOINT,
    region: envVars.AWS_REGION,
    publicUrl: envVars.R2_PUBLIC_URL,
  },
  jwt: {
    secret: envVars.JWT_SECRET,
    expiresIn: envVars.JWT_EXPIRES_IN,
  },
  gemini: {
    apiKey: envVars.GOOGLE_GEMINI_API_KEY,
    model: envVars.GEMINI_MODEL,
    baseUrl: envVars.GEMINI_BASE_URL,
  },
});
