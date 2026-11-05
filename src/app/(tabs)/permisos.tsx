// Ruta: /permisos  (tab "Permisos")
// Panel con el estado REAL de cada permiso. Se actualiza solo al volver de Ajustes
// porque cada fila usa usePermiso (que escucha AppState).

import { router } from 'expo-router';
import { Platform, View } from 'react-native';

import {
  Boton,
  colores,
  Encabezado,
  EtiquetaEstado,
  Fila,
  Lista,
  Pantalla,
  Pastilla,
  Seccion,
} from '@/components/ui';
import { usePermiso } from '@/hooks/usePermiso';
import { INFO, RECURSOS, type Recurso } from '@/lib/permisos';

function FilaPermiso({ recurso }: { recurso: Recurso }) {
  const { estado, matiz, abrirAjustes } = usePermiso(recurso);

  return (
    <View>
      <Fila
        icono={INFO[recurso].icono}
        titulo={INFO[recurso].nombre}
        detalle={matiz ? `Parcial: ${matiz} · ${Platform.OS}` : `Plataforma: ${Platform.OS}`}
        derecha={<EtiquetaEstado estado={estado} />}
      />
      {estado === 'preguntable' && (
        <View style={{ paddingLeft: 66, paddingBottom: 14 }}>
          <Boton
            titulo="Pedir permiso"
            chico
            secundario
            onPress={() => router.push({ pathname: '/permisos/[recurso]', params: { recurso } })}
          />
        </View>
      )}
      {estado === 'bloqueado' && (
        <View style={{ paddingLeft: 66, paddingBottom: 14 }}>
          <Boton titulo="Abrir Ajustes" chico secundario onPress={abrirAjustes} />
        </View>
      )}
    </View>
  );
}

export default function PanelPermisos() {
  return (
    <Pantalla>
      <Encabezado
        titulo="Permisos"
        subtitulo="Si cambiás algo en Ajustes, al volver se actualiza solo."
      />

      <Lista>
        {RECURSOS.map((recurso) => (
          <FilaPermiso key={recurso} recurso={recurso} />
        ))}
      </Lista>

      <Seccion>Sin permiso</Seccion>
      <Lista>
        <Fila
          icono="image-outline"
          titulo="Fotos de la galería"
          detalle="Usamos el selector del sistema: la app solo recibe la foto que elegís."
          derecha={<Pastilla texto="No hace falta" color={colores.verde} fondo={colores.verdeClaro} />}
        />
      </Lista>
    </Pantalla>
  );
}
