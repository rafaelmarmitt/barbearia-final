import assert from 'node:assert/strict';
import test from 'node:test';
import { validarCadastro, validarHorario, idValido } from '../validacoes.js';

test('cadastro exige nome, e-mail válido e senha de 8 a 72 bytes', () => {
  assert.equal(validarCadastro('Ana Souza', 'ana@exemplo.com', 'SenhaForte1'), null);
  assert.ok(validarCadastro('A', 'ana@exemplo.com', 'SenhaForte1'));
  assert.ok(validarCadastro('Ana', 'sem-arroba', 'SenhaForte1'));
  assert.ok(validarCadastro('Ana', 'ana@exemplo.com', 'curta'));
  assert.ok(validarCadastro('Ana', 'ana@exemplo.com', 'ç'.repeat(40)), 'mais de 72 bytes');
  assert.ok(validarCadastro(undefined, undefined, undefined));
});

test('horário exige data existente, hora cheia e momento futuro', () => {
  assert.equal(validarHorario('2099-12-31', '23:00'), null);
  assert.equal(validarHorario('2099-02-30', '09:00'), 'Data inválida.');
  assert.match(validarHorario('2099-12-31', '09:30'), /hora cheia/);
  assert.match(validarHorario('2099-12-31', '24:00'), /hora cheia/);
  assert.equal(validarHorario('2000-01-01', '09:00'), 'O horário precisa estar no futuro.');
});

test('identificadores aceitam apenas inteiros positivos', () => {
  assert.equal(idValido('15'), true);
  for (const id of ['0', '-1', 'abc', '1.5', '01', '99999999999999999999']) assert.equal(idValido(id), false, id);
});
