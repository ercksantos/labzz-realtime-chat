import esClient from '../config/elasticsearch';
import logger from '../utils/logger';
import {
    MessageDocument,
    UserDocument,
    SearchResult,
    SearchMessagesParams,
    SearchUsersParams,
} from '../types/elasticsearch.types';

export class ElasticsearchService {
    // Indexar uma mensagem
    async indexMessage(message: MessageDocument): Promise<void> {
        try {
            await esClient.index({
                index: 'messages',
                id: message.id,
                document: {
                    ...message,
                    createdAt: message.createdAt.toISOString(),
                    updatedAt: message.updatedAt.toISOString(),
                },
            });
            logger.debug(`Mensagem ${message.id} indexada no Elasticsearch`);
        } catch (error) {
            logger.error('Erro ao indexar mensagem no Elasticsearch:', error);
        }
    }

    // Indexar múltiplas mensagens em lote
    async bulkIndexMessages(messages: MessageDocument[]): Promise<void> {
        try {
            const body = messages.flatMap((message) => [
                { index: { _index: 'messages', _id: message.id } },
                {
                    ...message,
                    createdAt: message.createdAt.toISOString(),
                    updatedAt: message.updatedAt.toISOString(),
                },
            ]);

            const result = await esClient.bulk({ body, refresh: true });

            if (result.errors) {
                logger.error('Erros ao indexar mensagens em lote:', result.items);
            } else {
                logger.info(`${messages.length} mensagens indexadas em lote`);
            }
        } catch (error) {
            logger.error('Erro ao indexar mensagens em lote:', error);
        }
    }

    // Atualizar mensagem indexada
    async updateMessage(messageId: string, update: Partial<MessageDocument>): Promise<void> {
        try {
            await esClient.update({
                index: 'messages',
                id: messageId,
                doc: update,
            });
            logger.debug(`Mensagem ${messageId} atualizada no Elasticsearch`);
        } catch (error) {
            logger.error('Erro ao atualizar mensagem no Elasticsearch:', error);
        }
    }

    // Deletar mensagem do índice
    async deleteMessage(messageId: string): Promise<void> {
        try {
            await esClient.delete({
                index: 'messages',
                id: messageId,
            });
            logger.debug(`Mensagem ${messageId} removida do Elasticsearch`);
        } catch (error) {
            logger.error('Erro ao deletar mensagem do Elasticsearch:', error);
        }
    }

    // Buscar mensagens
    async searchMessages(params: SearchMessagesParams): Promise<SearchResult<MessageDocument>> {
        try {
            const mustClauses: any[] = [
                {
                    multi_match: {
                        query: params.query,
                        fields: ['content^2', 'senderName', 'senderUsername'],
                        fuzziness: 'AUTO',
                    },
                },
            ];

            if (params.conversationId) {
                mustClauses.push({
                    term: { conversationId: params.conversationId },
                });
            }

            if (params.senderId) {
                mustClauses.push({
                    term: { senderId: params.senderId },
                });
            }

            const sortOrder: any =
                params.sortBy === 'date'
                    ? [{ createdAt: { order: 'desc' as const } }]
                    : [{ _score: { order: 'desc' as const } }, { createdAt: { order: 'desc' as const } }];

            const response = await esClient.search({
                index: 'messages',
                query: {
                    bool: {
                        must: mustClauses,
                    },
                },
                sort: sortOrder,
                from: params.from || 0,
                size: params.size || 20,
            });

            return {
                total: (response.hits.total as any).value || 0,
                hits: response.hits.hits.map((hit: any) => ({
                    id: hit._id,
                    score: hit._score || 0,
                    source: {
                        ...hit._source,
                        createdAt: new Date(hit._source.createdAt),
                        updatedAt: new Date(hit._source.updatedAt),
                    },
                })),
            };
        } catch (error) {
            logger.error('Erro ao buscar mensagens no Elasticsearch:', error);
            throw error;
        }
    }

    // Indexar usuário
    async indexUser(user: UserDocument): Promise<void> {
        try {
            await esClient.index({
                index: 'users',
                id: user.id,
                document: {
                    ...user,
                    createdAt: user.createdAt.toISOString(),
                },
            });
            logger.debug(`Usuário ${user.id} indexado no Elasticsearch`);
        } catch (error) {
            logger.error('Erro ao indexar usuário no Elasticsearch:', error);
        }
    }

    // Buscar usuários
    async searchUsers(params: SearchUsersParams): Promise<SearchResult<UserDocument>> {
        try {
            const response = await esClient.search({
                index: 'users',
                query: {
                    multi_match: {
                        query: params.query,
                        fields: ['name^2', 'username^1.5', 'email'],
                        fuzziness: 'AUTO',
                    },
                },
                from: params.from || 0,
                size: params.size || 20,
            });

            return {
                total: (response.hits.total as any).value || 0,
                hits: response.hits.hits.map((hit: any) => ({
                    id: hit._id,
                    score: hit._score || 0,
                    source: {
                        ...hit._source,
                        createdAt: new Date(hit._source.createdAt),
                    },
                })),
            };
        } catch (error) {
            logger.error('Erro ao buscar usuários no Elasticsearch:', error);
            throw error;
        }
    }

    // Atualizar status online do usuário
    async updateUserOnlineStatus(userId: string, isOnline: boolean): Promise<void> {
        try {
            await esClient.update({
                index: 'users',
                id: userId,
                doc: { isOnline },
            });
        } catch (error) {
            logger.error('Erro ao atualizar status online no Elasticsearch:', error);
        }
    }
}

export default new ElasticsearchService();
