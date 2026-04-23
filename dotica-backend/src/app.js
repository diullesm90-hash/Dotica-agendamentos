const express    = require('express');
const cors       = require('cors');
const helmet     = require('helmet');
const morgan     = require('morgan');
const rateLimit  = require('express-rate-limit');

const authRoutes        = require('./routes/auth.routes');
const userRoutes        = require('./routes/user.routes');
const clientRoutes      = require('./routes/client.routes');
const appointmentRoutes = require('./routes/appointment.routes');
const dashboardRoutes   = require('./routes/dashboard.routes');
const reportRoutes      = require('./routes/report.routes');
const settingsRoutes    = require('./routes/settings.routes');
const { errorHandler }  = require('./middleware/error.middleware');

const app = express();

// ── Segurança ──────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
}));

// ── Rate limit ─────────────────────────────────────
app.use('/api', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: { message: 'Muitas requisições. Tente novamente em 15 minutos.' },
}));

// ── Parsing / Log ──────────────────────────────────
if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Rotas ──────────────────────────────────────────
app.use('/api/auth',         authRoutes);
app.use('/api/users',        userRoutes);
app.use('/api/clients',      clientRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/dashboard',    dashboardRoutes);
app.use('/api/reports',      reportRoutes);
app.use('/api/settings',     settingsRoutes);

// ── Health check ───────────────────────────────────
app.get('/api/health', (_req, res) =>
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
);

// ── Erro global ────────────────────────────────────
app.use(errorHandler);

module.exports = app;
