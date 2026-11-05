import './config.js';
import mysql from 'mysql2/promise';
export const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1', port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'barbearia', password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'barbearia_agenda', connectionLimit: 10,
  dateStrings: true, decimalNumbers: true, charset: 'utf8mb4',
});
// Datas da agenda usam horário civil de São Paulo, inclusive com MySQL em servidor UTC.
pool.on('connection', connection => connection.query("SET time_zone = '-03:00'"));
