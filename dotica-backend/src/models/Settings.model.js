const mongoose = require('mongoose');

const daySchema = {
  open:   { type: String, default: '08:00' },
  close:  { type: String, default: '18:00' },
  isOpen: { type: Boolean, default: true  },
};

const settingsSchema = new mongoose.Schema({
  unit: { type: String, default: 'Principal', unique: true },
  businessHours: {
    monday:    daySchema,
    tuesday:   daySchema,
    wednesday: daySchema,
    thursday:  daySchema,
    friday:    daySchema,
    saturday:  { open: { type: String, default: '08:00' }, close: { type: String, default: '13:00' }, isOpen: { type: Boolean, default: true } },
    sunday:    { open: { type: String, default: '' },      close: { type: String, default: '' },      isOpen: { type: Boolean, default: false } },
  },
  slotDuration:           { type: Number, default: 30 },
  maxAdvanceDays:         { type: Number, default: 60 },
  emailNotifications:     { type: Boolean, default: false },
  whatsappNotifications:  { type: Boolean, default: false },
  reminderHours:          { type: Number,  default: 24 },
}, { timestamps: true });

// Cria configurações padrão se não existir
settingsSchema.statics.getOrCreate = async function (unit = 'Principal') {
  let s = await this.findOne({ unit });
  if (!s) s = await this.create({ unit });
  return s;
};

module.exports = mongoose.model('Settings', settingsSchema);
