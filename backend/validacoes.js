export function validarHorario(data, hora) {
  if (typeof data !== 'string' || typeof hora !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(data) || !/^([01]\d|2[0-3]):00$/.test(hora)) return 'Informe data AAAA-MM-DD e horário em hora cheia (HH:00).';
  const [a, m, d] = data.split('-').map(Number);
  const inicio = new Date(a, m - 1, d, Number(hora.slice(0, 2)));
  if (inicio.getFullYear() !== a || inicio.getMonth() !== m - 1 || inicio.getDate() !== d) return 'Data inválida.';
  if (inicio <= new Date()) return 'O horário precisa estar no futuro.';
  return null;
}
export function idValido(id) { return /^[1-9]\d*$/.test(String(id)) && Number.isSafeInteger(Number(id)); }
