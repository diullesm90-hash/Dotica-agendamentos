require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const User     = require('../models/User.model');
const Client   = require('../models/Client.model');
const Settings = require('../models/Settings.model');

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Conectado ao MongoDB');

  // ── Usuários ──────────────────────────────────────
  const adminExists = await User.findOne({ email: 'admin@dotica.com' });
  if (!adminExists) {
    await User.create({ name: 'Administrador', email: 'admin@dotica.com', password: 'admin123', role: 'admin' });
    console.log('✅ Admin criado: admin@dotica.com / admin123');
  } else {
    console.log('ℹ️  Admin já existe');
  }

  const attExists = await User.findOne({ email: 'atendente@dotica.com' });
  if (!attExists) {
    await User.create({ name: 'Maria Atendente', email: 'atendente@dotica.com', password: 'atendente123', role: 'atendente' });
    console.log('✅ Atendente criada: atendente@dotica.com / atendente123');
  }

  // ── Clientes de exemplo ───────────────────────────
  const clientCount = await Client.countDocuments();
  if (clientCount === 0) {
    await Client.insertMany([
      { name: 'Ana Beatriz Costa', phone: '(91) 98765-4321', email: 'ana@email.com',          birth: '1990-03-14', notes: 'Usa óculos multifocais' },
      { name: 'Roberto Almeida',   phone: '(91) 99234-5678', email: 'roberto@gmail.com',      birth: '1975-07-22' },
      { name: 'Fernanda Lima',     phone: '(91) 98111-2233', email: 'fernanda@outlook.com',   birth: '1995-11-05', notes: 'Alergia a armações de metal' },
      { name: 'Marcos Oliveira',   phone: '(91) 99876-5432', email: 'marcos@empresa.com',     birth: '1988-01-30' },
      { name: 'Patrícia Santos',   phone: '(91) 98444-3311', email: 'patricia@gmail.com',     birth: '2001-09-18', notes: 'Lentes de contato' },
    ]);
    console.log('✅ 5 clientes de exemplo criados');
  } else {
    console.log(`ℹ️  ${clientCount} clientes já existem`);
  }

  // ── Configurações padrão ──────────────────────────
  await Settings.getOrCreate('Principal');
  console.log('✅ Configurações padrão OK');

  await mongoose.disconnect();
  console.log('🎉 Seed concluído! Rode: npm run dev');
}

seed().catch(err => { console.error(err); process.exit(1); });
