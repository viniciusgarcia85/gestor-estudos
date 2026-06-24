const STORAGE_KEY = 'vinicius_estudos_v1';
let estado = carregarEstado();
let energiaSelecionada = 0;

function carregarEstado() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch(e) {}
  return { sessoes: [], semanas: [], revisoes: [], iniciado: new Date().toISOString() };
}

function salvarEstado() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(estado)); } catch(e) {}
}

function toast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.style.display = 'block';
  setTimeout(() => { el.style.display = 'none'; }, 2200);
}

// NAVEGAÇÃO
function ir(tela) {
  document.querySelectorAll('.tela').forEach(t => t.classList.remove('ativo'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('ativo'));
  document.getElementById('t-' + tela).classList.add('ativo');
  const map = { painel:0, registrar:1, semana:2, historico:3, caderno:4, revisao:5, backup:6 };
  document.querySelectorAll('.nav-item')[map[tela]].classList.add('ativo');
  const renders = { painel: renderPainel, historico: renderHistorico, caderno: renderCaderno, semana: renderSemana, revisao: renderRevisoes, backup: renderBackup };
  if (renders[tela]) renders[tela]();
}

// ENERGIA
function setEnergia(v, btn) {
  energiaSelecionada = v;
  document.querySelectorAll('#energia-btns .btn').forEach(b => {
    b.style.background = 'transparent';
    b.style.color = 'var(--verde)';
  });
  btn.style.background = 'var(--verde)';
  btn.style.color = '#0a0f0b';
}

// HELPERS
function pilartag(pilar) {
  const m = { logistica:['LOGÍSTICA','tag-log'], dados:['DADOS','tag-dados'], ia:['IA','tag-ia'], negocio:['NEGÓCIO','tag-log'] };
  return m[pilar] || [pilar, 'tag-log'];
}

function formatarData(str) {
  if (!str) return '';
  const [y,m,d] = str.split('-');
  return `${d}/${m}/${y}`;
}

function formatarMes(str) {
  if (!str) return '';
  const meses = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
  const [y,m] = str.split('-');
  return `${meses[parseInt(m)-1]} ${y}`;
}

function obterChaveSemana() {
  const d = new Date();
  const jan1 = new Date(d.getFullYear(), 0, 1);
  const sem = Math.ceil(((d - jan1) / 86400000 + jan1.getDay() + 1) / 7);
  return d.getFullYear() + '-S' + sem;
}

function horasTotal() { return estado.sessoes.reduce((a,s) => a + (s.horas||0), 0); }

function horasSemana() {
  const hoje = new Date(); hoje.setHours(0,0,0,0);
  const dom = new Date(hoje); dom.setDate(hoje.getDate() - hoje.getDay());
  return estado.sessoes.filter(s => new Date(s.data) >= dom).reduce((a,s) => a + s.horas, 0);
}

function sessoesMes() {
  const mes = new Date().toISOString().slice(0,7);
  return estado.sessoes.filter(s => s.data && s.data.startsWith(mes)).length;
}

function calcStreak() {
  if (!estado.sessoes.length) return 0;
  const dias = [...new Set(estado.sessoes.map(s => s.data))].sort().reverse();
  let streak = 0;
  const hoje = new Date(); hoje.setHours(0,0,0,0);
  for (let i = 0; i < dias.length; i++) {
    const sd = new Date(dias[i] + 'T12:00:00');
    const diff = Math.round((hoje - sd) / 86400000);
    if (diff === streak) streak++;
    else if (diff > streak + 1) break;
  }
  return streak;
}

function atualizarSidebar() {
  document.getElementById('sf-sessoes').textContent = estado.sessoes.length;
  document.getElementById('sf-horas').textContent = horasTotal().toFixed(1) + 'h';
}

// SALVAR SESSÃO
function salvarSessao() {
  const data = document.getElementById('r-data').value;
  const pilar = document.getElementById('r-pilar').value;
  const horas = parseFloat(document.getElementById('r-horas').value);
  const topico = document.getElementById('r-topico').value.trim();
  const aprend = document.getElementById('r-aprendizado').value.trim();
  const duvidas = document.getElementById('r-duvidas').value.trim();
  if (!data || !pilar || !horas || !topico) { toast('⚠ PREENCHA OS CAMPOS OBRIGATÓRIOS'); return; }
  estado.sessoes.unshift({ id: Date.now(), data, pilar, horas, topico, aprendizado: aprend, duvidas, energia: energiaSelecionada });
  salvarEstado();
  limparForm();
  atualizarSidebar();
  toast('▸ SESSÃO REGISTRADA');
  ir('painel');
}

function limparForm() {
  ['r-data','r-topico','r-aprendizado','r-duvidas','r-horas'].forEach(id => { document.getElementById(id).value = ''; });
  document.getElementById('r-pilar').value = '';
  energiaSelecionada = 0;
  document.querySelectorAll('#energia-btns .btn').forEach(b => { b.style.background = 'transparent'; b.style.color = 'var(--verde)'; });
}

function deletarSessao(id) {
  if (!confirm('Remover esta sessão?')) return;
  estado.sessoes = estado.sessoes.filter(s => s.id !== id);
  salvarEstado();
  atualizarSidebar();
  renderHistorico();
  toast('▸ SESSÃO REMOVIDA');
}

// SALVAR SEMANA
function salvarSemana() {
  const pLog = document.getElementById('prio-log').value.trim();
  const pDados = document.getElementById('prio-dados').value.trim();
  const meta = parseFloat(document.getElementById('meta-horas').value);
  if (!pLog && !pDados) { toast('⚠ DEFINA AO MENOS UMA PRIORIDADE'); return; }
  const semana = obterChaveSemana();
  estado.semanas = estado.semanas.filter(s => s.semana !== semana);
  estado.semanas.push({ semana, logistica: pLog, dados: pDados, meta: meta||0, criado: new Date().toISOString() });
  salvarEstado();
  renderSemana();
  toast('▸ PLANEJAMENTO SALVO');
}

// SALVAR REVISÃO
function salvarRevisao() {
  const campos = [1,2,3,4,5,6].map(i => document.getElementById('rev-'+i).value.trim());
  if (campos.every(c => !c)) { toast('⚠ RESPONDA AO MENOS UMA PERGUNTA'); return; }
  const mes = new Date().toISOString().slice(0,7);
  estado.revisoes = estado.revisoes.filter(r => r.mes !== mes);
  estado.revisoes.unshift({ mes, respostas: campos, criado: new Date().toISOString() });
  salvarEstado();
  [1,2,3,4,5,6].forEach(i => { document.getElementById('rev-'+i).value = ''; });
  renderRevisoes();
  toast('▸ REVISÃO SALVA');
}

// BACKUP
function exportarBackup() {
  const dados = JSON.stringify(estado, null, 2);
  const blob = new Blob([dados], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const data = new Date().toISOString().slice(0,10);
  a.href = url;
  a.download = `backup-estudos-vinicius-${data}.json`;
  a.click();
  URL.revokeObjectURL(url);
  toast('▸ BACKUP EXPORTADO');
}

function importarBackup(input) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const dados = JSON.parse(e.target.result);
      if (!dados.sessoes) { toast('⚠ ARQUIVO INVÁLIDO'); return; }
      if (!confirm(`Importar backup com ${dados.sessoes.length} sessões? Os dados atuais serão substituídos.`)) return;
      estado = dados;
      salvarEstado();
      atualizarSidebar();
      renderBackup();
      toast('▸ BACKUP IMPORTADO');
    } catch(err) { toast('⚠ ERRO AO LER ARQUIVO'); }
  };
  reader.readAsText(file);
  input.value = '';
}

