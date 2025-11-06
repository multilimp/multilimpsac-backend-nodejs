import axios, { AxiosInstance, AxiosError } from 'axios';
import logger from '../config/logger';
import { File as FormidableFile } from 'formidable';
import * as fs from 'fs/promises';
import * as path from 'path';

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
  private maxFileSize: number;
  private maxRetries: number;

  constructor() {
    this.apiKey = process.env.GOOGLE_GEMINI_API_KEY || '';
    if (!this.apiKey) {
      logger.error('GOOGLE_GEMINI_API_KEY is not set in environment variables.');
      throw new GeminiServiceException('API Key for Gemini service is not configured.', 500);
    }

    this.baseUrl = process.env.GEMINI_BASE_URL || 'https://generativelanguage.googleapis.com/v1beta';
    this.model = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
    this.maxFileSize = parseInt(process.env.GEMINI_MAX_FILE_SIZE || '10485760'); // 10MB default
    this.maxRetries = parseInt(process.env.GEMINI_MAX_RETRIES || '3');

    this.client = axios.create({
      timeout: parseInt(process.env.GEMINI_TIMEOUT || '120000'),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.generationConfig = {
      temperature: 0.0,
      topK: 1,
      topP: 0.95,
      maxOutputTokens: 8192,
      responseMimeType: "application/json",
    };
  }

  private getPdfAnalysisPrompt(): string {
    return `Analiza el siguiente contenido de un archivo PDF y extrae la información solicitada.
Debes devolver la respuesta ÚNICAMENTE en formato JSON válido, sin ningún texto adicional antes o después del JSON, y sin usar markdown.
La estructura del JSON debe ser la siguiente:
{
    "ventaPrivada": false,
    "empresaRuc": "EXTRAER_VALOR_O_NULL",
    "empresaRazonSocial": "EXTRAER_VALOR_O_NULL",
    "clienteRuc": "EXTRAER_VALOR_O_NULL",
    "clienteRazonSocial": "EXTRAER_VALOR_O_NULL",
    "codigoUnidadEjecutora": "EXTRAER_VALOR_O_NULL",
    "codigoCatalogo": "EXTRAER_CODIGO_CATALOGO_O_NULL",
    "provinciaEntrega": "EXTRAER_VALOR_O_NULL",
    "distritoEntrega": "EXTRAER_VALOR_O_NULL",
    "departamentoEntrega": "EXTRAER_VALOR_O_NULL",
    "regionEntrega": "EXTRAER_VALOR_O_NULL",
    "direccionEntrega": "EXTRAER_VALOR_O_NULL",
    "referenciaEntrega": "EXTRAER_VALOR_O_NULL",
    "fechaEntrega": "EXTRAER_FECHA_ISO_O_NULL",
    "montoVenta": "EXTRAER_NUMERO_O_NULL",
    "fechaForm": "EXTRAER_FECHA_ISO_O_NULL",
    "fechaMaxForm": "EXTRAER_FECHA_MAX_ENTREGA",
    "fechaMaxEntrega": "EXTRAER_FECHA_ISO_O_NULL",
    "productos": [
        {
            "codigo": "Extraer el Código Único de Producto o NULL",
            "descripcion": "EXTRAER_DESCRIPCION_PRODUCTO_O_NULL",
            "marca": "EXTRAER_MARCA_PRODUCTO_O_NULL",
            "cantidad": "EXTRAER_CANTIDAD_NUMERICA_O_NULL"
        }
    ],
    "contactos": [
        {
            "cargo": "EXTRAER_CARGO_O_NULL",
            "nombre": "EXTRAER_NOMBRE_O_NULL",
            "telefono": "EXTRAER_TELEFONO_COMBINADO_O_NULL"
        }
    ],
    "siaf": "EXTRAER_NUMERO_O_NULL",
    "fechaSiaf": "EXTRAER_FECHA_ISO_O_NULL"
}

Instrucciones específicas para la extracción:
- Para los campos de fecha, si encuentras una fecha, formatéala como una cadena ISO 8601 (YYYY-MM-DDTHH:mm:ss.sssZ). Si no encuentras un valor, usa null.
- Para "montoVenta" y "siaf", extrae el valor numérico. Si no se encuentra, usa null.
- Para "codigoCatalogo", busca códigos alfanuméricos que aparezcan antes de la descripción de la venta. Busca patrones como:
  * "MED-FAR-2023-1 MEDICAMENTOS Y FARMACIA..." → código: "MED-FAR-2023-1"
  * "OFF-SUP-2024-B SUMINISTROS DE OFICINA..." → código: "OFF-SUP-2024-B"
  * "TEC-INF-2025-X EQUIPOS TECNOLÓGICOS..." → código: "TEC-INF-2025-X"
  Los códigos generalmente están seguidos de un espacio y luego la descripción de la venta.
- Para "productos", extrae cada producto como un objeto con la siguiente estructura:
  * "codigo": código del producto (ej: "EER-11")
  * "descripcion": descripción completa del producto
  * "marca": marca del producto si está especificada (ej: "eco", "SERLIMP", etc.)
  * "cantidad": cantidad numérica del producto
  Ejemplo de formato: {"codigo": "EER-11", "descripcion": "1824 PAÑOS Y BAYETAS: PAÑO MICROFIBRA...", "marca": "eco", "cantidad": 200}
  Si hay múltiples productos, incluye cada uno como un objeto separado en el array. Si no encuentras productos, devuelve un objeto con todos los campos en null: [{"codigo": null, "descripcion": null, "marca": null, "cantidad": null}].
- Para "contactos", busca la sección "DATOS DE RESPONSABLES DE RECEPCIÓN" o similar y extrae:
  * "cargo": el puesto o función del responsable (ej: "COORDINADOR LOGÍSTICA", "SUPERVISOR DE INVENTARIO")
  * "nombre": el nombre completo de la persona responsable (ej: "MARÍA GONZÁLEZ PÉREZ")
  * "telefono": combina teléfono fijo y celular en un solo campo separado por " / " (ej: "(01)2345678 / 987-654-321")
  Si hay múltiples contactos, incluye cada uno como un objeto separado en el array. Si no encuentras contactos, devuelve un objeto con todos los campos en null: [{"cargo": null, "nombre": null, "telefono": null}].
- Para los campos de dirección ("provinciaEntrega", "distritoEntrega", etc.), extrae el texto correspondiente. Si no se encuentra, usa null.
- "ventaPrivada" debe ser un booleano. Asume false si no hay información contraria.

Presta MUCHA ATENCIÓN a la estructura del JSON y a los tipos de datos.
No incluyas comentarios como "EXTRAER_VALOR_O_NULL" en el JSON final; reemplázalos con los datos extraídos o null.`;
  }

  private async validateFile(file: FormidableFile): Promise<void> {
    const stats = await fs.stat(file.filepath);
    if (stats.size > this.maxFileSize) {
      throw new GeminiServiceException(`File size exceeds limit of ${this.maxFileSize} bytes.`, 413);
    }
    const ext = path.extname(file.originalFilename || '').toLowerCase();
    if (ext !== '.pdf' || !file.mimetype?.includes('pdf')) {
      throw new GeminiServiceException('Invalid file type. Only PDF files are allowed.', 400);
    }
  }

  private async readFileAsBase64(filePath: string): Promise<string> {
    const fileBuffer = await fs.readFile(filePath);
    return fileBuffer.toString('base64');
  }

  private async callGeminiWithRetry(requestBody: any, attempt: number = 1): Promise<any> {
    try {
      const endpoint = `${this.baseUrl}/models/${this.model}:generateContent?key=${this.apiKey}`;
      const response = await this.client.post(endpoint, requestBody);
      return response;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response && error.response.status >= 500 && attempt < this.maxRetries) {
        const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
        logger.warn(`Gemini API error (attempt ${attempt}), retrying in ${delay}ms:`, error.message);
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.callGeminiWithRetry(requestBody, attempt + 1);
      }
      throw error;
    }
  }

  private validateJsonResponse(jsonData: any): void {
    const requiredKeys = ['ventaPrivada', 'productos', 'contactos'];
    for (const key of requiredKeys) {
      if (!(key in jsonData)) {
        throw new GeminiServiceException(`Invalid JSON response: missing key '${key}'.`, 500);
      }
    }
    if (!Array.isArray(jsonData.productos) || !Array.isArray(jsonData.contactos)) {
      throw new GeminiServiceException('Invalid JSON response: productos and contactos must be arrays.', 500);
    }
  }

  public async analyzePdf(file: FormidableFile): Promise<AnalyzePdfResult> {
    try {
      await this.validateFile(file);
      const base64Pdf = await this.readFileAsBase64(file.filepath);

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

      const response = await this.callGeminiWithRetry(requestBody);

      if (response.data.candidates && response.data.candidates.length > 0) {
        const candidate = response.data.candidates[0];
        if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
          const part = candidate.content.parts[0];
          if (part.text) {
            try {
              const jsonData = JSON.parse(part.text);
              this.validateJsonResponse(jsonData);
              return { success: true, data: jsonData };
            } catch (parseError) {
              logger.error('Error parsing JSON response from Gemini:', parseError);
              throw new GeminiServiceException('Error parsing JSON response from Gemini.', 500, parseError as Error);
            }
          } else {
            logger.error('No text found in Gemini response part.');
            throw new GeminiServiceException('No text found in Gemini response part.', 500);
          }
        } else {
          logger.error('No content parts returned from Gemini API candidate.');
          throw new GeminiServiceException('No content parts returned from Gemini API candidate.', 500);
        }
      } else {
        logger.error('No content candidates returned from Gemini API.');
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

  async generateTextContent(prompt: string, options: {
    temperature?: number;
    maxOutputTokens?: number;
    responseMimeType?: string;
  } = {}): Promise<string> {
    try {
      const response = await this.callGeminiWithRetry({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: options.temperature ?? 0.7,
          maxOutputTokens: options.maxOutputTokens ?? 1000,
          responseMimeType: options.responseMimeType ?? "text/plain",
          topK: 1,
          topP: 0.95
        }
      });

      return response.data.candidates[0].content.parts[0].text;
    } catch (error) {
      logger.error('Error generating text content with Gemini:', error);
      throw new GeminiServiceException('Error generating text content', 500, error as Error);
    }
  }
}