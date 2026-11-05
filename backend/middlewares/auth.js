import jwt from 'jsonwebtoken';
export function autenticar(repo, secret) {
  return async (req, res, next) => {
    const match = /^Bearer ([^\s]+)$/.exec(req.headers.authorization || '');
    if (!match) return res.status(401).json({ mensagem: 'Entre na sua conta para continuar.' });
    let payload;
    try { payload = jwt.verify(match[1], secret, { algorithms: ['HS256'], issuer: 'barbearia-agenda', audience: 'barbearia-app' }); }
    catch { return res.status(401).json({ mensagem: 'Sua sessão expirou. Entre novamente.' }); }
    try {
      // O nível é consultado no banco; não confiar em perfil enviado pelo aplicativo.
      req.usuario = await repo.usuarioId(payload.sub);
      if (!req.usuario) return res.status(401).json({ mensagem: 'Conta não encontrada. Entre novamente.' });
      next();
    } catch (erro) { next(erro); }
  };
}
export function somenteAdmin(req, res, next) {
  if (req.usuario.nivel !== 'admin') return res.status(403).json({ mensagem: 'Ação exclusiva do administrador.' });
  next();
}
