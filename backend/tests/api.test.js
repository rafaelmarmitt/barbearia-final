import test from 'node:test';
import { contrato } from './contrato.js';
// Dublê apenas para testar regras HTTP sem exigir banco. Integração MySQL roda separada.
function repositorioMemoria() {
  let usuarios = [], horarios = [], seqU = 0, seqH = 0;
  const duplicado = () => { const e = new Error(); e.code = 'ER_DUP_ENTRY'; throw e; };
  return {
    usuarioEmail: async email => usuarios.find(u => u.email === email),
    usuarioId: async id => { const u = usuarios.find(u => u.id === Number(id)); if (!u) return undefined; const { senha_hash, ...publico } = u; return publico; },
    criarUsuario: async (nome, email, senha_hash, nivel = 'cliente') => { if (usuarios.some(u => u.email === email)) duplicado(); const id = ++seqU; usuarios.push({ id, nome, email, senha_hash, nivel }); return id; },
    listar: async u => horarios.filter(h => u.nivel === 'admin' || !h.cliente_id || h.cliente_id === u.id).map(h => ({ ...h, cliente: usuarios.find(u => u.id === h.cliente_id)?.nome || null })),
    obter: async id => horarios.find(h => h.id === Number(id)),
    criar: async dados => { if (horarios.some(h => h.data === dados.data && h.hora === dados.hora)) duplicado(); const id = ++seqH; horarios.push({ id, ...dados, cliente_id: null }); return id; },
    editar: async (id, dados) => { const h = horarios.find(h => h.id === Number(id) && !h.cliente_id); if (!h) return 0; Object.assign(h, dados); return 1; },
    excluir: async id => { const i = horarios.findIndex(h => h.id === Number(id) && !h.cliente_id); if (i < 0) return 0; horarios.splice(i, 1); return 1; },
    reservar: async (id, cliente) => { const h = horarios.find(h => h.id === Number(id) && !h.cliente_id); if (!h) return 0; h.cliente_id = cliente; return 1; },
    cancelar: async (id, cliente) => { const h = horarios.find(h => h.id === Number(id) && h.cliente_id === cliente); if (!h) return 0; h.cliente_id = null; return 1; },
    saude: async () => [{ ok: 1 }],
  };
}
test('Contrato HTTP e autorização (repositório em memória)', t => contrato(t, repositorioMemoria()));
