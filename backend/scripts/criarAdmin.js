// Cria uma conta de administrador pelo terminal (npm run criar-admin).
// O cadastro público do app só cria clientes; este é o único caminho para criar um admin.
import '../config.js';
import { pool } from '../database.js';
import { criarRepositorio } from '../repository.js';
import { validarCadastro } from '../validacoes.js';
import bcrypt from 'bcryptjs';
import { createInterface } from 'node:readline/promises';

const terminal = createInterface({ input: process.stdin, output: process.stdout });
// Lê linha a linha: funciona digitando no terminal e também com entrada redirecionada (pipe).
const linhas = terminal[Symbol.asyncIterator]();
async function perguntar(texto) {
  process.stdout.write(texto);
  const { value } = await linhas.next();
  return value ?? '';
}
try {
  const nome = (await perguntar('Nome do administrador: ')).trim();
  const email = (await perguntar('E-mail: ')).trim().toLowerCase();
  console.log('Use uma senha exclusiva para o projeto. A entrada será visível neste terminal.');
  const senha = await perguntar('Senha (mínimo 8 caracteres): ');

  const erro = validarCadastro(nome, email, senha);
  if (erro) throw new Error(erro);

  await criarRepositorio(pool).criarUsuario(nome, email, await bcrypt.hash(senha, 12), 'admin');
  console.log('Administrador criado.');
} catch (e) {
  console.error(e.code === 'ER_DUP_ENTRY' ? 'E-mail já cadastrado.' : e.message);
  process.exitCode = 1;
} finally {
  terminal.close();
  await pool.end();
}
