// Ruta: /permisos  (tab "Permisos")
// Panel con el estado REAL de cada permiso. Se actualiza solo al volver de Ajustes
// porque cada fila usa usePermiso (que escucha AppState).

import { router } from 'expo-router';
import { Platform } from 'react-native';

import { Boton, EtiquetaEstado, Pantalla, Tarjeta, Texto, Titulo } from '@/components/ui';
import { usePermiso } from '@/hooks/usePermiso';
import { INFO, RECURSOS, type Recurso } from '@/lib/permisos';

function FilaPermiso({ recurso }: { recurso: Recurso }) {
  const { estado, matiz, abrirAjustes } = usePermiso(recurso);

  return (
    <Tarjeta>
      <Titulo>{INFO[recurso].nombre}</Titulo>
      <EtiquetaEstado estado={estado} />
      {matiz && <Texto>Parcial: {matiz}</Texto>}
      <Texto suave>Plataforma: {Platform.OS}</Texto>

      {estado === 'preguntable' && (
        <Boton
          titulo="Pedir permiso"
          onPress={() => router.push({ pathname: '/permisos/[recurso]', params: { recurso } })}
        />
      )}
      {estado === 'bloqueado' && <Boton titulo="Abrir Ajustes" onPress={abrirAjustes} />}
    </Tarjeta>
  );
}

export default function PanelPermisos() {
  return (
    <Pantalla>
      <Texto suave>
        Si cambiás un permiso en Ajustes, al volver a la app este panel se actualiza solo.
      </Texto>

      {RECURSOS.map((recurso) => (
        <FilaPermiso key={recurso} recurso={recurso} />
      ))}

      <Tarjeta>
        <Titulo>Fotos (galería)</Titulo>
        <Texto>No hace falta permiso.</Texto>
        <Texto suave>
          Usamos el selector de fotos del sistema: la persona elige UNA foto y la app solo recibe
          esa.
        </Texto>
      </Tarjeta>
    </Pantalla>
  );
}
