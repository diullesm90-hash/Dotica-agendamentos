const jwt  = require('jsonwebtoken');
const User = require('../models/User.model');

const protect = async (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer '))
    return res.status(401).json({ message: 'Não autenticado. Token ausente.' });

  try {
    const decoded = jwt.verify(auth.split(' ')[1], process.env.JWT_SECRET);
    const user    = await User.findById(decoded.id);
    if (!user || !user.isActive)
      return res.status(401).json({ message: 'Usuário inativo ou não encontrado.' });
    req.user = user;
    next();
  } catch {
    res.status(401).json({ message: 'Token inválido ou expirado.' });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin')
    return res.status(403).json({ message: 'Acesso restrito a administradores.' });
  next();
};

module.exports = { protect, adminOnly };
