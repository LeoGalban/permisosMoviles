// Ruta: /reporte/[id]
// Detalle del reporte. Valida el id: si no existe, muestra un mensaje en vez de romperse.

import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import {
  Boton,
  ESTILO_REPORTE,
  Fila,
  Lista,
  Pantalla,
  Pastilla,
  Seccion,
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
        : 'Las notificaciones están desactivadas: en 10 segundos el aviso aparece en la pestaña «Avisos».',
    );
  }

  const u = reporte.ubicacion;

  return (
    <Pantalla>
      <Tarjeta>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
          <View style={{ flex: 1 }}>
            <Titulo>{reporte.titulo}</Titulo>
          </View>
          <Pastilla {...ESTILO_REPORTE[reporte.estado]} />
        </View>
        <Texto>{reporte.descripcion || 'Sin descripción.'}</Texto>
      </Tarjeta>

      {reporte.fotoUri && (
        <Image
          source={{ uri: reporte.fotoUri }}
          style={{ height: 220, borderRadius: 12 }}
          contentFit="cover"
        />
      )}

      <Seccion>Datos</Seccion>
      <Lista>
        <Fila
          icono={ICONO_CATEGORIA[reporte.categoria]}
          titulo="Categoría"
          detalle={reporte.categoria.charAt(0).toUpperCase() + reporte.categoria.slice(1)}
        />
        <Fila icono="enter-outline" titulo="Aula" detalle={reporte.aula || '—'} />
        <Fila
          icono="location-outline"
          titulo="Ubicación"
          detalle={
            u
              ? u.aproximada
                ? 'Ubicación aproximada'
                : `${u.latitud.toFixed(5)}, ${u.longitud.toFixed(5)}`
              : 'Sin coordenadas'
          }
        />
        <Fila icono="compass-outline" titulo="Sector" detalle={reporte.sector ?? '—'} />
      </Lista>

      <Boton
        titulo="Simular resolución"
        secundario
        onPress={simular}
        deshabilitado={reporte.estado !== 'pendiente'}
      />
      {mensaje && <Texto suave>{mensaje}</Texto>}
    </Pantalla>
  );
}
