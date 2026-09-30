// ===== Financeiro PF/PJ — app local, dados em localStorage =====
const STORAGE_KEY = 'financeiro_v1';

const DEFAULT_CATEGORIES = [
  { name: 'Alimentação', keywords: ['ifood', 'rappi', 'restaurante', 'mercado', 'supermercado', 'padaria', 'açougue', 'hortifruti'] },
  { name: 'Transporte', keywords: ['uber', '99', 'posto', 'combustive', 'estacionamento', 'pedagio', 'gasolina'] },
  { name: 'Assinaturas', keywords: ['netflix', 'spotify', 'amazon prime', 'hbo', 'disney', 'icloud', 'google one', 'youtube premium', 'chatgpt', 'openai', 'claude', 'anthropic'] },
  { name: 'Saúde', keywords: ['farmacia', 'drogaria', 'hospital', 'clinica', 'laboratorio', 'plano de saude'] },
  { name: 'Casa', keywords: ['aluguel', 'condominio', 'luz', 'energia', 'sabesp', 'agua', 'internet', 'telefone', 'net ', 'claro', 'vivo', 'tim '] },
  { name: 'Lazer', keywords: ['cinema', 'ingresso', 'viagem', 'hotel', 'airbnb', 'booking'] },
  { name: 'Empresa - Fornecedores', keywords: ['fornecedor', 'materia prima', 'insumo'] },
  { name: 'Empresa - Impostos', keywords: ['das ', 'darf', 'inss', 'issqn', 'simples nacional'] },
  { name: 'Outros', keywords: [] },
];

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try { return JSON.parse(raw); } catch (e) { console.error('backup corrompido', e); }
  }
  return { accounts: [], transactions: [], payables: [], transfers: [], categories: DEFAULT_CATEGORIES };
}
let state = loadState();
function save() { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
function uid() { return Math.random().toString(36).slice(2, 10) + Date.now().toString(36); }

function fmtMoney(v) {
  return (v < 0 ? '-' : '') + 'R$ ' + Math.abs(v).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function monthKey(dateStr) { return dateStr.slice(0, 7); } // yyyy-mm
function monthLabel(key) {
  const [y, m] = key.split('-');
  return ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'][parseInt(m,10)-1] + '/' + y.slice(2);
}
function addMonths(key, n) {
  const [y, m] = key.split('-').map(Number);
  const d = new Date(y, m - 1 + n, 1);
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
}
function todayKey() { return new Date().toISOString().slice(0, 7); }
function todayISO() { return new Date().toISOString().slice(0, 10); }

function categorize(desc) {
  const d = desc.toLowerCase();
  for (const c of state.categories) {
    if (c.keywords.some(k => d.includes(k))) return c.name;
  }
  return 'Outros';
}

// ===== Cálculos =====
function accountsOf(ledger) { return state.accounts.filter(a => a.ledger === ledger); }
function transactionsOf(ledger) { return state.transactions.filter(t => t.ledger === ledger); }

function accountBalance(acc) {
  const txs = state.transactions.filter(t => t.accountId === acc.id);
  const delta = txs.reduce((s, t) => s + (t.kind === 'credito' ? t.amount : -t.amount), 0);
  return (acc.initialBalance || 0) + delta;
}

function cashTotal(ledger) {
  return accountsOf(ledger).filter(a => a.type === 'conta').reduce((s, a) => s + accountBalance(a), 0);
}

// Projeção de parcelas futuras por mês, para um ledger (cartões)
function installmentProjection(ledger, monthsAhead = 6) {
  const base = todayKey();
  const months = Array.from({ length: monthsAhead }, (_, i) => addMonths(base, i));
  const proj = Object.fromEntries(months.map(m => [m, 0]));
  transactionsOf(ledger).forEach(t => {
    if (!t.installmentTotal || t.installmentTotal <= 1) return;
    const baseMonth = monthKey(t.date);
    for (let n = t.installmentCurrent; n <= t.installmentTotal; n++) {
      const offset = n - t.installmentCurrent;
      const mk = addMonths(baseMonth, offset);
      if (proj[mk] !== undefined) proj[mk] += t.amount;
    }
  });
  return { months, proj };
}

// Contas a pagar projetadas (PJ) por mês, incluindo recorrentes
function payablesProjection(monthsAhead = 6) {
  const base = todayKey();
  const months = Array.from({ length: monthsAhead }, (_, i) => addMonths(base, i));
  const proj = Object.fromEntries(months.map(m => [m, 0]));
  state.payables.forEach(p => {
    if (p.status === 'pago' && !p.recurring) return;
    const dueMonth = monthKey(p.dueDate);
    if (p.recurring) {
      months.forEach(mk => { if (mk >= dueMonth) proj[mk] += p.amount; });
    } else if (proj[dueMonth] !== undefined) {
      proj[dueMonth] += p.amount;
    }
  });
  return { months, proj };
}

function transfersThisMonth() {
  const mk = todayKey();
  return state.transfers.filter(t => monthKey(t.date) === mk).reduce((s, t) => s + t.amount, 0);
}

function categorySpend(ledger, mk) {
  const map = {};
  transactionsOf(ledger).filter(t => t.kind === 'debito' && monthKey(t.date) === mk).forEach(t => {
    map[t.category] = (map[t.category] || 0) + t.amount;
  });
  return map;
}

function monthlyTotals(ledger, monthsBack = 6) {
  const base = todayKey();
  const months = Array.from({ length: monthsBack }, (_, i) => addMonths(base, -(monthsBack - 1 - i)));
  return months.map(mk => ({
    mk,
    despesa: transactionsOf(ledger).filter(t => t.kind === 'debito' && monthKey(t.date) === mk).reduce((s, t) => s + t.amount, 0),
    receita: transactionsOf(ledger).filter(t => t.kind === 'credito' && monthKey(t.date) === mk).reduce((s, t) => s + t.amount, 0),
  }));
}

// ===== Alertas / economia =====
function buildAlerts(ledger) {
  const alerts = [];
  const totals = monthlyTotals(ledger, 2);
  if (totals.length === 2) {
    const [prev, cur] = totals;
    Object.keys({}).length; // noop
    const prevCats = categorySpend(ledger, prev.mk);
    const curCats = categorySpend(ledger, cur.mk);
    Object.keys(curCats).forEach(cat => {
      const before = prevCats[cat] || 0;
      const now = curCats[cat];
      if (before > 50 && now > before * 1.2) {
        alerts.push({ type: 'warn', text: `${cat} subiu ${(((now - before) / before) * 100).toFixed(0)}% em relação ao mês anterior (${fmtMoney(before)} → ${fmtMoney(now)}).` });
      }
    });
  }
  // assinaturas / recorrentes duplicadas
  const bySig = {};
  transactionsOf(ledger).filter(t => t.kind === 'debito').forEach(t => {
    const sig = t.description.toLowerCase().trim().slice(0, 20);
    bySig[sig] = bySig[sig] || [];
    bySig[sig].push(t);
  });
  Object.entries(bySig).forEach(([sig, txs]) => {
    const months = new Set(txs.map(t => monthKey(t.date)));
    if (months.size >= 2 && txs[0].category === 'Assinaturas') {
      const total = txs.reduce((s, t) => s + t.amount, 0) / months.size;
      alerts.push({ type: 'good', text: `Assinatura recorrente "${txs[0].description}": ~${fmtMoney(total)}/mês. Confirme se ainda usa.` });
    }
  });
  // parcelamento pesado no mês corrente
  const { months, proj } = installmentProjection(ledger, 1);
  const curLoad = proj[months[0]];
  const cash = ledger === 'pj' ? cashTotal('pj') : cashTotal('pf');
  if (curLoad > 0 && cash > 0 && curLoad > cash * 0.4) {
    alerts.push({ type: 'bad', text: `Parcelas do mês (${fmtMoney(curLoad)}) comprometem mais de 40% do saldo em conta (${fmtMoney(cash)}).` });
  }
  if (ledger === 'pj') {
    const pp = payablesProjection(1);
    const dueThisMonth = pp.proj[pp.months[0]];
    if (dueThisMonth > cashTotal('pj')) {
      alerts.push({ type: 'bad', text: `Contas a pagar do mês (${fmtMoney(dueThisMonth)}) superam o caixa disponível (${fmtMoney(cashTotal('pj'))}).` });
    }
  }
  return alerts;
}

// ===== Render =====
let currentView = 'pf';
const app = document.getElementById('app');

function render() {
  if (currentView === 'resumo') renderResumo();
  else renderLedger(currentView);
}

function renderResumo() {
  const pfCash = cashTotal('pf'), pjCash = cashTotal('pj');
  const transferMonth = transfersThisMonth();
  app.innerHTML = `
    <div class="grid">
      <div class="card"><h3>Saldo Pessoal</h3><div class="big ${pfCash>=0?'pos':'neg'}">${fmtMoney(pfCash)}</div></div>
      <div class="card"><h3>Caixa Empresa (PJ)</h3><div class="big ${pjCash>=0?'pos':'neg'}">${fmtMoney(pjCash)}</div></div>
      <div class="card"><h3>Retirado da empresa (mês)</h3><div class="big">${fmtMoney(transferMonth)}</div></div>
    </div>
    <div class="section">
      <div class="section-head"><h2>Retiradas PJ → Pessoal</h2><button id="btnAddTransfer">+ registrar retirada</button></div>
      <table><thead><tr><th>Data</th><th>Valor</th><th>Observação</th><th></th></tr></thead>
      <tbody>${state.transfers.slice().sort((a,b)=>b.date.localeCompare(a.date)).map(t => `
        <tr><td>${t.date}</td><td>${fmtMoney(t.amount)}</td><td>${t.note||''}</td>
        <td><button class="danger" data-del-transfer="${t.id}">excluir</button></td></tr>`).join('') || '<tr><td colspan="4" class="muted">Nenhuma retirada registrada ainda.</td></tr>'}
      </tbody></table>
    </div>
    <div class="section">
      <h2>Como isso funciona</h2>
      <p class="muted">O caixa da empresa (PJ) é separado do saldo pessoal (PF). Quando você tira dinheiro da empresa pra pagar contas pessoais, registre aqui como "retirada" — isso não mexe automaticamente nos lançamentos, é só pra você acompanhar quanto saiu da empresa e quanto entrou no seu bolso, sem quantia fixa.</p>
    </div>
  `;
  document.getElementById('btnAddTransfer').onclick = () => promptTransfer();
  app.querySelectorAll('[data-del-transfer]').forEach(b => b.onclick = () => {
    state.transfers = state.transfers.filter(t => t.id !== b.dataset.delTransfer); save(); render();
  });
}

function promptTransfer() {
  const amount = parseFloat(prompt('Valor da retirada (ex: 3000):')?.replace(',', '.'));
  if (!amount) return;
  const note = prompt('Observação (opcional):') || '';
  state.transfers.push({ id: uid(), date: todayISO(), amount, note });
  save(); render();
}

function renderLedger(ledger) {
  const isPJ = ledger === 'pj';
  const accs = accountsOf(ledger);
  const cash = cashTotal(ledger);
  const alerts = buildAlerts(ledger);
  const totals = monthlyTotals(ledger, 6);
  const curMonthCats = categorySpend(ledger, todayKey());
  const { months: instMonths, proj: instProj } = installmentProjection(ledger, 6);

  let payablesBlock = '';
  if (isPJ) {
    const { months: pMonths, proj: pProj } = payablesProjection(6);
    const pendentes = state.payables.filter(p => p.status === 'pendente');
    payablesBlock = `
      <div class="section">
        <div class="section-head"><h2>Contas a pagar / provisão</h2><button id="btnAddPayable">+ nova conta</button></div>
        <table><thead><tr><th>Descrição</th><th>Vencimento</th><th>Valor</th><th>Recorrente</th><th>Status</th><th></th></tr></thead>
        <tbody>${pendentes.slice().sort((a,b)=>a.dueDate.localeCompare(b.dueDate)).map(p => `
          <tr><td>${p.description}</td><td>${p.dueDate}</td><td>${fmtMoney(p.amount)}</td><td>${p.recurring?'sim':'não'}</td><td>${p.status}</td>
          <td><button data-pay="${p.id}">marcar pago</button> <button class="danger" data-del-payable="${p.id}">excluir</button></td></tr>`).join('') || '<tr><td colspan="6" class="muted">Nenhuma conta pendente.</td></tr>'}
        </tbody></table>
      </div>
      <div class="section">
        <h2>Projeção de caixa (6 meses)</h2>
        <canvas id="chartProjecao"></canvas>
      </div>
    `;
  }

  app.innerHTML = `
    <div class="grid">
      <div class="card"><h3>${isPJ?'Caixa':'Saldo em conta'}</h3><div class="big ${cash>=0?'pos':'neg'}">${fmtMoney(cash)}</div></div>
      <div class="card"><h3>Gasto no mês</h3><div class="big neg">${fmtMoney(Object.values(curMonthCats).reduce((a,b)=>a+b,0))}</div></div>
      <div class="card"><h3>Parcelas em aberto (próx. mês)</h3><div class="big warn">${fmtMoney(instProj[instMonths[0]]||0)}</div></div>
    </div>

    ${alerts.length ? `<div class="section"><h2>Alertas / onde economizar</h2>${alerts.map(a=>`<div class="alert ${a.type}">${a.text}</div>`).join('')}</div>` : ''}

    <div class="section">
      <div class="section-head"><h2>Contas e cartões</h2><button id="btnAddAccount">+ nova conta/cartão</button></div>
      <table><thead><tr><th>Nome</th><th>Tipo</th><th>Saldo/Uso</th><th></th></tr></thead>
      <tbody>${accs.map(a => `
        <tr><td>${a.name}</td><td>${a.type==='conta'?'Conta':'Cartão'}</td><td class="${accountBalance(a)>=0?'pos':'neg'}">${fmtMoney(accountBalance(a))}</td>
        <td><button data-import="${a.id}">importar PDF</button> <button data-manual="${a.id}">lançar manual</button> <button class="danger" data-del-account="${a.id}">excluir</button></td></tr>`).join('') || '<tr><td colspan="4" class="muted">Cadastre uma conta ou cartão pra começar.</td></tr>'}
      </tbody></table>
    </div>

    <div class="section">
      <h2>Gastos por categoria (mês atual)</h2>
      <canvas id="chartCategorias"></canvas>
    </div>

    <div class="section">
      <h2>Evolução mensal — receitas x despesas</h2>
      <canvas id="chartEvolucao"></canvas>
    </div>

    ${payablesBlock}

    <div class="section">
      <div class="section-head"><h2>Parcelamentos futuros (cartões)</h2></div>
      <canvas id="chartParcelas"></canvas>
    </div>

    <div class="section">
      <div class="section-head"><h2>Lançamentos recentes</h2></div>
      <table><thead><tr><th>Data</th><th>Descrição</th><th>Categoria</th><th>Parcela</th><th>Valor</th><th></th></tr></thead>
      <tbody>${transactionsOf(ledger).slice().sort((a,b)=>b.date.localeCompare(a.date)).slice(0,25).map(t => `
        <tr><td>${t.date}</td><td>${t.description}</td><td>${t.category}</td><td>${t.installmentTotal>1?`${t.installmentCurrent}/${t.installmentTotal}`:'-'}</td>
        <td class="${t.kind==='credito'?'pos':'neg'}">${t.kind==='credito'?'+':'-'}${fmtMoney(t.amount)}</td>
        <td><button class="danger" data-del-tx="${t.id}">excluir</button></td></tr>`).join('') || '<tr><td colspan="6" class="muted">Nenhum lançamento ainda.</td></tr>'}
      </tbody></table>
    </div>
  `;

  // charts
  new Chart(document.getElementById('chartCategorias'), {
    type: 'doughnut',
    data: { labels: Object.keys(curMonthCats), datasets: [{ data: Object.values(curMonthCats), backgroundColor: palette(Object.keys(curMonthCats).length) }] },
    options: { plugins: { legend: { position: 'right', labels: { color: '#e8eaed' } } } }
  });
  new Chart(document.getElementById('chartEvolucao'), {
    type: 'bar',
    data: { labels: totals.map(t=>monthLabel(t.mk)), datasets: [
      { label: 'Receitas', data: totals.map(t=>t.receita), backgroundColor: '#3ecf8e' },
      { label: 'Despesas', data: totals.map(t=>t.despesa), backgroundColor: '#ff5c5c' },
    ]},
    options: { scales: { x:{ticks:{color:'#9aa3b2'}}, y:{ticks:{color:'#9aa3b2'}} }, plugins:{legend:{labels:{color:'#e8eaed'}}} }
  });
  new Chart(document.getElementById('chartParcelas'), {
    type: 'bar',
    data: { labels: instMonths.map(monthLabel), datasets: [{ label: 'Parcelas previstas', data: instMonths.map(m=>instProj[m]), backgroundColor: '#4f7cff' }] },
    options: { scales: { x:{ticks:{color:'#9aa3b2'}}, y:{ticks:{color:'#9aa3b2'}} }, plugins:{legend:{labels:{color:'#e8eaed'}}} }
  });
  if (isPJ) {
    const { months: pMonths, proj: pProj } = payablesProjection(6);
    const { proj: instProjPJ } = installmentProjection('pj', 6);
    let running = cashTotal('pj');
    const saldoProjetado = pMonths.map(m => { running = running - (pProj[m]||0) - (instProjPJ[m]||0); return running; });
    new Chart(document.getElementById('chartProjecao'), {
      type: 'line',
      data: { labels: pMonths.map(monthLabel), datasets: [{ label: 'Saldo projetado', data: saldoProjetado, borderColor: '#4f7cff', backgroundColor: 'rgba(79,124,255,.2)', fill:true, tension:.2 }] },
      options: { scales: { x:{ticks:{color:'#9aa3b2'}}, y:{ticks:{color:'#9aa3b2'}} }, plugins:{legend:{labels:{color:'#e8eaed'}}} }
    });
  }

  // handlers
  document.getElementById('btnAddAccount').onclick = () => promptAccount(ledger);
  app.querySelectorAll('[data-del-account]').forEach(b => b.onclick = () => {
    if (!confirm('Excluir conta e todos os lançamentos ligados a ela?')) return;
    const id = b.dataset.delAccount;
    state.accounts = state.accounts.filter(a => a.id !== id);
    state.transactions = state.transactions.filter(t => t.accountId !== id);
    save(); render();
  });
  app.querySelectorAll('[data-manual]').forEach(b => b.onclick = () => promptTransaction(ledger, b.dataset.manual));
  app.querySelectorAll('[data-import]').forEach(b => b.onclick = () => openPdfModal(ledger, b.dataset.import));
  app.querySelectorAll('[data-del-tx]').forEach(b => b.onclick = () => {
    state.transactions = state.transactions.filter(t => t.id !== b.dataset.delTx); save(); render();
  });
  if (isPJ) {
    document.getElementById('btnAddPayable').onclick = () => promptPayable();
    app.querySelectorAll('[data-pay]').forEach(b => b.onclick = () => {
      const p = state.payables.find(x => x.id === b.dataset.pay);
      if (p) { p.status = 'pago'; save(); render(); }
    });
    app.querySelectorAll('[data-del-payable]').forEach(b => b.onclick = () => {
      state.payables = state.payables.filter(p => p.id !== b.dataset.delPayable); save(); render();
    });
  }
}

function palette(n) {
  const colors = ['#4f7cff','#3ecf8e','#f5a623','#ff5c5c','#a56cff','#2fc7e8','#ff8fa3','#c7d34f'];
  return Array.from({length:n}, (_,i) => colors[i % colors.length]);
}

// ===== Forms simples via prompt (rápido de usar, sem telas extras) =====
function promptAccount(ledger) {
  const name = prompt('Nome da conta/cartão (ex: Nubank, Itaú, Conta PJ):');
  if (!name) return;
  const type = confirm('É um cartão de crédito? OK = cartão, Cancelar = conta corrente') ? 'cartao' : 'conta';
  let initialBalance = 0;
  if (type === 'conta') {
    initialBalance = parseFloat(prompt('Saldo atual dessa conta (ex: 1500.00):')?.replace(',', '.')) || 0;
  }
  state.accounts.push({ id: uid(), ledger, name, type, initialBalance });
  save(); render();
}

function promptTransaction(ledger, accountId) {
  const description = prompt('Descrição:');
  if (!description) return;
  const amount = Math.abs(parseFloat(prompt('Valor (ex: 89.90):')?.replace(',', '.')));
  if (!amount) return;
  const kind = confirm('É uma despesa? OK = despesa, Cancelar = receita') ? 'debito' : 'credito';
  const date = prompt('Data (AAAA-MM-DD):', todayISO()) || todayISO();
  let installmentCurrent = 1, installmentTotal = 1;
  const acc = state.accounts.find(a => a.id === accountId);
  if (acc && acc.type === 'cartao' && kind === 'debito') {
    const parc = prompt('Parcelas (ex: 1 ou 3/10 para parcela atual 3 de 10):', '1');
    if (parc && parc.includes('/')) {
      const [c, t] = parc.split('/').map(Number);
      installmentCurrent = c; installmentTotal = t;
    }
  }
  const category = categorize(description);
  state.transactions.push({ id: uid(), ledger, accountId, date, description, amount, kind, category, installmentCurrent, installmentTotal });
  save(); render();
}

function promptPayable() {
  const description = prompt('Descrição da conta a pagar:');
  if (!description) return;
  const amount = Math.abs(parseFloat(prompt('Valor:')?.replace(',', '.')));
  if (!amount) return;
  const dueDate = prompt('Vencimento (AAAA-MM-DD):', todayISO()) || todayISO();
  const recurring = confirm('É recorrente todo mês? OK = sim, Cancelar = não');
  state.payables.push({ id: uid(), description, amount, dueDate, recurring, status: 'pendente' });
  save(); render();
}

// ===== Importação de PDF =====
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

let pdfStaging = [];

function openPdfModal(ledger, accountId) {
  const tpl = document.getElementById('tpl-pdf-modal');
  const node = tpl.content.cloneNode(true);
  document.body.appendChild(node);
  const backdrop = document.body.lastElementChild;
  const ledgerSelect = backdrop.querySelector('#pdfLedger');
  const accountSelect = backdrop.querySelector('#pdfAccount');
  ledgerSelect.value = ledger;
  function refreshAccounts() {
    accountSelect.innerHTML = accountsOf(ledgerSelect.value).map(a => `<option value="${a.id}">${a.name} (${a.type})</option>`).join('');
    if (accountId) accountSelect.value = accountId;
  }
  refreshAccounts();
  ledgerSelect.onchange = refreshAccounts;
  backdrop.querySelector('#pdfCancel').onclick = () => backdrop.remove();
  backdrop.querySelector('#pdfFile').onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    backdrop.querySelector('#pdfStatus').textContent = 'Lendo PDF...';
    try {
      const text = await extractPdfText(file);
      pdfStaging = parseStatementLines(text);
      backdrop.querySelector('#pdfStatus').textContent = `${pdfStaging.length} linhas encontradas. Revise antes de salvar — corrija o que estiver errado ou desmarque o que não é transação.`;
      renderPdfResults(backdrop);
    } catch (err) {
      console.error(err);
      backdrop.querySelector('#pdfStatus').textContent = 'Não consegui ler esse PDF automaticamente. Você pode lançar manualmente pelo botão "lançar manual".';
    }
  };
  backdrop.querySelector('#pdfConfirm').onclick = () => {
    const rows = backdrop.querySelectorAll('#pdfResults tr[data-row]');
    let count = 0;
    rows.forEach(row => {
      const checked = row.querySelector('[data-f=check]').checked;
      if (!checked) return;
      const date = row.querySelector('[data-f=date]').value;
      const description = row.querySelector('[data-f=desc]').value;
      const amount = Math.abs(parseFloat(row.querySelector('[data-f=amount]').value.replace(',', '.')));
      const kind = row.querySelector('[data-f=kind]').value;
      const category = row.querySelector('[data-f=cat]').value || categorize(description);
      const parc = row.querySelector('[data-f=parc]').value;
      let installmentCurrent = 1, installmentTotal = 1;
      if (parc && parc.includes('/')) {
        const [c, t] = parc.split('/').map(Number);
        if (c && t) { installmentCurrent = c; installmentTotal = t; }
      }
      if (!date || !description || !amount) return;
      state.transactions.push({ id: uid(), ledger: ledgerSelect.value, accountId: accountSelect.value, date, description, amount, kind, category, installmentCurrent, installmentTotal });
      count++;
    });
    save();
    backdrop.remove();
    render();
    alert(`${count} transações importadas.`);
  };
}

function renderPdfResults(backdrop) {
  const container = backdrop.querySelector('#pdfResults');
  container.innerHTML = `
    <table><thead><tr><th></th><th>Data</th><th>Descrição</th><th>Valor</th><th>Tipo</th><th>Categoria</th><th>Parcela</th></tr></thead>
    <tbody>${pdfStaging.map((r, i) => `
      <tr data-row="${i}">
        <td><input type="checkbox" data-f="check" checked></td>
        <td><input type="text" data-f="date" value="${r.date}" size="10"></td>
        <td><input type="text" data-f="desc" value="${r.description.replace(/"/g,'&quot;')}" size="28"></td>
        <td><input type="text" data-f="amount" value="${r.amount}" size="8"></td>
        <td><select data-f="kind"><option value="debito" ${r.kind==='debito'?'selected':''}>Despesa</option><option value="credito" ${r.kind==='credito'?'selected':''}>Receita</option></select></td>
        <td><input type="text" data-f="cat" value="${categorize(r.description)}" size="14"></td>
        <td><input type="text" data-f="parc" value="${r.parc||''}" size="6" placeholder="ex: 3/10"></td>
      </tr>`).join('')}
    </tbody></table>
  `;
}

