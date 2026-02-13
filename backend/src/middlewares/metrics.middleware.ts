import { Request, Response, NextFunction } from 'express';
import { httpRequestsTotal, httpRequestDuration } from '../config/metrics';

export const metricsMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();

  // Interceptar o fim da resposta para coletar métricas
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000; // Converter para segundos
    const route = req.route?.path || req.path;
    const method = req.method;
    const statusCode = res.statusCode.toString();

    // Incrementar contador de requisições
    httpRequestsTotal.inc({
      method,
      route,
      status_code: statusCode,
    });

    // Registrar duração da requisição
    httpRequestDuration.observe(
      {
        method,
        route,
        status_code: statusCode,
      },
      duration,
    );
  });

  next();
};
