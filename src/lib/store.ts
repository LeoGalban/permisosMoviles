// Datos de la app guardados en memoria (se pierden al cerrar la app; alcanza para el TP).
// OJO: acá NO guardamos el estado de los permisos. Ese siempre se consulta al sistema,
// porque la persona lo puede cambiar en Ajustes en cualquier momento.

import { useSyncExternalStore } from 'react';

export type Categoria = 'electricidad' | 'agua' | 'mobiliario' | 'equipos';
export type EstadoReporte = 'pendiente' | 'en curso' | 'resuelto';
export type Sector = 'Patio' | 'Estacionamiento' | 'Pasillo' | 'Aula' | 'Baños';

export const CATEGORIAS: Categoria[] = ['electricidad', 'agua', 'mobiliario', 'equipos'];
export const SECTORES: Sector[] = ['Patio', 'Estacionamiento', 'Pasillo', 'Aula', 'Baños'];

export type Ubicacion = { latitud: number; longitud: number; aproximada: boolean };

export type Borrador = {
  titulo: string;
  descripcion: string;
  aula: string;
  categoria: Categoria;
  fotoUri?: string;
  ubicacion?: Ubicacion;
  sector?: Sector;
};

export type Reporte = Borrador & { id: string; estado: EstadoReporte; fecha: string };
export type Aviso = { id: string; titulo: string; cuerpo: string; fecha: string; reporteId: string };

type EstadoApp = {
  reportes: Reporte[];
  avisos: Aviso[];
  borrador: Borrador;
  avisarResolucion: boolean; // lo que la persona eligió en /ajustes-app
};

const borradorVacio: Borrador = { titulo: '', descripcion: '', aula: '', categoria: 'electricidad' };

let estado: EstadoApp = {
  reportes: [
    {
      id: '1',
      titulo: 'Luz quemada',
      descripcion: 'El tubo del fondo no prende.',
      aula: 'A12',
      categoria: 'electricidad',
      sector: 'Aula',
      estado: 'en curso',
      fecha: new Date().toISOString(),
    },
  ],
  avisos: [],
  borrador: borradorVacio,
  avisarResolucion: false,
};

const oyentes = new Set<() => void>();

function actualizar(cambio: Partial<EstadoApp>) {
  estado = { ...estado, ...cambio };
  oyentes.forEach((oyente) => oyente());
}

// Hook para leer el estado desde cualquier pantalla (se re-renderiza cuando cambia).
export function useApp() {
  return useSyncExternalStore(
    (oyente) => {
      oyentes.add(oyente);
      return () => oyentes.delete(oyente);
    },
    () => estado,
  );
}

export function editarBorrador(cambio: Partial<Borrador>) {
  actualizar({ borrador: { ...estado.borrador, ...cambio } });
}

export function guardarReporte(): Reporte {
  const reporte: Reporte = {
    ...estado.borrador,
    id: String(Date.now()),
    estado: 'pendiente',
    fecha: new Date().toISOString(),
  };
  actualizar({ reportes: [reporte, ...estado.reportes], borrador: borradorVacio });
  return reporte;
}

export function buscarReporte(id: string) {
  return estado.reportes.find((r) => r.id === id);
}

export function cambiarEstadoReporte(id: string, nuevo: EstadoReporte) {
  actualizar({ reportes: estado.reportes.map((r) => (r.id === id ? { ...r, estado: nuevo } : r)) });
}

export function agregarAviso(aviso: Omit<Aviso, 'id' | 'fecha'>) {
  const nuevo: Aviso = { ...aviso, id: String(Date.now()), fecha: new Date().toISOString() };
  actualizar({ avisos: [nuevo, ...estado.avisos] });
}

export function setAvisarResolucion(valor: boolean) {
  actualizar({ avisarResolucion: valor });
}
