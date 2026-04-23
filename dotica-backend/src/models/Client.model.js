const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  name:      { type: String, required: true, trim: true },
  phone:     { type: String, required: true, trim: true },
  email:     { type: String, trim: true, lowercase: true },
  birth:     { type: String },
  notes:     { type: String, trim: true },
  isActive:  { type: Boolean, default: true },
  unit:      { type: String, default: 'Principal' },
}, { timestamps: true });

clientSchema.index({ name: 'text', phone: 'text', email: 'text' });

module.exports = mongoose.model('Client', clientSchema);
