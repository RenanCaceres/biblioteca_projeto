// config/swagger.js
// Configura o Swagger para documentar automaticamente a API
// A documentação fica acessível em http://localhost:3001/api-docs

const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API - Sistema de Biblioteca',
      version: '1.0.0',
      description: 'Documentação da API do Sistema de Gerenciamento de Biblioteca',
    },
    // Define o esquema de segurança Bearer (JWT)
    // Isso adiciona o botão "Authorize" na interface do Swagger
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    // Aplica autenticação JWT em todas as rotas por padrão
    security: [{ bearerAuth: [] }],
  },
  // Diz ao swagger-jsdoc onde buscar os comentários JSDoc das rotas
  apis: ['./routes/*.js'],
};

module.exports = swaggerJsdoc(options);
