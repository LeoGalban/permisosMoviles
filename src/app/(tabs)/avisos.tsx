// Ruta: /avisos  (tab "Avisos")
// Bandeja dentro de la app: es la ALTERNATIVA si se deniegan las notificaciones.
// Los avisos llegan acá siempre, haya o no permiso.

import { router } from 'expo-router';
import { Text } from 'react-native';

import { Boton, colores, Encabezado, Pantalla, Tarjeta, Texto, Titulo } from '@/components/ui';
import { useApp } from '@/lib/store';

export default function Avisos() {
  const { avisos } = useApp();

  return (
    <Pantalla>
      <Encabezado
        icono="🔔"
        titulo="Bandeja de avisos"
        subtitulo="Llegan acá aunque las notificaciones estén apagadas."
      />

      {avisos.length === 0 && (
        <Tarjeta>
          <Text style={{ fontSize: 48, textAlign: 'center' }}>📭</Text>
          <Texto>No tenés avisos todavía.</Texto>
          <Texto suave>Probá «Simular resolución» en el detalle de un reporte.</Texto>
        </Tarjeta>
      )}

      {avisos.map((a) => (
        <Tarjeta key={a.id} color={colores.verde}>
          <Titulo>{a.titulo}</Titulo>
          <Texto>{a.cuerpo}</Texto>
          <Texto suave>🕒 {new Date(a.fecha).toLocaleString()}</Texto>
          <Boton
            titulo="Ver reporte"
            secundario
            onPress={() => router.push({ pathname: '/reporte/[id]', params: { id: a.reporteId } })}
          />
        </Tarjeta>
      ))}

      <Boton titulo="⚙️  Ajustes de avisos" secundario onPress={() => router.push('/ajustes-app')} />
    </Pantalla>
  );
}
