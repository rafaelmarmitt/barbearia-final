// Limita tentativas de login e cadastro por IP para dificultar ataques de força bruta.
const JANELA_MS = 15 * 60 * 1000;
const MAXIMO_TENTATIVAS = 30;

export function criarLimitador({ ativo = true } = {}) {
  const tentativas = new Map();

  // Remove registros vencidos a cada minuto. unref() não impede o processo de encerrar.
  const limpeza = setInterval(() => {
    const agora = Date.now();
    for (const [ip, registro] of tentativas) {
      if (registro.ate < agora) tentativas.delete(ip);
    }
  }, 60 * 1000);
  limpeza.unref();

  return function limitarTentativas(req, res, next) {
    if (!ativo) return next();

    const agora = Date.now();
    let registro = tentativas.get(req.ip);
    if (!registro || registro.ate < agora) {
      registro = { quantidade: 0, ate: agora + JANELA_MS };
      tentativas.set(req.ip, registro);
    }

    registro.quantidade += 1;
    if (registro.quantidade > MAXIMO_TENTATIVAS) {
      return res.status(429).json({ mensagem: 'Muitas tentativas. Aguarde 15 minutos e tente novamente.' });
    }
    next();
  };
}
