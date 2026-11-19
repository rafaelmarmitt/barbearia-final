// Cadastro, login e consulta da sessão.
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { validarCadastro } from '../validacoes.js';

// Custo do bcrypt: 2^12 rodadas. Quanto maior, mais lento para quem tenta adivinhar senhas.
const CUSTO_HASH = 12;
// Hash fictício: mantém o mesmo tempo de resposta quando o e-mail não existe,
// evitando descobrir pelo tempo quais e-mails estão cadastrados.
const HASH_FICTICIO = '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxWSJIwFsq9Ityb8L/QiCV5hWvW';

export function authController(repo, secret) {
  return {
    /** POST /auth/cadastro — sempre cria um CLIENTE; o campo "nivel" do corpo é ignorado. */
    cadastrar: async (req, res) => {
      const { nome, email, senha } = req.body;
      const erro = validarCadastro(nome, email, senha);
      if (erro) return res.status(400).json({ mensagem: erro });

      try {
        // A senha nunca é salva: apenas o hash bcrypt (com salt aleatório embutido).
        const senhaHash = await bcrypt.hash(senha, CUSTO_HASH);
        const id = await repo.criarUsuario(nome.trim(), email.trim().toLowerCase(), senhaHash);
        res.status(201).json({ id, mensagem: 'Conta criada. Entre com seu e-mail e senha.' });
      } catch (erroBanco) {
        if (erroBanco.code === 'ER_DUP_ENTRY') return res.status(409).json({ mensagem: 'Já existe uma conta com esse e-mail.' });
        throw erroBanco;
      }
    },

    /** POST /auth/login — compara a senha com o hash e devolve um JWT válido por 2 horas. */
    login: async (req, res) => {
      const { email, senha } = req.body;
      if (typeof email !== 'string' || email.length > 150 || typeof senha !== 'string' || Buffer.byteLength(senha) > 72) {
        return res.status(400).json({ mensagem: 'Informe e-mail e senha válidos.' });
      }

      const encontrado = await repo.usuarioEmail(email.trim().toLowerCase());
      const senhaConfere = await bcrypt.compare(senha, encontrado?.senha_hash || HASH_FICTICIO);
      if (!encontrado || !senhaConfere) {
        return res.status(401).json({ mensagem: 'E-mail ou senha incorretos.' });
      }

      // O payload leva só o ID (sub). O nível é sempre relido do banco pelo middleware.
      const token = jwt.sign({}, secret, {
        subject: String(encontrado.id),
        expiresIn: '2h',
        algorithm: 'HS256',
        issuer: 'barbearia-agenda',
        audience: 'barbearia-app',
      });
      const usuario = { id: encontrado.id, nome: encontrado.nome, email: encontrado.email, nivel: encontrado.nivel };
      res.json({ usuario, token });
    },

    /** GET /auth/me — usado pelo app para restaurar a sessão salva no aparelho. */
    sessao: (req, res) => res.json(req.usuario),
  };
}
