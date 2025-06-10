
import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  // Estado para armazenar o valor
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      // Tentar recuperar do localStorage
      const item = window.localStorage.getItem(key);
      
      if (item === null) {
        return initialValue;
      }
      
      // Parse JSON ou retornar valor inicial se não for válido
      return JSON.parse(item);
    } catch (error) {
      console.error(`Erro ao ler localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Função para atualizar o valor
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Permitir que value seja uma função para ter a mesma API do useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      // Salvar no state
      setStoredValue(valueToStore);
      
      // Salvar no localStorage
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Erro ao salvar no localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue] as const;
}
