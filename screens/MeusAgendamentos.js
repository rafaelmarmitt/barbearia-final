import { useState } from 'react';
import { Text } from 'react-native';
import { Pagina, Botao, Aviso, estilos } from '../components/ui.js';
import { Horario, Vazio, Atualizacao, Confirmacao } from '../components/agenda.js';
import { useAgenda, useAtualizarAgenda } from '../services/contexto.js';
import { ordenar, futuro } from '../data/horarios.js';
export default function MeusAgendamentos({ navigation }) {
  const { horarios, executar } = useAgenda(); useAtualizarAgenda();
  const [confirmar, setConfirmar] = useState(null); const [ocupado, setOcupado] = useState(false);
  const [erro, setErro] = useState(''); const [mensagem, setMensagem] = useState('');
  const meus = ordenar(horarios.filter(h => h.meu));
  return <Pagina><Text style={estilos.titulo}>Seu lugar está marcado.</Text><Text style={estilos.subtitulo}>Consulte suas reservas. Se os planos mudarem, cancele antes do atendimento para liberar a vaga.</Text>
    <Atualizacao /><Aviso mensagem={erro} /><Aviso mensagem={mensagem} tipo="sucesso" />
    {!meus.length && <Vazio titulo="Seu próximo corte começa aqui" descricao="Você ainda não tem reservas. Consulte as vagas e escolha seu horário." />}
    {meus.map(h => <Horario key={h.id} h={h} estado={futuro(h) ? 'Confirmado' : 'Horário passado'}>
      {futuro(h) && (confirmar === h.id ? <Confirmacao texto="Cancelar esta reserva e liberar a vaga para outro cliente?" ocupado={ocupado} cancelar={() => setConfirmar(null)} confirmar={async () => {
        setOcupado(true); setErro(''); setMensagem('');
        try { await executar('/horarios/' + h.id + '/reserva', { method: 'DELETE' }); setMensagem('Reserva cancelada. Você pode escolher um novo horário.'); setConfirmar(null); }
        catch (e) { setErro(e.message); } finally { setOcupado(false); }
      }} /> : <Botao titulo={'Cancelar reserva das ' + h.hora} variante="perigo" onPress={() => setConfirmar(h.id)} />)}
    </Horario>)}
    <Botao titulo="Escolher outro horário" variante="secundario" onPress={() => navigation.navigate('Horarios')} />
  </Pagina>;
}
