# Ejemplos de uso del GraphQL API con respuestas simplificadas

Este archivo contiene ejemplos de cómo consumir el API GraphQL con las nuevas respuestas simplificadas.

## Ejemplo básico - Consulta simple

```javascript
// Consulta de una orden de compra
const response = await fetch('/graphql', {
  method: 'POST',
  headers: { 
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_TOKEN'
  },
  body: JSON.stringify({
    query: `
      query {
        ordenCompra(id: "13") {
          id
          codigoVenta
          cliente {
            razonSocial
            ruc
          }
          empresa {
            razonSocial
          }
        }
      }
    `
  })
});

```

## Manejo de errores

```javascript
const response = await fetch('/graphql', {
  method: 'POST',
  headers: { 
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_TOKEN'
  },
  body: JSON.stringify({
    query: `
      query {
        ordenCompra(id: "ID_NO_EXISTENTE") {
          id
          codigoVenta
        }
      }
    `
  })
});

const result = await response.json();

// Para consultas con errores, se mantiene la estructura estándar GraphQL con errors
if (result.errors) {
  console.error('Error en la consulta:', result.errors);
} else {
  console.log('Orden encontrada:', result);
}
```
