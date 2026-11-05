import { segredo } from './config.js';
import { pool } from './database.js';
import { criarRepositorio } from './repository.js';
import { criarApp } from './app.js';
const app = criarApp(criarRepositorio(pool), segredo());
await pool.query('SELECT 1');
app.listen(Number(process.env.PORT || 3000), '0.0.0.0', () => console.log('API Barbearia Agenda pronta na porta ' + (process.env.PORT || 3000)));
