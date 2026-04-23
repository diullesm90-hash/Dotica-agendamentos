const jwt  = require('jsonwebtoken');
const User = require('../models/User.model');

const genToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

// POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: 'Email e senha são obrigatórios.' });

    const user = await User.findOne({ email, isActive: true });
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ message: 'Credenciais inválidas.' });

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    res.json({ token: genToken(user._id), user });
  } catch (err) { next(err); }
};

// GET /api/auth/me
const getMe = (req, res) => res.json(req.user);

// POST /api/auth/change-password
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);
    if (!(await user.comparePassword(currentPassword)))
      return res.status(400).json({ message: 'Senha atual incorreta.' });
    user.password = newPassword;
    await user.save();
    res.json({ message: 'Senha alterada com sucesso.' });
  } catch (err) { next(err); }
};

module.exports = { login, getMe, changePassword };
