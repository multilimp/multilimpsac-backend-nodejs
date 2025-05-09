import axios, { AxiosInstance, AxiosError } from 'axios';
import logger from '../config/logger';
import { File as FormidableFile } from 'formidable';
import * as fs from 'fs/promises';

export type AnalyzePdfResult = {
  success: boolean;
  data?: any;
  error?: string;
};

export class GeminiServiceException extends Error {
  public statusCode: number;
  public originalError?: Error;

  constructor(message: string, statusCode: number = 500, originalError?: Error) {
    super(message);
    this.name = 'GeminiServiceException';
    this.statusCode = statusCode;
    this.originalError = originalError;
    Object.setPrototypeOf(this, GeminiServiceException.prototype);
  }
}

export class GeminiService {
  private apiKey: string;
  private client: AxiosInstance;
  private baseUrl: string;
  private model: string;
  private generationConfig: Record<string, any>;

  constructor() {
    this.apiKey = process.env.GOOGLE_GEMINI_API_KEY || '';
    if (!this.apiKey) {
      logger.error('GOOGLE_GEMINI_API_KEY is not set in environment variables.');
      throw new GeminiServiceException('API Key for Gemini service is not configured.', 500);
    }

    this.baseUrl = process.env.GEMINI_BASE_URL || 'https://generativelanguage.googleapis.com/v1beta';
    this.model = process.env.GEMINI_MODEL || 'gemini-1.5-flash-latest'; // Asegúrate que el modelo soporta la entrada de archivos y JSON.

    this.client = axios.create({
      timeout: 120000, // Aumentado el timeout por si el análisis del PDF toma tiempo
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.generationConfig = {
      temperature: 0.0, // Temperatura baja para respuestas más deterministas y factuales
      topK: 1,
      topP: 0.95,
      maxOutputTokens: 8192, // Ajusta según necesidad
      responseMimeType: "application/json", // Especifica que esperamos JSON
    };
  }

  private getPdfAnalysisPrompt(): string {
    // Prompt ajustado para el nuevo formato JSON deseado
    return `Analiza el siguiente contenido de un archivo PDF y extrae la información solicitada.
Debes devolver la respuesta ÚNICAMENTE en formato JSON válido, sin ningún texto adicional antes o después del JSON, y sin usar markdown.
La estructura del JSON debe ser la siguiente:
{
    "ventaPrivada": false,
    "provinciaEntrega": "EXTRAER_VALOR_O_NULL",
    "distritoEntrega": "EXTRAER_VALOR_O_NULL",
    "departamentoEntrega": "EXTRAER_VALOR_O_NULL",
    "direccionEntrega": "EXTRAER_VALOR_O_NULL",
    "referenciaEntrega": "EXTRAER_VALOR_O_NULL",
    "fechaEntrega": "EXTRAER_FECHA_ISO_O_NULL",
    "montoVenta": "EXTRAER_NUMERO_O_NULL",
    "fechaForm": "EXTRAER_FECHA_ISO_O_NULL",
    "fechaMaxForm": "EXTRAER_FECHA_ISO_O_NULL",
    "productos": [
        "EXTRAER_PRODUCTO_1_COMO_STRING",
        "EXTRAER_PRODUCTO_2_COMO_STRING"
    ],
    "siaf": "EXTRAER_NUMERO_O_NULL",
    "etapaSiaf": "EXTRAER_VALOR_O_NULL",
    "fechaSiaf": "EXTRAER_FECHA_ISO_O_NULL"
}

Instrucciones específicas para la extracción:
- Para los campos de fecha, si encuentras una fecha, formatéala como una cadena ISO 8601 (YYYY-MM-DDTHH:mm:ss.sssZ). Si no encuentras un valor, usa null.
- Para "montoVenta" y "siaf", extrae el valor numérico. Si no se encuentra, usa null.
- Para "productos", extrae cada descripción de producto como una cadena de texto individual dentro del array. Si no hay productos, usa un array vacío [].
- Para los campos de dirección ("provinciaEntrega", "distritoEntrega", etc.), extrae el texto correspondiente. Si no se encuentra, usa null.
- "ventaPrivada" debe ser un booleano. Asume false si no hay información contraria.

Presta MUCHA ATENCIÓN a la estructura del JSON y a los tipos de datos.
No incluyas comentarios como "EXTRAER_VALOR_O_NULL" en el JSON final; reemplázalos con los datos extraídos o null.
`;
  }

  public async analyzePdf(file: FormidableFile): Promise<AnalyzePdfResult> {
    try {
      const fileBuffer = await fs.readFile(file.filepath);
      const base64Pdf = fileBuffer.toString('base64');

      const endpoint = `${this.baseUrl}/models/${this.model}:generateContent?key=${this.apiKey}`;

      const requestBody = {
        contents: [
          {
            parts: [
              { text: this.getPdfAnalysisPrompt() },
              {
                inlineData: {
                  mimeType: file.mimetype || 'application/pdf',
                  data: base64Pdf,
                },
              },
            ],
          },
        ],
        generationConfig: this.generationConfig,
      };

      const response = await this.client.post(endpoint, requestBody);

      if (response.data.candidates && response.data.candidates.length > 0) {
        const candidate = response.data.candidates[0];
        if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
            const part = candidate.content.parts[0];
            if (part.text) {
                try {
                    const jsonData = JSON.parse(part.text);
                    return { success: true, data: jsonData };
                } catch (parseError) {
                    logger.error('Error parsing JSON response from Gemini:', parseError);
                    logger.error('Gemini raw response text:', part.text);
                    throw new GeminiServiceException('Error parsing JSON response from Gemini. Raw text: ' + part.text, 500, parseError as Error);
                }
            } else {
                 logger.error('No text found in Gemini response part .');
                 logger.error('Gemini full candidate:', candidate);
                 throw new GeminiServiceException('No text found in Gemini response part.', 500);
            }
        } else {
          logger.error('No content parts returned from Gemini API candidate.');
          logger.error('Gemini full response:', response.data);
          throw new GeminiServiceException('No content parts returned from Gemini API candidate.', 500);
        }
      } else {
        logger.error('No content candidates returned from Gemini API.');
        logger.error('Gemini full response:', response.data);
        throw new GeminiServiceException('No content candidates returned from Gemini API.', 500);
      }

    } catch (error) {
      if (axios.isAxiosError(error)) {
        logger.error('Axios error calling Gemini API:', error.response?.data || error.message);
        const errorMessage = error.response?.data?.error?.message || error.message;
        throw new GeminiServiceException(`Error analyzing PDF with Gemini: ${errorMessage}`, error.response?.status || 500, error);
      }
      logger.error('Error analyzing PDF:', error);
      if (error instanceof GeminiServiceException) throw error;
      throw new GeminiServiceException('Unexpected error analyzing PDF', 500, error as Error);
    }
  }
}
