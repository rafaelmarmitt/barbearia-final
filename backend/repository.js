// Camada de acesso ao MySQL. Todo SQL é parametrizado (?), evitando SQL injection.
// As condições nos UPDATE/DELETE tornam as regras atômicas: se duas pessoas tentam
// reservar a mesma vaga ao mesmo tempo, o banco deixa apenas uma alterar a linha.
export function criarRepositorio(pool) {
  async function consultar(sql, parametros = []) {
    const [resultado] = await pool.execute(sql, parametros);
    return resultado;
  }

  const SELECT_HORARIOS = `
    SELECT h.id, DATE_FORMAT(h.data, '%Y-%m-%d') data, TIME_FORMAT(h.hora, '%H:%i') hora,
           h.cliente_id, u.nome cliente
      FROM horarios h
      LEFT JOIN usuarios u ON u.id = h.cliente_id`;

  return {
    // ---- Usuários ----
    usuarioEmail: async email =>
      (await consultar('SELECT * FROM usuarios WHERE email = ?', [email]))[0],

    usuarioId: async id =>
      (await consultar('SELECT id, nome, email, nivel FROM usuarios WHERE id = ?', [id]))[0],

    criarUsuario: async (nome, email, senhaHash, nivel = 'cliente') =>
      (await consultar('INSERT INTO usuarios (nome, email, senha_hash, nivel) VALUES (?, ?, ?, ?)', [nome, email, senhaHash, nivel])).insertId,

    // ---- Horários (CRUD) ----
    listar: async usuario => {
      if (usuario.nivel === 'admin') return consultar(SELECT_HORARIOS + ' ORDER BY h.data, h.hora');
      return consultar(SELECT_HORARIOS + ' WHERE h.cliente_id IS NULL OR h.cliente_id = ? ORDER BY h.data, h.hora', [usuario.id]);
    },

    obter: async id =>
      (await consultar(SELECT_HORARIOS + ' WHERE h.id = ?', [id]))[0],

    criar: async ({ data, hora }) =>
      (await consultar('INSERT INTO horarios (data, hora) VALUES (?, ?)', [data, hora])).insertId,

    editar: async (id, { data, hora }) =>
      (await consultar('UPDATE horarios SET data = ?, hora = ? WHERE id = ? AND cliente_id IS NULL', [data, hora, id])).affectedRows,

    excluir: async id =>
      (await consultar('DELETE FROM horarios WHERE id = ? AND cliente_id IS NULL', [id])).affectedRows,

    // ---- Reservas ----
    reservar: async (id, clienteId) =>
      (await consultar('UPDATE horarios SET cliente_id = ? WHERE id = ? AND cliente_id IS NULL AND TIMESTAMP(data, hora) > NOW()', [clienteId, id])).affectedRows,

    cancelar: async (id, clienteId) =>
      (await consultar('UPDATE horarios SET cliente_id = NULL WHERE id = ? AND cliente_id = ? AND TIMESTAMP(data, hora) > NOW()', [id, clienteId])).affectedRows,

    // Admin: libera uma vaga reservada (qualquer cliente), desde que ainda seja futura.
    liberar: async id =>
      (await consultar('UPDATE horarios SET cliente_id = NULL WHERE id = ? AND cliente_id IS NOT NULL AND TIMESTAMP(data, hora) > NOW()', [id])).affectedRows,

    saude: async () => consultar('SELECT 1 ok'),
  };
}
