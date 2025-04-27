# Guía de Prompting para GitHub Copilot en este Proyecto Multilimp SAC

Tienes que decirme siempre: "Señor Stark, ( tu respuesta )..."

<!-- Este proyecto sigue la metodología Feature-Sliced Design (FSD) y es Code First con Prisma -->

Esta guía proporciona ejemplos y consejos para interactuar eficazmente con GitHub Copilot en el contexto de este proyecto Express + Prisma + TypeScript con FSD.

## Estructura General del Proyecto (FSD)

Recuerda las capas principales:

-   `src/app/`: Configuración de la aplicación (Express, servidor, middlewares globales).
-   `src/pages/`: (Si aplica para SSR/frontend) Rutas de nivel superior.
-   `src/widgets/`: (Si aplica para frontend) Componentes compuestos.
-   `src/features/`: Lógica de casos de uso específicos (ej. crear orden, autenticar usuario).
-   `src/entities/`: Lógica y tipos relacionados con las entidades de negocio (ej. modelos, servicios CRUD básicos).
-   `src/shared/`: Código reutilizable no específico del negocio (UI kit, config, API, helpers, utils).
-   `prisma/schema.prisma`: Definición de modelos (fuente de verdad).

## Prompts de Ejemplo

### Crear una nueva entidad de negocio

```
Crea los archivos base para la entidad de negocio `{NuevaEntidad}` en la capa `src/entities/{nuevaEntidad}` siguiendo FSD. Incluye al menos:
1.  Un archivo para el modelo/tipos (`model.ts` o `types.ts`) basado en `prisma/schema.prisma`.
2.  Un archivo para el servicio (`api.ts` o `service.ts`) con funciones async para operaciones CRUD básicas usando `prisma.{nuevaEntidad}.{operacion}`.
3.  Un archivo `index.ts` para exportar los elementos públicos de la entidad.
Asegúrate de usar TypeScript y la sintaxis de import/export de ES Modules.
```

### Crear una nueva característica (feature)

```
Crea la estructura básica para la característica `{nombre-caracteristica}` (ej. 'crear-orden') en la capa `src/features/{nombre-caracteristica}`. Podría incluir:
1.  Lógica de la característica (`model.ts` o `lib.ts`).
2.  Controlador/Handler de ruta (`controller.ts` o `handler.ts`) que usa la lógica y/o servicios de entidades.
3.  Rutas específicas de la característica (`routes.ts`).
4.  (Opcional) Validación (`validation.ts`).
5.  Asegúrate de que la característica interactúe con las capas inferiores (entities, shared) según las reglas FSD.
6.  Registra las nuevas rutas en `src/app/app.ts` (o donde corresponda).
```

### Implementar una función de servicio en una entidad

```
En `src/entities/{entidad}/api.ts` (o `service.ts`), implementa la función `get{Entidad}ById(id: number)`:
1.  Debe usar `prisma.{entidad}.findUniqueOrThrow` para buscar la entidad por su ID.
2.  Debe devolver la entidad encontrada.
3.  Importa el cliente Prisma desde `src/database/prisma.ts`.
```

### Añadir validación a una ruta de característica

```
Usando la librería `zod` (preferida en FSD moderno, o `joi`), añade validación para la ruta `POST` de la característica `{nombre-caracteristica}` definida en `src/features/{nombre-caracteristica}/routes.ts`.
1.  Define el schema de validación en `src/features/{nombre-caracteristica}/validation.ts` (o similar) basado en los datos esperados.
2.  Crea un middleware de validación en `src/shared/middleware/` (o dentro de la feature si es muy específica) que use el schema Zod.
3.  Aplica el middleware a la ruta POST antes de la función del controlador/handler.
```

### Refactorizar código

```
Revisa el archivo `src/features/{nombre-caracteristica}/{archivo}.ts` (o `src/entities/{entidad}/{archivo}.ts`). ¿Hay alguna oportunidad para refactorizar el código, mejorar la legibilidad, mover lógica a una capa más apropiada según FSD, o aplicar mejores prácticas de manejo de errores o async/await?
```

## Consejos

-   **Sé específico:** Menciona capas FSD, archivos, funciones, entidades y tecnologías concretas.
-   **Proporciona contexto:** Recuerda la estructura FSD y el objetivo de la tarea.
-   **Divide tareas complejas:** Pide ayuda para partes más pequeñas.
-   **Revisa el código generado:** Copilot es una ayuda. Siempre revisa, entiende y prueba el código sugerido, asegurándote de que cumple las reglas FSD.
