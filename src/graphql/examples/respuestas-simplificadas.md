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

// Respuesta simplificada - directamente el objeto ordenCompra
const ordenCompra = await response.json();
console.log(ordenCompra.id);
console.log(ordenCompra.cliente.razonSocial);
```

## Ejemplo avanzado - Consulta con múltiples operaciones

```javascript
// Consulta con múltiples operaciones en una sola petición
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
        }
        
        clientes {
          id
          razonSocial
        }
        
        productos {
          id
          nombre
          precio
        }
      }
    `
  })
});

// Respuesta simplificada con las múltiples operaciones en el nivel raíz
const data = await response.json();
console.log('Orden de compra:', data.ordenCompra);
console.log('Número de clientes:', data.clientes.length);
console.log('Productos recientes:', data.productos);
```

## Ejemplo con variables - Consulta parametrizada

```javascript
// Consulta con variables
const ordenId = "123";
const includeProductos = true;

const response = await fetch('/graphql', {
  method: 'POST',
  headers: { 
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_TOKEN'
  },
  body: JSON.stringify({
    query: `
      query GetOrdenDetallada($id: ID!, $includeProductos: Boolean!) {
        ordenCompra(id: $id) {
          id
          codigoVenta
          cliente {
            razonSocial
          }
          productos @include(if: $includeProductos) {
            id
            nombre
            cantidad
            precio
            total
          }
        }
      }
    `,
    variables: {
      id: ordenId,
      includeProductos: includeProductos
    }
  })
});

// Respuesta simplificada - directamente el objeto ordenCompra
const ordenCompra = await response.json();
console.log(`Orden ${ordenCompra.id} para cliente ${ordenCompra.cliente.razonSocial}`);

if (includeProductos) {
  console.log(`Total productos: ${ordenCompra.productos.length}`);
  console.log(`Valor total: ${ordenCompra.productos.reduce((sum, p) => sum + p.total, 0)}`);
}
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
