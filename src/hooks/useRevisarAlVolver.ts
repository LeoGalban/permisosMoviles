// Los permisos pueden cambiar en Ajustes mientras la app está en segundo plano.
// Los hooks de Expo NO se enteran solos: hay que volver a consultar cuando la app
// regresa a primer plano ('background' → 'active').

import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';

export function useRevisarAlVolver(revisar: () => void) {
  const anterior = useRef(AppState.currentState);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (nuevo) => {
      const estabaAfuera = anterior.current.match(/inactive|background/) !== null;
      if (estabaAfuera && nuevo === 'active') revisar();
      anterior.current = nuevo;
    });
    return () => sub.remove();
  }, [revisar]);
}
