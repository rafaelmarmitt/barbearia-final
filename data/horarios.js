// Funções de apoio para datas e horários da agenda (sem acesso à API).

// A agenda usa o horário de São Paulo (UTC−03:00), o mesmo configurado no MySQL,
// independentemente do fuso configurado no aparelho.
const DESLOCAMENTO_AGENDA_MS = -3 * 60 * 60 * 1000;

function agoraNaAgenda() {
  return new Date(Date.now() + DESLOCAMENTO_AGENDA_MS);
}

/** Ordena por data e hora. */
export function ordenar(lista) {
  return [...lista].sort((a, b) => (a.data + a.hora).localeCompare(b.data + b.hora));
}

/** "2026-11-06" → "sexta-feira, 06 de novembro". */
export function formatarData(data) {
  return new Date(data + 'T00:00:00Z').toLocaleDateString('pt-BR', {
    timeZone: 'UTC', weekday: 'long', day: '2-digit', month: 'long',
  });
}

/** "2026-11-06" → "sex 06/11" (rótulo curto para botões de atalho). */
export function formatarDataCurta(data) {
  const semana = new Date(data + 'T00:00:00Z').toLocaleDateString('pt-BR', { timeZone: 'UTC', weekday: 'short' }).replace('.', '');
  return `${semana} ${data.slice(8, 10)}/${data.slice(5, 7)}`;
}

/** true se o horário ainda não começou. */
export function futuro(horario) {
  const minutoAtual = agoraNaAgenda().toISOString().slice(0, 16);
  return `${horario.data}T${horario.hora}` > minutoAtual;
}

/** Data de amanhã (AAAA-MM-DD) no horário da agenda. */
export function amanha() {
  return proximosDias(1)[0];
}

/** Lista as próximas `quantidade` datas a partir de amanhã. */
export function proximosDias(quantidade) {
  const base = agoraNaAgenda();
  return Array.from({ length: quantidade }, (_, i) => {
    const dia = new Date(base);
    dia.setUTCDate(base.getUTCDate() + i + 1);
    return dia.toISOString().slice(0, 10);
  });
}

/** Horas cheias oferecidas como atalho no formulário do administrador. */
export const HORAS_EXPEDIENTE = ['08:00', '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'];
