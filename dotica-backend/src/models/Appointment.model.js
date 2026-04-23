const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  client:     { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  clientName: { type: String }, // denormalizado para buscas rápidas
  attendant:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date:       { type: String, required: true },  // "YYYY-MM-DD"
  time:       { type: String, required: true },  // "HH:mm"
  type: {
    type: String,
    enum: ['exame_vista','ajuste_oculos','retirada','consulta_lentes','outros'],
    required: true,
  },
  status: {
    type: String,
    enum: ['agendado','confirmado','compareceu','falta','remarcado','cancelado'],
    default: 'agendado',
  },
  duration:       { type: Number, default: 30 },
  notes:          { type: String, trim: true },
  absenceReason:  { type: String, trim: true },
  rating:         { type: Number, min: 1, max: 5 },
  ratingComment:  { type: String, trim: true },
  unit:           { type: String, default: 'Principal' },
  rescheduledFrom:{ type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
  rescheduledTo:  { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
}, { timestamps: true });

// Evita dois agendamentos no mesmo horário para o mesmo atendente
appointmentSchema.index(
  { attendant: 1, date: 1, time: 1 },
  { unique: true, partialFilterExpression: { status: { $nin: ['cancelado','remarcado'] } } }
);
appointmentSchema.index({ date: 1, status: 1 });
appointmentSchema.index({ client: 1 });

module.exports = mongoose.model('Appointment', appointmentSchema);
