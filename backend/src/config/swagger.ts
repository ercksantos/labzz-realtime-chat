import swaggerJsdoc from 'swagger-jsdoc';
import { config } from './index';

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Labzz Chat API',
            version: '1.0.0',
            description: 'API RESTful para sistema de chat em tempo real com autenticação, WebSocket e busca avançada',
            contact: {
                name: 'Labzz Team',
                email: 'dev@labzz.com',
            },
            license: {
                name: 'MIT',
                url: 'https://opensource.org/licenses/MIT',
            },
        },
        servers: [
            {
                url: `http://localhost:${config.port}`,
                description: 'Servidor de desenvolvimento',
            },
            {
                url: 'https://api-chat.labzz.com',
                description: 'Servidor de produção',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'Token JWT obtido no endpoint de login',
                },
            },
            schemas: {
                Error: {
                    type: 'object',
                    properties: {
                        status: {
                            type: 'string',
                            example: 'error',
                        },
                        message: {
                            type: 'string',
                            example: 'Mensagem de erro',
                        },
                    },
                },
                User: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string',
                            format: 'uuid',
                        },
                        email: {
                            type: 'string',
                            format: 'email',
                        },
                        username: {
                            type: 'string',
                        },
                        name: {
                            type: 'string',
                        },
                        avatar: {
                            type: 'string',
                            nullable: true,
                        },
                        isOnline: {
                            type: 'boolean',
                        },
                        lastSeen: {
                            type: 'string',
                            format: 'date-time',
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date-time',
                        },
                    },
                },
                Message: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string',
                            format: 'uuid',
                        },
                        content: {
                            type: 'string',
                        },
                        senderId: {
                            type: 'string',
                            format: 'uuid',
                        },
                        conversationId: {
                            type: 'string',
                            format: 'uuid',
                        },
                        isRead: {
                            type: 'boolean',
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date-time',
                        },
                    },
                },
                Conversation: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string',
                            format: 'uuid',
                        },
                        name: {
                            type: 'string',
                            nullable: true,
                        },
                        isGroup: {
                            type: 'boolean',
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date-time',
                        },
                        participants: {
                            type: 'array',
                            items: {
                                $ref: '#/components/schemas/User',
                            },
                        },
                        lastMessage: {
                            $ref: '#/components/schemas/Message',
                            nullable: true,
                        },
                    },
                },
            },
            responses: {
                UnauthorizedError: {
                    description: 'Token de acesso ausente ou inválido',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/Error',
                            },
                            example: {
                                status: 'error',
                                message: 'No token provided',
                            },
                        },
                    },
                },
                NotFoundError: {
                    description: 'Recurso não encontrado',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/Error',
                            },
                            example: {
                                status: 'error',
                                message: 'Resource not found',
                            },
                        },
                    },
                },
                ValidationError: {
                    description: 'Dados de entrada inválidos',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/Error',
                            },
                            example: {
                                status: 'error',
                                message: 'Validation failed',
                            },
                        },
                    },
                },
                ServerError: {
                    description: 'Erro interno do servidor',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/Error',
                            },
                            example: {
                                status: 'error',
                                message: 'Internal server error',
                            },
                        },
                    },
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
        tags: [
            {
                name: 'Auth',
                description: 'Autenticação e autorização',
            },
            {
                name: 'Users',
                description: 'Gerenciamento de usuários',
            },
            {
                name: 'Chat',
                description: 'Conversas e mensagens',
            },
            {
                name: 'Search',
                description: 'Busca de usuários e mensagens',
            },
            {
                name: 'Cache',
                description: 'Gerenciamento de cache',
            },
            {
                name: 'Queue',
                description: 'Gerenciamento de filas',
            },
            {
                name: 'Health',
                description: 'Health checks e métricas',
            },
        ],
    },
    apis: ['./src/routes/*.ts', './src/controllers/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
