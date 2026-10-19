'use strict';
const crypto = require('crypto');
const { promisify } = require('util');
const db = require('./db');

const scrypt = promisify(crypto.scrypt);
const SESSION_DAYS = 30;
const COOKIE_NAME = 'cmais_sid';
const SCRYPT = { N: 16384, r: 8, p: 1, keylen: 64 };

async function hashPassword(password) {
  const salt = crypto.randomBytes(16);
  const key = await scrypt(password, salt, SCRYPT.keylen, { N: SCRYPT.N, r: SCRYPT.r, p: SCRYPT.p });
  return ['scrypt', SCRYPT.N, SCRYPT.r, SCRYPT.p, salt.toString('base64'), key.toString('base64')].join('$');
}

async function verifyPassword(password, stored) {
  try {
    const [alg, N, r, p, saltB64, keyB64] = String(stored).split('$');
    if (alg !== 'scrypt') return false;
    const expected = Buffer.from(keyB64, 'base64');
    const key = await scrypt(password, Buffer.from(saltB64, 'base64'), expected.length, { N: +N, r: +r, p: +p });
    return crypto.timingSafeEqual(key, expected);
  } catch { return false; }
}

// Hash "falso" usado quando o e-mail não existe, para o tempo de resposta não revelar quais e-mails têm conta.
const dummyHashPromise = hashPassword(crypto.randomBytes(12).toString('hex'));

const sha256 = (value) => crypto.createHash('sha256').update(value).digest('hex');

function cookieOptions() {
  return { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: SESSION_DAYS * 86400 * 1000 };
}

async function createSession(res, userId, userAgent) {
  const token = crypto.randomBytes(32).toString('base64url');
  await db.query(
    `INSERT INTO sessions (token_hash, user_id, expires_at, user_agent) VALUES ($1, $2, now() + ($3 || ' days')::interval, $4)`,
    [sha256(token), userId, String(SESSION_DAYS), String(userAgent || '').slice(0, 300)]
  );
  db.query('DELETE FROM sessions WHERE expires_at < now()').catch(() => {});
  res.cookie(COOKIE_NAME, token, cookieOptions());
}

function readToken(req) {
  const header = req.headers.cookie || '';
  for (const part of header.split(';')) {
    const i = part.indexOf('=');
    if (i > 0 && part.slice(0, i).trim() === COOKIE_NAME) {
      try { return decodeURIComponent(part.slice(i + 1).trim()); } catch { return null; }
    }
  }
  return null;
}

async function requireAuth(req, res, next) {
  try {
    const token = readToken(req);
    if (!token) return res.status(401).json({ error: 'Sessão expirada. Entre novamente.' });
    const { rows } = await db.query(
      `SELECT u.id, u.name, u.email FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token_hash = $1 AND s.expires_at > now()`,
      [sha256(token)]
    );
    if (!rows[0]) { res.clearCookie(COOKIE_NAME, { path: '/' }); return res.status(401).json({ error: 'Sessão expirada. Entre novamente.' }); }
    req.user = rows[0];
    req.tokenHash = sha256(token);
    next();
  } catch (err) { next(err); }
}

module.exports = { hashPassword, verifyPassword, dummyHashPromise, createSession, requireAuth, COOKIE_NAME };
