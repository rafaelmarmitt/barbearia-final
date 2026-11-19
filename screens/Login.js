// Tela de entrada: login, cadastro de cliente e configuração do endereço da API.
import { useState } from 'react';
import { Text, View } from 'react-native';
import { Pagina, Painel, Campo, Botao, Aviso, estilos, cores } from '../components/ui.js';
import { api, enderecoApi, configurarEndereco } from '../services/api.js';

export default function Login({ entrar, aviso }) {
  const [modoCadastro, setModoCadastro] = useState(false);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [ocupado, setOcupado] = useState(false);
  const [mostrarConexao, setMostrarConexao] = useState(false);
  const [url, setUrl] = useState(enderecoApi());

  function limparMensagens() {
    setErro('');
    setSucesso('');
  }

  /** Envia POST /auth/cadastro ou POST /auth/login conforme o modo da tela. */
  async function enviar() {
    limparMensagens();
    if (!email.trim() || !senha || (modoCadastro && !nome.trim())) {
      setErro('Preencha todos os campos para continuar.');
      return;
    }
    if (modoCadastro && senha.length < 8) {
      setErro('A senha precisa ter pelo menos 8 caracteres.');
      return;
    }

    setOcupado(true);
    try {
      if (modoCadastro) {
        await api('/auth/cadastro', { method: 'POST', body: { nome, email, senha } });
        setModoCadastro(false);
        setSenha('');
        setSucesso('Sua conta está pronta. Entre para marcar seu corte.');
      } else {
        const resposta = await api('/auth/login', { method: 'POST', body: { email, senha } });
        setSenha('');
        await entrar(resposta);
      }
    } catch (e) {
      setErro(e.message);
    } finally {
      setOcupado(false);
    }
  }

  /** Salva o endereço da API e testa GET /saude (API + MySQL). */
  async function salvarConexao() {
    setOcupado(true);
    limparMensagens();
    try {
      await configurarEndereco(url);
      await api('/saude');
      setSucesso('Conexão com API e MySQL confirmada.');
      setMostrarConexao(false);
    } catch (e) {
      setErro(e.message);
    } finally {
      setOcupado(false);
    }
  }

  function alternarModo() {
    setModoCadastro(!modoCadastro);
    setSenha('');
    limparMensagens();
  }

  return (
    <Pagina incluirTopo>
      <View style={{ paddingVertical: 24, gap: 18 }}>
        <View style={{ width: 52, height: 5, backgroundColor: cores.verde }} />
        <Text style={estilos.marca}>Barbearia<Text style={{ color: cores.verde }}> Agenda.</Text></Text>
        <Text style={estilos.destaque}>Seu tempo.{'\n'}Seu próximo corte.</Text>
        <Text style={estilos.subtitulo}>Menos mensagens para combinar. Mais tempo para você. Escolha uma vaga e chegue com hora marcada.</Text>
      </View>

      <Painel>
        <Text style={estilos.titulo}>{modoCadastro ? 'Comece por aqui' : 'Bom ter você por aqui'}</Text>
        <Text style={estilos.subtitulo}>{modoCadastro ? 'Crie sua conta para reservar e acompanhar seus horários.' : 'Entre para consultar sua agenda.'}</Text>
        {modoCadastro && <Campo rotulo="Nome completo" value={nome} onChangeText={setNome} autoComplete="name" maxLength={100} />}
        <Campo rotulo="E-mail" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" autoComplete="email" maxLength={150} placeholder="voce@exemplo.com" />
        <Campo rotulo="Senha" value={senha} onChangeText={setSenha} secureTextEntry={!mostrarSenha} autoComplete={modoCadastro ? 'new-password' : 'current-password'} placeholder={modoCadastro ? 'Pelo menos 8 caracteres' : 'Sua senha'} onSubmitEditing={enviar} />
        <Botao titulo={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'} variante="texto" onPress={() => setMostrarSenha(!mostrarSenha)} />
        <Aviso mensagem={erro || aviso} />
        <Aviso mensagem={sucesso} tipo="sucesso" />
        <Botao titulo={modoCadastro ? 'Criar minha conta' : 'Entrar na minha conta'} carregando={ocupado} onPress={enviar} />
        <Botao titulo={modoCadastro ? 'Já tenho uma conta' : 'Primeira vez? Criar conta'} variante="secundario" disabled={ocupado} onPress={alternarModo} />
      </Painel>

      <Botao titulo={mostrarConexao ? 'Fechar configuração de conexão' : 'Configurar conexão com a API'} variante="texto" onPress={() => setMostrarConexao(!mostrarConexao)} />
      {mostrarConexao && (
        <Painel>
          <Text style={estilos.texto}>No celular, use o IP do computador na mesma rede ou o endereço HTTPS da API publicada. localhost aponta para o próprio aparelho.</Text>
          <Campo rotulo="Endereço da API" value={url} onChangeText={setUrl} autoCapitalize="none" keyboardType="url" placeholder="http://192.168.1.10:3000" />
          <Botao titulo="Salvar e testar conexão" carregando={ocupado} onPress={salvarConexao} />
        </Painel>
      )}

      <Text style={estilos.rodape}>Corte de cabelo · Um barbeiro · Atendimento de 1 hora</Text>
    </Pagina>
  );
}
