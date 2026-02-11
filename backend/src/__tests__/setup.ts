// Mock do Prisma
jest.mock('@prisma/client', () => {
    const mockPrismaClient = {
        user: {
            findUnique: jest.fn(),
            findMany: jest.fn(),
            findFirst: jest.fn(),
            count: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        },
        message: {
            findMany: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        },
        conversation: {
            findUnique: jest.fn(),
            findMany: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
        },
        refreshToken: {
            findUnique: jest.fn(),
            create: jest.fn(),
            delete: jest.fn(),
            deleteMany: jest.fn(),
        },
        $disconnect: jest.fn(),
    };

    return {
        PrismaClient: jest.fn(() => mockPrismaClient),
    };
});

// Mock do Redis
jest.mock('ioredis', () => {
    return jest.fn().mockImplementation(() => ({
        get: jest.fn(),
        set: jest.fn(),
        setex: jest.fn(),
        del: jest.fn(),
        keys: jest.fn(),
        ping: jest.fn().mockResolvedValue('PONG'),
        info: jest.fn().mockResolvedValue('used_memory:1000000'),
        quit: jest.fn(),
        on: jest.fn(),
        once: jest.fn(),
        emit: jest.fn(),
    }));
});

// Mock do Elasticsearch
jest.mock('@elastic/elasticsearch', () => {
    return {
        Client: jest.fn().mockImplementation(() => ({
            ping: jest.fn().mockResolvedValue({}),
            indices: {
                exists: jest.fn().mockResolvedValue(true),
                create: jest.fn().mockResolvedValue({}),
            },
            index: jest.fn().mockResolvedValue({}),
            search: jest.fn().mockResolvedValue({
                hits: {
                    hits: [],
                    total: { value: 0 },
                },
            }),
        })),
    };
});

// Mock do BullMQ
jest.mock('bullmq', () => ({
    Queue: jest.fn().mockImplementation(() => ({
        add: jest.fn().mockResolvedValue({ id: 'job-id' }),
        getJobs: jest.fn().mockResolvedValue([]),
        clean: jest.fn(),
        on: jest.fn(),
    })),
    Worker: jest.fn().mockImplementation(() => ({
        on: jest.fn(),
        close: jest.fn(),
    })),
}));

// Mock do nodemailer
jest.mock('nodemailer', () => ({
    createTransport: jest.fn().mockReturnValue({
        sendMail: jest.fn().mockResolvedValue({ messageId: 'test-message-id' }),
    }),
}));

// Configurações globais
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
process.env.ENCRYPTION_KEY = 'a'.repeat(64);
process.env.HMAC_SECRET = 'test-hmac-secret';

// Limpar mocks após cada teste
afterEach(() => {
    jest.clearAllMocks();
});
