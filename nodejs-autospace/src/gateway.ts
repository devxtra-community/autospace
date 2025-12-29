import { Router } from 'express';
export const gatewayRouter = Router();

gatewayRouter.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});
