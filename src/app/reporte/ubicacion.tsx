// Ruta: /reporte/ubicacion
// - Solo ubicación en PRIMER PLANO (nunca "Siempre").
// - Si es aproximada: NO mostramos coordenadas, solo "Ubicación aproximada".
// - Si se deniega: se elige el sector a mano (siempre disponible).

import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { Boton, Chip, estilos, Pantalla, Tarjeta, Texto, Titulo } from '@/components/ui';
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
      <Tarjeta>
        <Titulo>Ubicación actual</Titulo>
        {u ? (
          u.aproximada ? (
            <Texto>📍 Ubicación aproximada</Texto>
          ) : (
            <Texto>
              📍 {u.latitud.toFixed(5)}, {u.longitud.toFixed(5)}
            </Texto>
          )
        ) : (
          <Texto suave>Sin ubicación.</Texto>
        )}
        {error && <Texto suave>No pudimos obtener la ubicación. Elegí el sector a mano.</Texto>}
        <Boton
          titulo={buscando ? 'Buscando…' : 'Usar mi ubicación actual'}
          deshabilitado={buscando}
          onPress={() => usarConPermiso('ubicacion', marcarUbicacion)}
        />
        {estado === 'bloqueado' && (
          <Texto suave>La ubicación está bloqueada. Elegí el sector a mano.</Texto>
        )}
      </Tarjeta>

      {/* Alternativa: siempre se puede elegir el sector a mano */}
      <Tarjeta>
        <Titulo>Sector</Titulo>
        <View style={estilos.fila}>
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

      <Boton titulo="Listo" onPress={() => router.back()} />
    </Pantalla>
  );
}
