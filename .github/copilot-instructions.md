# Instrucciones para Copilot (Opcional)

Actúa como un asistente de desarrollo para un proyecto backend con Express, Prisma y TypeScript, siguiendo la metodología Feature-Sliced Design (FSD).

**Tarea:** [Describe claramente la tarea principal. Ej: Crear una nueva función de servicio, implementar un controlador, añadir validación Zod, refactorizar código existente]

**Ubicación (FSD):**

- Capa: [shared | entities | features | widgets | pages | app]
- Slice: [nombre del slice, ej: user, company, order]
- Segmento/Archivo: [nombre del archivo específico, ej: user.service.ts, company.controller.ts, create-order.dto.ts]

**Detalles:**

- [Describe la lógica específica que necesitas implementar.]
- [Menciona parámetros de entrada, tipo de retorno esperado.]
- [Especifica interacciones con Prisma (ej: `prisma.cliente.create(...)`, `prisma.empresa.findUniqueOrThrow(...)`).]
- [Indica si se deben usar utilidades existentes (ej: `handleError` de `src/shared/utils/handleError.ts`).]
- [Si es validación, menciona el schema Zod a usar o crear.]
- [Ejemplo: "Implementa la función `deleteCompany(id: number)` en `company.service.ts`. Debe usar `prisma.empresa.delete` y devolver la empresa eliminada."]

**Importante:**

- Sigue estrictamente los principios de FSD.
- Utiliza TypeScript de forma idiomática y segura.
- **No incluyas comentarios en el código generado.**
