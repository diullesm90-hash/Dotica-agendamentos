const express    = require('express');
const cors       = require('cors');
const helmet     = require('helmet');
const morgan     = require('morgan');
const rateLimit  = require('express-rate-limit');

const authRoutes        = require('Auth.js');
const userRoutes        = require('User.js');
const clientRoutes      = require('Clientes.js');
const appointmentRoutes = require('Appointment.js');
const dashboardRoutes   = require('Dashboard.js');
const reportRoutes      = require('Reports.js');
const settingsRoutes    = require('Settings.js');
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
app.use('/api/Auth',         authRoutes);
app.use('/api/Users',        userRoutes);
app.use('/api/Clients',      clientRoutes);
app.use('/api/Appointments', appointmentRoutes);
app.use('/api/Dashboard',    dashboardRoutes);
app.use('/api/Reports',      reportRoutes);
app.use('/api/Settings',     settingsRoutes);

// ── Health check ───────────────────────────────────
app.get('/api/health', (_req, res) =>
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
);

// ── Erro global ────────────────────────────────────
app.use(errorHandler);

module.exports = app;