// RENDERS
function renderPainel() {
  document.getElementById('m-semana').innerHTML = horasSemana().toFixed(1) + '<span class="metrica-unit">h</span>';
  document.getElementById('m-mes').textContent = sessoesMes();
  document.getElementById('m-total').innerHTML = horasTotal().toFixed(1) + '<span class="metrica-unit">h</span>';
  document.getElementById('m-streak').innerHTML = calcStreak() + '<span class="metrica-unit">d</span>';

  const pct = Math.min(100, Math.round((horasTotal() / 900) * 100));
  document.getElementById('prog-pct').textContent = pct + '%';
  document.getElementById('prog-barra').style.width = pct + '%';

  // streak grid 30 dias
  const sg = document.getElementById('streak-grid');
  sg.innerHTML = '';
  const hoje = new Date(); hoje.setHours(0,0,0,0);
  const diasMap = {};
  estado.sessoes.forEach(s => { diasMap[s.data] = (diasMap[s.data]||0) + s.horas; });
  for (let i = 29; i >= 0; i--) {
    const d = new Date(hoje); d.setDate(hoje.getDate() - i);
    const key = d.toISOString().slice(0,10);
    const h = diasMap[key] || 0;
    const el = document.createElement('div');
    el.className = 'streak-dia' + (h>=2?' s3':h>=1?' s2':h>0?' s1':'');
    el.title = key + ': ' + h.toFixed(1) + 'h';
    sg.appendChild(el);
  }

  // distribuição por pilar
  const dp = document.getElementById('dist-pilares');
  const pilares = { logistica:0, dados:0, ia:0, negocio:0 };
  estado.sessoes.forEach(s => { if (pilares[s.pilar]!==undefined) pilares[s.pilar] += s.horas; });
  const total = Object.values(pilares).reduce((a,b)=>a+b,0);
  if (!total) { dp.innerHTML = '<div class="text-dim" style="padding:8px 0">Nenhuma sessão ainda.</div>'; }
  else {
    const nomes = { logistica:'LOGÍSTICA', dados:'DADOS', ia:'IA', negocio:'NEGÓCIO' };
    dp.innerHTML = Object.entries(pilares).map(([k,v]) => {
      const pct = Math.round((v/total)*100);
      return `<div style="margin-bottom:8px">
        <div class="row" style="margin-bottom:3px"><span class="text-dim">${nomes[k]}</span><span style="margin-left:auto;font-size:11px;color:var(--verde-claro)">${v.toFixed(1)}h · ${pct}%</span></div>
        <div class="barra-bg"><div class="barra-fill" style="width:${pct}%"></div></div>
      </div>`;
    }).join('');
  }

  // últimos aprendizados
  const ua = document.getElementById('ultimos-aprendizados');
  const lista = estado.sessoes.filter(s => s.aprendizado).slice(0,3);
  if (!lista.length) {
    ua.innerHTML = '<div class="empty"><div class="empty-icon">▸</div>Registre sessões com aprendizados para ver aqui.</div>';
  } else {
    ua.innerHTML = lista.map(s => {
      const [tag] = pilartag(s.pilar);
      return `<div class="aprendizado-item">
        <div class="aprendizado-data">${formatarData(s.data)}</div>
        <div class="aprendizado-texto">${s.aprendizado}</div>
        <div class="aprendizado-pilar">▸ ${tag} · ${s.topico}</div>
      </div>`;
    }).join('');
  }
}

