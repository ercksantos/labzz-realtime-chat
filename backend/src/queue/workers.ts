/**
 * Inicializar todos os workers
 * Este arquivo deve ser importado no server.ts para iniciar o processamento das filas
 */

import emailWorker from './emailWorker';
import notificationWorker from './notificationWorker';
import logger from '../utils/logger';

// Graceful shutdown
const shutdown = async () => {
  logger.info('Encerrando workers...');

  await Promise.all([emailWorker.close(), notificationWorker.close()]);

  logger.info('Workers encerrados');
  process.exit(0);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

logger.info('🚀 Todos os workers foram inicializados');

export { emailWorker, notificationWorker };
