import { Client } from '@elastic/elasticsearch';
import logger from '../utils/logger';

const ELASTICSEARCH_NODE = process.env.ELASTICSEARCH_NODE || 'http://localhost:9200';

// Cliente Elasticsearch singleton
const esClient = new Client({
    node: ELASTICSEARCH_NODE,
    maxRetries: 5,
    requestTimeout: 60000,
    sniffOnStart: false,
});

// Verificar conexão ao iniciar
export const checkElasticsearchConnection = async (): Promise<boolean> => {
    try {
        const health = await esClient.cluster.health();
        logger.info('✅ Elasticsearch conectado:', {
            cluster: health.cluster_name,
            status: health.status,
        });
        return true;
    } catch (error) {
        logger.error('❌ Erro ao conectar no Elasticsearch:', error);
        return false;
    }
};

// Criar índices se não existirem
export const initializeElasticsearchIndices = async () => {
    try {
        // Índice para mensagens
        const messagesIndexExists = await esClient.indices.exists({
            index: 'messages',
        });

        if (!messagesIndexExists) {
            await esClient.indices.create({
                index: 'messages',
                mappings: {
                    properties: {
                        id: { type: 'keyword' },
                        content: { type: 'text', analyzer: 'standard' },
                        senderId: { type: 'keyword' },
                        senderName: { type: 'text' },
                        senderUsername: { type: 'keyword' },
                        conversationId: { type: 'keyword' },
                        createdAt: { type: 'date' },
                        updatedAt: { type: 'date' },
                    },
                },
                settings: {
                    number_of_shards: 1,
                    number_of_replicas: 1,
                },
            });
            logger.info('✅ Índice "messages" criado no Elasticsearch');
        }

        // Índice para usuários
        const usersIndexExists = await esClient.indices.exists({
            index: 'users',
        });

        if (!usersIndexExists) {
            await esClient.indices.create({
                index: 'users',
                mappings: {
                    properties: {
                        id: { type: 'keyword' },
                        email: { type: 'keyword' },
                        username: { type: 'keyword' },
                        name: { type: 'text', analyzer: 'standard' },
                        avatar: { type: 'keyword' },
                        isOnline: { type: 'boolean' },
                        createdAt: { type: 'date' },
                    },
                },
                settings: {
                    number_of_shards: 1,
                    number_of_replicas: 1,
                },
            });
            logger.info('✅ Índice "users" criado no Elasticsearch');
        }
    } catch (error) {
        logger.error('❌ Erro ao criar índices do Elasticsearch:', error);
        throw error;
    }
};

export default esClient;