function renderHistorico() {
  const fp = document.getElementById('filtro-pilar').value;
  const fm = document.getElementById('filtro-mes').value;
  const meses = [...new Set(estado.sessoes.map(s => s.data?s.data.slice(0,7):'')).values()].filter(Boolean).sort().reverse();
  const sel = document.getElementById('filtro-mes');
  const valAtual = sel.value;
  sel.innerHTML = '<option value="">Todos os meses</option>' + meses.map(m=>`<option value="${m}" ${m===valAtual?'selected':''}>${formatarMes(m)}</option>`).join('');

  let lista = [...estado.sessoes];
  if (fp) lista = lista.filter(s => s.pilar===fp);
  if (fm) lista = lista.filter(s => s.data&&s.data.startsWith(fm));

  const el = document.getElementById('lista-historico');
  if (!lista.length) { el.innerHTML = '<div class="empty"><div class="empty-icon">▸</div>Nenhuma sessão encontrada.</div>'; return; }
  el.innerHTML = lista.map(s => {
    const [tagNome, tagClass] = pilartag(s.pilar);
    const dots = [1,2,3,4].map(i=>`<div class="energia-dot${s.energia>=i?' on':''}"></div>`).join('');
    return `<div class="sessao-item">
      <div class="sessao-data">${formatarData(s.data)}</div>
      <div class="sessao-corpo">
        <div class="sessao-topo">
          <span class="tag ${tagClass}">${tagNome}</span>
          <span class="sessao-horas">${s.horas}h · ${s.topico}</span>
        </div>
        ${s.aprendizado?`<div class="sessao-resumo">${s.aprendizado}</div>`:''}
        ${s.duvidas?`<div class="sessao-resumo" style="color:var(--texto3);margin-top:4px">Dúvida: ${s.duvidas}</div>`:''}
        <div class="energia-dots">${dots}</div>
      </div>
      <button class="btn btn-danger" onclick="deletarSessao(${s.id})">✕</button>
    </div>`;
  }).join('');
}

function renderCaderno() {
  const el = document.getElementById('lista-caderno');
  const lista = estado.sessoes.filter(s => s.aprendizado);
  if (!lista.length) { el.innerHTML = '<div class="empty"><div class="empty-icon">▸</div>Nenhum aprendizado registrado ainda.</div>'; return; }
  el.innerHTML = lista.map(s => {
    const [tag] = pilartag(s.pilar);
    return `<div class="aprendizado-item">
      <div class="aprendizado-data">${formatarData(s.data)} · ${s.topico}</div>
      <div class="aprendizado-texto">${s.aprendizado}</div>
      ${s.duvidas?`<div class="aprendizado-texto" style="color:var(--texto3);margin-top:6px;font-size:12px">Dúvida: ${s.duvidas}</div>`:''}
      <div class="aprendizado-pilar">▸ ${tag}</div>
    </div>`;
  }).join('');
}

