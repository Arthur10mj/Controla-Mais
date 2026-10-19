'use strict';
require('dotenv').config();
const { Pool, types } = require('pg');

// Datas (DATE) voltam como texto "AAAA-MM-DD" (sem deslocamento de fuso) e NUMERIC como número.
types.setTypeParser(1082, (value) => value);
types.setTypeParser(1700, (value) => parseFloat(value));

if (!process.env.DATABASE_URL) {
  console.error('Defina DATABASE_URL no arquivo .env (veja .env.example).');
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});
pool.on('error', (err) => console.error('Erro inesperado no pool do banco:', err.message));

module.exports = { pool, query: (text, params) => pool.query(text, params) };
