// Hook unificado: una sola forma de saber el estado de CUALQUIER permiso de la app.
//
// const { estado, parcial, matiz, pedir, abrirAjustes } = usePermiso('camara');
//   estado:  'cargando' | 'concedido' | 'preguntable' | 'bloqueado'
//   parcial: true si es ubicación aproximada / fotos limitadas / notificaciones provisionales
//
// Se actualiza solo: al montar, al volver a la pantalla (foco) y al volver de Ajustes (AppState).

import { useFocusEffect } from 'expo-router';
import type { PermissionResponse } from 'expo';
import { useCallback, useState } from 'react';

import { useRevisarAlVolver } from '@/hooks/useRevisarAlVolver';
import * as permisos from '@/lib/permisos';
import type { Recurso } from '@/lib/permisos';

export function usePermiso(recurso: Recurso) {
  // null = todavía no consultamos → estado 'cargando'
  const [respuesta, setRespuesta] = useState<PermissionResponse | null>(null);

  const revisar = useCallback(() => {
    permisos.consultar(recurso).then(setRespuesta);
  }, [recurso]);

  // Al entrar (o volver) a la pantalla: consultamos (get, nunca muestra diálogo).
  useFocusEffect(revisar);
  // Al volver de Ajustes: consultamos de nuevo.
  useRevisarAlVolver(revisar);

  const pedir = useCallback(async () => {
    const nueva = await permisos.pedir(recurso);
    setRespuesta(nueva);
    return nueva;
  }, [recurso]);

  const matiz = permisos.matizDe(respuesta);

  return {
    estado: permisos.estadoDe(respuesta),
    parcial: matiz !== null,
    matiz,
    respuesta,
    pedir,
    abrirAjustes: permisos.abrirAjustes,
    revisar,
  };
}
