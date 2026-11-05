import { useState } from 'react';
import { Text, View } from 'react-native';
import { Pagina, Painel, Campo, Botao, Aviso, estilos, cores } from '../components/ui.js';
import { api, enderecoApi, configurarEndereco } from '../services/api.js';
export default function Login({ entrar, aviso }) {
  const [cadastro, setCadastro] = useState(false);
  const [nome, setNome] = useState(''); const [email, setEmail] = useState('');
  const [senha, setSenha] = useState(''); const [mostrar, setMostrar] = useState(false);
  const [erro, setErro] = useState(''); const [sucesso, setSucesso] = useState('');
  const [ocupado, setOcupado] = useState(false); const [config, setConfig] = useState(false);
  const [url, setUrl] = useState(enderecoApi());
  async function enviar() {
    setErro(''); setSucesso('');
    if (!email.trim() || !senha || (cadastro && !nome.trim())) { setErro('Preencha todos os campos para continuar.'); return; }
    setOcupado(true);
    try {
      if (cadastro) {
        await api('/auth/cadastro', { method: 'POST', body: { nome, email, senha } });
        setCadastro(false); setSenha(''); setSucesso('Sua conta está pronta. Entre para marcar seu corte.');
      } else { await entrar(await api('/auth/login', { method: 'POST', body: { email, senha } })); setSenha(''); }
    } catch (e) { setErro(e.message); } finally { setOcupado(false); }
  }
  return <Pagina incluirTopo>
    <View style={{ paddingVertical: 24, gap: 18 }}>
      <View style={{ width: 52, height: 5, backgroundColor: cores.verde }} />
      <Text style={estilos.marca}>Barbearia<Text style={{ color: cores.verde }}> Agenda.</Text></Text>
      <Text style={estilos.destaque}>Seu tempo.{'\n'}Seu próximo corte.</Text>
      <Text style={estilos.subtitulo}>Menos mensagens para combinar. Mais tempo para você. Escolha uma vaga e chegue com hora marcada.</Text>
    </View>
    <Painel>
      <Text style={estilos.titulo}>{cadastro ? 'Comece por aqui' : 'Bom ter você por aqui'}</Text>
      <Text style={estilos.subtitulo}>{cadastro ? 'Crie sua conta para reservar e acompanhar seus horários.' : 'Entre para consultar sua agenda.'}</Text>
      {cadastro && <Campo rotulo="Nome completo" value={nome} onChangeText={setNome} autoComplete="name" maxLength={100} />}
      <Campo rotulo="E-mail" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" autoComplete="email" maxLength={150} placeholder="voce@exemplo.com" />
      <Campo rotulo="Senha" value={senha} onChangeText={setSenha} secureTextEntry={!mostrar} autoComplete={cadastro ? 'new-password' : 'current-password'} placeholder={cadastro ? 'Pelo menos 8 caracteres' : 'Sua senha'} />
      <Botao titulo={mostrar ? 'Ocultar senha' : 'Mostrar senha'} variante="texto" onPress={() => setMostrar(!mostrar)} />
      <Aviso mensagem={erro || aviso} /><Aviso mensagem={sucesso} tipo="sucesso" />
      <Botao titulo={cadastro ? 'Criar minha conta' : 'Entrar na minha conta'} carregando={ocupado} onPress={enviar} />
      <Botao titulo={cadastro ? 'Já tenho uma conta' : 'Primeira vez? Criar conta'} variante="secundario" disabled={ocupado} onPress={() => { setCadastro(!cadastro); setErro(''); setSucesso(''); setSenha(''); }} />
    </Painel>
    <Botao titulo={config ? 'Fechar configuração de conexão' : 'Configurar conexão com a API'} variante="texto" onPress={() => setConfig(!config)} />
    {config && <Painel><Text style={estilos.texto}>No celular, use o IP do computador na mesma rede ou o endereço HTTPS da API publicada. localhost aponta para o próprio aparelho.</Text>
      <Campo rotulo="Endereço da API" value={url} onChangeText={setUrl} autoCapitalize="none" keyboardType="url" placeholder="http://192.168.1.10:3000" />
      <Botao titulo="Salvar e testar conexão" carregando={ocupado} onPress={async () => { setOcupado(true); setErro(''); setSucesso(''); try { await configurarEndereco(url); await api('/saude'); setSucesso('Conexão com API e MySQL confirmada.'); setConfig(false); } catch (e) { setErro(e.message); } finally { setOcupado(false); } }} />
    </Painel>}
    <Text style={estilos.rodape}>Corte de cabelo · Um barbeiro · Atendimento de 1 hora</Text>
  </Pagina>;
}
