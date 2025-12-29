import express from 'express';
import { globalErrorHandler } from './middlewares/errorHandler';

const app = express();

app.use(express.json());

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use(globalErrorHandler)
export default app;
