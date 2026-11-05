import { useState } from 'react';
import { Text, View, Pressable } from 'react-native';
import { Pagina, Botao, Aviso, estilos, cores } from '../components/ui.js';
import { Horario, Vazio, Atualizacao } from '../components/agenda.js';
import { useAgenda, useAtualizarAgenda } from '../services/contexto.js';
import { ordenar, futuro, formatarData } from '../data/horarios.js';
export default function Horarios({ navigation }) {
  const { horarios, usuario, executar, sair } = useAgenda(); useAtualizarAgenda();
  const [dia, setDia] = useState(''); const [ocupado, setOcupado] = useState(null);
  const [mensagem, setMensagem] = useState(''); const [erro, setErro] = useState('');
  const livres = ordenar(horarios.filter(h => !h.meu && futuro(h)));
  const datas = [...new Set(livres.map(h => h.data))];
  const meus = horarios.filter(h => h.meu && futuro(h)).length;
  const filtrados = livres.filter(h => !dia || h.data === dia);
  return <Pagina>
    <Text style={estilos.titulo}>Olá, {usuario.nome.split(' ')[0]}.</Text>
    <Text style={estilos.subtitulo}>Um horário que cabe no seu dia. Escolha quando será seu próximo corte.</Text>
    <Botao titulo={`Meus agendamentos${meus ? ' (' + meus + ')' : ''}`} variante="secundario" onPress={() => navigation.navigate('MeusAgendamentos')} />
    <Atualizacao /><Aviso mensagem={erro} /><Aviso mensagem={mensagem} tipo="sucesso" />
    <Text style={estilos.titulo}>Encontre sua vaga</Text>
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
      {['', ...datas].map(d => <Pressable key={d} accessibilityRole="button" accessibilityState={{ selected: d === dia }} onPress={() => setDia(d)} style={{ borderWidth: 1, borderColor: d === dia ? cores.verde : cores.borda, borderRadius: 10, padding: 12, backgroundColor: d === dia ? '#3B3028' : cores.papel }}><Text style={{ color: cores.texto }}>{d ? formatarData(d) : 'Todas as datas'}</Text></Pressable>)}
    </View>
    {!filtrados.length && <Vazio titulo="Sem vagas nesta seleção" descricao="Escolha outra data ou atualize a agenda. Novos horários são abertos pelo administrador." />}
    {filtrados.map(h => <Horario key={h.id} h={h}><Botao titulo={'Agendar ' + h.hora} disabled={ocupado !== null} carregando={ocupado === h.id} onPress={async () => {
      setOcupado(h.id); setErro(''); setMensagem('');
      try { await executar('/horarios/' + h.id + '/reserva', { method: 'POST' }); setMensagem('Reserva confirmada. Veja os detalhes em Meus agendamentos.'); }
      catch (e) { setErro(e.message); } finally { setOcupado(null); }
    }} /></Horario>)}
    <Botao titulo="Sair da conta" variante="texto" onPress={() => sair()} />
  </Pagina>;
}
