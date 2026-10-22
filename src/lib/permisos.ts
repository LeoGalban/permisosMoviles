// Toda la lógica de permisos de la app vive acá.
// Las pantallas nunca llaman directo a expo-camera / expo-location / expo-notifications
// para pedir permisos: usan estas funciones (o el hook usePermiso, que las usa por dentro).

import { type PermissionResponse } from 'expo';
import { Camera } from 'expo-camera';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import { Linking, Platform } from 'react-native';

export type Recurso = 'camara' | 'ubicacion' | 'notificaciones';

export const RECURSOS: Recurso[] = ['camara', 'ubicacion', 'notificaciones'];

// Los 4 estados que maneja toda la app.
export type EstadoPermiso = 'cargando' | 'concedido' | 'preguntable' | 'bloqueado';

// Textos para la pantalla previa (/permisos/[recurso]) y el panel.
export const INFO: Record<Recurso, { nombre: string; beneficio: string; alternativa: string }> = {
  camara: {
    nombre: 'Cámara',
    beneficio: 'Usamos tu cámara para leer el QR del aula y sacar la foto del desperfecto.',
    alternativa: 'Podés escribir el código del aula a mano y elegir la foto desde la galería.',
  },
  ubicacion: {
    nombre: 'Ubicación',
    beneficio: 'Usamos tu ubicación para marcar en qué parte del edificio está el problema.',
    alternativa: 'Podés elegir el sector (patio, pasillo, estacionamiento) a mano.',
  },
  notificaciones: {
    nombre: 'Notificaciones',
    beneficio: 'Te avisamos cuando tu reporte se resuelva.',
    alternativa: 'Los avisos igual aparecen en la pestaña "Avisos" dentro de la app.',
  },
};

// ─── 1. Consultar (NUNCA muestra diálogo) ───────────────────────────────
export async function consultar(recurso: Recurso): Promise<PermissionResponse> {
  switch (recurso) {
    case 'camara':
      return Camera.getCameraPermissionsAsync();
    case 'ubicacion':
      return Location.getForegroundPermissionsAsync();
    case 'notificaciones':
      return Notifications.getPermissionsAsync();
  }
}

// ─── 2. Pedir (PUEDE mostrar el diálogo del sistema) ────────────────────
export async function pedir(recurso: Recurso): Promise<PermissionResponse> {
  switch (recurso) {
    case 'camara':
      return Camera.requestCameraPermissionsAsync();
    case 'ubicacion':
      // Solo primer plano: la app nunca pide "Siempre".
      return Location.requestForegroundPermissionsAsync();
    case 'notificaciones':
      // En Android 13+ el diálogo NO aparece si no existe un canal antes de pedir.
      await crearCanalReportes();
      return Notifications.requestPermissionsAsync();
  }
}

export async function crearCanalReportes() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('reportes', {
      name: 'Reportes resueltos',
      importance: Notifications.AndroidImportance.HIGH,
    });
  }
}

// ─── 3. Traducir la respuesta del sistema a NUESTROS 4 estados ──────────
// Esta es LA función que decide entre "Continuar" y "Abrir Ajustes".
// Los dos campos que deciden todo: granted (¿lo tengo?) y canAskAgain (¿puedo volver a preguntar?).
export function estadoDe(respuesta: PermissionResponse | null): EstadoPermiso {
  if (respuesta === null) return 'cargando';
  if (respuesta.granted) return 'concedido';
  if (respuesta.canAskAgain) return 'preguntable'; // → botón "Continuar"
  return 'bloqueado'; // → botón "Abrir Ajustes"
}

// ─── 4. ¿Es un permiso parcial? Devuelve el "matiz" o null ──────────────
export function matizDe(respuesta: PermissionResponse | null): string | null {
  if (!respuesta?.granted) return null;
  const r = respuesta as any;
  // Ubicación aproximada: Android dice 'coarse', iOS dice 'reduced'.
  if (r.android?.accuracy === 'coarse' || r.ios?.accuracy === 'reduced') {
    return 'Ubicación aproximada';
  }
  // Fotos limitadas (por si algún día se usa la galería con permiso).
  if (r.accessPrivileges === 'limited') return 'Fotos limitadas';
  // Notificaciones provisionales en iOS (llegan en silencio al centro de notificaciones).
  if (r.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL) {
    return 'Provisionales (silenciosas)';
  }
  return null;
}

export function abrirAjustes() {
  return Linking.openSettings();
}

// Camino exacto en Ajustes según la plataforma (para la pantalla de "bloqueado").
export function caminoEnAjustes(recurso: Recurso): string {
  const nombre = INFO[recurso].nombre;
  if (Platform.OS === 'ios') {
    return `Ajustes → Mantenimiento IPF → ${nombre} → activar.`;
  }
  if (recurso === 'notificaciones') {
    return 'Ajustes → Apps → Mantenimiento IPF → Notificaciones → activar.';
  }
  return `Ajustes → Apps → Mantenimiento IPF → Permisos → ${nombre} → Permitir.`;
}

// ─── 5. Pedir EN CONTEXTO ───────────────────────────────────────────────
// Se llama cuando la persona toca una función (escanear, sacar foto, ubicación, avisos).
// - Si ya hay permiso: ejecuta la acción directo.
// - Si no: guarda la acción y abre la pantalla previa /permisos/[recurso].
//   Si allí se concede, la pantalla previa ejecuta la acción pendiente.
let accionPendiente: (() => void) | null = null;

export async function usarConPermiso(recurso: Recurso, accion: () => void) {
  const estado = estadoDe(await consultar(recurso));
  if (estado === 'concedido') {
    accion();
    return;
  }
  accionPendiente = accion;
  router.push({ pathname: '/permisos/[recurso]', params: { recurso } });
}

export function ejecutarPendiente() {
  const accion = accionPendiente;
  accionPendiente = null;
  accion?.();
}

export function descartarPendiente() {
  accionPendiente = null;
}

export function esRecurso(valor: unknown): valor is Recurso {
  return typeof valor === 'string' && (RECURSOS as string[]).includes(valor);
}
