// Ruta: /reporte/ubicacion
// - Solo ubicación en PRIMER PLANO (nunca "Siempre").
// - Si es aproximada: NO mostramos coordenadas, solo "Ubicación aproximada".
// - Si se deniega: se elige el sector a mano (siempre disponible).

import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import {
  Boton,
  Chip,
  estilos,
  Fila,
  Lista,
  Pantalla,
  Seccion,
  Tarjeta,
  Texto,
} from '@/components/ui';
import { usePermiso } from '@/hooks/usePermiso';
import { usarConPermiso } from '@/lib/permisos';
import { editarBorrador, SECTORES, useApp } from '@/lib/store';
import { obtenerUbicacion } from '@/lib/ubicacion';

export default function UbicacionReporte() {
  const { borrador } = useApp();
  const { estado } = usePermiso('ubicacion');
  const [buscando, setBuscando] = useState(false);
  const [error, setError] = useState(false);

  async function marcarUbicacion() {
    setBuscando(true);
    const ubicacion = await obtenerUbicacion();
    setBuscando(false);
    setError(ubicacion === null);
    if (ubicacion) editarBorrador({ ubicacion });
  }

  const u = borrador.ubicacion;

  return (
    <Pantalla>
      <Lista>
        <Fila
          icono="navigate-outline"
          titulo={buscando ? 'Buscando…' : 'Usar mi ubicación actual'}
          detalle={
            u
              ? u.aproximada
                ? 'Ubicación aproximada'
                : `${u.latitud.toFixed(5)}, ${u.longitud.toFixed(5)}`
              : estado === 'bloqueado'
                ? 'Ubicación bloqueada: elegí el sector a mano'
                : 'Sin ubicación'
          }
          onPress={buscando ? undefined : () => usarConPermiso('ubicacion', marcarUbicacion)}
        />
      </Lista>
      {error && <Texto suave>No pudimos obtener la ubicación. Elegí el sector a mano.</Texto>}

      {/* Alternativa: siempre se puede elegir el sector a mano */}
      <Seccion>O elegí el sector</Seccion>
      <Tarjeta>
        <View style={estilos.grupo}>
          {SECTORES.map((s) => (
            <Chip
              key={s}
              texto={s}
              activo={borrador.sector === s}
              onPress={() => editarBorrador({ sector: s })}
            />
          ))}
        </View>
      </Tarjeta>

      <Boton titulo="Listo" acento onPress={() => router.back()} />
    </Pantalla>
  );
}
