import test from 'node:test';
import assert from 'node:assert/strict';
import mysql from 'mysql2/promise';
import { readFile } from 'node:fs/promises';
import { criarRepositorio } from '../repository.js';
import { contrato } from './contrato.js';
import '../config.js';
test('Contrato completo com MySQL real e SQL parametrizado', async t => {
  const nome = process.env.TEST_DB_NAME || 'barbearia_agenda_test';
  assert.match(nome, /^[a-z0-9_]+_test$/, 'Banco de teste deve terminar em _test.');
  const config = { host: process.env.DB_HOST || '127.0.0.1', port: Number(process.env.DB_PORT || 3306), user: process.env.DB_USER || 'root', password: process.env.DB_PASSWORD || '', dateStrings: true, multipleStatements: true };
  const conexao = await mysql.createConnection(config);
  let criada = false;
  t.after(async () => { if (criada) await conexao.query('DROP DATABASE `' + nome + '`'); await conexao.end(); });
  // Exige um banco novo para não apagar dados existentes.
  await conexao.query('CREATE DATABASE `' + nome + '` CHARACTER SET utf8mb4');
  criada = true;
  const sql = (await readFile(new URL('../../database/barbearia.sql', import.meta.url), 'utf8')).replace(/CREATE DATABASE[^;]+;/, '').replace('USE barbearia_agenda;', 'USE `' + nome + '`;');
  await conexao.query(sql);
  const pool = mysql.createPool({ ...config, database: nome, multipleStatements: false, connectionLimit: 5 });
  t.after(() => pool.end());
  await contrato(t, criarRepositorio(pool));
});
