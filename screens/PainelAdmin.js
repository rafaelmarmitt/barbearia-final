// Administrador: acompanha a agenda completa, mantém vagas (CRUD) e libera reservas.
import { useState } from 'react';
import { Text } from 'react-native';
import { Pagina, Botao, Aviso, estilos } from '../components/ui.js';
import { Horario, Vazio, Atualizacao, Confirmacao, Opcoes } from '../components/agenda.js';
import { useAgenda, useAtualizarAgenda, useLimparAoFocar } from '../services/contexto.js';
import { ordenar, futuro } from '../data/horarios.js';

const FILTROS = ['Próximos', 'Reservados', 'Todos'];

export default function PainelAdmin({ navigation }) {
  const { horarios, usuario, executar, sair } = useAgenda();
  useAtualizarAgenda();

  const [filtro, setFiltro] = useState('Próximos');
  // Ação aguardando confirmação: { id, tipo: 'excluir' | 'liberar' }
  const [confirmando, setConfirmando] = useState(null);
  const [ocupado, setOcupado] = useState(false);
  const [erro, setErro] = useState('');
  const [mensagem, setMensagem] = useState('');
  useLimparAoFocar(setMensagem, setErro);

  const lista = ordenar(horarios.filter(h => {
    if (filtro === 'Todos') return true;
    if (!futuro(h)) return false;
    return filtro === 'Próximos' || Boolean(h.cliente_id);
  }));
  const reservadosFuturos = horarios.filter(h => h.cliente_id && futuro(h)).length;
  const livresFuturos = horarios.filter(h => !h.cliente_id && futuro(h)).length;

  async function confirmarAcao(h) {
    setOcupado(true);
    setErro('');
    setMensagem('');
    try {
      if (confirmando.tipo === 'excluir') {
        await executar('/horarios/' + h.id, { method: 'DELETE' });
        setMensagem('Horário excluído.');
      } else {
        await executar('/horarios/' + h.id + '/reserva', { method: 'DELETE' });
        setMensagem('Reserva cancelada. A vaga está livre novamente.');
      }
      setConfirmando(null);
    } catch (e) {
      setErro(e.message);
    } finally {
      setOcupado(false);
    }
  }

  function acoes(h) {
    const emConfirmacao = confirmando?.id === h.id;
    if (emConfirmacao) {
      const texto = confirmando.tipo === 'excluir'
        ? 'Excluir esta vaga da agenda?'
        : `Cancelar a reserva de ${h.cliente} e liberar a vaga? Avise o cliente sobre a mudança.`;
      return <Confirmacao texto={texto} ocupado={ocupado} cancelar={() => setConfirmando(null)} confirmar={() => confirmarAcao(h)} />;
    }

    if (h.cliente_id) {
      return (
        <>
          <Text style={estilos.subtitulo}>Vagas reservadas não podem ser editadas ou excluídas. Libere a reserva antes, se necessário.</Text>
          {futuro(h) && <Botao titulo={'Liberar ' + h.hora} variante="perigo" onPress={() => setConfirmando({ id: h.id, tipo: 'liberar' })} />}
        </>
      );
    }

    // Vaga livre (futura ou passada): pode ser editada para outra data ou excluída.
    return (
      <>
        <Botao titulo={'Editar ' + h.hora} variante="secundario" onPress={() => navigation.navigate('CriarHorario', { horario: h })} />
        <Botao titulo={'Excluir ' + h.hora} variante="perigo" onPress={() => setConfirmando({ id: h.id, tipo: 'excluir' })} />
      </>
    );
  }

  return (
    <Pagina>
      <Text style={estilos.titulo}>A agenda, sob controle.</Text>
      <Text style={estilos.subtitulo}>{usuario.nome}, organize a disponibilidade e acompanhe quem vem para o próximo corte.</Text>
      <Text style={estilos.texto}>{livresFuturos} {livresFuturos === 1 ? 'vaga livre' : 'vagas livres'} · {reservadosFuturos} {reservadosFuturos === 1 ? 'reserva futura' : 'reservas futuras'}</Text>
      <Botao titulo="Abrir novo horário" onPress={() => navigation.navigate('CriarHorario')} />
      <Atualizacao />
      <Aviso mensagem={erro} />
      <Aviso mensagem={mensagem} tipo="sucesso" />

      <Opcoes opcoes={FILTROS} valor={filtro} aoSelecionar={setFiltro} />
      <Text style={estilos.subtitulo}>{lista.length} {lista.length === 1 ? 'horário nesta seleção' : 'horários nesta seleção'}</Text>

      {!lista.length && (
        <Vazio titulo="Agenda livre para começar" descricao="Abra novas vagas para que os clientes possam reservar. As reservas aparecerão aqui." />
      )}
      {lista.map(h => (
        <Horario key={h.id} h={h} estado={h.cliente_id ? 'Reservado' : futuro(h) ? 'Disponível' : 'Horário passado'}>
          <Text style={estilos.texto}>{h.cliente_id ? 'Cliente: ' + h.cliente : 'Aguardando reserva'}</Text>
          {acoes(h)}
        </Horario>
      ))}

      <Botao titulo="Sair da conta" variante="texto" onPress={() => sair()} />
    </Pagina>
  );
}
