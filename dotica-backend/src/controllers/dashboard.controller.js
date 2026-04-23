const Appointment = require('../models/Appointment.model');
const Client      = require('../models/Client.model');

const getDashboard = async (req, res, next) => {
  try {
    const todayStr = new Date().toISOString().split('T')[0];

    // Agendamentos de hoje
    const todayAppts = await Appointment.find({ date: todayStr })
      .populate('client',   'name phone')
      .populate('attendant','name')
      .sort({ time: 1 });

    const todayStats = {
      total:      todayAppts.length,
      compareceu: todayAppts.filter(a => a.status === 'compareceu').length,
      falta:      todayAppts.filter(a => a.status === 'falta').length,
      agendado:   todayAppts.filter(a => ['agendado','confirmado'].includes(a.status)).length,
      cancelado:  todayAppts.filter(a => a.status === 'cancelado').length,
    };
    const denom = todayStats.compareceu + todayStats.falta;
    todayStats.attendanceRate = denom > 0 ? Math.round(todayStats.compareceu / denom * 100) : 0;

    // Últimos 7 dias
    const week = [];
    for (let i = 6; i >= 0; i--) {
      const d  = new Date();
      d.setDate(d.getDate() - i);
      const ds = d.toISOString().split('T')[0];
      const da = await Appointment.find({ date: ds });
      week.push({
        date:       ds,
        label:      d.toLocaleDateString('pt-BR', { weekday:'short', day:'2-digit' }),
        total:      da.length,
        compareceu: da.filter(a => a.status === 'compareceu').length,
        falta:      da.filter(a => a.status === 'falta').length,
      });
    }

    // Mês atual
    const ym = todayStr.slice(0, 7);
    const monthAppts = await Appointment.find({ date: { $gte: ym + '-01', $lte: ym + '-31' } });
    const mPresent   = monthAppts.filter(a => a.status === 'compareceu').length;
    const mAbsent    = monthAppts.filter(a => a.status === 'falta').length;
    const monthStats = {
      total:          monthAppts.length,
      compareceu:     mPresent,
      falta:          mAbsent,
      attendanceRate: mPresent + mAbsent > 0 ? Math.round(mPresent / (mPresent + mAbsent) * 100) : 0,
    };

    // Tipos do mês
    const typeMap = {};
    monthAppts.forEach(a => { typeMap[a.type] = (typeMap[a.type] || 0) + 1; });
    const typeStats = Object.entries(typeMap)
      .map(([_id, count]) => ({ _id, count }))
      .sort((a, b) => b.count - a.count);

    const totalClients = await Client.countDocuments({ isActive: true });

    res.json({
      today: { stats: todayStats, appointments: todayAppts },
      week,
      month: monthStats,
      typeStats,
      totalClients,
    });
  } catch (err) { next(err); }
};

module.exports = { getDashboard };
