'use strict';
require('dotenv').config();
const path = require('path');
const express = require('express');
const db = require('./db');
const { hashPassword, verifyPassword, dummyHashPromise, createSession, requireAuth, COOKIE_NAME } = require('./auth');
const { validateTransaction, validateEmail } = require('./validate');

const app = express();
const isProd = process.env.NODE_ENV === 'production';
const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const extraOrigins = (process.env.ALLOWED_ORIGINS || '').split(',').map((s) => s.trim()).filter(Boolean);
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

if (isProd) app.set('trust proxy', 1);
app.disable('x-powered-by');

// ---------- Segurança básica ----------
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Content-Security-Policy', [
    "default-src 'self'", "script-src 'self'", "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com", "img-src 'self' data:", "connect-src 'self'",
    "object-src 'none'", "base-uri 'self'", "frame-ancestors 'none'", "form-action 'self'",
  ].join('; '));
  if (isProd) res.setHeader('Strict-Transport-Security', 'max-age=15552000; includeSubDomains');
  next();
});

app.use(express.json({ limit: '50kb' }));

// Bloqueia requisições de escrita vindas de outros sites (proteção extra contra CSRF).
app.use('/api', (req, res, next) => {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
  const origin = req.headers.origin;
  if (origin) {
    let host = '';
    try { host = new URL(origin).host; } catch { /* origem inválida */ }
    if (host !== req.headers.host && !extraOrigins.includes(origin)) return res.status(403).json({ error: 'Origem não autorizada.' });
  }
  next();
});

// Limite simples de tentativas de login/cadastro por IP (em memória).
const attempts = new Map();
function authLimiter(req, res, next) {
  const now = Date.now();
  const entry = attempts.get(req.ip);
  if (!entry || entry.reset < now) { attempts.set(req.ip, { count: 1, reset: now + 15 * 60 * 1000 }); return next(); }
  if (++entry.count > 20) {
    res.setHeader('Retry-After', String(Math.ceil((entry.reset - now) / 1000)));
    return res.status(429).json({ error: 'Muitas tentativas. Aguarde alguns minutos e tente de novo.' });
  }
  next();
}
setInterval(() => { const now = Date.now(); for (const [ip, e] of attempts) if (e.reset < now) attempts.delete(ip); }, 10 * 60 * 1000).unref();

const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
const publicUser = (u) => ({ id: u.id, name: u.name, email: u.email });

// ---------- Autenticação ----------
app.post('/api/auth/register', authLimiter, wrap(async (req, res) => {
  const name = String(req.body?.name || '').trim().replace(/\s+/g, ' ');
  const email = validateEmail(req.body?.email);
  const password = String(req.body?.password || '');
  if (name.length < 2 || name.length > 120) return res.status(400).json({ error: 'Informe seu nome (entre 2 e 120 caracteres).' });
  if (!email) return res.status(400).json({ error: 'Informe um e-mail válido.' });
  if (password.length < 8) return res.status(400).json({ error: 'Sua senha precisa ter pelo menos 8 caracteres.' });
  if (password.length > 128) return res.status(400).json({ error: 'A senha pode ter no máximo 128 caracteres.' });
  let user;
  try {
    const { rows } = await db.query('INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email', [name, email, await hashPassword(password)]);
    user = rows[0];
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Já existe uma conta com esse e-mail. Faça login ou use outro endereço.' });
    throw err;
  }
  await createSession(res, user.id, req.headers['user-agent']);
  res.status(201).json({ user: publicUser(user) });
}));

app.post('/api/auth/login', authLimiter, wrap(async (req, res) => {
  const email = validateEmail(req.body?.email);
  const password = String(req.body?.password || '');
  const fail = () => res.status(401).json({ error: 'E-mail ou senha incorretos. Confira os dados e tente novamente.' });
  if (!email || !password || password.length > 128) return fail();
  const { rows } = await db.query('SELECT id, name, email, password_hash FROM users WHERE lower(email) = $1', [email]);
  const user = rows[0];
  const ok = await verifyPassword(password, user ? user.password_hash : await dummyHashPromise);
  if (!user || !ok) return fail();
  await createSession(res, user.id, req.headers['user-agent']);
  res.json({ user: publicUser(user) });
}));

app.post('/api/auth/logout', wrap(async (req, res) => {
  const header = req.headers.cookie || '';
  const match = header.split(';').map((p) => p.trim()).find((p) => p.startsWith(`${COOKIE_NAME}=`));
  if (match) {
    const token = decodeURIComponent(match.slice(COOKIE_NAME.length + 1));
    await db.query('DELETE FROM sessions WHERE token_hash = $1', [require('crypto').createHash('sha256').update(token).digest('hex')]);
  }
  res.clearCookie(COOKIE_NAME, { path: '/' });
  res.json({ ok: true });
}));

