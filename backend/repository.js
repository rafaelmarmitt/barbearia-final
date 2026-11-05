// SQL parametrizado; a condição no UPDATE torna a disputa pela mesma vaga atômica.
export function criarRepositorio(pool) {
  async function rows(sql, params = []) { return (await pool.execute(sql, params))[0]; }
  const select = `SELECT h.id, DATE_FORMAT(h.data, '%Y-%m-%d') data, TIME_FORMAT(h.hora, '%H:%i') hora,
    h.cliente_id, u.nome cliente FROM horarios h LEFT JOIN usuarios u ON u.id=h.cliente_id`;
  return {
    usuarioEmail: async email => (await rows('SELECT * FROM usuarios WHERE email=?', [email]))[0],
    usuarioId: async id => (await rows('SELECT id,nome,email,nivel FROM usuarios WHERE id=?', [id]))[0],
    criarUsuario: async (nome, email, hash, nivel = 'cliente') => (await rows('INSERT INTO usuarios (nome,email,senha_hash,nivel) VALUES (?,?,?,?)', [nome, email, hash, nivel])).insertId,
    listar: async usuario => rows(select + (usuario.nivel === 'admin' ? '' : ' WHERE h.cliente_id IS NULL OR h.cliente_id=?') + ' ORDER BY h.data,h.hora', usuario.nivel === 'admin' ? [] : [usuario.id]),
    obter: async id => (await rows(select + ' WHERE h.id=?', [id]))[0],
    criar: async ({ data, hora }) => (await rows('INSERT INTO horarios (data,hora) VALUES (?,?)', [data, hora])).insertId,
    editar: async (id, { data, hora }) => (await rows('UPDATE horarios SET data=?,hora=? WHERE id=? AND cliente_id IS NULL', [data, hora, id])).affectedRows,
    excluir: async id => (await rows('DELETE FROM horarios WHERE id=? AND cliente_id IS NULL', [id])).affectedRows,
    reservar: async (id, cliente) => (await rows('UPDATE horarios SET cliente_id=? WHERE id=? AND cliente_id IS NULL AND TIMESTAMP(data,hora)>NOW()', [cliente, id])).affectedRows,
    cancelar: async (id, cliente) => (await rows('UPDATE horarios SET cliente_id=NULL WHERE id=? AND cliente_id=? AND TIMESTAMP(data,hora)>NOW()', [id, cliente])).affectedRows,
    saude: async () => rows('SELECT 1 ok'),
  };
}
