// Cliente: acompanha as próprias reservas e cancela as futuras.
import { useState } from 'react';
import { Text } from 'react-native';
import { Pagina, Botao, Aviso, estilos } from '../components/ui.js';
import { Horario, Vazio, Atualizacao, Confirmacao } from '../components/agenda.js';
import { useAgenda, useAtualizarAgenda } from '../services/contexto.js';
import { ordenar, futuro } from '../data/horarios.js';

export default function MeusAgendamentos({ navigation }) {
  const { horarios, executar } = useAgenda();
  useAtualizarAgenda();

  const [confirmando, setConfirmando] = useState(null); // id aguardando confirmação
  const [ocupado, setOcupado] = useState(false);
  const [erro, setErro] = useState('');
  const [mensagem, setMensagem] = useState('');

  const minhas = ordenar(horarios.filter(h => h.meu));

  async function cancelar(h) {
    setOcupado(true);
    setErro('');
    setMensagem('');
    try {
      await executar('/horarios/' + h.id + '/reserva', { method: 'DELETE' });
      setMensagem('Reserva cancelada. Você pode escolher um novo horário.');
      setConfirmando(null);
    } catch (e) {
      setErro(e.message);
    } finally {
      setOcupado(false);
    }
  }

  return (
    <Pagina>
      <Text style={estilos.titulo}>Seu lugar está marcado.</Text>
      <Text style={estilos.subtitulo}>Consulte suas reservas. Se os planos mudarem, cancele antes do atendimento para liberar a vaga.</Text>
      <Atualizacao />
      <Aviso mensagem={erro} />
      <Aviso mensagem={mensagem} tipo="sucesso" />

      {!minhas.length && (
        <Vazio titulo="Seu próximo corte começa aqui" descricao="Você ainda não tem reservas. Consulte as vagas e escolha seu horário." />
      )}
      {minhas.map(h => (
        <Horario key={h.id} h={h} estado={futuro(h) ? 'Confirmado' : 'Horário passado'}>
          {futuro(h) && (confirmando === h.id ? (
            <Confirmacao
              texto="Cancelar esta reserva e liberar a vaga para outro cliente?"
              ocupado={ocupado}
              cancelar={() => setConfirmando(null)}
              confirmar={() => cancelar(h)}
            />
          ) : (
            <Botao titulo={'Cancelar reserva das ' + h.hora} variante="perigo" onPress={() => setConfirmando(h.id)} />
          ))}
        </Horario>
      ))}

      {/* popTo volta para a tela existente; navigate empilharia outra cópia de Horarios (React Navigation 7). */}
      <Botao titulo="Escolher outro horário" variante="secundario" onPress={() => navigation.popTo('Horarios')} />
    </Pagina>
  );
}
