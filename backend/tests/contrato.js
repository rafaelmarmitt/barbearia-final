import assert from 'node:assert/strict';
import { once } from 'node:events';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { criarApp } from '../app.js';
export const secret = 'segredo-apenas-para-testes-automatizados-12345';
export async function contrato(t, repo) {
  const servidor = criarApp(repo, secret, { limitar: false }).listen(0, '127.0.0.1');
  await once(servidor, 'listening'); t.after(() => new Promise(r => servidor.close(r)));
  const url = 'http://127.0.0.1:' + servidor.address().port;
  async function req(path, method = 'GET', body, token) {
    const r = await fetch(url + path, { method, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}) }, ...(body ? { body: JSON.stringify(body) } : {}) });
    return { status: r.status, body: await r.json() };
  }
  let cliente, outro, admin, id;
  const data = new Date(Date.now() + 86400000 * 10).toISOString().slice(0, 10);
  await t.test('cadastro valida dados e impede elevação de perfil', async () => {
    assert.equal((await req('/auth/cadastro', 'POST', { nome: 'X' })).status, 400);
    const r = await req('/auth/cadastro', 'POST', { nome: 'Cliente Teste', email: 'cliente@teste.local', senha: 'SenhaTeste123', nivel: 'admin' });
    assert.equal(r.status, 201);
    const u = await repo.usuarioEmail('cliente@teste.local');
    assert.equal(u.nivel, 'cliente'); assert.notEqual(u.senha_hash, 'SenhaTeste123'); assert.ok(await bcrypt.compare('SenhaTeste123', u.senha_hash));
    assert.equal((await req('/auth/cadastro', 'POST', { nome: 'Duplicado', email: u.email, senha: 'SenhaTeste123' })).status, 409);
  });
  await t.test('login valida credenciais, emite JWT e não expõe hash', async () => {
    assert.equal((await req('/auth/login', 'POST', { email: 'cliente@teste.local', senha: 'errada' })).status, 401);
    const r = await req('/auth/login', 'POST', { email: 'CLIENTE@teste.local', senha: 'SenhaTeste123' });
    assert.equal(r.status, 200); cliente = r.body.token; assert.equal(r.body.usuario.senha_hash, undefined);
    assert.equal(jwt.verify(cliente, secret).iss, 'barbearia-agenda');
    await req('/auth/cadastro', 'POST', { nome: 'Cliente Teste', email: 'outro@teste.local', senha: 'SenhaTeste123' });
    outro = (await req('/auth/login', 'POST', { email: 'outro@teste.local', senha: 'SenhaTeste123' })).body.token;
    await repo.criarUsuario('Admin', 'admin@teste.local', await bcrypt.hash('SenhaTeste123', 4), 'admin');
    admin = (await req('/auth/login', 'POST', { email: 'admin@teste.local', senha: 'SenhaTeste123' })).body.token;
  });
  await t.test('rotas recusam token ausente, adulterado e expirado', async () => {
    assert.equal((await req('/horarios')).status, 401);
    assert.equal((await req('/horarios', 'GET', null, cliente + 'x')).status, 401);
    const expirado = jwt.sign({}, secret, { subject: '1', expiresIn: -1, issuer: 'barbearia-agenda', audience: 'barbearia-app' });
    assert.equal((await req('/auth/me', 'GET', null, expirado)).status, 401);
    assert.equal((await req('/auth/me', 'GET', null, cliente)).status, 200);
  });
  await t.test('cliente não acessa criação, edição ou exclusão', async () => {
    for (const [path, method] of [['/horarios','POST'],['/horarios/1','PUT'],['/horarios/1','DELETE']]) assert.equal((await req(path, method, { data, hora: '09:00' }, cliente)).status, 403);
  });
  await t.test('admin cria e valida data, duplicidade e hora cheia', async () => {
    for (const body of [{ data: '2099-02-30', hora: '09:00' }, { data, hora: '09:30' }, { data: '2000-01-01', hora: '09:00' }]) assert.equal((await req('/horarios', 'POST', body, admin)).status, 400);
    const r = await req('/horarios', 'POST', { data, hora: '09:00' }, admin); assert.equal(r.status, 201); id = r.body.id;
    assert.equal((await req('/horarios', 'POST', { data, hora: '09:00' }, admin)).status, 409);
  });
  await t.test('CRUD edita e lista vaga persistida', async () => {
    assert.equal((await req('/horarios/' + id, 'PUT', { data, hora: '10:00' }, admin)).status, 200);
    const lista = (await req('/horarios', 'GET', null, cliente)).body;
    assert.equal(lista.find(h => h.id === id).hora, '10:00');
    assert.equal((await req('/horarios/abc', 'DELETE', null, admin)).status, 400);
    assert.equal((await req('/horarios/999999', 'DELETE', null, admin)).status, 404);
  });
  let vencedor, perdedor;
  await t.test('duas reservas simultâneas produzem apenas um vencedor', async () => {
    const rs = await Promise.all([req('/horarios/' + id + '/reserva', 'POST', null, cliente), req('/horarios/' + id + '/reserva', 'POST', null, outro)]);
    assert.deepEqual(rs.map(r => r.status).sort(), [200, 409]);
    vencedor = rs[0].status === 200 ? cliente : outro; perdedor = vencedor === cliente ? outro : cliente;
  });
  await t.test('privacidade e propriedade da reserva', async () => {
    const lista = (await req('/horarios', 'GET', null, perdedor)).body; assert.equal(lista.some(h => h.id === id), false);
    const minha = (await req('/horarios', 'GET', null, vencedor)).body.find(h => h.id === id);
    assert.equal(minha.meu, true); assert.equal(minha.cliente, undefined); assert.equal(minha.cliente_id, undefined);
    assert.equal((await req('/horarios/' + id + '/reserva', 'DELETE', null, perdedor)).status, 409);
  });
  await t.test('reserva impede edição e exclusão administrativa', async () => {
    assert.equal((await req('/horarios/' + id, 'PUT', { data, hora: '11:00' }, admin)).status, 409);
    assert.equal((await req('/horarios/' + id, 'DELETE', null, admin)).status, 409);
    assert.equal((await req('/horarios/' + id + '/reserva', 'POST', null, admin)).status, 403);
  });
  await t.test('cancelamento libera vaga, nova reserva e exclusão completam fluxo', async () => {
    assert.equal((await req('/horarios/' + id + '/reserva', 'DELETE', null, vencedor)).status, 200);
    assert.equal((await req('/horarios/' + id + '/reserva', 'POST', null, perdedor)).status, 200);
    assert.equal((await req('/horarios/' + id + '/reserva', 'DELETE', null, perdedor)).status, 200);
    assert.equal((await req('/horarios/' + id, 'DELETE', null, admin)).status, 200);
    assert.equal((await req('/horarios', 'GET', null, admin)).body.length, 0);
  });
  await t.test('tratamento de JSON inválido e rota inexistente', async () => {
    const r = await fetch(url + '/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{' }); assert.equal(r.status, 400);
    assert.equal((await req('/nao-existe')).status, 404);
  });
}
