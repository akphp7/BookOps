import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import http from 'http';
import { connectDB } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import availabilityRoutes from './routes/availabilityRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import integrationRoutes from './routes/integrationRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import publicRoutes from './routes/publicRoutes.js';
import serviceRoutes from './routes/serviceRoutes.js';

const app = express();
const PORT = 5000;

// DB
connectDB();

//Middleware

app.use(cors());
app.use(express.json());


// Routes

app.get('/', (req, res) => {
  res.send('API Working!');
});

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/availability', availabilityRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/integrations', integrationRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/public', publicRoutes);
app.use('/public', publicRoutes);

const server = http.createServer(app);

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Stop the existing backend process or set a different PORT in backend/.env.`);
    process.exit(1);
  }

  throw error;
});

server.listen(PORT, () => {         
    console.log(`Server Started on http://localhost:${PORT}`);
});

export default app;
