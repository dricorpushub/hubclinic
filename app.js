const $ = (s, el=document)=>el.querySelector(s);
const $$ = (s, el=document)=>[...el.querySelectorAll(s)];
const BRL = new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'});
const app = $('#app');
const state = {
  page: location.hash.replace('#/','') || 'dashboard',
  treatments: JSON.parse(localStorage.getItem('hub_treatments') || 'null') || HUB_DATA.treatments,
  leads: JSON.parse(localStorage.getItem('hub_leads') || 'null') || HUB_DATA.leads,
  campaigns: JSON.parse(localStorage.getItem('hub_campaigns') || 'null') || HUB_DATA.campaigns,
  ideas: JSON.parse(localStorage.getItem('hub_ideas') || 'null') || [
    {title:'Clube de vantagens',category:'Fidelização',status:'Em análise',text:'Programa de pontos por recorrência, indicação e produtos.'},
    {title:'Dia da transformação',category:'Evento',status:'Prioridade',text:'Agenda concentrada com avaliação, experiência e condição especial.'},
    {title:'Série Bastidores',category:'Conteúdo',status:'Banco de ideias',text:'Vídeos curtos mostrando tecnologia, equipe e rotina real da clínica.'}
  ],
  checklist: JSON.parse(localStorage.getItem('hub_checklist') || 'null') || [
    {text:'Revisar agenda do dia',done:true},{text:'Validar confirmações',done:true},{text:'Conferir salas e materiais',done:false},
    {text:'Atualizar indicadores comerciais',done:false},{text:'Realizar reunião rápida da equipe',done:false}
  ]
};
const nav = [
  ['','dashboard','⌂','Dashboard'],
  ['Comercial','tabela','▦','Tabela de vendas'],['Comercial','funil-comercial','↗','Funil'],
  ['Gestão','bonificacao','◇','Bonificação'],['Gestão','faturamento','◫','Faturamento'],['Gestão','premiacao','☆','Premiação'],['Gestão','resultados','◎','Resultados'],
  ['Marketing','campanhas','◉','Campanhas'],['Marketing','planejamento','□','Planejamento'],['Marketing','ideias','✦','Ideias'],['Marketing','biblioteca','▣','Biblioteca'],['Marketing','funil-marketing','↗','Funil'],
  ['Operação','fluxos','⌁','Fluxos'],['Operação','checklists','✓','Checklists'],['Operação','processos','≡','Processos'],
  ['Treinamentos','trilhas','♢','Trilhas'],['Treinamentos','aulas','▷','Aulas'],['Treinamentos','materiais','▤','Materiais'],['Treinamentos','avaliacoes','✓','Avaliações'],['Treinamentos','progresso','◔','Progresso']
];
const labels = Object.fromEntries(nav.map(x=>[x[1],x[3]]));
function renderNav(){
  let last=null, html='';
  nav.forEach(([group,id,icon,label])=>{
    if(group && group!==last) html+=`<div class="nav-group-title">${group}</div>`;
    html+=`<button class="nav-item ${state.page===id?'active':''}" data-page="${id}"><span class="nav-icon">${icon}</span>${label}</button>`;
    last=group;
  });
  $('#mainNav').innerHTML=html;
  $$('.nav-item').forEach(b=>b.onclick=()=>navigate(b.dataset.page));
}
function navigate(page){ state.page=page; location.hash='#/'+page; $('#sidebar').classList.remove('open'); render(); }
window.addEventListener('hashchange',()=>{state.page=location.hash.replace('#/','')||'dashboard';render()});
$('#menuBtn').onclick=()=>$('#sidebar').classList.toggle('open');
function toast(msg){const t=$('#toast');t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2200)}
function modal(html){$('#modal').innerHTML=html;$('#modalBackdrop').classList.add('open')}
function closeModal(){$('#modalBackdrop').classList.remove('open')}
$('#modalBackdrop').onclick=e=>{if(e.target===e.currentTarget)closeModal()}
function save(key,val){localStorage.setItem(key,JSON.stringify(val))}
function head(title,desc,action=''){return `<div class="page-head"><div><h2>${title}</h2><p>${desc}</p></div>${action?`<div class="actions">${action}</div>`:''}</div>`}
function kpi(label,value,trend,icon='•',tone='up'){return `<div class="card kpi"><div class="kpi-top"><span>${label}</span><span class="kpi-icon">${icon}</span></div><div class="kpi-value">${value}</div><div class="trend ${tone}">${trend}</div></div>`}
function stageBonus(rule,value){
  let current={nome:'Sem faixa',meta:0,bonus:0};
  rule.faixas.forEach(f=>{if(value>=f.meta)current=f});
  let bonus=current.bonus;
  if(rule.excedente && value>=rule.excedente.a_partir) bonus+=(value-(rule.excedente.a_partir-1))*rule.excedente.valor_unitario;
  return {...current,bonus};
}
function personResult(p){
  const r=HUB_DATA.bonusRules;
  const b1=stageBonus(r.consultas,p.consultas).bonus,b2=stageBonus(r.avaliacoes,p.avaliacoes).bonus;
  const b3=stageBonus(r.vendas53,p.vendas53).bonus,b4=stageBonus(r.vendas54,p.vendas54).bonus,bp=p.produtos*.05;
  return {...p,bonus:b1+b2+b3+b4+bp,b1,b2,b3,b4,bp,topTier:Math.max(stageBonus(r.vendas53,p.vendas53).meta,stageBonus(r.vendas54,p.vendas54).meta)};
}
function dashboard(){
  const team=HUB_DATA.team.map(personResult), totalBonus=team.reduce((a,b)=>a+b.bonus,0);
  const ranking=[...team].filter(x=>x.name!=='Driele').sort((a,b)=>b.bonus-a.bonus);
  const months=[72,88,96,105,118,132,128];
  const healthItems=[
    {label:'Meta de faturamento',value:107,tone:'green'},
    {label:'Conversão comercial',value:83,tone:'blue'},
    {label:'Comparecimento',value:82,tone:'amber'},
    {label:'Execução de campanhas',value:75,tone:'purple'}
  ];
  return `
  <div class="welcome-card">
    <div>
      <span class="welcome-kicker">QUINTA-FEIRA, 31 DE JULHO</span>
      <h2>Bom dia, Aline.</h2>
      <p>A clínica está acima da meta de faturamento. O principal ponto de atenção hoje é o comparecimento.</p>
    </div>
    <div class="welcome-actions">
      <button class="btn btn-secondary" onclick="navigate('resultados')">Ver resultados</button>
      <button class="btn btn-primary" onclick="navigate('funil-comercial')">Abrir funil</button>
    </div>
  </div>

  <div class="quick-actions">
    <button class="quick-action" onclick="leadForm()"><span>＋</span><div><strong>Novo lead</strong><small>Adicionar ao funil</small></div></button>
    <button class="quick-action" onclick="navigate('tabela')"><span>▦</span><div><strong>Consultar tabela</strong><small>Valores e condições</small></div></button>
    <button class="quick-action" onclick="showSimulator()"><span>◇</span><div><strong>Simular bônus</strong><small>Calcular faixas</small></div></button>
    <button class="quick-action" onclick="campaignForm()"><span>◉</span><div><strong>Nova campanha</strong><small>Planejar ação</small></div></button>
  </div>

  <div class="kpi-grid">
   ${kpi('Faturamento do mês',BRL.format(128450),'+ 8,7% em relação a junho','↗')}
   ${kpi('Bonificações previstas',BRL.format(totalBonus),ranking.length+' pessoas elegíveis','◇')}
   ${kpi('Conversão comercial','24,8%','+ 3,1 pontos no período','◎')}
   ${kpi('Campanhas ativas','3','1 campanha encerra esta semana','◉','down')}
  </div>

  <div class="dashboard-grid">
    <div class="card panel revenue-panel">
      <div class="panel-head"><div><h3>Evolução do faturamento</h3><span>Últimos 7 meses · em milhares</span></div><span class="tag green">Meta 120 mil</span></div>
      <div class="chart">${months.map((v,i)=>`<div class="chart-col"><div class="bar" style="height:${v/1.45}%"></div><span class="chart-label">${['Jan','Fev','Mar','Abr','Mai','Jun','Jul'][i]}</span></div>`).join('')}</div>
    </div>

    <div class="card panel health-panel">
      <div class="panel-head"><div><h3>Saúde da clínica</h3><span>Índice consolidado do mês</span></div><span class="health-score">87</span></div>
      <div class="health-ring"><div><strong>87%</strong><span>Bom desempenho</span></div></div>
      <div class="health-list">${healthItems.map(x=>`<div class="health-item"><div><span>${x.label}</span><strong>${x.value}%</strong></div><div class="progress"><span class="${x.tone}" style="width:${x.value}%"></span></div></div>`).join('')}</div>
    </div>

    <div class="card panel ranking-panel">
      <div class="panel-head"><div><h3>Ranking de bonificação</h3><span>Bonificação individual</span></div><button class="mini-btn" onclick="navigate('bonificacao')">Ver tudo</button></div>
      <div class="ranking">${ranking.slice(0,5).map((p,i)=>`<div class="rank-row"><div class="rank-pos">${i+1}</div><div class="rank-name"><strong>${p.name}</strong><span>${p.role}</span></div><div class="rank-value"><strong>${BRL.format(p.bonus)}</strong><span>previsto</span></div></div>`).join('')}</div>
    </div>

    <div class="card panel attention-panel">
      <div class="panel-head"><div><h3>Central de atenção</h3><span>Prioridades que pedem ação</span></div><span class="tag red">3 alertas</span></div>
      <button class="attention-item" onclick="navigate('resultados')"><span class="attention-dot red"></span><div><strong>Comparecimento abaixo da meta</strong><small>82% realizado · meta de 85%</small></div><b>→</b></button>
      <button class="attention-item" onclick="navigate('campanhas')"><span class="attention-dot amber"></span><div><strong>Campanha encerra esta semana</strong><small>Revisar leads e última chamada</small></div><b>→</b></button>
      <button class="attention-item" onclick="navigate('checklists')"><span class="attention-dot blue"></span><div><strong>3 tarefas operacionais pendentes</strong><small>Checklist de abertura diária</small></div><b>→</b></button>
    </div>
  </div>`;
}
function tabela(){
  const cats=['Todas',...new Set(state.treatments.map(x=>x.categoria))];
  return head('Tabela de vendas','A tabela oficial da clínica com valores, limites e condições comerciais.',
    `<button class="btn btn-secondary" onclick="exportTreatments()">Exportar</button><button class="btn btn-primary" onclick="treatmentForm()">+ Novo tratamento</button>`)+
  `<div class="card panel">
    <div class="toolbar"><div class="search"><input id="tSearch" placeholder="Buscar tratamento..."></div><select id="tCat">${cats.map(c=>`<option>${c}</option>`).join('')}</select><span class="tag" id="tCount">${state.treatments.length} itens</span></div>
    <div class="table-wrap"><table class="data-table"><thead><tr><th>Tratamento</th><th>Categoria</th><th>Valor tabela</th><th>Desconto</th><th>Valor mínimo</th><th>Venda livre</th><th></th></tr></thead><tbody id="tBody"></tbody></table></div>
  </div>`;
}
function drawTreatments(){
  const q=($('#tSearch')?.value||'').toLowerCase(),cat=$('#tCat')?.value||'Todas';
  const rows=state.treatments.filter(x=>(cat==='Todas'||x.categoria===cat)&&x.tratamento.toLowerCase().includes(q));
  $('#tCount').textContent=rows.length+' itens';
  $('#tBody').innerHTML=rows.slice(0,100).map(x=>`<tr><td><strong>${x.tratamento}</strong><br><span style="color:var(--muted);font-size:11px">ID ${x.id}</span></td><td><span class="tag">${x.categoria}</span></td><td class="money">${BRL.format(x.valor)}</td><td>${x.percentual}%</td><td class="money">${BRL.format(x.valorMinimo)}</td><td><span class="tag ${x.vendaLivre==='Sim'?'green':'amber'}">${x.vendaLivre}</span></td><td><button class="mini-btn" onclick="treatmentForm('${x.id}')">Editar</button></td></tr>`).join('') || `<tr><td colspan="7"><div class="empty"><strong>Nenhum tratamento encontrado</strong>Tente mudar os filtros.</div></td></tr>`;
}
function treatmentForm(id){
  const x=state.treatments.find(t=>t.id===id)||{id:String(Date.now()),tratamento:'',categoria:'',valor:0,percentual:0,valorMinimo:0,valorDesconto:0,vendaLivre:'Sim',parcelamento:'Consultar condição',avaliacao:'A definir',observacoes:''};
  modal(`<h2>${id?'Editar':'Novo'} tratamento</h2><div class="form-grid">
    <div class="field full"><label>Nome do tratamento</label><input id="fName" value="${x.tratamento}"></div>
    <div class="field"><label>Categoria</label><input id="fCat" value="${x.categoria}"></div>
    <div class="field"><label>Valor de tabela</label><input id="fValue" type="number" step=".01" value="${x.valor}"></div>
    <div class="field"><label>Desconto máximo (%)</label><input id="fDiscount" type="number" step=".01" value="${x.percentual}"></div>
    <div class="field"><label>Venda livre</label><select id="fFree"><option ${x.vendaLivre==='Sim'?'selected':''}>Sim</option><option ${x.vendaLivre==='Não'?'selected':''}>Não</option></select></div>
    <div class="field full"><label>Observações</label><textarea id="fObs">${x.observacoes||''}</textarea></div></div>
    <div class="modal-actions">${id?`<button class="btn btn-danger" onclick="deleteTreatment('${x.id}')">Excluir</button>`:''}<button class="btn btn-secondary" onclick="closeModal()">Cancelar</button><button class="btn btn-primary" onclick="saveTreatment('${x.id}')">Salvar</button></div>`);
}
function saveTreatment(id){
  const value=Number($('#fValue').value),discount=Number($('#fDiscount').value);
  const obj={id,tratamento:$('#fName').value,categoria:$('#fCat').value.toUpperCase(),valor:value,percentual:discount,valorMinimo:value*(1-discount/100),valorDesconto:value*discount/100,vendaLivre:$('#fFree').value,parcelamento:'Consultar condição',avaliacao:'A definir',observacoes:$('#fObs').value};
  const i=state.treatments.findIndex(x=>x.id===id); if(i>=0)state.treatments[i]=obj;else state.treatments.unshift(obj);
  save('hub_treatments',state.treatments);closeModal();render();toast('Tratamento salvo');
}
function deleteTreatment(id){if(confirm('Excluir este tratamento?')){state.treatments=state.treatments.filter(x=>x.id!==id);save('hub_treatments',state.treatments);closeModal();render();toast('Tratamento excluído')}}
function exportTreatments(){const blob=new Blob([JSON.stringify(state.treatments,null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='tabela-vendas-hubclinic.json';a.click()}
function funilComercial(){
  const stages=['Novo lead','Qualificação','Agendamento','Proposta','Venda'];
  return head('Funil comercial','Uma visão prática da jornada comercial. Arraste o olhar, não a paciência.',
    `<button class="btn btn-primary" onclick="leadForm()">+ Novo lead</button>`)+
    `<div class="kanban">${stages.map(s=>`<div class="kanban-col"><div class="kanban-head">${s}<span class="count">${state.leads.filter(l=>l.stage===s).length}</span></div>${state.leads.filter(l=>l.stage===s).map(l=>`<div class="lead-card"><h4>${l.name}</h4><p>${l.phone} · ${l.source}</p><div class="lead-meta"><strong>${BRL.format(l.value)}</strong><button class="mini-btn" onclick="leadForm('${l.name}')">Editar</button></div></div>`).join('')}</div>`).join('')}</div>`;
}
function leadForm(name){
  const l=state.leads.find(x=>x.name===name)||{name:'',phone:'',source:'Instagram',stage:'Novo lead',value:0};
  modal(`<h2>${name?'Editar':'Novo'} lead</h2><div class="form-grid"><div class="field full"><label>Nome</label><input id="lName" value="${l.name}"></div><div class="field"><label>Telefone</label><input id="lPhone" value="${l.phone}"></div><div class="field"><label>Origem</label><input id="lSource" value="${l.source}"></div><div class="field"><label>Etapa</label><select id="lStage">${['Novo lead','Qualificação','Agendamento','Proposta','Venda'].map(s=>`<option ${s===l.stage?'selected':''}>${s}</option>`).join('')}</select></div><div class="field"><label>Potencial</label><input id="lValue" type="number" value="${l.value}"></div></div><div class="modal-actions"><button class="btn btn-secondary" onclick="closeModal()">Cancelar</button><button class="btn btn-primary" onclick="saveLead('${name||''}')">Salvar</button></div>`);
}
function saveLead(old){const o={name:$('#lName').value,phone:$('#lPhone').value,source:$('#lSource').value,stage:$('#lStage').value,value:Number($('#lValue').value)};const i=state.leads.findIndex(x=>x.name===old);if(i>=0)state.leads[i]=o;else state.leads.push(o);save('hub_leads',state.leads);closeModal();render();toast('Lead salvo')}
function bonificacao(){
  const rules=HUB_DATA.bonusRules, team=HUB_DATA.team.map(personResult);
  const ranking=[...team].filter(x=>x.name!=='Driele').sort((a,b)=>b.bonus-a.bonus);
  const cards=['consultas','avaliacoes','vendas53','vendas54'].map(k=>{const r=rules[k];return `<div class="card bonus-card"><div class="bonus-title"><div><h3>${r.nome}</h3><p>${r.unidade}</p></div><span class="tag ${k==='consultas'?'purple':k==='avaliacoes'?'blue':k==='vendas53'?'amber':'green'}">${r.faixas.length} faixas</span></div><div class="tiers">${r.faixas.map(f=>`<div class="tier ${f.nome.includes('Preta')?'black':''}"><span>${f.nome}</span><strong>${r.unidade==='R$'?BRL.format(f.meta):f.meta+' '+r.unidade}</strong><span>${BRL.format(f.bonus)}</span></div>`).join('')}</div>${r.excedente?`<div class="extra-rule">Após a Faixa Preta: + ${BRL.format(r.excedente.valor_unitario)} por ${r.unidade.slice(0,-1)} excedente, a partir da ${r.excedente.a_partir}ª.</div>`:''}</div>`}).join('');
  return head('Bonificação','Regras, cálculo, ranking individual e visão separada da gerência.')+
    `<div class="tabs"><button class="tab active">Visão geral</button><button class="tab" onclick="showSimulator()">Simulador</button></div>
     <div class="bonus-grid">${cards}</div>
     <div class="grid-2" style="margin-top:18px"><div class="card panel"><div class="panel-head"><div><h3>Ranking individual</h3><span>O bônus da gerência não interfere na posição</span></div></div>
     <div class="table-wrap"><table class="data-table performance-table"><thead><tr><th>#</th><th>Colaborador</th><th>5.1</th><th>5.2</th><th>5.3</th><th>5.4</th><th>Produtos</th><th>Total</th></tr></thead><tbody>${ranking.map((p,i)=>`<tr><td><div class="rank-pos">${i+1}</div></td><td><div class="person"><div class="person-avatar">${p.name.slice(0,2).toUpperCase()}</div><div><strong>${p.name}</strong><span>${p.role}</span></div></div></td><td>${BRL.format(p.b1)}</td><td>${BRL.format(p.b2)}</td><td>${BRL.format(p.b3)}</td><td>${BRL.format(p.b4)}</td><td>${BRL.format(p.bp)}</td><td class="money">${BRL.format(p.bonus)}</td></tr>`).join('')}</tbody></table></div></div>
     <div class="card panel"><div class="panel-head"><div><h3>Painel da gerência</h3><span>Priscila</span></div><span class="tag purple">Separado do ranking</span></div>
       <div class="kpi-value">${BRL.format(1350)}</div><p style="color:var(--muted)">Bônus gerado pelas faixas de vendas da equipe.</p>
       <div class="rank-row"><div class="rank-pos">P</div><div class="rank-name"><strong>Bonificação própria</strong><span>Vendas individuais</span></div><div class="rank-value"><strong>${BRL.format(personResult(HUB_DATA.team[4]).bonus)}</strong></div></div>
       <div class="rank-row"><div class="rank-pos">Σ</div><div class="rank-name"><strong>Total Priscila</strong><span>Própria + gerência</span></div><div class="rank-value"><strong>${BRL.format(personResult(HUB_DATA.team[4]).bonus+1350)}</strong></div></div>
       <div class="extra-rule">${rules.gerencia.observacao}</div>
     </div></div>`;
}
function showSimulator(){
  const names=HUB_DATA.team.map(x=>x.name);
  modal(`<h2>Simulador de bonificação</h2><div class="form-grid"><div class="field full"><label>Colaborador</label><select id="sName">${names.map(n=>`<option>${n}</option>`).join('')}</select></div><div class="field"><label>Consultas</label><input id="s1" type="number" value="40"></div><div class="field"><label>Avaliações/reconsultas</label><input id="s2" type="number" value="40"></div><div class="field"><label>Vendas 5.3</label><input id="s3" type="number" value="30000"></div><div class="field"><label>Vendas 5.4</label><input id="s4" type="number" value="30000"></div><div class="field full"><label>Produtos</label><input id="s5" type="number" value="1000"></div></div><div id="simResult" class="extra-rule">Preencha os valores e clique em calcular.</div><div class="modal-actions"><button class="btn btn-secondary" onclick="closeModal()">Fechar</button><button class="btn btn-primary" onclick="calcSimulator()">Calcular</button></div>`);
}
function calcSimulator(){const p={name:$('#sName').value,role:'',consultas:+$('#s1').value,avaliacoes:+$('#s2').value,vendas53:+$('#s3').value,vendas54:+$('#s4').value,produtos:+$('#s5').value};const r=personResult(p);$('#simResult').innerHTML=`Bonificação prevista: <strong>${BRL.format(r.bonus)}</strong><br><small>Consultas ${BRL.format(r.b1)} · Avaliações ${BRL.format(r.b2)} · 5.3 ${BRL.format(r.b3)} · 5.4 ${BRL.format(r.b4)} · Produtos ${BRL.format(r.bp)}</small>`}
function faturamento(){
 const rows=[['Emagrecimento',46200,36],['Corporal',31850,25],['Facial',22400,17],['Laser',16900,13],['Produtos',11100,9]];
 return head('Faturamento','Leitura gerencial do realizado por área, origem e período.')+`<div class="kpi-grid">${kpi('Realizado',BRL.format(128450),'107% da meta','↗')}${kpi('Meta mensal',BRL.format(120000),'Faltam 0 reais','◎')}${kpi('Ticket médio',BRL.format(2433),'+ 6,2%','◫')}${kpi('Vendas',53,'12 acima de junho','▦')}</div><div class="card panel"><div class="panel-head"><h3>Faturamento por área</h3><span>Julho de 2026</span></div>${rows.map(r=>`<div class="rank-row"><div class="rank-pos">${r[2]}%</div><div class="rank-name"><strong>${r[0]}</strong><div class="progress" style="margin-top:7px"><span style="width:${r[2]*2.6}%"></span></div></div><div class="rank-value"><strong>${BRL.format(r[1])}</strong></div></div>`).join('')}</div>`;
}
function premiacao(){
 return head('Premiação','Campanhas internas, desafios e reconhecimento da equipe.',`<button class="btn btn-primary" onclick="toast('Modelo de nova premiação preparado')">+ Nova premiação</button>`)+`<div class="idea-grid">${[
 ['Sprint Faixa Preta','Atingir Faixa Preta em qualquer modelo até 31/07','R$ 500 + experiência','Ativa'],
 ['Maior evolução','Maior crescimento percentual versus mês anterior','Day spa','Em apuração'],
 ['Meta coletiva','Clínica acima de R$ 140 mil no mês','Jantar da equipe','Planejada']
 ].map(x=>`<div class="card item-card"><span class="tag ${x[3]==='Ativa'?'green':'amber'}">${x[3]}</span><h3>${x[0]}</h3><p>${x[1]}</p><div class="item-card-footer"><span>${x[2]}</span><button class="mini-btn">Detalhes</button></div></div>`).join('')}</div>`;
}
function resultados(){
 return head('Resultados','A visão consolidada para a reunião de gestão.')+`<div class="kpi-grid">${kpi('Meta atingida','107%','Acima da meta mensal','↗')}${kpi('Conversão','24,8%','3,1 p.p. de evolução','◎')}${kpi('Comparecimento','82%','Meta: 85%','◔','down')}${kpi('Recuperação','R$ 18.400','14 vendas recuperadas','↗')}</div><div class="grid-2"><div class="card panel"><div class="panel-head"><h3>Indicadores do funil</h3></div>${[['Leads recebidos',312,100],['Qualificados',201,64],['Agendados',126,40],['Compareceram',103,33],['Vendas',53,17]].map(x=>`<div class="rank-row"><div class="rank-pos">${x[2]}%</div><div class="rank-name"><strong>${x[0]}</strong><div class="progress" style="margin-top:7px"><span style="width:${x[2]}%"></span></div></div><div class="rank-value"><strong>${x[1]}</strong></div></div>`).join('')}</div><div class="card panel"><div class="panel-head"><h3>Leituras do mês</h3></div><div class="extra-rule">O faturamento ultrapassou a meta, mas o comparecimento ainda é o principal gargalo.</div><div class="rank-row"><div class="rank-pos">1</div><div class="rank-name"><strong>Prioridade</strong><span>Confirmação e redução de faltas</span></div></div><div class="rank-row"><div class="rank-pos">2</div><div class="rank-name"><strong>Oportunidade</strong><span>Escalar campanhas de emagrecimento</span></div></div></div></div>`;
}
function campanhas(){
 return head('Campanhas','Planeje, acompanhe investimento e conecte marketing com vendas.',`<button class="btn btn-primary" onclick="campaignForm()">+ Nova campanha</button>`)+`<div class="card panel"><div class="table-wrap"><table class="data-table"><thead><tr><th>Campanha</th><th>Objetivo</th><th>Canal</th><th>Investimento</th><th>Leads</th><th>Vendas</th><th>Status</th></tr></thead><tbody>${state.campaigns.map(c=>`<tr><td><strong>${c.name}</strong></td><td>${c.objective}</td><td>${c.channel}</td><td>${BRL.format(c.budget)}</td><td>${c.leads}</td><td>${c.sales}</td><td><span class="tag ${c.status==='Ativa'?'green':c.status==='Concluída'?'blue':'amber'}">${c.status}</span></td></tr>`).join('')}</tbody></table></div></div>`;
}
function campaignForm(){modal(`<h2>Nova campanha</h2><div class="form-grid"><div class="field full"><label>Nome</label><input id="cName"></div><div class="field"><label>Objetivo</label><input id="cObj"></div><div class="field"><label>Canal</label><input id="cChannel"></div><div class="field"><label>Investimento</label><input id="cBudget" type="number"></div><div class="field"><label>Status</label><select id="cStatus"><option>Planejada</option><option>Ativa</option><option>Concluída</option></select></div></div><div class="modal-actions"><button class="btn btn-secondary" onclick="closeModal()">Cancelar</button><button class="btn btn-primary" onclick="saveCampaign()">Salvar</button></div>`)}
function saveCampaign(){state.campaigns.push({name:$('#cName').value,objective:$('#cObj').value,channel:$('#cChannel').value,budget:+$('#cBudget').value,leads:0,sales:0,status:$('#cStatus').value});save('hub_campaigns',state.campaigns);closeModal();render();toast('Campanha criada')}
function planejamento(){
 const days=['Seg 27','Ter 28','Qua 29','Qui 30','Sex 31'];
 return head('Planejamento de marketing','Calendário semanal de campanhas, conteúdo e ações.')+`<div class="kanban">${days.map((d,i)=>`<div class="kanban-col"><div class="kanban-head">${d}<span class="count">${i%3+1}</span></div>${[
  ['Stories bastidores','Conteúdo'],['Retomada leads frios','WhatsApp'],['Criativo Emagrecimento','Meta Ads']
 ].slice(0,i%3+1).map(x=>`<div class="lead-card"><h4>${x[0]}</h4><p>${x[1]}</p><span class="tag ${i%2?'blue':'purple'}">${i%2?'Em produção':'Planejado'}</span></div>`).join('')}</div>`).join('')}</div>`;
}
function ideias(){
 return head('Banco de ideias','Um lugar para capturar boas ideias antes que elas fujam.',`<button class="btn btn-primary" onclick="ideaForm()">+ Nova ideia</button>`)+`<div class="idea-grid">${state.ideas.map((x,i)=>`<div class="card item-card"><span class="tag purple">${x.category}</span><h3>${x.title}</h3><p>${x.text}</p><div class="item-card-footer"><span class="tag ${x.status==='Prioridade'?'green':'amber'}">${x.status}</span><button class="mini-btn" onclick="deleteIdea(${i})">Excluir</button></div></div>`).join('')}</div>`;
}
function ideaForm(){modal(`<h2>Nova ideia</h2><div class="form-grid"><div class="field full"><label>Título</label><input id="iTitle"></div><div class="field"><label>Categoria</label><input id="iCat"></div><div class="field"><label>Status</label><select id="iStatus"><option>Banco de ideias</option><option>Em análise</option><option>Prioridade</option></select></div><div class="field full"><label>Descrição</label><textarea id="iText"></textarea></div></div><div class="modal-actions"><button class="btn btn-secondary" onclick="closeModal()">Cancelar</button><button class="btn btn-primary" onclick="saveIdea()">Salvar</button></div>`)}
function saveIdea(){state.ideas.unshift({title:$('#iTitle').value,category:$('#iCat').value,status:$('#iStatus').value,text:$('#iText').value});save('hub_ideas',state.ideas);closeModal();render();toast('Ideia salva')}
function deleteIdea(i){state.ideas.splice(i,1);save('hub_ideas',state.ideas);render()}
function biblioteca(){
 const files=[['Script de avaliação','Roteiro','PDF'],['Campanha Experiência DriCorpus','Campanha','Imagem'],['Manual de marca','Identidade','PDF'],['Objeções comerciais','Comercial','Documento'],['Fotos da fachada','Institucional','Imagens'],['Treinamento Kommo','Sistemas','Vídeo']];
 return head('Biblioteca','Materiais aprovados, scripts, campanhas e referências.')+`<div class="library-grid">${files.map(x=>`<div class="card item-card"><span class="tag blue">${x[2]}</span><h3>${x[0]}</h3><p>${x[1]} · Atualizado recentemente</p><div class="item-card-footer"><span>Uso interno</span><button class="mini-btn">Abrir</button></div></div>`).join('')}</div>`;
}
function funilMarketing(){
 return head('Funil de marketing','Da mídia ao faturamento: acompanhe eficiência e retorno.')+`<div class="kpi-grid">${kpi('Investimento',BRL.format(3500),'Orçamento mensal','◉')}${kpi('Leads','312',BRL.format(11.22)+' por lead','↗')}${kpi('Agendamentos','126','40,4% dos leads','□')}${kpi('Receita atribuída',BRL.format(58200),'ROAS 16,6x','◎')}</div><div class="card panel">${[['Impressões',184000,100],['Cliques',4280,74],['Leads',312,51],['Agendamentos',126,34],['Vendas',24,18]].map(x=>`<div class="rank-row"><div class="rank-pos">${x[2]}%</div><div class="rank-name"><strong>${x[0]}</strong><div class="progress" style="margin-top:7px"><span style="width:${x[2]}%"></span></div></div><div class="rank-value"><strong>${x[1].toLocaleString('pt-BR')}</strong></div></div>`).join('')}</div>`;
}
function fluxos(){
 const flows=[['Aquisição de novos leads','Lead → Qualificação → Agendamento → Confirmação → Atendimento'],['Recuperação','Orçamento aberto → Cadência → Nova condição → Fechamento'],['Pós-venda','Venda → Boas-vindas → Acompanhamento → Reconsulta → Fidelização']];
 return head('Fluxos','Jornadas claras para que o processo não dependa da memória de ninguém.')+`<div class="process-grid">${flows.map((x,i)=>`<div class="card item-card"><span class="tag ${i===0?'green':i===1?'amber':'blue'}">${i+5} etapas</span><h3>${x[0]}</h3><p>${x[1]}</p><div class="item-card-footer"><span>Responsável definido</span><button class="mini-btn">Ver fluxo</button></div></div>`).join('')}</div>`;
}
function checklists(){
 return head('Checklists','Rotinas simples, visíveis e auditáveis.')+`<div class="grid-2"><div class="card panel"><div class="panel-head"><h3>Abertura diária</h3><span>${state.checklist.filter(x=>x.done).length}/${state.checklist.length}</span></div><div class="checklist">${state.checklist.map((x,i)=>`<label class="check-row"><input type="checkbox" ${x.done?'checked':''} onchange="toggleCheck(${i})"><span>${x.text}</span></label>`).join('')}</div></div><div class="card panel"><div class="panel-head"><h3>Outros checklists</h3></div>${['Fechamento da clínica','Preparação de cabine','Evento interno','Integração de colaborador'].map((x,i)=>`<div class="rank-row"><div class="rank-pos">${i+1}</div><div class="rank-name"><strong>${x}</strong><span>${6+i*2} tarefas</span></div><div class="rank-value"><span class="tag">Abrir</span></div></div>`).join('')}</div></div>`;
}
function toggleCheck(i){state.checklist[i].done=!state.checklist[i].done;save('hub_checklist',state.checklist);render()}
function processos(){
 const p=[['Agendamento de avaliação','Comercial','v1.3'],['Confirmação de consulta','Relacionamento','v2.0'],['Cadastro no Belle','Recepção','v1.1'],['Fechamento em cabine','Equipe técnica','v1.5'],['Gestão de cancelamentos','Financeiro','v1.0'],['Retomada de orçamento','Comercial','v2.1']];
 return head('Processos','Procedimentos oficiais, responsáveis e versões.')+`<div class="process-grid">${p.map(x=>`<div class="card item-card"><span class="tag">${x[2]}</span><h3>${x[0]}</h3><p>Responsável: ${x[1]}</p><div class="item-card-footer"><span>Revisado em julho</span><button class="mini-btn">Abrir</button></div></div>`).join('')}</div>`;
}
function treinamentos(kind){
 const map={
  trilhas:[['DNA DriCorpus','Cultura e integração','72%'],['Excelência Comercial','Atendimento e vendas','48%'],['Produtos e Protocolos','Conhecimento técnico','35%']],
  aulas:[['Primeiro contato que converte','12 min','Comercial'],['Como conduzir uma avaliação','18 min','Atendimento'],['Registro correto no Kommo','9 min','Sistemas']],
  materiais:[['Playbook Comercial','PDF','Atualizado'],['Tabela de Objeções','Documento','Atualizado'],['Manual do Belle','PDF','Em revisão']],
  avaliacoes:[['Avaliação DNA DriCorpus','10 questões','80% mínima'],['Prova Comercial','15 questões','85% mínima'],['Conhecimento de protocolos','20 questões','80% mínima']],
  progresso:[['Bárbara','68%','2 pendências'],['Mari','82%','1 pendência'],['Luana','54%','3 pendências'],['Evelin','47%','4 pendências'],['Priscila','91%','Em dia']]
 };
 const titles={trilhas:'Trilhas de aprendizagem',aulas:'Aulas',materiais:'Materiais',avaliacoes:'Avaliações',progresso:'Progresso da equipe'};
 return head(titles[kind],'Capacitação contínua, organizada e mensurável.')+`<div class="training-grid">${map[kind].map((x,i)=>`<div class="card item-card"><span class="tag ${i===0?'green':'blue'}">${x[2]}</span><h3>${x[0]}</h3><p>${x[1]}</p><div class="item-card-footer"><span>${kind==='progresso'?'Trilha geral':'Uso interno'}</span><button class="mini-btn">${kind==='progresso'?'Detalhes':'Abrir'}</button></div></div>`).join('')}</div>`;
}
function render(){
 renderNav();
 $('#pageTitle').textContent=labels[state.page]||'HubClinic';
 $('#breadcrumb').textContent=(nav.find(x=>x[1]===state.page)||['HubClinic'])[0]||'Visão geral';
 const routes={dashboard,tabela,'funil-comercial':funilComercial,bonificacao,faturamento,premiacao,resultados,campanhas,planejamento,ideias,biblioteca,'funil-marketing':funilMarketing,fluxos,checklists,processos,
 trilhas:()=>treinamentos('trilhas'),aulas:()=>treinamentos('aulas'),materiais:()=>treinamentos('materiais'),avaliacoes:()=>treinamentos('avaliacoes'),progresso:()=>treinamentos('progresso')};
 app.innerHTML=(routes[state.page]||dashboard)();
 if(state.page==='tabela'){drawTreatments();$('#tSearch').oninput=drawTreatments;$('#tCat').onchange=drawTreatments}
 window.scrollTo(0,0);
}
render();
