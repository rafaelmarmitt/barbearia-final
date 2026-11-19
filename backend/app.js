// Monta a aplicação Express: middlewares globais, rotas e tratamento de erros.
// Recebe o repositório como parâmetro para que os testes possam usar MySQL real
// ou um dublê em memória sem alterar o código da API.
import express from 'express';
import cors from 'cors';
import { criarLimitador } from './middlewares/limite.js';
import { rotasAuth } from './routes/auth.js';
import { rotasHorarios } from './routes/horarios.js';

export function criarApp(repo, secret, { limitar = true } = {}) {
  const app = express();
  app.disable('x-powered-by');
  app.use(cors());
  app.use(express.json({ limit: '10kb' }));
  app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store'); // respostas com dados pessoais não ficam em cache
    req.body ||= {};
    next();
  });

  // Rota pública usada pelo app para testar a conexão com API e MySQL.
  app.get('/saude', async (req, res) => {
    await repo.saude();
    res.json({ status: 'ok', banco: 'MySQL' });
  });

  app.use('/auth', rotasAuth(repo, secret, criarLimitador({ ativo: limitar })));
  app.use('/horarios', rotasHorarios(repo, secret));

  app.use((req, res) => res.status(404).json({ mensagem: 'Rota não encontrada.' }));

  // Tratamento central de erros: nunca devolve detalhes internos do banco ao cliente.
  // eslint-disable-next-line no-unused-vars
  app.use((erro, req, res, next) => {
    if (erro.code === 'ER_DUP_ENTRY') return res.status(409).json({ mensagem: 'Já existe uma vaga nesta data e hora.' });
    if (erro.type === 'entity.parse.failed') return res.status(400).json({ mensagem: 'JSON inválido.' });
    if (erro.type === 'entity.too.large') return res.status(413).json({ mensagem: 'Requisição muito grande.' });
    console.error('Falha na API:', erro.code || erro.name);
    res.status(500).json({ mensagem: 'Não foi possível concluir. Verifique a API e o banco de dados.' });
  });

  return app;
}
