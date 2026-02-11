/**
 * Script para indexar todos os usuários existentes no Elasticsearch
 * Uso: npm run index-users
 */

import 'dotenv/config';
import prisma from '../config/database';
import elasticsearchService from '../services/elasticsearch.service';
import { UserDocument } from '../types/elasticsearch.types';
import logger from '../utils/logger';

async function indexAllUsers() {
    try {
        logger.info('🔍 Iniciando indexação de usuários...');

        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                username: true,
                name: true,
                avatar: true,
                isOnline: true,
                createdAt: true,
            },
        });

        logger.info(`📊 Total de usuários para indexar: ${users.length}`);

        if (users.length === 0) {
            logger.info('✅ Nenhum usuário para indexar');
            return;
        }

        // Indexar um por um
        let indexed = 0;

        for (const user of users) {
            const userDoc: UserDocument = {
                id: user.id,
                email: user.email,
                username: user.username,
                name: user.name,
                avatar: user.avatar,
                isOnline: user.isOnline,
                createdAt: user.createdAt,
            };

            await elasticsearchService.indexUser(userDoc);
            indexed++;

            if (indexed % 10 === 0) {
                logger.info(`📝 Progresso: ${indexed}/${users.length} usuários indexados`);
            }
        }

        logger.info(`✅ Indexação concluída! Total: ${indexed} usuários`);
    } catch (error) {
        logger.error('❌ Erro ao indexar usuários:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Executar script
indexAllUsers()
    .then(() => {
        process.exit(0);
    })
    .catch((error) => {
        logger.error('Erro fatal:', error);
        process.exit(1);
    });
