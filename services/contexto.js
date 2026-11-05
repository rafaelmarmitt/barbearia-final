import { createContext, useContext, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
export const Contexto = createContext(null);
export const useAgenda = () => useContext(Contexto);
export function useAtualizarAgenda() {
  const { atualizar } = useAgenda();
  useFocusEffect(useCallback(() => { atualizar(); }, [atualizar]));
}