async function extractPdfText(file) {
  const buf = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buf }).promise;
  let full = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const lines = {};
    content.items.forEach(item => {
      const y = Math.round(item.transform[5]);
      lines[y] = (lines[y] || '') + item.str;
    });
    full += Object.keys(lines).sort((a,b)=>b-a).map(y => lines[y]).join('\n') + '\n';
  }
  return full;
}

// Heurística genérica: procura linhas com data (dd/mm ou dd/mm/aaaa) e um valor em R$ no final.
// Funciona bem para a maioria dos extratos de cartão/conta brasileiros; ajuste manual sempre disponível.
function parseStatementLines(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const results = [];
  const dateRe = /(\d{2}\/\d{2}(?:\/\d{2,4})?)/;
  const valueRe = /(-?\s?R?\$?\s?-?\d{1,3}(?:\.\d{3})*,\d{2})\s*$/;
  const parcRe = /(\d{1,2})\s*\/\s*(\d{1,2})(?!\d)/;

  for (const line of lines) {
    const dateMatch = line.match(dateRe);
    const valueMatch = line.match(valueRe);
    if (!dateMatch || !valueMatch) continue;

    let rawDate = dateMatch[1];
    let [d, m, y] = rawDate.split('/');
    if (!y) y = new Date().getFullYear().toString();
    if (y.length === 2) y = '20' + y;
    const isoDate = `${y}-${m.padStart(2,'0')}-${d.padStart(2,'0')}`;

    let rawValue = valueMatch[1].replace(/\s/g, '').replace('R$', '');
    const negative = rawValue.startsWith('-');
    rawValue = rawValue.replace('-', '').replace(/\./g, '').replace(',', '.');
    const amount = parseFloat(rawValue);
    if (!amount || isNaN(amount)) continue;

    let description = line.replace(dateMatch[0], '').replace(valueMatch[0], '').trim();
    description = description.replace(/\s{2,}/g, ' ');
    if (description.length < 3) continue;

    let parc = '';
    const pm = description.match(parcRe);
    if (pm && Number(pm[1]) <= Number(pm[2]) && Number(pm[2]) <= 48) parc = `${pm[1]}/${pm[2]}`;

    results.push({
      date: isoDate,
      description,
      amount,
      kind: negative ? 'credito' : 'debito', // extratos de cartão geralmente listam despesa sem sinal; ajuste manualmente se necessário
      parc,
    });
  }
  return results;
}

// ===== Backup =====
document.getElementById('btnBackup').onclick = () => {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `financeiro-backup-${todayISO()}.json`; a.click();
  URL.revokeObjectURL(url);
};
document.getElementById('fileRestore').onchange = async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  if (!confirm('Isso substitui todos os dados atuais pelo backup. Continuar?')) return;
  const text = await file.text();
  try {
    state = JSON.parse(text);
    save(); render();
  } catch (err) { alert('Arquivo inválido.'); }
};

// ===== Tabs =====
document.querySelectorAll('.tab').forEach(tab => {
  tab.onclick = () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    currentView = tab.dataset.ledger;
    render();
  };
});

render();