app.get('/api/auth/me', requireAuth, (req, res) => res.json({ user: publicUser(req.user) }));

app.patch('/api/auth/me', requireAuth, wrap(async (req, res) => {
  const name = String(req.body?.name || '').trim().replace(/\s+/g, ' ');
  if (name.length < 2 || name.length > 120) return res.status(400).json({ error: 'Informe um nome válido.' });
  const { rows } = await db.query('UPDATE users SET name = $1 WHERE id = $2 RETURNING id, name, email', [name, req.user.id]);
  res.json({ user: publicUser(rows[0]) });
}));

// ---------- Lançamentos ----------
const COLS = 'id, direction, entry_date, company, invoice, type, subtype, due_date, value, status, payment_date, notes, created_at, updated_at';
const toApi = (r) => ({
  id: r.id, direction: r.direction, date: r.entry_date, company: r.company, invoice: r.invoice, type: r.type, subtype: r.subtype,
  dueDate: r.due_date || '', dueMonth: r.due_date ? r.due_date.slice(0, 7) : '', value: r.value, status: r.status,
  paymentDate: r.payment_date || '', notes: r.notes, createdAt: new Date(r.created_at).getTime(), updatedAt: new Date(r.updated_at).getTime(),
});

app.get('/api/transactions', requireAuth, wrap(async (req, res) => {
  const { rows } = await db.query(`SELECT ${COLS} FROM transactions WHERE user_id = $1 ORDER BY entry_date DESC, created_at DESC`, [req.user.id]);
  res.json({ transactions: rows.map(toApi) });
}));

app.post('/api/transactions', requireAuth, wrap(async (req, res) => {
  const { data, error } = validateTransaction(req.body);
  if (error) return res.status(400).json({ error });
  const { rows } = await db.query(
    `INSERT INTO transactions (user_id, direction, entry_date, company, invoice, type, subtype, due_date, value, status, payment_date, notes)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING ${COLS}`,
    [req.user.id, data.direction, data.date, data.company, data.invoice, data.type, data.subtype, data.dueDate, data.value, data.status, data.paymentDate, data.notes]
  );
  res.status(201).json({ transaction: toApi(rows[0]) });
}));

app.put('/api/transactions/:id', requireAuth, wrap(async (req, res) => {
  if (!UUID.test(req.params.id)) return res.status(404).json({ error: 'Lançamento não encontrado.' });
  const { data, error } = validateTransaction(req.body);
  if (error) return res.status(400).json({ error });
  const { rows } = await db.query(
    `UPDATE transactions SET direction=$3, entry_date=$4, company=$5, invoice=$6, type=$7, subtype=$8, due_date=$9, value=$10, status=$11, payment_date=$12, notes=$13
     WHERE id=$1 AND user_id=$2 RETURNING ${COLS}`,
    [req.params.id, req.user.id, data.direction, data.date, data.company, data.invoice, data.type, data.subtype, data.dueDate, data.value, data.status, data.paymentDate, data.notes]
  );
  if (!rows[0]) return res.status(404).json({ error: 'Lançamento não encontrado.' });
  res.json({ transaction: toApi(rows[0]) });
}));

app.delete('/api/transactions/:id', requireAuth, wrap(async (req, res) => {
  if (!UUID.test(req.params.id)) return res.status(404).json({ error: 'Lançamento não encontrado.' });
  const { rowCount } = await db.query('DELETE FROM transactions WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
  if (!rowCount) return res.status(404).json({ error: 'Lançamento não encontrado.' });
  res.json({ ok: true });
}));

app.delete('/api/transactions', requireAuth, wrap(async (req, res) => {
  const { rowCount } = await db.query('DELETE FROM transactions WHERE user_id = $1', [req.user.id]);
  res.json({ ok: true, deleted: rowCount });
}));

app.get('/api/health', wrap(async (req, res) => { await db.query('SELECT 1'); res.json({ ok: true }); }));
app.use('/api', (req, res) => res.status(404).json({ error: 'Rota não encontrada.' }));

// ---------- Site (arquivos estáticos) ----------
app.use(express.static(PUBLIC_DIR, { extensions: ['html'], maxAge: isProd ? '1h' : 0 }));
app.get('*', (req, res) => res.sendFile(path.join(PUBLIC_DIR, 'index.html')));

// ---------- Erros ----------
app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
  if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'Requisição inválida.' });
  if (err.type === 'entity.too.large') return res.status(413).json({ error: 'Requisição grande demais.' });
  console.error(err);
  res.status(500).json({ error: 'Algo deu errado do nosso lado. Tente novamente em instantes.' });
});

if (require.main === module) {
  const port = Number(process.env.PORT) || 3000;
  app.listen(port, () => console.log(`Controla+ rodando em http://localhost:${port}`));
}
module.exports = app;
