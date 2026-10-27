
import express from 'express';
import cors from 'cors';
import authRoutes from './modules/auth/auth.routes.js';
import leadRoutes from './modules/leads/lead.routes.js';
import dealRoutes from './modules/deals/deal.routes.js';
import analyticsRoutes from './modules/analytics/analytics.routes.js';
import activityRoutes from './modules/activities/activity.routes.js';
import userRoutes from './modules/users/user.routes.js';
import cookieParser from 'cookie-parser';
const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'LeadFlow API is running',
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/deals', dealRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/users', userRoutes);
app.use((err, req, res, next) => {
  console.error(err);

  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    message:
      statusCode === 500
        ? 'Internal server error'
        : err.message,
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

export default app;
