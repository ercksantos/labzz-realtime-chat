/**
 * Script para indexar todas as mensagens existentes no Elasticsearch
 * Uso: npm run index-messages
 */

import 'dotenv/config';
import prisma from '../config/database';
import elasticsearchService from '../services/elasticsearch.service';
import { MessageDocument } from '../types/elasticsearch.types';
import logger from '../utils/logger';

async function indexAllMessages() {
  try {
    logger.info('🔍 Iniciando indexação de mensagens...');

    const messages = await prisma.message.findMany({
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            name: true,
          },
        },
      },
    });

    logger.info(`📊 Total de mensagens para indexar: ${messages.length}`);

    if (messages.length === 0) {
      logger.info('✅ Nenhuma mensagem para indexar');
      return;
    }

    // Indexar em lotes de 100 mensagens
    const batchSize = 100;
    let indexed = 0;

    for (let i = 0; i < messages.length; i += batchSize) {
      const batch = messages.slice(i, i + batchSize);
      const messageDocs: MessageDocument[] = batch.map((msg) => ({
        id: msg.id,
        content: msg.content,
        senderId: msg.senderId,
        senderName: msg.sender.name,
        senderUsername: msg.sender.username,
        conversationId: msg.conversationId,
        createdAt: msg.createdAt,
        updatedAt: msg.updatedAt,
      }));

      await elasticsearchService.bulkIndexMessages(messageDocs);
      indexed += batch.length;
      logger.info(`📝 Progresso: ${indexed}/${messages.length} mensagens indexadas`);
    }

    logger.info(`✅ Indexação concluída! Total: ${indexed} mensagens`);
  } catch (error) {
    logger.error('❌ Erro ao indexar mensagens:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Executar script
indexAllMessages()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    logger.error('Erro fatal:', error);
    process.exit(1);
  });
