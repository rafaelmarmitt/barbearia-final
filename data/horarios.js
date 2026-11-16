export function ordenar(lista) { return [...lista].sort((a, b) => (a.data + a.hora).localeCompare(b.data + b.hora)); }
// Mesmo UTC−03:00 configurado para a agenda no MySQL.
const deslocamentoAgendaMs = -3 * 60 * 60 * 1000;

function agoraNaAgenda() {
  return new Date(Date.now() + deslocamentoAgendaMs);
}

export function formatarData(data) {
  return new Date(data + 'T00:00:00Z').toLocaleDateString('pt-BR', {
    timeZone: 'UTC', weekday: 'long', day: '2-digit', month: 'long',
  });
}

export function futuro(horario) {
  const minutoAtual = agoraNaAgenda().toISOString().slice(0, 16);
  return `${horario.data}T${horario.hora}` > minutoAtual;
}

export function amanha() {
  const data = agoraNaAgenda();
  data.setUTCDate(data.getUTCDate() + 1);
  return data.toISOString().slice(0, 10);
}