function renderSemana() {
  const sg = document.getElementById('semana-grid');
  const dias = ['DOM','SEG','TER','QUA','QUI','SEX','SÁB'];
  const hoje = new Date(); hoje.setHours(0,0,0,0);
  const dom = new Date(hoje); dom.setDate(hoje.getDate()-hoje.getDay());
  sg.innerHTML = dias.map((d,i) => {
    const dt = new Date(dom); dt.setDate(dom.getDate()+i);
    const isHoje = dt.getTime()===hoje.getTime();
    const isEstudo = [1,2,3,4,5].includes(i);
    return `<div class="dia-card${isHoje?' hoje':''}${isEstudo?' bloqueado':''}">
      <div class="dia-nome">${d}</div>
      <div class="dia-num">${dt.getDate()}</div>
      <div class="dia-status">${isEstudo?'▸ ESTUDO':i===6?'PROJETO':'DESCANSO'}</div>
    </div>`;
  }).join('');

  const chave = obterChaveSemana();
  const sem = estado.semanas.find(s => s.semana===chave);
  const ss = document.getElementById('semana-salva');
  if (!sem) {
    ss.innerHTML = '<div class="empty"><div class="empty-icon">▸</div>Nenhum planejamento para esta semana ainda.</div>';
  } else {
    ss.innerHTML = `
      ${sem.logistica?`<div class="form-group"><div class="form-label">LOGÍSTICA</div><div class="text-verde">${sem.logistica}</div></div>`:''}
      ${sem.dados?`<div class="form-group"><div class="form-label">DADOS</div><div class="text-verde">${sem.dados}</div></div>`:''}
      ${sem.meta?`<div class="form-group"><div class="form-label">META</div><div class="text-verde">${sem.meta}h esta semana</div></div>`:''}
      <div class="text-dim">Salvo em ${new Date(sem.criado).toLocaleDateString('pt-BR')}</div>`;
    document.getElementById('prio-log').value = sem.logistica||'';
    document.getElementById('prio-dados').value = sem.dados||'';
    document.getElementById('meta-horas').value = sem.meta||'';
  }
}

function renderRevisoes() {
  const el = document.getElementById('lista-revisoes');
  if (!estado.revisoes.length) { el.innerHTML = '<div class="empty"><div class="empty-icon">▸</div>Nenhuma revisão salva ainda.</div>'; return; }
  const perguntas = ['O que aprendi este mês?','Cumpri o planejado?','O ritmo está sustentável?','Qual pilar avançou menos?','O que não funcionou?','O que farei diferente?'];
  el.innerHTML = estado.revisoes.map(r => `
    <div style="margin-bottom:16px">
      <div class="aprendizado-pilar" style="margin-bottom:8px">▸ ${formatarMes(r.mes)}</div>
      ${r.respostas.map((resp,i) => resp?`<div class="aprendizado-item" style="margin-bottom:6px">
        <div class="aprendizado-data">${perguntas[i]}</div>
        <div class="aprendizado-texto">${resp}</div>
      </div>`:'').join('')}
    </div>
    <div class="divider"></div>`).join('');
}

function renderBackup() {
  const el = document.getElementById('resumo-backup');
  const ht = horasTotal();
  const inicio = estado.iniciado ? new Date(estado.iniciado).toLocaleDateString('pt-BR') : '—';
  el.innerHTML = `
    <div class="form-row3">
      <div><div class="form-label">SESSÕES</div><div class="text-verde" style="font-size:18px;font-weight:bold">${estado.sessoes.length}</div></div>
      <div><div class="form-label">HORAS TOTAIS</div><div class="text-verde" style="font-size:18px;font-weight:bold">${ht.toFixed(1)}h</div></div>
      <div><div class="form-label">REVISÕES SALVAS</div><div class="text-verde" style="font-size:18px;font-weight:bold">${estado.revisoes.length}</div></div>
    </div>
    <div class="text-dim" style="margin-top:8px">Sistema iniciado em ${inicio}</div>`;
}

// INIT
document.getElementById('r-data').value = new Date().toISOString().slice(0,10);
atualizarSidebar();
renderPainel();
renderSemana();
