import { Registry, Counter, Histogram, Gauge } from 'prom-client';

// Registro global de métricas
export const register = new Registry();

// Prefixo para todas as métricas
const prefix = 'labzz_chat_';

// Métricas HTTP
export const httpRequestsTotal = new Counter({
  name: `${prefix}http_requests_total`,
  help: 'Total de requisições HTTP',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register],
});

export const httpRequestDuration = new Histogram({
  name: `${prefix}http_request_duration_seconds`,
  help: 'Duração das requisições HTTP em segundos',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1, 5],
  registers: [register],
});

// Métricas WebSocket
export const websocketConnectionsActive = new Gauge({
  name: `${prefix}websocket_connections_active`,
  help: 'Número de conexões WebSocket ativas',
  registers: [register],
});

export const websocketMessagesTotal = new Counter({
  name: `${prefix}websocket_messages_total`,
  help: 'Total de mensagens enviadas via WebSocket',
  labelNames: ['event_type'],
  registers: [register],
});

// Métricas de Database
export const databaseQueriesTotal = new Counter({
  name: `${prefix}database_queries_total`,
  help: 'Total de queries no banco de dados',
  labelNames: ['operation'],
  registers: [register],
});

export const databaseQueryDuration = new Histogram({
  name: `${prefix}database_query_duration_seconds`,
  help: 'Duração das queries do banco em segundos',
  labelNames: ['operation'],
  buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1],
  registers: [register],
});

// Métricas de Cache (Redis)
export const cacheHitsTotal = new Counter({
  name: `${prefix}cache_hits_total`,
  help: 'Total de cache hits',
  registers: [register],
});

export const cacheMissesTotal = new Counter({
  name: `${prefix}cache_misses_total`,
  help: 'Total de cache misses',
  registers: [register],
});

// Métricas de Filas (BullMQ)
export const queueJobsTotal = new Counter({
  name: `${prefix}queue_jobs_total`,
  help: 'Total de jobs processados na fila',
  labelNames: ['queue_name', 'status'],
  registers: [register],
});

export const queueJobDuration = new Histogram({
  name: `${prefix}queue_job_duration_seconds`,
  help: 'Duração do processamento de jobs',
  labelNames: ['queue_name'],
  buckets: [0.1, 0.5, 1, 5, 10, 30, 60],
  registers: [register],
});

// Métricas de sistema
export const usersOnline = new Gauge({
  name: `${prefix}users_online`,
  help: 'Número de usuários online',
  registers: [register],
});

export const messagesTotal = new Counter({
  name: `${prefix}messages_total`,
  help: 'Total de mensagens enviadas',
  registers: [register],
});

// Métricas Node.js padrão (CPU, Memory, etc)
import { collectDefaultMetrics } from 'prom-client';
collectDefaultMetrics({ register, prefix });

export default register;
