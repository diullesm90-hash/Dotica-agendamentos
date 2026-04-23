require('dotenv').config();
const app       = require('./App');
const connectDB = require('./Data');

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
    console.log(`📌 Ambiente: ${process.env.NODE_ENV}`);
  });
});