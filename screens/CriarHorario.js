import { useState } from 'react';
import { Text } from 'react-native';
import { Pagina, Painel, Campo, Botao, Aviso, estilos } from '../components/ui.js';
import { amanha } from '../data/horarios.js';
import { useAgenda } from '../services/contexto.js';
export default function CriarHorario({ navigation, route }) {
  const { executar } = useAgenda(); const original = route.params?.horario;
  const [data, setData] = useState(original?.data || amanha()); const [hora, setHora] = useState(original?.hora || '09:00');
  const [erro, setErro] = useState(''); const [ocupado, setOcupado] = useState(false);
  async function salvar() {
    setErro('');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(data) || !/^([01]\d|2[0-3]):00$/.test(hora)) { setErro('Use data AAAA-MM-DD e hora cheia, como 09:00.'); return; }
    setOcupado(true);
    try { await executar('/horarios' + (original ? '/' + original.id : ''), { method: original ? 'PUT' : 'POST', body: { data, hora } }); navigation.goBack(); }
    catch (e) { setErro(e.message); } finally { setOcupado(false); }
  }
  return <Pagina><Text style={estilos.titulo}>{original ? 'Ajuste sua agenda.' : 'Abra espaço para o próximo corte.'}</Text>
    <Text style={estilos.subtitulo}>Cada vaga corresponde a um atendimento de uma hora. Somente horários livres podem ser alterados.</Text>
    <Painel><Campo rotulo="Data (AAAA-MM-DD)" value={data} onChangeText={setData} placeholder="2026-11-06" maxLength={10} keyboardType="numbers-and-punctuation" />
      <Campo rotulo="Hora (HH:00)" value={hora} onChangeText={setHora} placeholder="09:00" maxLength={5} keyboardType="numbers-and-punctuation" />
      <Aviso mensagem={erro} /><Botao titulo={original ? 'Salvar alterações' : 'Abrir horário'} carregando={ocupado} onPress={salvar} />
    </Painel>
  </Pagina>;
}
