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
export default function App() {
  const [usuario, setUsuario] = useState(null);
  const [horarios, setHorarios] = useState([]);
  const [iniciando, setIniciando] = useState(true);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');
  const [sessaoAviso, setSessaoAviso] = useState('');
  const sair = useCallback(async (expirou = false) => {
    configurarSessao(null); setUsuario(null); setHorarios([]); setErro('');
    if (expirou) setSessaoAviso('Sua sessão expirou. Entre novamente.');
    try { await guardarToken(null); } catch { setSessaoAviso('Sessão encerrada. Não foi possível limpar o armazenamento do aparelho.'); }
  }, []);
  useEffect(() => {
    async function restaurar() {
      try {
        await iniciarEndereco(); const salvo = await lerToken();
        if (salvo) { configurarSessao(salvo, () => sair(true)); setUsuario(await api('/auth/me')); }
      } catch (e) { configurarSessao(null); setSessaoAviso(e.message); }
      finally { setIniciando(false); }
    }
    restaurar();
  }, [sair]);
  async function entrar(dados) {
    await guardarToken(dados.token);
    configurarSessao(dados.token, () => sair(true)); setSessaoAviso(''); setUsuario(dados.usuario);
  }
  const atualizar = useCallback(async () => {
    setCarregando(true); setErro('');
    try { setHorarios(await api('/horarios')); }
    catch (e) { setErro(e.message); }
    finally { setCarregando(false); }
  }, []);
  async function executar(caminho, opcoes) { const resposta = await api(caminho, opcoes); await atualizar(); return resposta; }
  return <SafeAreaProvider><StatusBar style="light" />{iniciando ? <Carregamento mensagem="Preparando sua agenda…" /> :
    <Contexto.Provider value={{ usuario, horarios, carregando, erro, atualizar, executar, sair }}>
      <NavigationContainer theme={{ ...DarkTheme, colors: { ...DarkTheme.colors, primary: cores.verde, background: cores.fundo, card: cores.papel, text: cores.texto, border: cores.borda } }}>
        <Stack.Navigator id="Barbearia" screenOptions={{ headerStyle: { backgroundColor: cores.fundo }, headerTintColor: cores.texto, headerShadowVisible: false, contentStyle: { backgroundColor: cores.fundo }, headerTitleStyle: { fontSize: 17, fontWeight: '600' } }}>
          {!usuario ? <Stack.Screen name="Login" options={{ headerShown: false }}>{() => <Login entrar={entrar} aviso={sessaoAviso} />}</Stack.Screen> : usuario.nivel === 'admin' ?
            <Stack.Group navigationKey="admin"><Stack.Screen name="PainelAdmin" component={PainelAdmin} options={{ title: 'Barbearia Agenda · Gestão' }} /><Stack.Screen name="CriarHorario" component={CriarHorario} options={{ title: 'Gerenciar horário' }} /></Stack.Group> :
            <Stack.Group navigationKey="cliente"><Stack.Screen name="Horarios" component={Horarios} options={{ title: 'Barbearia Agenda' }} /><Stack.Screen name="MeusAgendamentos" component={MeusAgendamentos} options={{ title: 'Meus agendamentos' }} /></Stack.Group>}
        </Stack.Navigator>
      </NavigationContainer>
    </Contexto.Provider>}</SafeAreaProvider>;
}
