// Cliente: consulta vagas livres, filtra por data e reserva.
import { useState } from 'react';
import { Text } from 'react-native';
import { Pagina, Botao, Aviso, estilos } from '../components/ui.js';
import { Horario, Vazio, Atualizacao, Opcoes } from '../components/agenda.js';
import { useAgenda, useAtualizarAgenda, useLimparAoFocar } from '../services/contexto.js';
import { ordenar, futuro, formatarData } from '../data/horarios.js';

export default function Horarios({ navigation }) {
  const { horarios, usuario, executar, sair } = useAgenda();
  useAtualizarAgenda();

  const [dia, setDia] = useState('');
  const [reservando, setReservando] = useState(null); // id da vaga em processamento
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState('');
  useLimparAoFocar(setMensagem, setErro);

  const livres = ordenar(horarios.filter(h => !h.meu && futuro(h)));
  const datas = [...new Set(livres.map(h => h.data))];
  const quantidadeMinhas = horarios.filter(h => h.meu && futuro(h)).length;
  const filtrados = livres.filter(h => !dia || h.data === dia);

  async function reservar(h) {
    setReservando(h.id);
    setErro('');
    setMensagem('');
    try {
      await executar('/horarios/' + h.id + '/reserva', { method: 'POST' });
      setMensagem('Reserva confirmada. Veja os detalhes em Meus agendamentos.');
    } catch (e) {
      setErro(e.message);
    } finally {
      setReservando(null);
    }
  }

  return (
    <Pagina>
      <Text style={estilos.titulo}>Olá, {usuario.nome.split(' ')[0]}.</Text>
      <Text style={estilos.subtitulo}>Um horário que cabe no seu dia. Escolha quando será seu próximo corte.</Text>
      <Botao
        titulo={`Meus agendamentos${quantidadeMinhas ? ' (' + quantidadeMinhas + ')' : ''}`}
        variante="secundario"
        onPress={() => navigation.navigate('MeusAgendamentos')}
      />
      <Atualizacao />
      <Aviso mensagem={erro} />
      <Aviso mensagem={mensagem} tipo="sucesso" />

      <Text style={estilos.titulo}>Encontre sua vaga</Text>
      <Opcoes opcoes={['', ...datas]} valor={dia} aoSelecionar={setDia} rotulo={d => (d ? formatarData(d) : 'Todas as datas')} />

      {!filtrados.length && (
        <Vazio titulo="Sem vagas nesta seleção" descricao="Escolha outra data ou atualize a agenda. Novos horários são abertos pelo administrador." />
      )}
      {filtrados.map(h => (
        <Horario key={h.id} h={h}>
          <Botao titulo={'Agendar ' + h.hora} disabled={reservando !== null} carregando={reservando === h.id} onPress={() => reservar(h)} />
        </Horario>
      ))}

      <Botao titulo="Sair da conta" variante="texto" onPress={() => sair()} />
    </Pagina>
  );
}
