# Guía de Prompting para GitHub Copilot en este Proyecto Multilimp SAC 

Tienes que decirme siempre: "Señor Stark, ( tu respuesta )..."

Recuerda que este proyecto es Database First

Esta guía proporciona ejemplos y consejos para interactuar eficazmente con GitHub Copilot en el contexto de este proyecto Express + Prisma + TypeScript.

## Estructura General del Proyecto

Recuerda la estructura principal:

-   `app.ts`: Configuración de Express.
-   `src/db/prisma.ts`: Instancia del cliente Prisma.
-   `src/modules/{entidad}/`: Contiene rutas, controladores y servicios para cada entidad.
-   `prisma/schema.prisma`: Esquema de la base de datos.

## Prompts de Ejemplo

### Crear un nuevo módulo/entidad

```
Basándote en la estructura existente en `src/modules/user`, crea un nuevo módulo completo para la entidad `{NuevaEntidad}`. Incluye:
1.  Rutas (`{nuevaEntidad}.routes.ts`) con operaciones CRUD básicas (listar, obtener por ID, crear, actualizar, eliminar).
2.  Controlador (`{nuevaEntidad}.controller.ts`) con funciones async que llaman a los servicios correspondientes y usan `handleError`.
3.  Servicio (`{nuevaEntidad}.service.ts`) con funciones async que usan `prisma.{nuevaEntidad}.{operacion}` para interactuar con la base de datos.
4.  Asegúrate de usar TypeScript, tipos adecuados y la sintaxis de import/export de ES Modules.
5.  Registra las nuevas rutas en `app.ts` bajo `/api/{nuevaEntidad}`.
```

### Implementar una función de servicio

```
En `src/modules/{entidad}/{entidad}.service.ts`, implementa la función `get{Entidad}ById(id: number)`:
1.  Debe usar `prisma.{entidad}.findUniqueOrThrow` para buscar la entidad por su ID.
2.  Debe devolver la entidad encontrada.
3.  Maneja posibles errores (aunque `findUniqueOrThrow` ya lanza uno si no se encuentra).
```

### Añadir validación a una ruta

```
Usando la librería `joi` (o `zod` si se prefiere instalar), añade validación para la ruta `POST /api/{entidad}` definida en `src/modules/{entidad}/{entidad}.routes.ts`.
1.  Crea un schema de validación para el cuerpo de la solicitud (`req.body`) que coincida con los campos necesarios para crear un `{Entidad}` según `prisma/schema.prisma`.
2.  Crea un middleware de validación que use este schema.
3.  Aplica el middleware a la ruta POST antes de la función del controlador.
```

### Refactorizar código

```
Revisa el archivo `src/modules/{entidad}/{entidad}.controller.ts`. ¿Hay alguna oportunidad para refactorizar el código, mejorar la legibilidad o aplicar mejores prácticas de manejo de errores o async/await?
```

## Consejos

-   **Sé específico:** Menciona archivos, funciones, entidades y tecnologías concretas.
-   **Proporciona contexto:** Recuerda la estructura del proyecto o el objetivo general.
-   **Divide tareas complejas:** Pide ayuda para partes más pequeñas en lugar de una funcionalidad completa de una vez.
-   **Revisa el código generado:** Copilot es una ayuda, no un reemplazo. Siempre revisa, entiende y prueba el código sugerido.
