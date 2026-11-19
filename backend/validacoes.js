// Validações de entrada. O servidor é a autoridade: o app também valida, mas só para a experiência do usuário.
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Retorna uma mensagem de erro ou null se os dados de cadastro forem válidos. */
export function validarCadastro(nome, email, senha) {
  const nomeOk = typeof nome === 'string' && nome.trim().length >= 2 && nome.trim().length <= 100;
  const emailOk = typeof email === 'string' && email.length <= 150 && EMAIL.test(email);
  // bcrypt considera no máximo 72 bytes da senha.
  const senhaOk = typeof senha === 'string' && senha.length >= 8 && Buffer.byteLength(senha) <= 72;
  if (!nomeOk || !emailOk || !senhaOk) return 'Informe nome (2 a 100 caracteres), e-mail válido e senha de 8 a 72 bytes.';
  return null;
}

/** Data AAAA-MM-DD existente, hora cheia HH:00 e momento no futuro (horário de São Paulo). */
export function validarHorario(data, hora) {
  if (typeof data !== 'string' || typeof hora !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(data) || !/^([01]\d|2[0-3]):00$/.test(hora)) {
    return 'Informe data AAAA-MM-DD e horário em hora cheia (HH:00).';
  }
  const [ano, mes, dia] = data.split('-').map(Number);
  const inicio = new Date(ano, mes - 1, dia, Number(hora.slice(0, 2)));
  // new Date "corrige" datas impossíveis (ex.: 30/02 vira 02/03); por isso comparamos de volta.
  if (inicio.getFullYear() !== ano || inicio.getMonth() !== mes - 1 || inicio.getDate() !== dia) return 'Data inválida.';
  if (inicio <= new Date()) return 'O horário precisa estar no futuro.';
  return null;
}

/** IDs aceitos: inteiros positivos. */
export function idValido(id) {
  return /^[1-9]\d*$/.test(String(id)) && Number.isSafeInteger(Number(id));
}
