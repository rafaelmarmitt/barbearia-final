// Ponto central do aplicativo: sessão do usuário, estado da agenda e navegação.
import { useState, useEffect, useCallback } from 'react';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import Login from './screens/Login.js';
import Horarios from './screens/Horarios.js';
import MeusAgendamentos from './screens/MeusAgendamentos.js';
import PainelAdmin from './screens/PainelAdmin.js';
import CriarHorario from './screens/CriarHorario.js';
import { Carregamento, cores } from './components/ui.js';
import { api, configurarSessao, guardarToken, lerToken, iniciarEndereco } from './services/api.js';
import { Contexto } from './services/contexto.js';

const Stack = createNativeStackNavigator();

const tema = {
  ...DarkTheme,
  colors: { ...DarkTheme.colors, primary: cores.verde, background: cores.fundo, card: cores.papel, text: cores.texto, border: cores.borda },
};

/** @type {import('@react-navigation/native-stack').NativeStackNavigationOptions} */
const opcoesTelas = {
  headerStyle: { backgroundColor: cores.fundo },
  headerTintColor: cores.texto,
  headerShadowVisible: false,
  contentStyle: { backgroundColor: cores.fundo },
  headerTitleStyle: { fontSize: 17, fontWeight: '600' },
};

export default function App() {
  const [usuario, setUsuario] = useState(null);
  const [horarios, setHorarios] = useState([]);
  const [iniciando, setIniciando] = useState(true);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');
  const [sessaoAviso, setSessaoAviso] = useState('');

  /** Logout: limpa o token em memória e no aparelho e volta para a tela de entrada. */
  const sair = useCallback(async (expirou = false) => {
    configurarSessao(null);
    setUsuario(null);
    setHorarios([]);
    setErro('');
    if (expirou) setSessaoAviso('Sua sessão expirou. Entre novamente.');
    try {
      await guardarToken(null);
    } catch {
      setSessaoAviso('Sessão encerrada. Não foi possível limpar o armazenamento do aparelho.');
    }
  }, []);

  // Ao abrir o app: carrega o endereço da API e tenta restaurar a sessão salva (SecureStore).
  useEffect(() => {
    async function restaurarSessao() {
      try {
        await iniciarEndereco();
        const tokenSalvo = await lerToken();
        if (tokenSalvo) {
          configurarSessao(tokenSalvo, () => sair(true));
          setUsuario(await api('/auth/me')); // o servidor confirma se o token ainda é válido
        }
      } catch (e) {
        configurarSessao(null);
        setSessaoAviso(e.message);
      } finally {
        setIniciando(false);
      }
    }
    restaurarSessao();
  }, [sair]);

  /** Chamado pela tela de Login com a resposta de POST /auth/login. */
  async function entrar({ token, usuario: dadosUsuario }) {
    await guardarToken(token);
    configurarSessao(token, () => sair(true)); // qualquer 401 posterior encerra a sessão
    setSessaoAviso('');
    setUsuario(dadosUsuario);
  }

  /** Recarrega a agenda a partir da API (GET /horarios). */
  const atualizar = useCallback(async () => {
    setCarregando(true);
    setErro('');
    try {
      setHorarios(await api('/horarios'));
    } catch (e) {
      setErro(e.message);
    } finally {
      setCarregando(false);
    }
  }, []);

  /** Executa uma alteração na API e, em seguida, atualiza a agenda. */
  async function executar(caminho, opcoes) {
    const resposta = await api(caminho, opcoes);
    await atualizar();
    return resposta;
  }

  if (iniciando) {
    return <SafeAreaProvider><StatusBar style="light" /><Carregamento mensagem="Preparando sua agenda…" /></SafeAreaProvider>;
  }

  // A navegação muda conforme o nível: sem sessão → Login; admin → gestão; cliente → agenda.
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <Contexto.Provider value={{ usuario, horarios, carregando, erro, atualizar, executar, sair }}>
        <NavigationContainer theme={tema}>
          <Stack.Navigator id="Barbearia" screenOptions={opcoesTelas}>
            {!usuario ? (
              <Stack.Screen name="Login" options={{ headerShown: false }}>
                {() => <Login entrar={entrar} aviso={sessaoAviso} />}
              </Stack.Screen>
            ) : usuario.nivel === 'admin' ? (
              <Stack.Group navigationKey="admin">
                <Stack.Screen name="PainelAdmin" component={PainelAdmin} options={{ title: 'Barbearia Agenda · Gestão' }} />
                <Stack.Screen name="CriarHorario" component={CriarHorario} options={{ title: 'Gerenciar horário' }} />
              </Stack.Group>
            ) : (
              <Stack.Group navigationKey="cliente">
                <Stack.Screen name="Horarios" component={Horarios} options={{ title: 'Barbearia Agenda' }} />
                <Stack.Screen name="MeusAgendamentos" component={MeusAgendamentos} options={{ title: 'Meus agendamentos' }} />
              </Stack.Group>
            )}
          </Stack.Navigator>
        </NavigationContainer>
      </Contexto.Provider>
    </SafeAreaProvider>
  );
}
