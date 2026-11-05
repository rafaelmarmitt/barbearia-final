import { validarHorario, idValido } from '../validacoes.js';
export function horariosController(repo) {
  async function alterar(req, res, acao, sucesso) {
    if (!idValido(req.params.id)) return res.status(400).json({ mensagem: 'Identificador inválido.' });
    if (!await repo.obter(req.params.id)) return res.status(404).json({ mensagem: 'Horário não encontrado.' });
    const mudou = await acao();
    if (!mudou) return res.status(409).json({ mensagem: 'Ação indisponível: a vaga pode estar reservada, ter passado ou não pertencer à sua conta. Atualize a agenda.' });
    res.json({ mensagem: sucesso });
  }
  return {
    listar: async (req, res) => {
      const lista = await repo.listar(req.usuario);
      res.json(lista.map(h => req.usuario.nivel === 'admin' ? h : { id: h.id, data: h.data, hora: h.hora, meu: h.cliente_id === req.usuario.id }));
    },
    criar: async (req, res) => {
      const erro = validarHorario(req.body.data, req.body.hora);
      if (erro) return res.status(400).json({ mensagem: erro });
      res.status(201).json({ id: await repo.criar(req.body), mensagem: 'Horário aberto.' });
    },
    editar: async (req, res) => {
      const erro = validarHorario(req.body.data, req.body.hora);
      if (erro) return res.status(400).json({ mensagem: erro });
      return alterar(req, res, () => repo.editar(req.params.id, req.body), 'Horário atualizado.');
    },
    excluir: (req, res) => alterar(req, res, () => repo.excluir(req.params.id), 'Horário excluído.'),
    reservar: (req, res) => alterar(req, res, () => repo.reservar(req.params.id, req.usuario.id), 'Reserva confirmada.'),
    cancelar: (req, res) => alterar(req, res, () => repo.cancelar(req.params.id, req.usuario.id), 'Reserva cancelada. A vaga está disponível novamente.'),
  };
}
