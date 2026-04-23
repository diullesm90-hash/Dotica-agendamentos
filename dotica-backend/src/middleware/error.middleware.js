const errorHandler = (err, req, res, next) => {
  console.error('❌', err.message);

  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({ message: 'Dados inválidos', errors });
  }
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0] || 'campo';
    return res.status(409).json({ message: `Conflito: ${field} já existe.` });
  }
  if (err.name === 'CastError')
    return res.status(400).json({ message: 'ID inválido.' });

  res.status(err.status || 500).json({ message: err.message || 'Erro interno do servidor.' });
};

module.exports = { errorHandler };
