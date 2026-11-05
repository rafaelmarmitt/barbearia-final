import '../config.js';
import { pool } from '../database.js';
import { criarRepositorio } from '../repository.js';
import bcrypt from 'bcryptjs';
import { createInterface } from 'node:readline/promises';
const rl = createInterface({ input: process.stdin, output: process.stdout });
try {
  const nome = (await rl.question('Nome do administrador: ')).trim();
  const email = (await rl.question('E-mail: ')).trim().toLowerCase();
  console.log('Use uma senha exclusiva para o projeto. A entrada será visível neste terminal.');
  const senha = await rl.question('Senha (mínimo 8 caracteres): ');
  if (nome.length < 2 || nome.length > 100 || email.length > 150 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || senha.length < 8 || Buffer.byteLength(senha) > 72) throw new Error('Dados inválidos.');
  await criarRepositorio(pool).criarUsuario(nome, email, await bcrypt.hash(senha, 12), 'admin');
  console.log('Administrador criado.');
} catch (e) { console.error(e.code === 'ER_DUP_ENTRY' ? 'E-mail já cadastrado.' : e.message); process.exitCode = 1; }
finally { rl.close(); await pool.end(); }
