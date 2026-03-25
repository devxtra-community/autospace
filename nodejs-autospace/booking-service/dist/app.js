import express from 'express';
import cors from 'cors';
import bookingRoutes from './routes/booking.routes.js';
import morgan from 'morgan';
import { errorHandler } from './middleware/error.middleware.js';
const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
// Health check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'UP', service: 'booking-service' });
});
app.use('/bookings', bookingRoutes);
app.use(errorHandler);
export default app;
//# sourceMappingURL=app.js.map