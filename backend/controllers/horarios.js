// Regras da agenda: CRUD de horários (admin), reserva e cancelamento.
import { validarHorario, idValido } from '../validacoes.js';

const MENSAGEM_CONFLITO = 'Ação indisponível: a vaga pode estar reservada, ter passado ou não pertencer à sua conta. Atualize a agenda.';

export function horariosController(repo) {
  /**
   * Fluxo comum às alterações: valida o ID, confere se o horário existe e executa a ação.
   * As ações do repositório retornam quantas linhas mudaram; 0 significa que a condição
   * (vaga livre, futura ou do próprio cliente) não foi atendida → 409.
   */
  async function alterar(req, res, acao, mensagemSucesso) {
    if (!idValido(req.params.id)) return res.status(400).json({ mensagem: 'Identificador inválido.' });
    if (!await repo.obter(req.params.id)) return res.status(404).json({ mensagem: 'Horário não encontrado.' });

    const linhasAlteradas = await acao();
    if (!linhasAlteradas) return res.status(409).json({ mensagem: MENSAGEM_CONFLITO });
    res.json({ mensagem: mensagemSucesso });
  }

  return {
    /** GET /horarios — admin vê tudo; cliente vê vagas livres e as próprias, sem dados de terceiros. */
    listar: async (req, res) => {
      const lista = await repo.listar(req.usuario);
      if (req.usuario.nivel === 'admin') return res.json(lista);
      res.json(lista.map(h => ({ id: h.id, data: h.data, hora: h.hora, meu: h.cliente_id === req.usuario.id })));
    },

    /** POST /horarios (admin) */
    criar: async (req, res) => {
      const erro = validarHorario(req.body.data, req.body.hora);
      if (erro) return res.status(400).json({ mensagem: erro });
      const id = await repo.criar(req.body);
      res.status(201).json({ id, mensagem: 'Horário aberto.' });
    },

    /** PUT /horarios/:id (admin) — somente vaga livre. */
    editar: async (req, res) => {
      const erro = validarHorario(req.body.data, req.body.hora);
      if (erro) return res.status(400).json({ mensagem: erro });
      return alterar(req, res, () => repo.editar(req.params.id, req.body), 'Horário atualizado.');
    },

    /** DELETE /horarios/:id (admin) — somente vaga livre. */
    excluir: (req, res) => alterar(req, res, () => repo.excluir(req.params.id), 'Horário excluído.'),

    /** POST /horarios/:id/reserva (cliente) — o ID do cliente vem do JWT, não do corpo. */
    reservar: (req, res) => alterar(req, res, () => repo.reservar(req.params.id, req.usuario.id), 'Reserva confirmada.'),

    /**
     * DELETE /horarios/:id/reserva
     * Cliente: cancela apenas a própria reserva futura.
     * Admin: libera qualquer reserva futura (ex.: barbeiro indisponível).
     */
    cancelar: (req, res) => {
      if (req.usuario.nivel === 'admin') {
        return alterar(req, res, () => repo.liberar(req.params.id), 'Reserva cancelada pelo administrador. A vaga está livre novamente.');
      }
      return alterar(req, res, () => repo.cancelar(req.params.id, req.usuario.id), 'Reserva cancelada. A vaga está disponível novamente.');
    },
  };
}
