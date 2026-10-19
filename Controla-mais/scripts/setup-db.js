'use strict';
const fs = require('fs');
const path = require('path');
const { pool } = require('../server/db');

(async () => {
  try {
    const sql = fs.readFileSync(path.join(__dirname, '..', 'db', 'schema.sql'), 'utf8');
    await pool.query(sql);
    const { rows } = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY 1");
    console.log('Banco pronto. Tabelas:', rows.map((r) => r.table_name).join(', '));
  } catch (err) {
    console.error('Falha ao preparar o banco:', err.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
})();
