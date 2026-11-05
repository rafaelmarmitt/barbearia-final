export function ordenar(lista) { return [...lista].sort((a, b) => (a.data + a.hora).localeCompare(b.data + b.hora)); }
export function formatarData(data) { return new Date(data + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' }); }
export function futuro(h) { return new Date(h.data + 'T' + h.hora + ':00') > new Date(); }
export function amanha() { const d = new Date(); d.setDate(d.getDate() + 1); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; }
