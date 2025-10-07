const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
  max: 10,
  idleTimeoutMillis: 30000,
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  end: () => pool.end(),
};
