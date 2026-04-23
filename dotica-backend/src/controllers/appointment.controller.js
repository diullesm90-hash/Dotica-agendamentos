const Appointment = require('../models/Appointment.model');
const Client      = require('../models/Client.model');
const Settings    = require('../models/Settings.model');

/* ---------- LISTAGEM ---------- */
const getAppointments = async (req, res, next) => {
  try {
    const { date, startDate, endDate, status, attendant, unit } = req.query;
    const query = {};

    if (date) {
      query.date = date;
    } else if (startDate && endDate) {
      // Para datas como string "YYYY-MM-DD" usamos $gte/$lte direto
      query.date = { $gte: startDate, $lte: endDate };
    }
    if (status)    query.status   = status;
    if (attendant) query.attendant = attendant;
    if (unit)      query.unit     = unit;

    const appointments = await Appointment.find(query)
      .populate('client',   'name phone email')
      .populate('attendant','name')
      .sort({ date: 1, time: 1 });

    res.json({ appointments, total: appointments.length });
  } catch (err) { next(err); }
};

/* ---------- DETALHE ---------- */
const getAppointment = async (req, res, next) => {
  try {
    const appt = await Appointment.findById(req.params.id)
      .populate('client')
      .populate('attendant','name email');
    if (!appt) return res.status(404).json({ message: 'Agendamento não encontrado.' });
    res.json(appt);
  } catch (err) { next(err); }
};

/* ---------- CRIAR ---------- */
const createAppointment = async (req, res, next) => {
  try {
    const { clientId, attendantId, date, time, type, duration, notes, unit } = req.body;

    // Verificar conflito de horário
    const conflict = await Appointment.findOne({
      attendant: attendantId,
      date,
      time,
      status: { $nin: ['cancelado','remarcado'] },
    });
    if (conflict)
      return res.status(409).json({ message: 'Conflito: já existe um agendamento neste horário.' });

    const client = await Client.findById(clientId);
    if (!client) return res.status(404).json({ message: 'Cliente não encontrado.' });

    const appt = await Appointment.create({
      client:     clientId,
      clientName: client.name,
      attendant:  attendantId,
      date, time, type,
      duration: duration || 30,
      notes,
      unit: unit || 'Principal',
    });

    await appt.populate([
      { path: 'client',   select: 'name phone' },
      { path: 'attendant',select: 'name' },
    ]);
    res.status(201).json(appt);
  } catch (err) { next(err); }
};

/* ---------- ATUALIZAR ---------- */
const updateAppointment = async (req, res, next) => {
  try {
    const appt = await Appointment.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate('client','name phone')
      .populate('attendant','name');
    if (!appt) return res.status(404).json({ message: 'Agendamento não encontrado.' });
    res.json(appt);
  } catch (err) { next(err); }
};

/* ---------- ATUALIZAR STATUS ---------- */
const updateStatus = async (req, res, next) => {
  try {
    const { status, absenceReason, rating, ratingComment } = req.body;
    const update = { status };
    if (absenceReason)  update.absenceReason = absenceReason;
    if (rating)         update.rating        = rating;
    if (ratingComment)  update.ratingComment = ratingComment;

    const appt = await Appointment.findByIdAndUpdate(req.params.id, update, { new: true })
      .populate('client','name phone')
      .populate('attendant','name');
    if (!appt) return res.status(404).json({ message: 'Agendamento não encontrado.' });
    res.json(appt);
  } catch (err) { next(err); }
};

/* ---------- REMARCAR ---------- */
const reschedule = async (req, res, next) => {
  try {
    const { date, time } = req.body;
    const orig = await Appointment.findById(req.params.id);
    if (!orig) return res.status(404).json({ message: 'Agendamento não encontrado.' });

    // Verificar conflito no novo horário
    const conflict = await Appointment.findOne({
      attendant: orig.attendant,
      date, time,
      status: { $nin: ['cancelado','remarcado'] },
    });
    if (conflict)
      return res.status(409).json({ message: 'Conflito no novo horário.' });

    // Marcar original como remarcado
    orig.status = 'remarcado';
    await orig.save();

    // Criar novo agendamento
    const novo = await Appointment.create({
      client:          orig.client,
      clientName:      orig.clientName,
      attendant:       orig.attendant,
      date, time,
      type:            orig.type,
      duration:        orig.duration,
      notes:           orig.notes,
      unit:            orig.unit,
      rescheduledFrom: orig._id,
    });
    orig.rescheduledTo = novo._id;
    await orig.save();

    await novo.populate([
      { path: 'client',   select: 'name phone' },
      { path: 'attendant',select: 'name' },
    ]);
    res.status(201).json(novo);
  } catch (err) { next(err); }
};

/* ---------- HORÁRIOS DISPONÍVEIS ---------- */
const getAvailability = async (req, res, next) => {
  try {
    const { date, attendantId, unit = 'Principal' } = req.query;
    if (!date) return res.status(400).json({ message: 'Data obrigatória.' });

    const settings = await Settings.getOrCreate(unit);
    const DAYS_EN  = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
    const dayName  = DAYS_EN[new Date(date + 'T12:00:00').getDay()];
    const bh       = settings.businessHours[dayName];

    if (!bh || !bh.isOpen)
      return res.json({ available: [], message: 'Sem atendimento neste dia.' });

    const [oh, om] = bh.open.split(':').map(Number);
    const [ch, cm] = bh.close.split(':').map(Number);

    const booked = await Appointment.find({
      date,
      ...(attendantId ? { attendant: attendantId } : {}),
      status: { $nin: ['cancelado','remarcado'] },
    }).select('time');
    const bookedTimes = new Set(booked.map(a => a.time));

    const available = [];
    let cur = oh * 60 + om;
    while (cur < ch * 60 + cm) {
      const h = String(Math.floor(cur / 60)).padStart(2,'0');
      const m = String(cur % 60).padStart(2,'0');
      available.push({ time: `${h}:${m}`, busy: bookedTimes.has(`${h}:${m}`) });
      cur += settings.slotDuration;
    }

    res.json({ available, slotDuration: settings.slotDuration });
  } catch (err) { next(err); }
};

/* ---------- CANCELAR ---------- */
const cancelAppointment = async (req, res, next) => {
  try {
    await Appointment.findByIdAndUpdate(req.params.id, { status: 'cancelado' });
    res.json({ message: 'Agendamento cancelado.' });
  } catch (err) { next(err); }
};

module.exports = {
  getAppointments, getAppointment, createAppointment, updateAppointment,
  updateStatus, reschedule, getAvailability, cancelAppointment,
};
