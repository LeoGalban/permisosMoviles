import * as Notifications from 'expo-notifications';

import { consultar } from '@/lib/permisos';
import { agregarAviso, buscarReporte, cambiarEstadoReporte } from '@/lib/store';

const DEMORA_SEGUNDOS = 10;

// Cómo se muestra una notificación si llega con la app abierta.
export function configurarNotificaciones() {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

// Botón de prueba "Simular resolución" en /reporte/[id].
// - El reporte pasa a "en curso" y a los 10 s a "resuelto".
// - El aviso SIEMPRE queda en la bandeja /avisos (alternativa a las notificaciones).
// - Si hay permiso y la persona activó los avisos, además se programa una notificación local.
export async function simularResolucion(reporteId: string, avisarActivado: boolean) {
  const reporte = buscarReporte(reporteId);
  if (!reporte) return { notificacion: false };

  cambiarEstadoReporte(reporteId, 'en curso');
  const titulo = 'Reporte resuelto ✅';
  const cuerpo = `"${reporte.titulo}" (aula ${reporte.aula || 'sin aula'}) ya fue resuelto.`;

  const permiso = await consultar('notificaciones');
  const conNotificacion = permiso.granted && avisarActivado;

  if (conNotificacion) {
    await Notifications.scheduleNotificationAsync({
      content: { title: titulo, body: cuerpo },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: DEMORA_SEGUNDOS,
        channelId: 'reportes',
      },
    });
  }

  setTimeout(() => {
    cambiarEstadoReporte(reporteId, 'resuelto');
    agregarAviso({ titulo, cuerpo, reporteId });
  }, DEMORA_SEGUNDOS * 1000);

  return { notificacion: conNotificacion };
}
