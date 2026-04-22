// ============================================
// helpers.js — Constantes e funções utilitárias
// ============================================

const TYPE_LABELS = {
  exame_vista:'Exame de Vista', ajuste_oculos:'Ajuste de Óculos',
  retirada:'Retirada', consulta_lentes:'Consulta de Lentes', outros:'Outros',
};
const STATUS_CFG = {
  agendado:  {label:'Agendado',  badge:'b-accent'},
  confirmado:{label:'Confirmado',badge:'b-teal'},
  compareceu:{label:'Compareceu',badge:'b-green'},
  falta:     {label:'Falta',     badge:'b-crimson'},
  remarcado: {label:'Remarcado', badge:'b-gold'},
  cancelado: {label:'Cancelado', badge:'b-gray'},
};
const DAYS_EN=['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
const DAYS_PT=['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];
const MONTHS_PT=['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
const DAYS_PT_FULL={monday:'Segunda-feira',tuesday:'Terça-feira',wednesday:'Quarta-feira',thursday:'Quinta-feira',friday:'Sexta-feira',saturday:'Sábado',sunday:'Domingo'};

function initials(name=''){return name.split(' ').slice(0,2).map(w=>w[0]).join('').toUpperCase()}
function fmt(d){if(!d)return'';return new Date(d+'T12:00:00').toLocaleDateString('pt-BR')}
function isoDate(d){const x=new Date(d);return `${x.getFullYear()}-${String(x.getMonth()+1).padStart(2,'0')}-${String(x.getDate()).padStart(2,'0')}`}
function todayISO(){return isoDate(new Date())}
function clientName(a){return a.client?.name||a.clientName||'—'}
function clientPhone(a){return a.client?.phone||'—'}
function attendantName(a){return a.attendant?.name||'—'}

function statusBadge(s){
  const c=STATUS_CFG[s]||{label:s,badge:'b-gray'};
  return `<span class="badge ${c.badge}"><span class="b-dot"></span>${c.label}</span>`;
}

function toast(msg,type='inf'){
  const icons={ok:'✓',err:'✕',inf:'ℹ'};
  const el=document.createElement('div');
  el.className=`toast ${type}`;
  el.innerHTML=`<span>${icons[type]||'ℹ'}</span><span>${msg}</span>`;
  document.getElementById('toasts').appendChild(el);
  setTimeout(()=>el.remove(),3500);
}

function showLoading(id,cols=5){
  const el=document.getElementById(id);
  if(el)el.innerHTML=`<tr><td colspan="${cols}" style="text-align:center;padding:30px;color:var(--ink3)"><div style="display:inline-block;width:22px;height:22px;border:3px solid var(--border);border-top-color:var(--red);border-radius:50%;animation:spin 0.7s linear infinite"></div></td></tr>`;
}
if(!document.getElementById('spinStyle')){const s=document.createElement('style');s.id='spinStyle';s.textContent='@keyframes spin{to{transform:rotate(360deg)}}';document.head.appendChild(s);}

async function populateSelects(){
  try{
    const[cr,ur]=await Promise.all([api.getClients(),api.getUsers()]);
    const clients=cr.clients||[];const users=ur||[];
    const cSel=document.getElementById('apptClient');
    const aSel=document.getElementById('apptAttendant');
    cSel.innerHTML='<option value="">Selecione o cliente</option>';
    aSel.innerHTML='<option value="">Selecione o atendente</option>';
    clients.forEach(c=>{const o=document.createElement('option');o.value=c._id;o.textContent=c.name;cSel.appendChild(o);});
    users.filter(u=>u.isActive).forEach(u=>{const o=document.createElement('option');o.value=u._id;o.textContent=u.name;aSel.appendChild(o);});
  }catch(e){console.error(e);}
}