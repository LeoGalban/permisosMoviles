// Ruta: /reporte/[id]
// Detalle del reporte. Valida el id: si no existe, muestra un mensaje en vez de romperse.

import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';

import { Boton, Pantalla, Tarjeta, Texto, Titulo } from '@/components/ui';
import { simularResolucion } from '@/lib/notificaciones';
import { useApp } from '@/lib/store';

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
      <Tarjeta>
        <Titulo>{reporte.titulo}</Titulo>
        <Texto>{reporte.descripcion || 'Sin descripción.'}</Texto>
        <Texto suave>Aula: {reporte.aula || '—'}</Texto>
        <Texto suave>Categoría: {reporte.categoria}</Texto>
        <Texto suave>
          Ubicación:{' '}
          {u
            ? u.aproximada
              ? 'Ubicación aproximada'
              : `${u.latitud.toFixed(5)}, ${u.longitud.toFixed(5)}`
            : 'sin coordenadas'}
        </Texto>
        <Texto suave>Sector: {reporte.sector ?? '—'}</Texto>
        <Texto>Estado: {reporte.estado.toUpperCase()}</Texto>
      </Tarjeta>

      {reporte.fotoUri && (
        <Image source={{ uri: reporte.fotoUri }} style={{ height: 220, borderRadius: 12 }} />
      )}

      <Boton
        titulo="Simular resolución"
        onPress={simular}
        deshabilitado={reporte.estado !== 'pendiente'}
      />
      {mensaje && <Texto suave>{mensaje}</Texto>}
    </Pantalla>
  );
}
