// settings.js — Configurações via API
async function renderSettings(){
  try{
    const settings=await api.getSettings();
    const form=document.getElementById('hoursForm');
    form.innerHTML=Object.entries(settings.businessHours||{}).map(([day,bh])=>`
      <div style="display:flex;align-items:center;gap:14px;padding:10px 0;border-bottom:1px solid var(--border)">
        <div style="width:140px;font-size:0.85rem;font-weight:500;color:var(--ink2)">${DAYS_PT_FULL[day]||day}</div>
        <label style="display:flex;align-items:center;gap:6px;text-transform:none;font-size:0.83rem;cursor:pointer;font-weight:400;margin:0">
          <input type="checkbox" id="open_${day}" ${bh.isOpen?'checked':''} style="width:auto" onchange="toggleDay('${day}')" /> Aberto
        </label>
        <div id="hours_${day}" style="display:flex;align-items:center;gap:8px;${bh.isOpen?'':'opacity:0.3;pointer-events:none'}">
          <input type="time" id="open_h_${day}"  value="${bh.open}"  style="width:110px" />
          <span style="color:var(--ink3);font-size:0.85rem">até</span>
          <input type="time" id="close_h_${day}" value="${bh.close}" style="width:110px" />
        </div>
      </div>`).join('');

    if(settings.slotDuration){const el=document.getElementById('slotDur');if(el)el.value=settings.slotDuration;}
    if(settings.maxAdvanceDays){const el=document.getElementById('maxDays');if(el)el.value=settings.maxAdvanceDays;}
    if(document.getElementById('emailNotif'))document.getElementById('emailNotif').checked=settings.emailNotifications||false;
    if(document.getElementById('waNotif'))   document.getElementById('waNotif').checked=settings.whatsappNotifications||false;
    if(document.getElementById('remindHours')&&settings.reminderHours)document.getElementById('remindHours').value=settings.reminderHours;
  }catch(e){toast('Erro ao carregar configurações: '+e.message,'err');}
}

function toggleDay(day){
  const isOpen=document.getElementById('open_'+day).checked;
  const el=document.getElementById('hours_'+day);
  el.style.opacity=isOpen?'1':'0.3'; el.style.pointerEvents=isOpen?'auto':'none';
}

async function saveSettings(){
  const body={businessHours:{}};
  const days=['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];
  days.forEach(day=>{
    const openEl=document.getElementById('open_'+day);
    if(!openEl)return;
    body.businessHours[day]={
      isOpen:openEl.checked,
      open:  document.getElementById('open_h_'+day)?.value||'08:00',
      close: document.getElementById('close_h_'+day)?.value||'18:00',
    };
  });
  const slotEl=document.getElementById('slotDur');
  const maxEl =document.getElementById('maxDays');
  if(slotEl)body.slotDuration=parseInt(slotEl.value);
  if(maxEl) body.maxAdvanceDays=parseInt(maxEl.value);
  body.emailNotifications   =document.getElementById('emailNotif')?.checked||false;
  body.whatsappNotifications=document.getElementById('waNotif')?.checked||false;
  const rh=document.getElementById('remindHours');
  if(rh)body.reminderHours=parseInt(rh.value);
  try{ await api.updateSettings(body); toast('Configurações salvas!','ok'); }
  catch(e){ toast(e.message,'err'); }
}

function switchTab(el,targetId){
  el.parentElement.querySelectorAll('.tab').forEach(t=>t.classList.remove('on'));
  el.classList.add('on');
  ['tabHours','tabInterval','tabNotif'].forEach(id=>{const e=document.getElementById(id);if(e)e.style.display=id===targetId?'block':'none';});
}
