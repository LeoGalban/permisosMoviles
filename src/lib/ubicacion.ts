import * as Location from 'expo-location';

import type { Ubicacion } from '@/lib/store';

// Devuelve las coordenadas y si son aproximadas. Si no hay permiso o algo falla,
// devuelve null (la app NO se rompe: la pantalla ofrece elegir el sector a mano).
export async function obtenerUbicacion(): Promise<Ubicacion | null> {
  try {
    const permiso = await Location.getForegroundPermissionsAsync();
    if (!permiso.granted) return null;

    const posicion = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    // Android: 'fine' | 'coarse'   ·   iOS: 'full' | 'reduced'
    const aproximada =
      permiso.android?.accuracy === 'coarse' || permiso.ios?.accuracy === 'reduced';

    return {
      latitud: posicion.coords.latitude,
      longitud: posicion.coords.longitude,
      aproximada,
    };
  } catch {
    return null;
  }
}
