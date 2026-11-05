import { useState } from 'react';
import { Text, View } from 'react-native';
import { Pagina, Botao, Aviso, estilos } from '../components/ui.js';
import { Horario, Vazio, Atualizacao, Confirmacao } from '../components/agenda.js';
import { useAgenda, useAtualizarAgenda } from '../services/contexto.js';
import { ordenar, futuro } from '../data/horarios.js';
export default function PainelAdmin({ navigation }) {
  const { horarios, usuario, executar, sair } = useAgenda(); useAtualizarAgenda();
  const [filtro, setFiltro] = useState('Próximos'); const [confirmar, setConfirmar] = useState(null);
  const [ocupado, setOcupado] = useState(false); const [erro, setErro] = useState(''); const [mensagem, setMensagem] = useState('');
  const lista = ordenar(horarios.filter(h => filtro === 'Todos' || (futuro(h) && (filtro !== 'Reservados' || h.cliente_id))));
  return <Pagina><Text style={estilos.titulo}>A agenda, sob controle.</Text><Text style={estilos.subtitulo}>{usuario.nome}, organize a disponibilidade e acompanhe quem vem para o próximo corte.</Text>
    <Botao titulo="Abrir novo horário" onPress={() => navigation.navigate('CriarHorario')} />
    <Atualizacao /><Aviso mensagem={erro} /><Aviso mensagem={mensagem} tipo="sucesso" />
    <View style={estilos.linha}>{['Próximos','Reservados','Todos'].map(f => <Botao key={f} titulo={f} variante={filtro === f ? 'primario' : 'secundario'} onPress={() => setFiltro(f)} />)}</View>
    <Text style={estilos.subtitulo}>{lista.length} {lista.length === 1 ? 'horário nesta seleção' : 'horários nesta seleção'}</Text>
    {!lista.length && <Vazio titulo="Agenda livre para começar" descricao="Abra novas vagas para que os clientes possam reservar. As reservas aparecerão aqui." />}
    {lista.map(h => <Horario key={h.id} h={h} estado={h.cliente_id ? 'Reservado' : futuro(h) ? 'Disponível' : 'Horário passado'}>
      <Text style={estilos.texto}>{h.cliente_id ? 'Cliente: ' + h.cliente : 'Aguardando reserva'}</Text>
      {!h.cliente_id && <><Botao titulo={'Editar ' + h.hora} variante="secundario" onPress={() => navigation.navigate('CriarHorario', { horario: h })} />
        {confirmar === h.id ? <Confirmacao texto="Excluir esta vaga da agenda?" ocupado={ocupado} cancelar={() => setConfirmar(null)} confirmar={async () => {
          setOcupado(true); setErro(''); setMensagem(''); try { await executar('/horarios/' + h.id, { method: 'DELETE' }); setMensagem('Horário excluído.'); setConfirmar(null); }
          catch (e) { setErro(e.message); } finally { setOcupado(false); }
        }} /> : <Botao titulo={'Excluir ' + h.hora} variante="perigo" onPress={() => setConfirmar(h.id)} />}</>}
      {Boolean(h.cliente_id) && <Text style={estilos.subtitulo}>Vagas reservadas ficam protegidas contra edição e exclusão.</Text>}
    </Horario>)}
    <Botao titulo="Sair da conta" variante="texto" onPress={() => sair()} />
  </Pagina>;
}
