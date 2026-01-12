import { createSwaggerSpec } from 'next-swagger-doc';

export const getApiDocs = async () => {
  const spec = createSwaggerSpec({
    apiFolder: 'pages/api', 
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'Mi API Next.js 2026',
        version: '1.0.0',
        description: 'Documentación completa de la API con Swagger',
      },
      servers: [
        {
          url: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000',
          description: 'Base URL de la API',
        },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
        schemas: {
          Usuario: {
            type: 'object',
            properties: {
              id: { type: 'integer' },
              nombrecompleto: { type: 'string' },
              email: { type: 'string' },
              telefono: { type: 'string' },
              rolid: { type: 'integer' },
              estado: { type: 'boolean' },
            },
          },
          UsuarioInput: {
            type: 'object',
            required: ['nombrecompleto', 'rolid', 'email'],
            properties: {
              nombrecompleto: { type: 'string' },
              rolid: { type: 'integer' },
              email: { type: 'string' },
              telefono: { type: 'string' },
              password: { type: 'string' },
            },
          },
          Transaccion: {
            type: 'object',
            properties: {
              id: { type: 'integer' },
              monto: { type: 'number' },
              tipo: { type: 'string' },
              fecha: { type: 'string', format: 'date-time' },
              usuarioId: { type: 'integer' },
              usuario: { $ref: '#/components/schemas/Usuario' },
            },
          },
          ErrorResponse: {
            type: 'object',
            properties: { error: { type: 'string' } },
          },
        },
      },
      security: [{ bearerAuth: [] }],
    },
  });
  return spec;
};
