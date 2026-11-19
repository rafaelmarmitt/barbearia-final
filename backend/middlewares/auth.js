// Middlewares de autenticação e autorização.
// Um middleware roda ANTES do controller: se a regra não for atendida, ele
// responde com erro e o controller nunca é executado.
import jwt from 'jsonwebtoken';

// Mesmos valores usados na emissão do token (controllers/auth.js).
export const OPCOES_JWT = { algorithms: ['HS256'], issuer: 'barbearia-agenda', audience: 'barbearia-app' };

/**
 * Exige um JWT válido enviado como Bearer Token:
 *   Authorization: Bearer <token>
 * Verifica assinatura, expiração, emissor e audiência e, depois, busca o
 * usuário no banco. O nível (cliente/admin) vem do MySQL, nunca do aplicativo.
 */
export function autenticar(repo, secret) {
  return async (req, res, next) => {
    const cabecalho = req.headers.authorization || '';
    const encontrado = /^Bearer ([^\s]+)$/.exec(cabecalho);
    if (!encontrado) {
      return res.status(401).json({ mensagem: 'Entre na sua conta para continuar.' });
    }

    let payload;
    try {
      payload = jwt.verify(encontrado[1], secret, OPCOES_JWT);
    } catch {
      // Assinatura inválida, token adulterado ou expirado.
      return res.status(401).json({ mensagem: 'Sua sessão expirou. Entre novamente.' });
    }

    try {
      req.usuario = await repo.usuarioId(payload.sub);
      if (!req.usuario) {
        return res.status(401).json({ mensagem: 'Conta não encontrada. Entre novamente.' });
      }
      next();
    } catch (erro) {
      next(erro);
    }
  };
}

/** Permite continuar apenas se o usuário autenticado for administrador. */
export function somenteAdmin(req, res, next) {
  if (req.usuario.nivel !== 'admin') {
    return res.status(403).json({ mensagem: 'Ação exclusiva do administrador.' });
  }
  next();
}

/** Permite continuar apenas se o usuário autenticado for cliente. */
export function somenteCliente(req, res, next) {
  if (req.usuario.nivel !== 'cliente') {
    return res.status(403).json({ mensagem: 'Reservas são feitas pelo perfil de cliente.' });
  }
  next();
}
