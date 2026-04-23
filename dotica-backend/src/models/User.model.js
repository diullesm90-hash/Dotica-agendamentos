const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name:      { type: String, required: true, trim: true },
  email:     { type: String, required: true, unique: true, lowercase: true, trim: true },
  password:  { type: String, required: true, minlength: 6 },
  role:      { type: String, enum: ['admin','atendente'], default: 'atendente' },
  unit:      { type: String, default: 'Principal' },
  phone:     { type: String, trim: true },
  isActive:  { type: Boolean, default: true },
  lastLogin: { type: Date },
}, { timestamps: true });

// Hash da senha antes de salvar
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Comparar senha
userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

// Remove o campo password ao serializar
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
