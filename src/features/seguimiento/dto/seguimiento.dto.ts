import { z } from 'zod';

export const UpdateEstadoOpSeguimientoDto = z.object({
  estado: z.enum(['PENDIENTE', 'EN_PROCESO', 'COMPLETADO', 'RETRASADO', 'CANCELADO'])
});

export const UpdateFechaEntregaRealDto = z.object({
  fechaEntrega: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Fecha de entrega debe ser una fecha válida'
  })
});

export const SubirDocumentoEntregaCompletoDto = z.object({
  documentoUrl: z.string().url('URL del documento debe ser válida')
});

export type UpdateEstadoOpSeguimientoRequest = z.infer<typeof UpdateEstadoOpSeguimientoDto>;
export type UpdateFechaEntregaRealRequest = z.infer<typeof UpdateFechaEntregaRealDto>;
export type SubirDocumentoEntregaCompletoRequest = z.infer<typeof SubirDocumentoEntregaCompletoDto>;
