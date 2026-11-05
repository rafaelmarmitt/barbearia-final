import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
let token = null;
let base = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
let expirar = () => {};
export function configurarSessao(valor, aoExpirar) { token = valor; expirar = aoExpirar || (() => {}); }
export function enderecoApi() { return base; }
export async function configurarEndereco(url) {
  const limpo = url.trim().replace(/\/+$/, '');
  if (!/^https?:\/\/[^\s]+$/.test(limpo)) throw new Error('Informe uma URL http:// ou https:// válida.');
  await AsyncStorage.setItem('barbearia.api', limpo); base = limpo;
}
export async function iniciarEndereco() { base = await AsyncStorage.getItem('barbearia.api') || base; }
export async function guardarToken(valor) {
  if (Platform.OS === 'web') { token = valor; return; }
  if (valor) await SecureStore.setItemAsync('barbearia.jwt', valor);
  else await SecureStore.deleteItemAsync('barbearia.jwt');
}
export async function lerToken() { return Platform.OS === 'web' ? null : SecureStore.getItemAsync('barbearia.jwt'); }
export async function api(caminho, { method = 'GET', body = undefined } = {}) {
  const abortar = new AbortController(); const timeout = setTimeout(() => abortar.abort(), 15000);
  try {
    const resposta = await fetch(base + caminho, { method, signal: abortar.signal,
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}) },
      ...(body ? { body: JSON.stringify(body) } : {}) });
    let dados;
    try { dados = await resposta.json(); } catch { throw new Error('Endereço sem resposta JSON da API. Confira a conexão.'); }
    if (!resposta.ok) {
      if (resposta.status === 401 && token) expirar();
      throw new Error(dados.mensagem || 'Não foi possível concluir esta ação.');
    }
    return dados;
  } catch (erro) {
    if (erro.name === 'AbortError' || erro instanceof TypeError) throw new Error('Não foi possível conectar à API. Confira o endereço, a rede e se o servidor está ligado.');
    throw erro;
  } finally { clearTimeout(timeout); }
}
