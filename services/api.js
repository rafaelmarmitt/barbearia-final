// Cliente HTTP do aplicativo: endereço da API, armazenamento do JWT e chamadas com fetch().
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

const CHAVE_ENDERECO = 'barbearia.api';
const CHAVE_TOKEN = 'barbearia.jwt';
const TEMPO_LIMITE_MS = 15000;

let token = null;
let base = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
let aoExpirar = () => {};

/** Define o token usado nas próximas chamadas e o que fazer se o servidor responder 401. */
export function configurarSessao(valor, callbackExpirou) {
  token = valor;
  aoExpirar = callbackExpirou || (() => {});
}

// ---- Endereço da API (configurável pela tela de entrada) ----
export function enderecoApi() {
  return base;
}

export async function configurarEndereco(url) {
  const limpo = url.trim().replace(/\/+$/, '');
  if (!/^https?:\/\/[^\s]+$/.test(limpo)) throw new Error('Informe uma URL http:// ou https:// válida.');
  await AsyncStorage.setItem(CHAVE_ENDERECO, limpo);
  base = limpo;
}

export async function iniciarEndereco() {
  base = (await AsyncStorage.getItem(CHAVE_ENDERECO)) || base;
}

// ---- Token JWT ----
// Android: Expo SecureStore (armazenamento criptografado do sistema).
// Web: apenas em memória — recarregar a página exige novo login.
export async function guardarToken(valor) {
  if (Platform.OS === 'web') {
    token = valor;
    return;
  }
  if (valor) await SecureStore.setItemAsync(CHAVE_TOKEN, valor);
  else await SecureStore.deleteItemAsync(CHAVE_TOKEN);
}

export async function lerToken() {
  if (Platform.OS === 'web') return null;
  return SecureStore.getItemAsync(CHAVE_TOKEN);
}

/**
 * Faz uma requisição JSON para a API. Quando há sessão, envia o cabeçalho
 *   Authorization: Bearer <token>
 * Lança Error com a mensagem do servidor quando a resposta não é 2xx.
 */
export async function api(caminho, { method = 'GET', body = undefined } = {}) {
  const controle = new AbortController();
  const limite = setTimeout(() => controle.abort(), TEMPO_LIMITE_MS);

  try {
    const cabecalhos = { 'Content-Type': 'application/json' };
    if (token) cabecalhos.Authorization = 'Bearer ' + token;

    const resposta = await fetch(base + caminho, {
      method,
      headers: cabecalhos,
      signal: controle.signal,
      ...(body ? { body: JSON.stringify(body) } : {}),
    });

    let dados;
    try {
      dados = await resposta.json();
    } catch {
      throw new Error('Endereço sem resposta JSON da API. Confira a conexão.');
    }

    if (!resposta.ok) {
      if (resposta.status === 401 && token) aoExpirar(); // token inválido/expirado → logout
      throw new Error(dados.mensagem || 'Não foi possível concluir esta ação.');
    }
    return dados;
  } catch (erro) {
    if (erro.name === 'AbortError' || erro instanceof TypeError) {
      throw new Error('Não foi possível conectar à API. Confira o endereço, a rede e se o servidor está ligado.');
    }
    throw erro;
  } finally {
    clearTimeout(limite);
  }
}
