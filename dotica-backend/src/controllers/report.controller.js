const Appointment = require('../models/Appointment.model');

const getReport = async (req, res, next) => {
  try {
    const { startDate, endDate, status, type, attendant, format = 'json' } = req.query;
    if (!startDate || !endDate)
      return res.status(400).json({ message: 'startDate e endDate são obrigatórios.' });

    const query = { date: { $gte: startDate, $lte: endDate } };
    if (status)    query.status   = status;
    if (type)      query.type     = type;
    if (attendant) query.attendant = attendant;

    const list = await Appointment.find(query)
      .populate('client',   'name phone email')
      .populate('attendant','name')
      .sort({ date: 1, time: 1 });

    const total    = list.length;
    const present  = list.filter(a => a.status === 'compareceu').length;
    const absent   = list.filter(a => a.status === 'falta').length;
    const canceled = list.filter(a => a.status === 'cancelado').length;
    const summary  = {
      total, present, absent, canceled,
      attendanceRate: present + absent > 0 ? Math.round(present / (present + absent) * 100) : 0,
    };

    if (format === 'csv') {
      const TYPE_LABELS = { exame_vista:'Exame de Vista', ajuste_oculos:'Ajuste de Óculos', retirada:'Retirada', consulta_lentes:'Consulta de Lentes', outros:'Outros' };
      const header = ['Data','Hora','Cliente','Telefone','Tipo','Atendente','Status','Motivo Falta'];
      const rows   = list.map(a => [
        new Date(a.date + 'T12:00:00').toLocaleDateString('pt-BR'),
        a.time,
        a.client?.name || a.clientName || '',
        a.client?.phone || '',
        TYPE_LABELS[a.type] || a.type,
        a.attendant?.name || '',
        a.status,
        a.absenceReason || '',
      ]);
      const csv = '\uFEFF' + [header, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n');
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="relatorio_${startDate}_${endDate}.csv"`);
      return res.send(csv);
    }

    res.json({ summary, appointments: list, period: { startDate, endDate } });
  } catch (err) { next(err); }
};

module.exports = { getReport };
