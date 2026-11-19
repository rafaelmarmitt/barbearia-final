// Rotas da agenda. Todas exigem JWT; cada rota declara qual perfil pode usá-la.
import { Router } from 'express';
import { horariosController } from '../controllers/horarios.js';
import { autenticar, somenteAdmin, somenteCliente } from '../middlewares/auth.js';

export function rotasHorarios(repo, secret) {
  const router = Router();
  const horarios = horariosController(repo);

  // A partir daqui, nenhuma rota é acessível sem Bearer Token válido.
  router.use(autenticar(repo, secret));

  // CRUD da entidade principal (horário).
  router.get('/', horarios.listar);                       // Read: cliente e admin (conteúdo varia pelo perfil)
  router.post('/', somenteAdmin, horarios.criar);         // Create
  router.put('/:id', somenteAdmin, horarios.editar);      // Update
  router.delete('/:id', somenteAdmin, horarios.excluir);  // Delete

  // Reserva: o cliente reserva; o cancelamento vale para o dono ou para o admin.
  router.post('/:id/reserva', somenteCliente, horarios.reservar);
  router.delete('/:id/reserva', horarios.cancelar);

  return router;
}
