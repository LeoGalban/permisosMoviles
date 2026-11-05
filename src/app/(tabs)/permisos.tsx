// Ruta: /permisos  (tab "Permisos")
// Panel con el estado REAL de cada permiso. Se actualiza solo al volver de Ajustes
// porque cada fila usa usePermiso (que escucha AppState).

import { router } from 'expo-router';
import { Platform, Text, View } from 'react-native';

import {
  Boton,
  colores,
  Encabezado,
  ESTILO_ESTADO,
  EtiquetaEstado,
  Pantalla,
  Pastilla,
  Tarjeta,
  Texto,
  Titulo,
} from '@/components/ui';
import { usePermiso } from '@/hooks/usePermiso';
import { INFO, RECURSOS, type Recurso } from '@/lib/permisos';

function FilaPermiso({ recurso }: { recurso: Recurso }) {
  const { estado, matiz, abrirAjustes } = usePermiso(recurso);

  return (
    <Tarjeta color={ESTILO_ESTADO[estado].color}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <Text style={{ fontSize: 34 }}>{INFO[recurso].icono}</Text>
        <View style={{ flex: 1, gap: 6 }}>
          <Titulo>{INFO[recurso].nombre}</Titulo>
          <EtiquetaEstado estado={estado} />
        </View>
      </View>
      {matiz && (
        <Pastilla texto={`◐ Parcial: ${matiz}`} color={colores.primario} fondo={colores.primarioClaro} />
      )}
      <Texto suave>Plataforma: {Platform.OS}</Texto>

      {estado === 'preguntable' && (
        <Boton
          titulo="Pedir permiso"
          onPress={() => router.push({ pathname: '/permisos/[recurso]', params: { recurso } })}
        />
      )}
      {estado === 'bloqueado' && <Boton titulo="⚙️  Abrir Ajustes" onPress={abrirAjustes} />}
    </Tarjeta>
  );
}

export default function PanelPermisos() {
  return (
    <Pantalla>
      <Encabezado
        icono="🔐"
        titulo="Tus permisos"
        subtitulo="Si cambiás algo en Ajustes, al volver se actualiza solo."
      />

      {RECURSOS.map((recurso) => (
        <FilaPermiso key={recurso} recurso={recurso} />
      ))}

      <Tarjeta color={colores.verde}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Text style={{ fontSize: 34 }}>🖼️</Text>
          <View style={{ flex: 1, gap: 6 }}>
            <Titulo>Fotos (galería)</Titulo>
            <Pastilla texto="✅ No hace falta" color={colores.verde} fondo={colores.verdeClaro} />
          </View>
        </View>
        <Texto suave>
          Usamos el selector de fotos del sistema: la persona elige UNA foto y la app solo recibe
          esa.
        </Texto>
      </Tarjeta>
    </Pantalla>
  );
}
