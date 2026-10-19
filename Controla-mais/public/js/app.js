'use strict';

const app = document.getElementById('app');
const toastRoot = document.getElementById('toast-root');
const STORAGE_THEME = 'controla_plus_theme_v1';

const state = {
  currentUser: null,
  transactions: [],
  authMode: 'login',
  authError: '',
  authDraft: { name: '', email: '' },
  busy: false,
  search: '',
  activeView: 'dashboard',
  modalOpen: false,
  editingId: null,
  modalDirection: 'Saída',
  filterOpen: false,
  pendingOnly: false,
  filters: { month: '', status: '', type: '', subtype: '', date: '', company: '' },
  darkMode: localStorage.getItem(STORAGE_THEME) === 'dark',
};

const ICONS = {
  grid: '<rect x="3" y="3" width="7" height="7" rx="1.4"/><rect x="14" y="3" width="7" height="7" rx="1.4"/><rect x="3" y="14" width="7" height="7" rx="1.4"/><rect x="14" y="14" width="7" height="7" rx="1.4"/>',
  arrows: '<path d="M7 7h13l-3-3"/><path d="M20 7l-3 3"/><path d="M17 17H4l3 3"/><path d="M4 17l3-3"/>',
  building: '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M9 7h2m2 0h2M9 11h2m2 0h2M9 15h2m2 0h2M10 21v-3h4v3"/>',
  chart: '<path d="M3 3v18h18"/><path d="m7 14 4-4 4 3 6-7"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="m19.4 15 .1.1 1.4 1.1-1.4 2.4-1.7-.6a8 8 0 0 1-1.8 1l-.3 1.8h-2.8l-.3-1.8a8 8 0 0 1-1.8-1l-1.7.6-1.4-2.4 1.4-1.1a7 7 0 0 1 0-2L5.7 12l1.4-2.4 1.7.6a8 8 0 0 1 1.8-1l.3-1.8h2.8l.3 1.8a8 8 0 0 1 1.8 1l1.7-.6 1.4 2.4-1.4 1.1a7 7 0 0 1-.1 1.9Z"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/>',
  down: '<path d="m7 10 5 5 5-5"/>',
  up: '<path d="m7 14 5-5 5 5"/>',
  eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
  eyeoff: '<path d="m3 3 18 18M10.6 10.6a2 2 0 0 0 2.8 2.8"/><path d="M9.9 5.2A10.5 10.5 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3.1 3.9M6.2 6.2C3.5 8.1 2 12 2 12s3.5 7 10 7c1.1 0 2.1-.2 3-.5"/>',
  close: '<path d="m18 6-12 12M6 6l12 12"/>',
  arrowDown: '<path d="M12 4v16m-7-7 7 7 7-7"/>',
  arrowUp: '<path d="M12 20V4m-7 7 7-7 7 7"/>',
  wallet: '<rect x="3" y="5" width="18" height="15" rx="2"/><path d="M3 9h18M16 15h2"/><path d="M6 5V3h12v2"/>',
  coins: '<circle cx="8" cy="8" r="5"/><path d="M10.5 13H16a5 5 0 0 0 0-10h-1.5M13 16a5 5 0 0 1-10 0c0-1.5.7-2.9 1.8-3.8"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  search: '<circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 5 5"/>',
  filter: '<path d="M4 7h16M7 12h10m-7 5h4"/>',
  download: '<path d="M12 3v12m-5-5 5 5 5-5"/><path d="M5 17v3h14v-3"/>',
  edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L9 17l-4 1 1-4Z"/>',
  trash: '<path d="M3 6h18M8 6V4h8v2m3 0-1 15H6L5 6m4 4v7m6-7v7"/>',
  receipt: '<path d="M4 3h16v18l-3-2-3 2-3-2-4 2-3-2Z"/><path d="M8 8h8M8 12h8M8 16h4"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  sparkle: '<path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z"/><path d="m19 16 .8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8Z"/>',
  logout: '<path d="M10 17l5-5-5-5M15 12H3"/><path d="M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6"/>',
  moon: '<path d="M20.9 13A8.5 8.5 0 0 1 11 3.1 8.5 8.5 0 1 0 20.9 13Z"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>',
  shield: '<path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z"/><path d="m9 12 2 2 4-4"/>',
  file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6M8 13h8m-8 4h8"/>',
  info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4m0-4h.01"/>',
};
function icon(name, size = 18) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" aria-hidden="true">${ICONS[name] || ICONS.info}</svg>`;
}
function escapeHtml(value = '') {
  return String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
}
function localDateISO(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
class ApiError extends Error {
  constructor(message, status) { super(message); this.status = status; }
}
async function api(path, { method = 'GET', body } = {}) {
  let res;
  try {
    res = await fetch('/api' + path, {
      method, credentials: 'same-origin',
      headers: body ? { 'Content-Type': 'application/json' } : {},
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError('Sem conexão com o servidor. Verifique sua internet e tente de novo.', 0);
  }
  let data = null;
  try { data = await res.json(); } catch { /* resposta sem corpo */ }
  if (!res.ok) {
    if (res.status === 401 && state.currentUser) handleSessionExpired();
    throw new ApiError((data && data.error) || 'Não foi possível concluir a operação.', res.status);
  }
  return data;
}
function handleSessionExpired() {
  state.currentUser = null; state.transactions = []; state.modalOpen = false; state.activeView = 'dashboard';
  state.authMode = 'login'; state.authError = 'Sua sessão expirou. Entre novamente para continuar.';
  renderAuth();
}
async function loadTransactions() {
  const result = await api('/transactions');
  state.transactions = Array.isArray(result.transactions) ? result.transactions : [];
}
function setBusy(form, on) {
  state.busy = on;
  form?.querySelectorAll('button[type="submit"]').forEach(btn => { btn.disabled = on; btn.classList.toggle('is-loading', on); });
}
function formatCurrency(amount) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(amount) || 0);
}
function formatDate(date, opts = { day: '2-digit', month: 'short', year: 'numeric' }) {
  if (!date) return '—';
  const parsed = new Date(`${date}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) return '—';
  return new Intl.DateTimeFormat('pt-BR', opts).format(parsed).replace('.', '');
}
function monthName(ym) {
  if (!ym || !/^\d{4}-\d{2}$/.test(ym)) return '';
  const [year, month] = ym.split('-').map(Number);
  const text = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(new Date(year, month - 1, 1));
  return text.charAt(0).toLocaleUpperCase('pt-BR') + text.slice(1);
}
function monthFromDate(date) { return date ? date.slice(0, 7) : ''; }
function titleCaseWords(input) {
  return String(input || '').trim().replace(/\s+/g, ' ').split(' ').map(word => {
    if (!word) return '';
    const lower = word.toLocaleLowerCase('pt-BR');
    return lower.charAt(0).toLocaleUpperCase('pt-BR') + lower.slice(1);
  }).join(' ');
}
function initials(name = '') {
  return name.trim().split(/\s+/).slice(0, 2).map(part => part[0] || '').join('').toLocaleUpperCase('pt-BR') || 'C+';
}
function allCompanies() {
  const byKey = new Map();
  state.transactions.forEach(tx => {
    const name = String(tx.company || '').trim();
    if (name) byKey.set(name.toLocaleLowerCase('pt-BR'), name);
  });
  return Array.from(byKey.values()).sort((a, b) => a.localeCompare(b, 'pt-BR'));
}
function allTypes() { return uniqueValues('type'); }
function allSubtypes() { return uniqueValues('subtype'); }
function uniqueValues(key) {
  return [...new Set(state.transactions.map(tx => String(tx[key] || '').trim()).filter(Boolean))].sort((a,b) => a.localeCompare(b, 'pt-BR'));
}
function isIncoming(tx) { return tx.direction === 'Entrada'; }
function isSettledIncome(tx) { return isIncoming(tx) && tx.status === 'Recebido'; }
function isSettledExpense(tx) { return !isIncoming(tx) && ['Pago', 'Quitado'].includes(tx.status); }
function isPending(tx) { return ['Em aberto', 'A receber'].includes(tx.status); }
function isOverdue(tx) { return isPending(tx) && !!tx.dueDate && tx.dueDate < localDateISO(); }
function statusClass(status) {
  if (status === 'Recebido') return 'status-received';
  if (status === 'Pago') return 'status-paid';
  if (status === 'Quitado') return 'status-settled';
  if (status === 'A receber') return 'status-receivable';
  return 'status-open';
}
function currentDateLabel() {
  const today = new Date();
  const formatted = new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' }).format(today);
  return formatted.charAt(0).toLocaleUpperCase('pt-BR') + formatted.slice(1);
}
function toast(message, type = 'success') {
  const el = document.createElement('div');
  el.className = 'toast' + (type === 'error' ? ' error' : '');
  el.innerHTML = `${icon(type === 'error' ? 'info' : 'check', 17)}<span>${escapeHtml(message)}</span>`;
  toastRoot.appendChild(el);
  setTimeout(() => el.remove(), 3600);
}
function applyTheme() {
  document.body.classList.toggle('dark-theme', state.darkMode);
  localStorage.setItem(STORAGE_THEME, state.darkMode ? 'dark' : 'light');
}
function renderAuth() {
  applyTheme();
  const registering = state.authMode === 'register';
  app.innerHTML = `
    <main class="auth-shell">
      <section class="auth-visual">
        <div class="auth-brand">
          <img class="logo-img auth-brand-full" src="assets/logo-branca.png" alt="Controla+">
        </div>
        <div class="auth-copy">
          <span class="eyebrow">Clareza para decidir melhor</span>
          <h1>Seu dinheiro merece um lugar <span>em ordem.</span></h1>
          <p>Reúna entradas, despesas e contas a vencer em uma visão simples, organizada e feita para acompanhar a sua rotina.</p>
          <div class="auth-showcase" aria-hidden="true">
            <div class="showcase-top"><span>Visão financeira</span><strong>Resumo mensal</strong></div>
            <div class="showcase-balance">R$ 8.420,50</div>
            <div class="showcase-growth">↗ Organização que acompanha você</div>
            <div class="showcase-bars"><span style="height:36%"></span><span style="height:56%"></span><span style="height:43%"></span><span style="height:73%"></span><span style="height:53%"></span><span style="height:90%"></span><span style="height:67%"></span><span style="height:100%"></span><span style="height:78%"></span><span style="height:84%"></span><span style="height:64%"></span><span style="height:94%"></span></div>
          </div>
        </div>
        <div class="auth-foot">Controle financeiro com mais simplicidade. © ${new Date().getFullYear()} Controla+.</div>
      </section>
      <section class="auth-panel">
        <div class="auth-form-wrap">
          <div class="auth-small-logo"><img class="logo-img" src="assets/logo.png" alt="Controla+"></div>
          <h2 class="auth-heading">${registering ? 'Crie sua conta' : 'Bem-vindo de volta'}</h2>
          <p class="auth-intro">${registering ? 'Comece a organizar sua vida financeira em poucos passos.' : 'Entre para visualizar e organizar suas movimentações.'}</p>
          ${state.authError ? `<div class="auth-error" role="alert">${escapeHtml(state.authError)}</div>` : ''}
          <form id="auth-form" novalidate>
            ${registering ? `<div class="auth-field"><label class="auth-label" for="auth-name">Nome completo</label><input class="field" id="auth-name" name="name" type="text" autocomplete="name" placeholder="Como podemos chamar você?" value="${escapeHtml(state.authDraft.name)}" required></div>` : ''}
            <div class="auth-field"><label class="auth-label" for="auth-email">E-mail</label><input class="field" id="auth-email" name="email" type="email" autocomplete="email" placeholder="voce@exemplo.com.br" value="${escapeHtml(state.authDraft.email)}" required></div>
            <div class="auth-field"><label class="auth-label" for="auth-password">Senha</label><div class="password-wrap"><input class="field" id="auth-password" name="password" type="password" autocomplete="${registering ? 'new-password' : 'current-password'}" placeholder="${registering ? 'Crie uma senha com 8 caracteres ou mais' : 'Digite sua senha'}" minlength="8" required><button class="password-toggle" type="button" data-action="toggle-password" aria-label="Mostrar senha">${icon('eye')}</button></div></div>
            ${registering ? `<p class="auth-help">Use pelo menos 8 caracteres. Para sua segurança, evite reutilizar senhas de outros serviços.</p>` : ''}
            <button class="btn btn-primary btn-wide" type="submit">${registering ? 'Criar minha conta' : 'Entrar na minha conta'} ${icon('arrowUp', 15)}</button>
          </form>
          <p class="auth-switch">${registering ? 'Já tem uma conta?' : 'Ainda não tem uma conta?'} <button class="text-button" type="button" data-action="switch-auth">${registering ? 'Fazer login' : 'Criar conta grátis'}</button></p>
        </div>
      </section>
    </main>`;
}

function navItem(key, label, iconName, count = '') {
  const active = state.activeView === key ? ' active' : '';
  return `<button class="nav-item${active}" type="button" data-action="navigate" data-view="${key}">${icon(iconName)}<span>${label}</span>${count ? `<span class="nav-count">${count}</span>` : ''}</button>`;
}
function pageTitle() {
  const names = { dashboard: ['Visão geral', 'Aqui está o panorama das suas finanças.'], transactions: ['Movimentações', 'Acompanhe, edite e organize cada lançamento.'], companies: ['Empresas', 'Veja os lançamentos agrupados por empresa.'], reports: ['Relatórios', 'Entenda como as entradas e saídas se distribuem.'], settings: ['Configurações', 'Gerencie seu perfil e seus dados.'] };
  return names[state.activeView] || names.dashboard;
}
function renderApp() {
  if (!state.currentUser) return renderAuth();
  applyTheme();
  const [title, subtitle] = pageTitle();
  const pendingCount = state.transactions.filter(isPending).length;
  const navCount = pendingCount ? Math.min(pendingCount, 99) : '';
  app.innerHTML = `
    <div class="app-shell">
      <aside class="sidebar" id="sidebar">
        <div class="side-brand"><img class="logo-img logo-light" src="assets/logo.png" alt="Controla+"><img class="logo-img logo-dark" src="assets/logo-branca.png" alt="Controla+"></div>
        <div class="side-section-label">Menu principal</div>
        <nav class="side-nav" aria-label="Menu principal">
          ${navItem('dashboard', 'Visão geral', 'grid')}
          ${navItem('transactions', 'Movimentações', 'arrows', state.transactions.length ? Math.min(state.transactions.length, 99) : '')}
          ${navItem('companies', 'Empresas', 'building')}
          ${navItem('reports', 'Relatórios', 'chart')}
        </nav>
        <div class="side-spacer"></div>
        <div class="side-tip"><div class="side-tip-icon">${icon('sparkle', 16)}</div><h4>Organização é liberdade</h4><p>Manter seus lançamentos atualizados ajuda você a enxergar o que vem pela frente.</p></div>
        <nav class="side-nav">${navItem('settings', 'Configurações', 'settings')}</nav>
        <div class="side-profile"><div class="avatar">${escapeHtml(initials(state.currentUser.name))}</div><div class="profile-meta"><strong>${escapeHtml(state.currentUser.name)}</strong><span>Conta pessoal</span></div><button class="profile-menu" type="button" data-action="logout" title="Sair">${icon('logout', 17)}</button></div>
      </aside>
      <div class="mobile-scrim" data-action="close-sidebar"></div>
      <main class="main-area">
        <header class="topbar">
          <div class="topbar-left"><button class="icon-button mobile-menu" data-action="open-sidebar" aria-label="Abrir menu">${icon('grid', 17)}</button><span class="topbar-muted">Workspace</span><span class="topbar-divider"></span><strong>${title}</strong></div>
          <div class="topbar-right"><button class="icon-button" type="button" data-action="toggle-theme" title="Alternar tema" aria-label="Alternar tema">${icon(state.darkMode ? 'sun' : 'moon', 17)}</button><button class="icon-button" type="button" data-action="export-csv" title="Exportar dados" aria-label="Exportar dados">${icon('download', 17)}</button></div>
        </header>
        <div class="content">
          <div class="page-heading"><div><h1>${title}</h1><p>${subtitle}</p></div>${state.activeView === 'dashboard' || state.activeView === 'transactions' ? `<div class="heading-actions"><div class="period-chip">${icon('calendar', 15)} ${escapeHtml(currentDateLabel())}</div><button class="btn btn-outline" type="button" data-action="toggle-filters">${icon('filter', 15)} Filtros</button><button class="btn btn-primary" type="button" data-action="new-transaction">${icon('plus', 16)} Novo lançamento</button></div>` : ''}</div>
          ${(state.activeView === 'dashboard' || state.activeView === 'transactions') ? renderFilters() : ''}
          ${renderCurrentPage()}
          <div class="app-disclaimer">${icon('shield', 13)} <span>Seus dados ficam salvos com segurança na sua conta. Exporte um CSV sempre que quiser uma cópia.</span></div>
        </div>
      </main>
    </div>
    ${state.modalOpen ? renderLaunchModal() : ''}`;
  applyTheme();
}
function getFilteredTransactions(filters = state.filters) {
  return state.transactions.filter(tx => {
    if (state.pendingOnly && !isPending(tx)) return false;
    if (filters.month && tx.dueMonth !== filters.month) return false;
    if (filters.status && tx.status !== filters.status) return false;
    if (filters.type && tx.type !== filters.type) return false;
    if (filters.subtype && String(tx.subtype || '') !== filters.subtype) return false;
    if (filters.date && tx.date !== filters.date) return false;
    if (state.search) {
      const hay = [tx.company, tx.invoice, tx.type, tx.subtype, tx.notes].join(' ').toLocaleLowerCase('pt-BR');
      if (!hay.includes(state.search.toLocaleLowerCase('pt-BR'))) return false;
    }
    if (filters.company && String(tx.company || '').toLocaleLowerCase('pt-BR') !== filters.company.toLocaleLowerCase('pt-BR')) return false;
    return true;
  }).sort((a,b) => (b.date || '').localeCompare(a.date || '') || (b.createdAt || 0) - (a.createdAt || 0));
}
function renderFilters() {
  const types = allTypes(); const subtypes = allSubtypes(); const companies = allCompanies();
  return `<section class="filter-panel${state.filterOpen ? ' open' : ''}" aria-label="Filtros de movimentações">
    <div class="filter-heading"><strong>Refinar movimentações</strong><button class="text-button" type="button" data-action="reset-filters">Limpar filtros</button></div>
    <form id="filter-form"><div class="filter-grid">
      <div><label class="control-label" for="filter-month">Mês de vencimento</label><input class="field" id="filter-month" name="month" type="month" value="${escapeHtml(state.filters.month)}"></div>
      <div><label class="control-label" for="filter-status">Status</label><select class="field" id="filter-status" name="status"><option value="">Todos os status</option>${['Pago','Em aberto','Recebido','A receber','Quitado'].map(x => `<option ${state.filters.status === x ? 'selected' : ''} value="${x}">${x}</option>`).join('')}</select></div>
      <div><label class="control-label" for="filter-type">Tipo</label><select class="field" id="filter-type" name="type"><option value="">Todos os tipos</option>${types.map(x => `<option ${state.filters.type === x ? 'selected' : ''} value="${escapeHtml(x)}">${escapeHtml(x)}</option>`).join('')}</select></div>
      <div><label class="control-label" for="filter-subtype">Subtipo</label><select class="field" id="filter-subtype" name="subtype"><option value="">Todos os subtipos</option>${subtypes.map(x => `<option ${state.filters.subtype === x ? 'selected' : ''} value="${escapeHtml(x)}">${escapeHtml(x)}</option>`).join('')}</select></div>
      <div><label class="control-label" for="filter-date">Data do lançamento</label><input class="field" id="filter-date" name="date" type="date" value="${escapeHtml(state.filters.date)}"></div>
      <div><label class="control-label" for="filter-company">Empresa</label><select class="field" id="filter-company" name="company"><option value="">Todas as empresas</option>${companies.map(x => `<option ${state.filters.company.toLocaleLowerCase('pt-BR') === x.toLocaleLowerCase('pt-BR') ? 'selected' : ''} value="${escapeHtml(x)}">${escapeHtml(x)}</option>`).join('')}</select></div>
    </div><div class="filter-actions"><button type="button" class="btn btn-quiet" data-action="close-filters">Cancelar</button><button type="submit" class="btn btn-primary">Aplicar filtros</button></div></form>
  </section>`;
}
function renderCurrentPage() {
  if (state.activeView === 'dashboard') return renderDashboard();
  if (state.activeView === 'transactions') return renderTransactionsPage();
  if (state.activeView === 'companies') return renderCompaniesPage();
  if (state.activeView === 'reports') return renderReportsPage();
  if (state.activeView === 'settings') return renderSettingsPage();
  return renderDashboard();
}
function renderDashboard() {
  const txs = getFilteredTransactions();
  const allIncome = txs.filter(isIncoming).reduce((sum,tx) => sum + Number(tx.value || 0), 0);
  const allExpense = txs.filter(tx => !isIncoming(tx)).reduce((sum,tx) => sum + Number(tx.value || 0), 0);
  const incomePaid = txs.filter(isSettledIncome).reduce((sum,tx) => sum + Number(tx.value || 0), 0);
  const expensePaid = txs.filter(isSettledExpense).reduce((sum,tx) => sum + Number(tx.value || 0), 0);
  const pending = txs.filter(isPending);
  const overdueCount = pending.filter(isOverdue).length;
  const pendingSum = pending.reduce((sum,tx) => sum + Number(tx.value || 0), 0);
  const settledBalance = incomePaid - expensePaid;
  const recent = txs.slice(0, 6);
  return `
    <section class="dashboard-banner"><div class="banner-copy"><div class="banner-icon">${icon('sparkle', 22)}</div><div><h3>Olá, ${escapeHtml(firstName(state.currentUser.name))}! Vamos deixar tudo em ordem?</h3><p>Confira suas movimentações e mantenha suas contas sempre organizadas.</p></div></div><div class="banner-value"><span>Saldo realizado</span><strong>${formatCurrency(settledBalance)}</strong></div></section>
    <section class="metrics-grid" aria-label="Resumo financeiro">
      ${metricCard('Entradas recebidas', formatCurrency(incomePaid), `${txs.filter(isSettledIncome).length} lançamento(s) confirmado(s)`, 'arrowDown', 'green')}
      ${metricCard('Saídas pagas', formatCurrency(expensePaid), `${txs.filter(isSettledExpense).length} lançamento(s) quitado(s)`, 'arrowUp', 'red')}
      ${metricCard('Saldo realizado', formatCurrency(settledBalance), 'Entradas recebidas menos saídas pagas', 'wallet', 'blue')}
      ${metricCard('Valores em aberto', formatCurrency(pendingSum), `${pending.length} pendente(s)${overdueCount ? ` · ${overdueCount} vencido(s)` : ''}`, 'clock', 'amber')}
    </section>
    <section class="dashboard-grid"><div class="panel"><div class="panel-header"><div><h2 class="panel-title">Movimentação financeira</h2><p class="panel-subtitle">Valores lançados nos últimos seis meses</p></div><div class="chart-legend"><span><i class="legend-dot"></i>Entradas</span><span><i class="legend-dot expense"></i>Saídas</span></div></div><div class="chart-area">${renderBarChart(txs)}</div></div>
      <div class="panel quick-summary"><h2 class="panel-title">Resumo dos lançamentos</h2><p class="panel-subtitle">Visão geral dos valores cadastrados</p><div class="summary-balance"><span>Saldo previsto (todos os lançamentos)</span><strong>${formatCurrency(allIncome - allExpense)}</strong></div><div class="summary-line"><span><i class="summary-mini-dot"></i>Entradas previstas</span><strong>${formatCurrency(allIncome)}</strong></div><div class="summary-line"><span><i class="summary-mini-dot red"></i>Saídas previstas</span><strong>${formatCurrency(allExpense)}</strong></div><div class="summary-line"><span><i class="summary-mini-dot amber"></i>Contas pendentes</span><strong>${pending.length}</strong></div></div>
    </section>
    ${renderUpcoming(pending)}
    <section class="panel table-panel"><div class="table-toolbar"><div class="table-toolbar-left"><h2 class="panel-title">Movimentações recentes</h2><span class="table-count">${txs.length}</span></div><div class="table-actions"><button class="btn btn-outline" type="button" data-action="export-csv">${icon('download', 14)} Exportar</button><button class="btn btn-quiet" type="button" data-action="navigate" data-view="transactions">Ver todas ${icon('arrowUp', 13)}</button></div></div>${renderTransactionTable(recent, txs.length > 0 ? 'Nenhuma movimentação encontrada com esses filtros.' : 'Seus lançamentos aparecerão aqui assim que você adicionar o primeiro.')}${txs.length ? `<div class="table-footer">Exibindo ${recent.length} de ${txs.length} movimentação(ões)</div>` : ''}</section>`;
}
function renderUpcoming(pending) {
  const list = [...pending].sort((a, b) => (a.dueDate || '9999').localeCompare(b.dueDate || '9999')).slice(0, 5);
  if (!list.length) return '';
  return `<section class="panel upcoming-panel"><div class="panel-header"><div><h2 class="panel-title">Próximos vencimentos</h2><p class="panel-subtitle">Contas a pagar e valores a receber, do mais urgente ao mais distante</p></div></div><ul class="upcoming-list">${list.map(tx => {
    const late = isOverdue(tx);
    return `<li class="upcoming-item${late ? ' overdue' : ''}"><div class="upcoming-date"><strong>${tx.dueDate ? escapeHtml(formatDate(tx.dueDate, { day: '2-digit' })) : '—'}</strong><span>${tx.dueDate ? escapeHtml(formatDate(tx.dueDate, { month: 'short' })) : 's/ data'}</span></div><div class="upcoming-info"><strong>${escapeHtml(tx.company)}</strong><span>${escapeHtml(tx.type)} · ${late ? 'Vencido' : tx.status}</span></div><span class="amount ${isIncoming(tx) ? 'income' : ''}">${isIncoming(tx) ? '+' : '−'} ${formatCurrency(tx.value)}</span><button class="btn btn-outline btn-sm" type="button" data-action="settle-transaction" data-id="${escapeHtml(tx.id)}">${icon('check', 13)} ${isIncoming(tx) ? 'Receber' : 'Pagar'}</button></li>`;
  }).join('')}</ul></section>`;
}
function firstName(name) { return String(name || '').trim().split(/\s+/)[0] || 'por aqui'; }
function metricCard(title, value, foot, iconName, color) {
  return `<article class="metric-card"><div class="metric-head"><span>${title}</span><span class="metric-icon ${color}">${icon(iconName, 16)}</span></div><div class="metric-value">${value}</div><div class="metric-foot">${escapeHtml(foot)}</div></article>`;
}
function renderBarChart(txs) {
  const now = new Date();
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({ key: `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`, label: new Intl.DateTimeFormat('pt-BR',{month:'short'}).format(d).replace('.',''), income: 0, expense: 0 });
  }
  const monthMap = new Map(months.map(m => [m.key, m]));
  txs.forEach(tx => {
    const month = monthMap.get(monthFromDate(tx.date));
    if (!month) return;
    if (isIncoming(tx)) month.income += Number(tx.value || 0); else month.expense += Number(tx.value || 0);
  });
  const max = Math.max(1, ...months.flatMap(m => [m.income, m.expense]));
  if (!txs.length || !months.some(m => m.income || m.expense)) return `<div class="empty-chart">${icon('chart', 30)}<strong>Ainda não há dados para o gráfico</strong><span>Adicione movimentações para acompanhar a evolução mês a mês.</span></div>`;
  const h = v => (v > 0 ? Math.max(3, v / max * 100) : 0);
  return `<div class="col-chart" role="img" aria-label="Entradas e saídas dos últimos seis meses">${months.map(m => `<div class="col-group" title="${escapeHtml(m.label)} — Entradas: ${formatCurrency(m.income)} · Saídas: ${formatCurrency(m.expense)}"><div class="col-bars"><span class="col-bar income" style="height:${h(m.income)}%"></span><span class="col-bar expense" style="height:${h(m.expense)}%"></span></div><span class="col-label">${escapeHtml(m.label)}</span></div>`).join('')}</div>`;
}
function formatCompact(value) {
  const amount = Number(value) || 0;
  if (amount >= 1000000) return 'R$ ' + (amount/1000000).toLocaleString('pt-BR',{maximumFractionDigits:1}) + ' mi';
  if (amount >= 1000) return 'R$ ' + (amount/1000).toLocaleString('pt-BR',{maximumFractionDigits:1}) + ' mil';
  return 'R$ ' + amount.toLocaleString('pt-BR',{maximumFractionDigits:0});
}
function renderTransactionsPage() {
  const txs = getFilteredTransactions();
  const total = txs.reduce((sum, tx) => sum + (isIncoming(tx) ? Number(tx.value || 0) : -Number(tx.value || 0)), 0);
  return `${state.pendingOnly ? `<section class="dashboard-banner"><div class="banner-copy"><div class="banner-icon">${icon('clock',22)}</div><div><h3>Visualizando pendências</h3><p>Exibindo apenas lançamentos com status “Em aberto” ou “A receber”.</p></div></div><button class="btn btn-outline" type="button" data-action="clear-pending-view">Ver todas</button></section>` : ''}<section class="report-grid" style="margin-bottom:17px"><article class="report-stat"><span>Movimentações filtradas</span><strong>${txs.length}</strong><p>Registros que correspondem aos filtros atuais</p></article><article class="report-stat"><span>Saldo previsto da seleção</span><strong>${formatCurrency(total)}</strong><p>Entradas menos saídas lançadas</p></article></section><section class="panel table-panel"><div class="table-toolbar"><div class="table-toolbar-left"><h2 class="panel-title">Todas as movimentações</h2><span class="table-count">${txs.length}</span></div><div class="table-actions"><label class="search-box">${icon('search',14)}<input id="tx-search" type="search" placeholder="Buscar empresa, fatura, tipo…" value="${escapeHtml(state.search)}" autocomplete="off" aria-label="Buscar movimentações"></label><button class="btn btn-outline" data-action="export-csv" type="button">${icon('download',14)} Exportar CSV</button></div></div>${renderTransactionTable(txs, 'Nenhuma movimentação encontrada. Altere os filtros ou crie um novo lançamento.')}${txs.length ? `<div class="table-footer">${txs.length} movimentação(ões) listada(s)</div>` : ''}</section>`;
}
function renderTransactionTable(txs, emptyMessage) {
  if (!txs.length) return `<div class="empty-table"><div class="empty-table-icon">${icon('receipt', 22)}</div><strong>Nada por aqui ainda</strong><p>${escapeHtml(emptyMessage)}</p><button class="btn btn-primary" data-action="new-transaction" type="button">${icon('plus',15)} Novo lançamento</button></div>`;
  return `<div class="table-wrap"><table><thead><tr><th>Empresa / Fatura</th><th>Tipo</th><th>Vencimento</th><th>Status</th><th>Valor</th><th style="text-align:right">Ações</th></tr></thead><tbody>${txs.map(tx => `<tr><td><div class="transaction-name"><div class="transaction-icon ${isIncoming(tx) ? 'income' : 'expense'}">${icon(isIncoming(tx) ? 'arrowDown' : 'arrowUp', 15)}</div><div class="transaction-meta"><strong>${escapeHtml(tx.company || 'Sem empresa')}</strong><span>${escapeHtml(tx.subtype || tx.invoice || 'Sem subtipo')} · ${escapeHtml(tx.invoice || 'Sem fatura')}</span></div></div></td><td><span class="type-label">${escapeHtml(tx.type || 'Sem tipo')}</span></td><td>${escapeHtml(formatDate(tx.dueDate, { day: '2-digit', month: 'short', year: 'numeric' }))}</td><td>${isOverdue(tx) ? `<span class="status-pill status-overdue" title="${escapeHtml(tx.status)} — vencimento já passou">Vencido</span>` : `<span class="status-pill ${statusClass(tx.status)}">${escapeHtml(tx.status)}</span>`}</td><td><span class="amount ${isIncoming(tx) ? 'income' : ''}">${isIncoming(tx) ? '+' : '−'} ${formatCurrency(tx.value)}</span></td><td><div class="row-actions">${isPending(tx) ? `<button class="row-action settle" type="button" data-action="settle-transaction" data-id="${escapeHtml(tx.id)}" title="${isIncoming(tx) ? 'Marcar como recebido' : 'Marcar como pago'}" aria-label="${isIncoming(tx) ? 'Marcar como recebido' : 'Marcar como pago'}">${icon('check',14)}</button>` : ''}<button class="row-action" type="button" data-action="edit-transaction" data-id="${escapeHtml(tx.id)}" title="Editar lançamento" aria-label="Editar lançamento">${icon('edit',14)}</button><button class="row-action delete" type="button" data-action="delete-transaction" data-id="${escapeHtml(tx.id)}" title="Excluir lançamento" aria-label="Excluir lançamento">${icon('trash',14)}</button></div></td></tr>`).join('')}</tbody></table></div>`;
}
function renderCompaniesPage() {
  const companies = allCompanies();
  if (!companies.length) return `<section class="panel"><div class="empty-table"><div class="empty-table-icon">${icon('building',22)}</div><strong>Suas empresas aparecerão aqui</strong><p>Ao criar um lançamento, informe a empresa relacionada. Ela será adicionada automaticamente à sua lista.</p><button class="btn btn-primary" type="button" data-action="new-transaction">${icon('plus',15)} Novo lançamento</button></div></section>`;
  return `<div class="section-grid">${companies.map(company => { const txs = state.transactions.filter(tx => String(tx.company).toLocaleLowerCase('pt-BR') === company.toLocaleLowerCase('pt-BR')); const net = txs.reduce((sum,tx) => sum + (isIncoming(tx) ? 1 : -1) * Number(tx.value || 0),0); return `<article class="company-card"><div class="company-avatar">${escapeHtml(initials(company))}</div><div class="company-details"><strong>${escapeHtml(company)}</strong><span>${txs.length} lançamento(s)</span></div><div class="company-total" title="Saldo previsto">${formatCompact(net)}</div><button class="row-action" data-action="company-filter" data-company="${escapeHtml(company)}" title="Ver movimentações">${icon('arrowUp',14)}</button></article>`; }).join('')}</div>`;
}
function renderReportsPage() {
  const txs = state.transactions;
  const entries = txs.filter(isIncoming).reduce((s, tx) => s + Number(tx.value || 0), 0);
  const expenses = txs.filter(tx => !isIncoming(tx)).reduce((s, tx) => s + Number(tx.value || 0), 0);
  const received = txs.filter(isSettledIncome).reduce((s, tx) => s + Number(tx.value || 0), 0);
  const paid = txs.filter(isSettledExpense).reduce((s, tx) => s + Number(tx.value || 0), 0);
  const open = txs.filter(isPending).reduce((s, tx) => s + Number(tx.value || 0), 0);
  const typeTotals = new Map();
  txs.forEach(tx => typeTotals.set(tx.type || 'Sem tipo', (typeTotals.get(tx.type || 'Sem tipo') || 0) + Number(tx.value || 0)));
  const max = Math.max(1, ...typeTotals.values());
  return `<section class="report-grid"><article class="report-stat"><span>Total de entradas cadastradas</span><strong>${formatCurrency(entries)}</strong><p>Inclui valores recebidos e a receber</p></article><article class="report-stat"><span>Total de saídas cadastradas</span><strong>${formatCurrency(expenses)}</strong><p>Inclui valores pagos e em aberto</p></article><article class="report-stat"><span>Entradas recebidas</span><strong>${formatCurrency(received)}</strong><p>Valores confirmados como recebidos</p></article><article class="report-stat"><span>Saídas pagas / quitadas</span><strong>${formatCurrency(paid)}</strong><p>Valores confirmados como pagos</p></article></section><section class="panel" style="margin-top:17px"><div class="panel-header"><div><h2 class="panel-title">Distribuição por tipo de conta</h2><p class="panel-subtitle">Valores agrupados pelo tipo informado nos lançamentos</p></div></div><div class="chart-area">${typeTotals.size ? `<div class="bar-chart">${[...typeTotals.entries()].sort((a,b)=>b[1]-a[1]).map(([label,value])=>`<div class="bar-row" style="grid-template-columns:minmax(90px,160px) minmax(0,1fr) 105px"><span class="bar-label" style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${escapeHtml(label)}">${escapeHtml(label)}</span><div class="bar-line" style="height:9px"><span class="bar-fill" style="width:${value/max*100}%"></span></div><span class="bar-total">${formatCurrency(value)}</span></div>`).join('')}</div>` : `<div class="empty-chart">${icon('chart',30)}<strong>Sem dados para analisar</strong><span>Faça lançamentos para gerar relatórios e comparativos.</span></div>`}</div></section><section class="panel" style="margin-top:17px"><div class="panel-header"><div><h2 class="panel-title">Pendências financeiras</h2><p class="panel-subtitle">Soma de valores com status “Em aberto” ou “A receber”</p></div></div><div class="quick-summary"><div class="summary-balance"><span>Total pendente</span><strong>${formatCurrency(open)}</strong></div><button class="btn btn-outline" type="button" data-action="show-pending">Ver pendências ${icon('arrowUp',14)}</button></div></section>`;
}
function renderSettingsPage() {
  return `<section class="settings-card"><h3>Perfil</h3><p>Essas informações identificam sua conta no Controla+.</p><form id="profile-form"><div class="settings-grid"><div><label class="control-label" for="profile-name">Nome</label><input class="field" id="profile-name" name="name" value="${escapeHtml(state.currentUser.name)}" required></div><div><label class="control-label" for="profile-email">E-mail</label><input class="field" id="profile-email" type="email" value="${escapeHtml(state.currentUser.email)}" disabled></div></div><div style="margin-top:16px"><button class="btn btn-primary" type="submit">Salvar alterações</button></div></form></section><section class="settings-card"><h3>Seus dados</h3><p>Suas movimentações ficam guardadas na nuvem, vinculadas à sua conta, e você as acessa de qualquer dispositivo. Exporte tudo em CSV quando quiser ou apague todos os lançamentos desta conta.</p><div class="settings-actions"><button class="btn btn-outline" type="button" data-action="export-csv">${icon('download',15)} Exportar movimentações (CSV)</button><button class="btn btn-danger" type="button" data-action="clear-transactions">${icon('trash',15)} Apagar todos os lançamentos</button></div></section><section class="settings-card"><h3>Armazenamento e privacidade</h3><p>Sua senha é armazenada apenas como hash seguro, a sessão fica em um cookie protegido e cada conta enxerga somente os próprios lançamentos.</p><div class="settings-actions"><span class="type-label">${icon('shield',13)} Banco de dados PostgreSQL (Neon)</span><span class="type-label">${icon('check',13)} Senha com hash seguro</span></div></section>`;
}

function getStatusOptions(direction, type) {
  if (direction === 'Entrada') return ['Recebido', 'A receber'];
  const list = ['Pago', 'Em aberto'];
  if (/boleto/i.test(type || '')) list.push('Quitado');
  return list;
}
function defaultStatus(direction, type) { return direction === 'Entrada' ? 'A receber' : (/boleto/i.test(type || '') ? 'Em aberto' : 'Em aberto'); }
function statusOptionsHtml(direction, type, selected) {
  const options = getStatusOptions(direction, type);
  let safeSelected = options.includes(selected) ? selected : defaultStatus(direction, type);
  return options.map(x => `<option value="${x}" ${x === safeSelected ? 'selected' : ''}>${x}</option>`).join('');
}
function getEditingTransaction() { return state.editingId ? state.transactions.find(tx => tx.id === state.editingId) : null; }
function renderLaunchModal() {
  const tx = getEditingTransaction();
  const direction = tx ? tx.direction : state.modalDirection;
  const today = localDateISO();
  const date = tx?.date || today;
  const dueDate = tx?.dueDate || '';
  const status = tx?.status || defaultStatus(direction, tx?.type || '');
  const company = tx?.company || '';
  const inputId = (name) => `tx-${name}`;
  return `<div class="modal-backdrop" data-action="backdrop-close"><section class="launch-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><form id="transaction-form">
    <div class="modal-header"><h2 id="modal-title">${tx ? 'Editar lançamento' : 'Adicionar lançamento'}</h2><button class="modal-close" type="button" data-action="close-modal" aria-label="Fechar">${icon('close',19)}</button></div>
    <div class="modal-scroll">
      <div class="direction-tabs" role="tablist" aria-label="Tipo de movimentação"><button class="direction-tab ${direction === 'Entrada' ? 'active' : ''}" type="button" data-action="set-direction" data-direction="Entrada" role="tab" aria-selected="${direction === 'Entrada'}">${icon('arrowDown',15)} Entrada</button><button class="direction-tab ${direction === 'Saída' ? 'active' : ''}" type="button" data-action="set-direction" data-direction="Saída" role="tab" aria-selected="${direction === 'Saída'}">${icon('arrowUp',15)} Saída</button></div>
      <input type="hidden" name="direction" id="tx-direction" value="${direction}">
      <div class="form-grid">
        <div class="form-field"><label class="control-label" for="${inputId('date')}">Data do lançamento</label><input class="field" id="${inputId('date')}" name="date" type="date" value="${escapeHtml(date)}" required></div>
        <div class="form-field company-field"><label class="control-label" for="${inputId('company')}">Empresa</label><input class="field" id="${inputId('company')}" name="company" type="text" value="${escapeHtml(company)}" autocomplete="off" placeholder="Nome da empresa" required><div class="autocomplete-list" id="company-suggestions" role="listbox"></div></div>
        <div class="form-field"><label class="control-label" for="${inputId('invoice')}">Fatura / Destinatário</label><input class="field" id="${inputId('invoice')}" name="invoice" type="text" value="${escapeHtml(tx?.invoice || '')}" placeholder="Quem vai receber?" required></div>
        <div class="form-field"><label class="control-label" for="${inputId('type')}">Tipo</label><input class="field" id="${inputId('type')}" name="type" list="transaction-types" value="${escapeHtml(tx?.type || '')}" placeholder="Ex.: Cartão de crédito" required><datalist id="transaction-types"><option value="Cartão de crédito"><option value="Impostos"><option value="Boleto"><option value="Aluguel"><option value="Serviços"><option value="Fornecedores"><option value="Salário"><option value="Vendas"><option value="Transferência"><option value="Outros"></datalist></div>
        <div class="form-field"><label class="control-label" for="${inputId('subtype')}">Subtipo</label><input class="field" id="${inputId('subtype')}" name="subtype" list="transaction-subtypes" value="${escapeHtml(tx?.subtype || '')}" placeholder="Ex.: Internet, energia"><datalist id="transaction-subtypes">${allSubtypes().map(x=>`<option value="${escapeHtml(x)}">`).join('')}</datalist></div>
        <div class="form-field"><label class="control-label" for="${inputId('dueDate')}">Vencimento</label><input class="field" id="${inputId('dueDate')}" name="dueDate" type="date" value="${escapeHtml(dueDate)}"></div>
        <div class="form-field"><label class="control-label" for="${inputId('dueMonth')}">Mês de vencimento</label><input class="field" id="${inputId('dueMonth')}" name="dueMonthDisplay" type="text" value="${escapeHtml(monthName(monthFromDate(dueDate)))}" placeholder="Preenchido automaticamente" readonly><span class="field-note">Calculado com base no vencimento.</span></div>
        <div class="form-field"><label class="control-label" for="${inputId('value')}">Valor</label><div class="field-prefix"><span>R$</span><input class="field" id="${inputId('value')}" name="value" type="number" inputmode="decimal" min="0.01" step="0.01" value="${tx ? escapeHtml(tx.value) : ''}" placeholder="0,00" required></div></div>
        <div class="form-field"><label class="control-label" for="${inputId('status')}">Status</label><select class="field" id="${inputId('status')}" name="status" required>${statusOptionsHtml(direction, tx?.type || '', status)}</select></div>
        <div class="form-field"><label class="control-label" for="${inputId('paymentDate')}">Data de pagamento</label><input class="field" id="${inputId('paymentDate')}" name="paymentDate" type="date" value="${escapeHtml(tx?.paymentDate || '')}"></div>
        <div class="form-field full"><label class="control-label" for="${inputId('notes')}">Descrição / observações <span class="field-note">(Opcional)</span></label><textarea class="field" style="height:76px;padding-top:11px;resize:vertical" id="${inputId('notes')}" name="notes" placeholder="Adicione detalhes úteis sobre este lançamento">${escapeHtml(tx?.notes || '')}</textarea></div>
      </div>
      <div class="total-preview"><span>Valor do lançamento</span><strong id="tx-total-preview">${formatCurrency(tx?.value || 0)}</strong></div>
    </div>
    <div class="modal-footer"><button class="btn btn-quiet" type="button" data-action="close-modal">Cancelar</button><button class="btn btn-primary" type="submit">${icon('plus',15)} ${tx ? 'Salvar alterações' : 'Adicionar lançamento'}</button></div>
  </form></section></div>`;
}

function openModal(id = null) {
  state.editingId = id;
  const tx = id ? state.transactions.find(item => item.id === id) : null;
  state.modalDirection = tx?.direction || 'Saída';
  state.modalOpen = true;
  document.body.classList.remove('sidebar-open');
  renderApp();
  setTimeout(() => document.getElementById(tx ? 'tx-company' : 'tx-date')?.focus(), 30);
}
function closeModal() { state.modalOpen = false; state.editingId = null; renderApp(); }
function updateDirection(direction) {
  state.modalDirection = direction;
  const hidden = document.getElementById('tx-direction');
  if (hidden) hidden.value = direction;
  app.querySelectorAll('.direction-tab').forEach(tab => {
    const active = tab.dataset.direction === direction;
    tab.classList.toggle('active', active);
    tab.setAttribute('aria-selected', String(active));
  });
  updateStatusSelect();
}
function updateStatusSelect() {
  const statusSelect = document.getElementById('tx-status');
  const typeInput = document.getElementById('tx-type');
  if (!statusSelect) return;
  const current = statusSelect.value;
  const options = getStatusOptions(document.getElementById('tx-direction')?.value || state.modalDirection, typeInput?.value || '');
  const next = options.includes(current) ? current : defaultStatus(document.getElementById('tx-direction')?.value || state.modalDirection, typeInput?.value || '');
  statusSelect.innerHTML = statusOptionsHtml(document.getElementById('tx-direction')?.value || state.modalDirection, typeInput?.value || '', next);
  const payment = document.getElementById('tx-paymentDate');
  if (['Pago','Recebido','Quitado'].includes(statusSelect.value) && payment && !payment.value) payment.value = localDateISO();
  if (['Em aberto','A receber'].includes(statusSelect.value) && payment) payment.value = '';
}
function updateCompanySuggestions() {
  const input = document.getElementById('tx-company');
  const list = document.getElementById('company-suggestions');
  if (!input || !list) return;
  const query = input.value.trim().toLocaleLowerCase('pt-BR');
  if (!query) { list.classList.remove('show'); list.innerHTML = ''; return; }
  const matches = allCompanies().filter(company => company.toLocaleLowerCase('pt-BR').includes(query)).slice(0, 7);
  if (!matches.length) { list.classList.remove('show'); list.innerHTML = ''; return; }
  list.innerHTML = matches.map(company => `<button class="autocomplete-option" type="button" role="option" data-action="select-company" data-company="${escapeHtml(company)}">${icon('building',14)}<span>${escapeHtml(company)}</span></button>`).join('');
  list.classList.add('show');
}
async function handleTransactionSubmit(form) {
  if (state.busy) return;
  const data = new FormData(form);
  const direction = data.get('direction') === 'Entrada' ? 'Entrada' : 'Saída';
  const company = titleCaseWords(data.get('company'));
  const invoice = String(data.get('invoice') || '').trim();
  const type = String(data.get('type') || '').trim();
  const subtype = String(data.get('subtype') || '').trim();
  const date = String(data.get('date') || '');
  const dueDate = String(data.get('dueDate') || '');
  const value = Number(data.get('value'));
  let status = String(data.get('status') || '');
  let paymentDate = String(data.get('paymentDate') || '');
  const notes = String(data.get('notes') || '').trim();
  if (!company || !invoice || !type || !date || !Number.isFinite(value) || value <= 0) {
    toast('Preencha empresa, fatura, tipo, data e um valor maior que zero.', 'error'); return;
  }
  const validStatus = getStatusOptions(direction, type);
  if (!validStatus.includes(status)) status = defaultStatus(direction, type);
  if (['Pago','Recebido','Quitado'].includes(status) && !paymentDate) paymentDate = localDateISO();
  if (['Em aberto','A receber'].includes(status)) paymentDate = '';
  const payload = { direction, date, company, invoice, type, subtype, dueDate, value: Math.round(value * 100) / 100, status, paymentDate, notes };
  const existing = getEditingTransaction();
  setBusy(form, true);
  try {
    const result = existing
      ? await api(`/transactions/${encodeURIComponent(existing.id)}`, { method: 'PUT', body: payload })
      : await api('/transactions', { method: 'POST', body: payload });
    const saved = result.transaction;
    state.transactions = existing ? state.transactions.map(item => item.id === saved.id ? saved : item) : [saved, ...state.transactions];
    state.busy = false; state.modalOpen = false; state.editingId = null; state.activeView = 'dashboard';
    renderApp();
    toast(existing ? 'Lançamento atualizado com sucesso.' : 'Lançamento adicionado com sucesso.');
  } catch (err) {
    setBusy(form, false);
    toast(err.message, 'error');
  }
}
async function settleTransaction(id) {
  const tx = state.transactions.find(item => item.id === id);
  if (!tx || state.busy) return;
  const status = isIncoming(tx) ? 'Recebido' : (/boleto/i.test(tx.type || '') ? 'Quitado' : 'Pago');
  state.busy = true;
  try {
    const result = await api(`/transactions/${encodeURIComponent(id)}`, { method: 'PUT', body: { ...tx, status, paymentDate: localDateISO() } });
    state.transactions = state.transactions.map(item => item.id === id ? result.transaction : item);
    state.busy = false; renderApp();
    toast(isIncoming(tx) ? 'Marcado como recebido.' : 'Marcado como pago.');
  } catch (err) { state.busy = false; toast(err.message, 'error'); }
}
async function deleteTransaction(id) {
  const tx = state.transactions.find(item => item.id === id);
  if (!tx || state.busy) return;
  const ok = window.confirm(`Excluir o lançamento de ${tx.company || 'empresa'} no valor de ${formatCurrency(tx.value)}? Essa ação não poderá ser desfeita.`);
  if (!ok) return;
  state.busy = true;
  try {
    await api(`/transactions/${encodeURIComponent(id)}`, { method: 'DELETE' });
    state.transactions = state.transactions.filter(item => item.id !== id);
    state.busy = false; renderApp(); toast('Lançamento excluído.');
  } catch (err) { state.busy = false; toast(err.message, 'error'); }
}
function exportCSV() {
  if (!state.transactions.length) { toast('Ainda não há movimentações para exportar.', 'error'); return; }
  const rows = [['Direção','Data','Empresa','Fatura / Destinatário','Tipo','Subtipo','Mês de vencimento','Vencimento','Valor','Status','Data de pagamento','Observações']];
  getFilteredTransactions().forEach(tx => rows.push([tx.direction, tx.date, tx.company, tx.invoice, tx.type, tx.subtype, monthName(tx.dueMonth), tx.dueDate, Number(tx.value).toFixed(2).replace('.',','), tx.status, tx.paymentDate, tx.notes]));
  const csv = '\ufeff' + rows.map(row => row.map(value => `"${String(value ?? '').replace(/"/g, '""')}"`).join(';')).join('\r\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a'); link.href = url; link.download = `controla-mais-movimentacoes-${localDateISO()}.csv`;
  document.body.appendChild(link); link.click(); link.remove(); URL.revokeObjectURL(url);
  toast('Arquivo CSV preparado para exportação.');
}
function applyFilterForm(form) {
  const data = new FormData(form);
  state.filters = { month: String(data.get('month') || ''), status: String(data.get('status') || ''), type: String(data.get('type') || ''), subtype: String(data.get('subtype') || ''), date: String(data.get('date') || ''), company: String(data.get('company') || '') };
  state.pendingOnly = false;
  state.filterOpen = false; renderApp(); toast('Filtros aplicados.');
}

// Delegated event handling keeps the interface simple to maintain without a framework.
app.addEventListener('click', async (event) => {
  const target = event.target.closest('[data-action]');
  if (!target) {
    if (state.modalOpen && !event.target.closest('.company-field')) document.getElementById('company-suggestions')?.classList.remove('show');
    return;
  }
  const action = target.dataset.action;
  if (action === 'backdrop-close') { if (event.target === target) closeModal(); return; }
  if (action === 'switch-auth') { state.authMode = state.authMode === 'login' ? 'register' : 'login'; state.authError = ''; renderAuth(); return; }
  if (action === 'toggle-password') { const input = document.getElementById('auth-password'); if (input) { input.type = input.type === 'password' ? 'text' : 'password'; target.innerHTML = icon(input.type === 'password' ? 'eye' : 'eyeoff'); target.setAttribute('aria-label', input.type === 'password' ? 'Mostrar senha' : 'Ocultar senha'); } return; }
  if (action === 'navigate') { state.activeView = target.dataset.view || 'dashboard'; state.pendingOnly = false; state.search = ''; state.filterOpen = false; document.body.classList.remove('sidebar-open'); renderApp(); return; }
  if (action === 'new-transaction') { openModal(); return; }
  if (action === 'close-modal') { closeModal(); return; }
  if (action === 'set-direction') { updateDirection(target.dataset.direction); return; }
  if (action === 'select-company') { const input = document.getElementById('tx-company'); if (input) input.value = target.dataset.company || ''; document.getElementById('company-suggestions')?.classList.remove('show'); return; }
  if (action === 'toggle-filters') { state.filterOpen = !state.filterOpen; renderApp(); return; }
  if (action === 'close-filters') { state.filterOpen = false; renderApp(); return; }
  if (action === 'reset-filters') { state.filters = { month: '', status: '', type: '', subtype: '', date: '', company: '' }; state.pendingOnly = false; state.filterOpen = true; renderApp(); toast('Filtros limpos.'); return; }
  if (action === 'edit-transaction') { openModal(target.dataset.id); return; }
  if (action === 'delete-transaction') { deleteTransaction(target.dataset.id); return; }
  if (action === 'settle-transaction') { settleTransaction(target.dataset.id); return; }
  if (action === 'retry-boot') { bootstrap(); return; }
  if (action === 'export-csv') { exportCSV(); return; }
  if (action === 'toggle-theme') { state.darkMode = !state.darkMode; applyTheme(); renderApp(); return; }
  if (action === 'logout') { api('/auth/logout', { method: 'POST' }).catch(() => {}); state.currentUser = null; state.transactions = []; state.activeView = 'dashboard'; state.modalOpen = false; state.authMode = 'login'; state.authError = ''; state.search = ''; renderAuth(); return; }
  if (action === 'open-sidebar') { document.body.classList.add('sidebar-open'); return; }
  if (action === 'close-sidebar') { document.body.classList.remove('sidebar-open'); return; }
  if (action === 'company-filter') { state.pendingOnly = false; state.search = ''; state.activeView = 'transactions'; state.filters.company = target.dataset.company || ''; state.filterOpen = true; document.body.classList.remove('sidebar-open'); renderApp(); return; }
  if (action === 'clear-pending-view') { state.pendingOnly = false; renderApp(); return; }
  if (action === 'show-pending') { state.search = ''; state.activeView = 'transactions'; state.filters = { month:'', status:'', type:'', subtype:'', date:'', company:'' }; state.pendingOnly = true; state.filterOpen = false; renderApp(); return; }
  if (action === 'clear-transactions') { if (!state.transactions.length) { toast('Não há lançamentos para apagar.', 'error'); return; } if (confirm('Tem certeza de que deseja apagar TODOS os lançamentos desta conta? Esta ação não poderá ser desfeita.')) { try { await api('/transactions', { method: 'DELETE' }); state.transactions = []; renderApp(); toast('Todos os lançamentos foram apagados.'); } catch (err) { toast(err.message, 'error'); } } return; }
});

app.addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = event.target;
  if (form.id === 'auth-form') {
    if (state.busy) return;
    const data = new FormData(form);
    const registering = state.authMode === 'register';
    const name = String(data.get('name') || '').trim();
    const email = String(data.get('email') || '').trim().toLocaleLowerCase('pt-BR');
    const password = String(data.get('password') || '');
    state.authDraft = { name, email };
    const fail = (message) => { state.authError = message; renderAuth(); };
    if (!email || !email.includes('@') || !password) return fail('Informe um e-mail válido e sua senha.');
    if (registering && name.length < 2) return fail('Informe seu nome completo ou como prefere ser chamado.');
    if (registering && password.length < 8) return fail('Sua senha precisa ter pelo menos 8 caracteres.');
    setBusy(form, true);
    try {
      const result = await api(registering ? '/auth/register' : '/auth/login', { method: 'POST', body: registering ? { name, email, password } : { email, password } });
      state.currentUser = result.user;
      await loadTransactions();
      state.authError = ''; state.authDraft = { name: '', email: '' }; state.activeView = 'dashboard'; state.busy = false;
      renderApp();
      toast(registering ? 'Conta criada! Bem-vindo ao Controla+.' : `Olá, ${firstName(result.user.name)}! Bom ter você de volta.`);
    } catch (err) {
      state.busy = false; state.currentUser = null; fail(err.message);
    }
    return;
  }
  if (form.id === 'transaction-form') { handleTransactionSubmit(form); return; }
  if (form.id === 'filter-form') { applyFilterForm(form); return; }
  if (form.id === 'profile-form') {
    const name = String(new FormData(form).get('name') || '').trim();
    if (name.length < 2) { toast('Informe um nome válido.', 'error'); return; }
    try {
      const result = await api('/auth/me', { method: 'PATCH', body: { name } });
      state.currentUser = result.user; renderApp(); toast('Perfil atualizado.');
    } catch (err) { toast(err.message, 'error'); }
    return;
  }
});

app.addEventListener('input', (event) => {
  const target = event.target;
  if (target.id === 'tx-search') {
    state.search = target.value; const pos = target.selectionStart; renderApp();
    const el = document.getElementById('tx-search'); if (el) { el.focus(); try { el.setSelectionRange(pos, pos); } catch { /* ignore */ } }
    return;
  }
  if (target.id === 'tx-company') updateCompanySuggestions();
  if (target.id === 'tx-dueDate') { const dueMonth = document.getElementById('tx-dueMonth'); if (dueMonth) dueMonth.value = monthName(monthFromDate(target.value)); }
  if (target.id === 'tx-value') { const preview = document.getElementById('tx-total-preview'); if (preview) preview.textContent = formatCurrency(target.value); }
  if (target.id === 'tx-type') updateStatusSelect();
});
app.addEventListener('change', (event) => {
  const target = event.target;
  if (target.id === 'tx-dueDate') { const dueMonth = document.getElementById('tx-dueMonth'); if (dueMonth) dueMonth.value = monthName(monthFromDate(target.value)); }
  if (target.id === 'tx-type') updateStatusSelect();
  if (target.id === 'tx-status') {
    const payment = document.getElementById('tx-paymentDate');
    if (payment && ['Pago','Recebido','Quitado'].includes(target.value) && !payment.value) payment.value = localDateISO();
    if (payment && ['Em aberto','A receber'].includes(target.value)) payment.value = '';
  }
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    if (state.modalOpen) closeModal();
    else document.body.classList.remove('sidebar-open');
  }
});

function renderLoading() {
  applyTheme();
  app.innerHTML = '<div class="boot-screen" role="status"><img class="logo-img" src="assets/logo.png" alt="Controla+"><div class="boot-spinner" aria-hidden="true"></div><span>Carregando suas finanças…</span></div>';
}
function renderBootError(err) {
  applyTheme();
  app.innerHTML = `<div class="boot-screen"><img class="logo-img" src="assets/logo.png" alt="Controla+"><h2>Não conseguimos conectar</h2><p>${escapeHtml(err.message)}</p><button class="btn btn-primary" type="button" data-action="retry-boot">Tentar novamente</button></div>`;
}
async function bootstrap() {
  renderLoading();
  try {
    const me = await api('/auth/me');
    state.currentUser = me.user;
    await loadTransactions();
    renderApp();
  } catch (err) {
    state.currentUser = null;
    if (err.status === 401) renderAuth(); else renderBootError(err);
  }
}
bootstrap();
