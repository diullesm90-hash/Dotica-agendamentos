async function populateSelects(){
  try{
    const[cr,ur]=await Promise.all([api.getClients(),api.getUsers()]);
    const clients=cr.clients||[];
    const users=ur||[];

    const cSel=document.getElementById('apptClient');
    const aSel=document.getElementById('apptAttendant');

    cSel.innerHTML='<option value="">Selecione o cliente</option>';
    aSel.innerHTML='<option value="">Selecione o atendente</option>';

    clients.forEach(c=>{
      const o=document.createElement('option');
      o.value=c._id;
      o.textContent=c.name;
      cSel.appendChild(o);
    });

    users.filter(u=>u.active).forEach(u=>{
      const o=document.createElement('option');
      o.value=u._id;
      o.textContent=u.name;
      aSel.appendChild(o);
    });

  }catch(e){console.error(e);}
}