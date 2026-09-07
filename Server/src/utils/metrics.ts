import client from 'prom-client';
import express, { Request, Response } from 'express';


export const register = new client.Registry();


register.setDefaultLabels({
  app: 'save-bite-backend'
});


client.collectDefaultMetrics({ register });


export const httpRequestCounter = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register]
});

export const metricsEndpoint = async (req: Request, res: Response) => {
  res.setHeader('Content-Type', register.contentType);
  res.send(await register.metrics());
};

// it is the middleware to track all API requests
export const metricsMiddleware = (req: Request, res: Response, next: express.NextFunction) => {
  res.on('finish', () => {
   
    if (req.path !== '/metrics') {
      httpRequestCounter.labels({
        method: req.method,
        route: req.route ? req.route.path : req.path,
        status_code: res.statusCode.toString()
      }).inc();
    }
  });
  next();
};
