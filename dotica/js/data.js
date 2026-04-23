// ============================================
// data.js — Dados mock (substitua pela API)
// ============================================

const USERS_DB = [
  { id:'u1', name:'Carlos Admin',    email:'admin@otica.com',      password:'admin123',      role:'admin',     unit:'Principal', active:true, lastLogin:'2025-04-20T08:30:00' },
  { id:'u2', name:'Maria Atendente', email:'atendente@otica.com',  password:'atendente123',  role:'atendente', unit:'Principal', active:true, lastLogin:'2025-04-20T09:15:00' },
  { id:'u3', name:'João Vendas',     email:'joao@otica.com',       password:'joao123',       role:'atendente', unit:'Filial 1',  active:true, lastLogin:'2025-04-19T14:00:00' },
];

let CLIENTS_DB = [
  { id:'c1', name:'Ana Beatriz Costa', phone:'(91) 98765-4321', email:'ana@email.com',          birth:'1990-03-14', notes:'Usa óculos multifocais' },
  { id:'c2', name:'Roberto Almeida',   phone:'(91) 99234-5678', email:'roberto@gmail.com',      birth:'1975-07-22', notes:'' },
  { id:'c3', name:'Fernanda Lima',     phone:'(91) 98111-2233', email:'fernanda.l@outlook.com', birth:'1995-11-05', notes:'Alergia a armações de metal' },
  { id:'c4', name:'Marcos Oliveira',   phone:'(91) 99876-5432', email:'marcos@empresa.com',     birth:'1988-01-30', notes:'' },
  { id:'c5', name:'Patrícia Santos',   phone:'(91) 98444-3311', email:'patricia.s@gmail.com',   birth:'2001-09-18', notes:'Lentes de contato' },
  { id:'c6', name:'Lucas Ferreira',    phone:'(91) 99001-2233', email:'lucas@gmail.com',        birth:'1998-06-07', notes:'' },
  { id:'c7', name:'Juliana Mendes',    phone:'(91) 98777-8899', email:'juliana@hotmail.com',    birth:'1985-12-25', notes:'Glaucoma em tratamento' },
  { id:'c8', name:'Cláudio Pinheiro',  phone:'(91) 99345-6789', email:'claudio@gmail.com',      birth:'1970-04-03', notes:'' },
];

// Função helper para gerar datas relativas ao dia atual
const _base = new Date();
const td = (d=0) => {
  const x = new Date(_base);
  x.setDate(x.getDate() + d);
  return x.toISOString().split('T')[0];
};

let APPTS_DB = [
  { id:'a1',  client:'c1', attendant:'u2', date:td(0),  time:'08:00', type:'exame_vista',     status:'compareceu', notes:'', rating:5, ratingComment:'Ótimo atendimento!' },
  { id:'a2',  client:'c2', attendant:'u2', date:td(0),  time:'09:00', type:'ajuste_oculos',   status:'compareceu', notes:'' },
  { id:'a3',  client:'c3', attendant:'u3', date:td(0),  time:'10:00', type:'retirada',        status:'agendado',   notes:'Óculos pronto para retirar' },
  { id:'a4',  client:'c4', attendant:'u2', date:td(0),  time:'11:00', type:'consulta_lentes', status:'confirmado', notes:'' },
  { id:'a5',  client:'c5', attendant:'u2', date:td(0),  time:'14:00', type:'exame_vista',     status:'falta',      notes:'', absenceReason:'Não respondeu ligações' },
  { id:'a6',  client:'c6', attendant:'u3', date:td(0),  time:'15:00', type:'outros',          status:'agendado',   notes:'' },
  { id:'a7',  client:'c7', attendant:'u2', date:td(-1), time:'09:00', type:'exame_vista',     status:'compareceu', notes:'', rating:4 },
  { id:'a8',  client:'c8', attendant:'u2', date:td(-1), time:'10:30', type:'ajuste_oculos',   status:'compareceu', notes:'' },
  { id:'a9',  client:'c1', attendant:'u3', date:td(-1), time:'14:00', type:'retirada',        status:'remarcado',  notes:'' },
  { id:'a10', client:'c2', attendant:'u2', date:td(1),  time:'08:30', type:'exame_vista',     status:'agendado',   notes:'' },
  { id:'a11', client:'c3', attendant:'u2', date:td(1),  time:'09:30', type:'consulta_lentes', status:'agendado',   notes:'' },
  { id:'a12', client:'c4', attendant:'u3', date:td(2),  time:'10:00', type:'ajuste_oculos',   status:'agendado',   notes:'' },
  { id:'a13', client:'c5', attendant:'u2', date:td(-2), time:'08:00', type:'exame_vista',     status:'compareceu', notes:'' },
  { id:'a14', client:'c6', attendant:'u2', date:td(-2), time:'09:30', type:'retirada',        status:'falta',      notes:'', absenceReason:'Viagem' },
  { id:'a15', client:'c7', attendant:'u3', date:td(-3), time:'11:00', type:'exame_vista',     status:'compareceu', notes:'', rating:5 },
  { id:'a16', client:'c8', attendant:'u2', date:td(-3), time:'14:30', type:'ajuste_oculos',   status:'compareceu', notes:'' },
  { id:'a17', client:'c1', attendant:'u2', date:td(3),  time:'09:00', type:'exame_vista',     status:'agendado',   notes:'' },
  { id:'a18', client:'c2', attendant:'u3', date:td(-4), time:'08:30', type:'consulta_lentes', status:'compareceu', notes:'' },
  { id:'a19', client:'c3', attendant:'u2', date:td(-4), time:'10:00', type:'outros',          status:'cancelado',  notes:'' },
  { id:'a20', client:'c4', attendant:'u2', date:td(-5), time:'09:00', type:'exame_vista',     status:'compareceu', notes:'', rating:3 },
];

const SETTINGS = {
  businessHours: {
    monday:    { open:'08:00', close:'18:00', isOpen:true },
    tuesday:   { open:'08:00', close:'18:00', isOpen:true },
    wednesday: { open:'08:00', close:'18:00', isOpen:true },
    thursday:  { open:'08:00', close:'18:00', isOpen:true },
    friday:    { open:'08:00', close:'18:00', isOpen:true },
    saturday:  { open:'08:00', close:'13:00', isOpen:true },
    sunday:    { open:'',      close:'',      isOpen:false },
  },
  slotDuration:    30,
  maxAdvanceDays:  60,
  emailNotifications:    false,
  whatsappNotifications: false,
  reminderHours:   24,
};
