// Administrador: abre um novo horário (POST) ou edita uma vaga livre (PUT).
import { useState } from 'react';
import { Text } from 'react-native';
import { Pagina, Painel, Campo, Botao, Aviso, estilos } from '../components/ui.js';
import { Opcoes } from '../components/agenda.js';
import { amanha, proximosDias, formatarDataCurta, HORAS_EXPEDIENTE } from '../data/horarios.js';
import { useAgenda } from '../services/contexto.js';

export default function CriarHorario({ navigation, route }) {
  const { executar } = useAgenda();
  const original = route.params?.horario; // presente quando a tela é aberta para edição

  const [data, setData] = useState(original?.data || amanha());
  const [hora, setHora] = useState(original?.hora || '09:00');
  const [erro, setErro] = useState('');
  const [ocupado, setOcupado] = useState(false);

  async function salvar() {
    setErro('');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(data) || !/^([01]\d|2[0-3]):00$/.test(hora)) {
      setErro('Use data AAAA-MM-DD e hora cheia, como 09:00.');
      return;
    }
    setOcupado(true);
    try {
      const caminho = original ? '/horarios/' + original.id : '/horarios';
      await executar(caminho, { method: original ? 'PUT' : 'POST', body: { data, hora } });
      navigation.goBack();
    } catch (e) {
      setErro(e.message); // ex.: 409 vaga duplicada, 400 horário no passado
    } finally {
      setOcupado(false);
    }
  }

  return (
    <Pagina>
      <Text style={estilos.titulo}>{original ? 'Ajuste sua agenda.' : 'Abra espaço para o próximo corte.'}</Text>
      <Text style={estilos.subtitulo}>Cada vaga corresponde a um atendimento de uma hora. Somente horários livres podem ser alterados.</Text>
      <Painel>
        <Text style={estilos.texto}>Escolha um dia</Text>
        <Opcoes opcoes={proximosDias(7)} valor={data} aoSelecionar={setData} rotulo={formatarDataCurta} />
        <Campo rotulo="Data (AAAA-MM-DD)" value={data} onChangeText={setData} placeholder="2026-11-06" maxLength={10} keyboardType="numbers-and-punctuation" />

        <Text style={estilos.texto}>Escolha a hora</Text>
        <Opcoes opcoes={HORAS_EXPEDIENTE} valor={hora} aoSelecionar={setHora} />
        <Campo rotulo="Hora (HH:00)" value={hora} onChangeText={setHora} placeholder="09:00" maxLength={5} keyboardType="numbers-and-punctuation" />

        <Aviso mensagem={erro} />
        <Botao titulo={original ? 'Salvar alterações' : 'Abrir horário'} carregando={ocupado} onPress={salvar} />
        <Botao titulo="Voltar sem salvar" variante="texto" disabled={ocupado} onPress={() => navigation.goBack()} />
      </Painel>
    </Pagina>
  );
}
