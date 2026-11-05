// Componentes visuales simples que se repiten en todas las pantallas.

import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import type { EstadoPermiso } from '@/lib/permisos';
import type { EstadoReporte } from '@/lib/store';

export const colores = {
  primario: '#1d4ed8',
  primarioOscuro: '#1e3a8a',
  primarioClaro: '#dbeafe',
  fondo: '#eef2f7',
  tarjeta: '#ffffff',
  borde: '#cbd5e1',
  texto: '#0f172a',
  suave: '#475569',
  verde: '#15803d',
  verdeClaro: '#dcfce7',
  amarillo: '#b45309',
  amarilloClaro: '#fef3c7',
  rojo: '#b91c1c',
  rojoClaro: '#fee2e2',
};

export function Pantalla({ children }: { children: ReactNode }) {
  return <ScrollView contentContainerStyle={estilos.pantalla}>{children}</ScrollView>;
}

// Franja de color arriba de la pantalla, con un ícono grande y un título.
export function Encabezado({
  icono,
  titulo,
  subtitulo,
}: {
  icono: string;
  titulo: string;
  subtitulo?: string;
}) {
  return (
    <View style={estilos.encabezado}>
      <Text style={estilos.encabezadoIcono}>{icono}</Text>
      <View style={{ flex: 1 }}>
        <Text style={estilos.encabezadoTitulo}>{titulo}</Text>
        {subtitulo && <Text style={estilos.encabezadoSubtitulo}>{subtitulo}</Text>}
      </View>
    </View>
  );
}

export function Tarjeta({ children, color }: { children: ReactNode; color?: string }) {
  return (
    <View style={[estilos.tarjeta, color && { borderLeftWidth: 6, borderLeftColor: color }]}>
      {children}
    </View>
  );
}

export function Titulo({ children }: { children: ReactNode }) {
  return <Text style={estilos.titulo}>{children}</Text>;
}

export function Texto({ children, suave }: { children: ReactNode; suave?: boolean }) {
  return <Text style={[estilos.texto, suave && { color: colores.suave }]}>{children}</Text>;
}

type BotonProps = {
  titulo: string;
  onPress: () => void;
  secundario?: boolean;
  deshabilitado?: boolean;
};

export function Boton({ titulo, onPress, secundario, deshabilitado }: BotonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={deshabilitado}
      style={({ pressed }) => [
        estilos.boton,
        secundario && estilos.botonSecundario,
        pressed && { opacity: 0.75 },
        deshabilitado && { opacity: 0.4 },
      ]}>
      <Text style={[estilos.botonTexto, secundario && { color: colores.primario }]}>{titulo}</Text>
    </Pressable>
  );
}

export function Chip({ texto, activo, onPress }: { texto: string; activo: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[estilos.chip, activo && estilos.chipActivo]}>
      <Text style={[estilos.chipTexto, activo && { color: '#fff' }]}>
        {activo ? '✓ ' : ''}
        {texto}
      </Text>
    </Pressable>
  );
}

// Etiqueta redondeada de color (para estados).
export function Pastilla({ texto, color, fondo }: { texto: string; color: string; fondo: string }) {
  return <Text style={[estilos.pastilla, { color, backgroundColor: fondo }]}>{texto}</Text>;
}

export function Cargando({ texto = 'Consultando permiso…' }: { texto?: string }) {
  return (
    <View style={estilos.centro}>
      <ActivityIndicator size="large" color={colores.primario} />
      <Texto suave>{texto}</Texto>
    </View>
  );
}

export const ESTILO_ESTADO: Record<EstadoPermiso, { texto: string; color: string; fondo: string }> = {
  cargando: { texto: '⏳ Cargando', color: colores.suave, fondo: '#e2e8f0' },
  concedido: { texto: '✅ Concedido', color: colores.verde, fondo: colores.verdeClaro },
  preguntable: { texto: '❔ Preguntable', color: colores.amarillo, fondo: colores.amarilloClaro },
  bloqueado: { texto: '⛔ Bloqueado', color: colores.rojo, fondo: colores.rojoClaro },
};

export const ESTILO_REPORTE: Record<EstadoReporte, { texto: string; color: string; fondo: string }> = {
  pendiente: { texto: '🔴 Pendiente', color: colores.rojo, fondo: colores.rojoClaro },
  'en curso': { texto: '🟡 En curso', color: colores.amarillo, fondo: colores.amarilloClaro },
  resuelto: { texto: '🟢 Resuelto', color: colores.verde, fondo: colores.verdeClaro },
};

export function EtiquetaEstado({ estado }: { estado: EstadoPermiso }) {
  return <Pastilla {...ESTILO_ESTADO[estado]} />;
}

const sombra = {
  shadowColor: '#000',
  shadowOpacity: 0.08,
  shadowRadius: 8,
  shadowOffset: { width: 0, height: 2 },
  elevation: 3,
};

export const estilos = StyleSheet.create({
  pantalla: { padding: 16, gap: 14, backgroundColor: colores.fondo, flexGrow: 1 },
  encabezado: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: colores.primarioOscuro,
    borderRadius: 16,
    padding: 18,
  },
  encabezadoIcono: { fontSize: 40 },
  encabezadoTitulo: { color: '#fff', fontSize: 22, fontWeight: '800' },
  encabezadoSubtitulo: { color: '#bfdbfe', fontSize: 15, marginTop: 2 },
  tarjeta: {
    backgroundColor: colores.tarjeta,
    borderRadius: 14,
    padding: 16,
    gap: 10,
    ...sombra,
  },
  titulo: { fontSize: 20, fontWeight: '800', color: colores.texto },
  texto: { fontSize: 16, color: colores.texto, lineHeight: 23 },
  boton: {
    backgroundColor: colores.primario,
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderRadius: 12,
    alignItems: 'center',
    ...sombra,
  },
  botonSecundario: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: colores.primario,
    shadowOpacity: 0,
    elevation: 0,
  },
  botonTexto: { color: '#fff', fontWeight: '700', fontSize: 17 },
  chip: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: colores.borde,
    backgroundColor: '#fff',
  },
  chipActivo: { backgroundColor: colores.primario, borderColor: colores.primario },
  chipTexto: { fontSize: 16, color: colores.texto, fontWeight: '600' },
  fila: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24 },
  input: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: colores.borde,
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    color: colores.texto,
  },
  pastilla: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    overflow: 'hidden',
    fontSize: 15,
    fontWeight: '700',
  },
});
