// Ruta: /reporte/[id]
// Detalle del reporte. Valida el id: si no existe, muestra un mensaje en vez de romperse.

import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';

import {
  Boton,
  Encabezado,
  ESTILO_REPORTE,
  Pantalla,
  Pastilla,
  Tarjeta,
  Texto,
  Titulo,
} from '@/components/ui';
import { simularResolucion } from '@/lib/notificaciones';
import { ICONO_CATEGORIA, useApp } from '@/lib/store';

export default function DetalleReporte() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { reportes, avisarResolucion } = useApp();
  const [mensaje, setMensaje] = useState<string | null>(null);

  const reporte = reportes.find((r) => r.id === id);

  if (!reporte) {
    return (
      <Pantalla>
        <Tarjeta>
          <Titulo>Reporte no encontrado</Titulo>
          <Texto>No existe ningún reporte con el id «{id}».</Texto>
          <Boton titulo="Volver al inicio" onPress={() => router.replace('/')} />
        </Tarjeta>
      </Pantalla>
    );
  }

  async function simular() {
    const { notificacion } = await simularResolucion(reporte!.id, avisarResolucion);
    setMensaje(
      notificacion
        ? 'En 10 segundos vas a recibir una notificación.'
        : 'Las notificaciones están desactivadas: en 10 segundos el aviso aparece en la pestaña "Avisos".',
    );
  }

  const u = reporte.ubicacion;

  return (
    <Pantalla>
      <Encabezado
        icono={ICONO_CATEGORIA[reporte.categoria]}
        titulo={reporte.titulo}
        subtitulo={`Categoría: ${reporte.categoria}`}
      />

      <Tarjeta color={ESTILO_REPORTE[reporte.estado].color}>
        <Pastilla {...ESTILO_REPORTE[reporte.estado]} />
        <Texto>{reporte.descripcion || 'Sin descripción.'}</Texto>
        <Texto>🚪 Aula: {reporte.aula || '—'}</Texto>
        <Texto>
          📍 Ubicación:{' '}
          {u
            ? u.aproximada
              ? 'Ubicación aproximada'
              : `${u.latitud.toFixed(5)}, ${u.longitud.toFixed(5)}`
            : 'sin coordenadas'}
        </Texto>
        <Texto>🧭 Sector: {reporte.sector ?? '—'}</Texto>
      </Tarjeta>

      {reporte.fotoUri && (
        <Image source={{ uri: reporte.fotoUri }} style={{ height: 220, borderRadius: 12 }} />
      )}

      <Boton
        titulo="🛠️  Simular resolución"
        onPress={simular}
        deshabilitado={reporte.estado !== 'pendiente'}
      />
      {mensaje && <Texto suave>{mensaje}</Texto>}
    </Pantalla>
  );
}
