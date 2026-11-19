// Rotas de autenticação: /auth/cadastro e /auth/login são públicas; /auth/me exige JWT.
import { Router } from 'express';
import { authController } from '../controllers/auth.js';
import { autenticar } from '../middlewares/auth.js';

export function rotasAuth(repo, secret, limitarTentativas) {
  const router = Router();
  const auth = authController(repo, secret);

  router.post('/cadastro', limitarTentativas, auth.cadastrar);
  router.post('/login', limitarTentativas, auth.login);
  router.get('/me', autenticar(repo, secret), auth.sessao);

  return router;
}
