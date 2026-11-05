import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
export function authController(repo, secret) {
  return {
    cadastrar: async (req, res) => {
      const { nome, email, senha } = req.body;
      if (typeof nome !== 'string' || nome.trim().length < 2 || nome.trim().length > 100 || typeof email !== 'string' || email.length > 150 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || typeof senha !== 'string' || senha.length < 8 || Buffer.byteLength(senha) > 72) return res.status(400).json({ mensagem: 'Informe nome (2 a 100 caracteres), e-mail válido e senha de 8 a 72 bytes.' });
      try {
        const id = await repo.criarUsuario(nome.trim(), email.trim().toLowerCase(), await bcrypt.hash(senha, 12));
        res.status(201).json({ id, mensagem: 'Conta criada. Entre com seu e-mail e senha.' });
      } catch (erro) { if (erro.code === 'ER_DUP_ENTRY') return res.status(409).json({ mensagem: 'Já existe uma conta com esse e-mail.' }); throw erro; }
    },
    login: async (req, res) => {
      const { email, senha } = req.body;
      if (typeof email !== 'string' || email.length > 150 || typeof senha !== 'string' || Buffer.byteLength(senha) > 72) return res.status(400).json({ mensagem: 'Informe e-mail e senha válidos.' });
      const u = await repo.usuarioEmail(email.trim().toLowerCase());
      // Hash fictício mantém o custo de comparação quando o e-mail não existe.
      const hash = u?.senha_hash || '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxWSJIwFsq9Ityb8L/QiCV5hWvW';
      const ok = await bcrypt.compare(senha, hash);
      if (!u || !ok) return res.status(401).json({ mensagem: 'E-mail ou senha incorretos.' });
      const usuario = { id: u.id, nome: u.nome, email: u.email, nivel: u.nivel };
      res.json({ usuario, token: jwt.sign({}, secret, { subject: String(u.id), expiresIn: '2h', algorithm: 'HS256', issuer: 'barbearia-agenda', audience: 'barbearia-app' }) });
    },
  };
}
