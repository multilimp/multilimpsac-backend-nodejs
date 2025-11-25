import { z } from 'zod';
import { ContactoTipo } from '../../../prisma/generated/client';
import { NextFunction, Request, Response } from 'express';

const baseContactSchema = z.object({
  nombre: z.string().min(1, "El nombre es requerido."),
  telefono: z.string().optional(),
  email: z.string().email("Email inválido.").optional().or(z.literal('')),
  cargo: z.string().optional(),
  cumpleanos: z.coerce.date().optional(),
  nota: z.string().optional(),
  usuarioDestacado: z.boolean().optional(),
});

export const createContactSchema = baseContactSchema.extend({
  tipo: z.nativeEnum(ContactoTipo, { required_error: "El tipo de contacto es requerido." }),
  referenciaId: z.number().int().min(1, "El ID de referencia es requerido y debe ser un entero positivo."),
});

export const updateContactSchema = baseContactSchema.partial().extend({
  tipo: z.nativeEnum(ContactoTipo).optional(),
  referenciaId: z.number().int().min(1).optional(),
}).refine(data => {
  if ((data.tipo && data.referenciaId === undefined) || (data.tipo === undefined && data.referenciaId)) {
    return false;
  }
  return true;
}, { message: "Si se actualiza 'tipo' o 'referenciaId', ambos deben ser proporcionados." });

export const listContactsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  pageSize: z.coerce.number().int().min(1).optional(),
  tipo: z.nativeEnum(ContactoTipo).optional(),
  referenciaId: z.coerce.number().int().min(1).optional(),
}).refine(data => {
  if (data.referenciaId !== undefined && data.tipo === undefined) {
    return false;
  }
  return true;
}, { message: "El parámetro 'tipo' es requerido cuando se provee 'referenciaId'."});


export const validateRequest = (schema: z.ZodSchema<any>) => (req: Request, res: Response, next: NextFunction) => {
  try {
    if (Object.keys(req.body).length > 0) {
      req.body = schema.parse(req.body);
    }
    if (Object.keys(req.query).length > 0) {
      req.query = schema.parse(req.query);
    }
    if (Object.keys(req.params).length > 0) {
      req.params = schema.parse(req.params);
    }
    next();
  } catch (e: any) {
    return res.status(400).json({ errors: e.errors });
  }
};

// Ejemplo de cómo usarías los middlewares de validación en tus rutas:
// router.post('/', validateRequest(createContactSchema), createContact);
// router.get('/', validateRequest(listContactsQuerySchema), listContacts);
