import { Text, View } from 'react-native';
import { Painel, Botao, Aviso, estilos, cores } from './ui.js';
import { useAgenda } from '../services/contexto.js';
import { formatarData } from '../data/horarios.js';
export function Atualizacao() {
  const { erro, carregando, atualizar } = useAgenda();
  return <View style={{ gap: 10 }}><Aviso mensagem={erro} /><Botao titulo="Atualizar agenda" variante="texto" carregando={carregando} onPress={atualizar} /></View>;
}
export function Vazio({ titulo, descricao }) { return <Painel><Text style={estilos.titulo}>{titulo}</Text><Text style={estilos.subtitulo}>{descricao}</Text></Painel>; }
export function Horario({ h, children, estado = 'Disponível' }) {
  return <View style={{ borderTopWidth: 1, borderColor: cores.borda, paddingVertical: 22, gap: 14 }}>
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
      <Text style={{ color: cores.texto, fontSize: 34, fontWeight: '700', fontVariant: ['tabular-nums'] }}>{h.hora}</Text>
      <Text style={{ color: cores.verde, fontSize: 13, fontWeight: '600' }}>{estado}</Text>
    </View>
    <Text style={estilos.texto}>{formatarData(h.data)}</Text>
    <Text style={estilos.subtitulo}>Corte de cabelo · 1 hora</Text>
    {children}
  </View>;
}
export function Confirmacao({ texto, confirmar, cancelar, ocupado }) {
  return <Painel><Text style={estilos.texto}>{texto}</Text><Botao titulo="Confirmar" variante="perigo" carregando={ocupado} onPress={confirmar} /><Botao titulo="Manter como está" variante="secundario" disabled={ocupado} onPress={cancelar} /></Painel>;
}
