// Ruta: /avisos  (tab "Avisos")
// Bandeja dentro de la app: es la ALTERNATIVA si se deniegan las notificaciones.
// Los avisos llegan acá siempre, haya o no permiso.

import { router } from 'expo-router';

import { Boton, Pantalla, Tarjeta, Texto, Titulo } from '@/components/ui';
import { useApp } from '@/lib/store';

export default function Avisos() {
  const { avisos } = useApp();

  return (
    <Pantalla>
      <Texto suave>
        Acá ves todos los avisos aunque las notificaciones del sistema estén desactivadas.
      </Texto>

      {avisos.length === 0 && (
        <Tarjeta>
          <Texto>No tenés avisos todavía.</Texto>
          <Texto suave>Probá «Simular resolución» en el detalle de un reporte.</Texto>
        </Tarjeta>
      )}

      {avisos.map((a) => (
        <Tarjeta key={a.id}>
          <Titulo>{a.titulo}</Titulo>
          <Texto>{a.cuerpo}</Texto>
          <Texto suave>{new Date(a.fecha).toLocaleString()}</Texto>
          <Boton
            titulo="Ver reporte"
            secundario
            onPress={() => router.push({ pathname: '/reporte/[id]', params: { id: a.reporteId } })}
          />
        </Tarjeta>
      ))}

      <Boton titulo="⚙️ Ajustes de avisos" secundario onPress={() => router.push('/ajustes-app')} />
    </Pantalla>
  );
}
