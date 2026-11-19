// Contexto compartilhado entre as telas: usuário logado, agenda e ações.
import { createContext, useContext, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';

export const Contexto = createContext(null);

export const useAgenda = () => useContext(Contexto);

/** Recarrega a agenda sempre que a tela recebe foco (ao abrir ou voltar para ela). */
export function useAtualizarAgenda() {
  const { atualizar } = useAgenda();
  useFocusEffect(useCallback(() => { atualizar(); }, [atualizar]));
}

/** Limpa avisos de sucesso/erro antigos quando o usuário volta para a tela. */
export function useLimparAoFocar(...setters) {
  useFocusEffect(useCallback(() => { setters.forEach(limpar => limpar('')); }, [])); // eslint-disable-line react-hooks/exhaustive-deps
}
