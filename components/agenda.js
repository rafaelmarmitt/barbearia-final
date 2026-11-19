// Componentes específicos da agenda, reutilizados pelas telas de cliente e administrador.
import { Pressable, Text, View } from 'react-native';
import { Painel, Botao, Aviso, estilos, cores } from './ui.js';
import { useAgenda } from '../services/contexto.js';
import { formatarData } from '../data/horarios.js';

/** Mostra erro de carregamento da agenda e o botão de atualizar. */
export function Atualizacao() {
  const { erro, carregando, atualizar } = useAgenda();
  return (
    <View style={{ gap: 10 }}>
      <Aviso mensagem={erro} />
      <Botao titulo="Atualizar agenda" variante="texto" carregando={carregando} onPress={atualizar} />
    </View>
  );
}

/** Estado vazio com orientação sobre o próximo passo. */
export function Vazio({ titulo, descricao }) {
  return (
    <Painel>
      <Text style={estilos.titulo}>{titulo}</Text>
      <Text style={estilos.subtitulo}>{descricao}</Text>
    </Painel>
  );
}

/** Linha de um atendimento: hora, estado, data e as ações recebidas em children. */
export function Horario({ h, children, estado = 'Disponível' }) {
  return (
    <View style={{ borderTopWidth: 1, borderColor: cores.borda, paddingVertical: 22, gap: 14 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
        <Text style={{ color: cores.texto, fontSize: 34, fontWeight: '700', fontVariant: ['tabular-nums'] }}>{h.hora}</Text>
        <Text style={{ color: cores.verde, fontSize: 13, fontWeight: '600' }}>{estado}</Text>
      </View>
      <Text style={estilos.texto}>{formatarData(h.data)}</Text>
      <Text style={estilos.subtitulo}>Corte de cabelo · 1 hora</Text>
      {children}
    </View>
  );
}

/** Confirmação inline para ações destrutivas. */
export function Confirmacao({ texto, confirmar, cancelar, ocupado }) {
  return (
    <Painel>
      <Text style={estilos.texto}>{texto}</Text>
      <Botao titulo="Confirmar" variante="perigo" carregando={ocupado} onPress={confirmar} />
      <Botao titulo="Manter como está" variante="secundario" disabled={ocupado} onPress={cancelar} />
    </Painel>
  );
}

/** Grupo de opções selecionáveis (filtros e atalhos). */
export function Opcoes({ opcoes, valor, aoSelecionar, rotulo = o => o }) {
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
      {opcoes.map(opcao => {
        const selecionada = opcao === valor;
        return (
          <Pressable
            key={opcao}
            accessibilityRole="button"
            accessibilityState={{ selected: selecionada }}
            onPress={() => aoSelecionar(opcao)}
            style={{ borderWidth: 1, borderColor: selecionada ? cores.verde : cores.borda, borderRadius: 10, paddingVertical: 10, paddingHorizontal: 12, backgroundColor: selecionada ? '#3B3028' : cores.papel }}>
            <Text style={{ color: cores.texto }}>{rotulo(opcao)}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
