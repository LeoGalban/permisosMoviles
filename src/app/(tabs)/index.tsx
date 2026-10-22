// Ruta: /   (tab "Reportes") — no pide ningún permiso.

import { router } from 'expo-router';
import { Pressable, Text } from 'react-native';

import { Boton, colores, Pantalla, Tarjeta, Texto, Titulo } from '@/components/ui';
import { useApp, type EstadoReporte } from '@/lib/store';

const COLOR_ESTADO: Record<EstadoReporte, string> = {
  pendiente: colores.rojo,
  'en curso': colores.amarillo,
  resuelto: colores.verde,
};

export default function Inicio() {
  const { reportes } = useApp();

  return (
    <Pantalla>
      <Boton titulo="+ Nuevo reporte" onPress={() => router.push('/reporte/nuevo')} />
      <Boton titulo="⚙️ Ajustes de avisos" secundario onPress={() => router.push('/ajustes-app')} />

      <Titulo>Mis reportes</Titulo>
      {reportes.length === 0 && <Texto suave>Todavía no hiciste ningún reporte.</Texto>}

      {reportes.map((r) => (
        <Pressable
          key={r.id}
          onPress={() => router.push({ pathname: '/reporte/[id]', params: { id: r.id } })}>
          <Tarjeta>
            <Texto>{r.titulo}</Texto>
            <Texto suave>
              Aula {r.aula || '—'} · {r.categoria}
            </Texto>
            <Text style={{ color: COLOR_ESTADO[r.estado], fontWeight: '700' }}>
              ● {r.estado.toUpperCase()}
            </Text>
          </Tarjeta>
        </Pressable>
      ))}
    </Pantalla>
  );
}
