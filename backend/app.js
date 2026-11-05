import express from 'express';
import cors from 'cors';
import { authController } from './controllers/auth.js';
import { horariosController } from './controllers/horarios.js';
import { autenticar, somenteAdmin } from './middlewares/auth.js';
export function criarApp(repo, secret, { limitar = true } = {}) {
  const app = express();
  app.disable('x-powered-by');
  app.use(cors());
  app.use(express.json({ limit: '10kb' }));
  app.use((req, res, next) => { res.set('Cache-Control', 'no-store'); req.body ||= {}; next(); });
  app.get('/saude', async (req, res) => { await repo.saude(); res.json({ status: 'ok', banco: 'MySQL' }); });
  const tentativas = new Map();
  const limpar = setInterval(() => { const agora = Date.now(); for (const [ip, t] of tentativas) if (t.ate < agora) tentativas.delete(ip); }, 60000);
  limpar.unref();
  function limite(req, res, next) {
    if (!limitar) return next();
    const chave = req.ip; const agora = Date.now();
    let t = tentativas.get(chave);
    if (!t || t.ate < agora) { t = { n: 0, ate: agora + 15 * 60000 }; tentativas.set(chave, t); }
    if (++t.n > 30) return res.status(429).json({ mensagem: 'Muitas tentativas. Aguarde 15 minutos e tente novamente.' });
    next();
  }
  const auth = authController(repo, secret);
  const publico = express.Router();
  publico.post('/cadastro', limite, auth.cadastrar);
  publico.post('/login', limite, auth.login);
  app.use('/auth', publico);
  app.get('/auth/me', autenticar(repo, secret), (req, res) => res.json(req.usuario));
  const h = horariosController(repo); const agenda = express.Router();
  agenda.use(autenticar(repo, secret));
  agenda.get('/', h.listar);
  agenda.post('/', somenteAdmin, h.criar);
  agenda.put('/:id', somenteAdmin, h.editar);
  agenda.delete('/:id', somenteAdmin, h.excluir);
  function cliente(req, res, next) { return req.usuario.nivel === 'cliente' ? next() : res.status(403).json({ mensagem: 'Reservas são feitas pelo perfil de cliente.' }); }
  agenda.post('/:id/reserva', cliente, h.reservar);
  agenda.delete('/:id/reserva', cliente, h.cancelar);
  app.use('/horarios', agenda);
  app.use((req, res) => res.status(404).json({ mensagem: 'Rota não encontrada.' }));
  app.use((erro, req, res, next) => {
    if (erro.code === 'ER_DUP_ENTRY') return res.status(409).json({ mensagem: 'Já existe uma vaga nesta data e hora.' });
    if (erro.type === 'entity.parse.failed') return res.status(400).json({ mensagem: 'JSON inválido.' });
    if (erro.type === 'entity.too.large') return res.status(413).json({ mensagem: 'Requisição muito grande.' });
    console.error('Falha na API:', erro.code || erro.name);
    res.status(500).json({ mensagem: 'Não foi possível concluir. Verifique a API e o banco de dados.' });
  });
  return app;
}
