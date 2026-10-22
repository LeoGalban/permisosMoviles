// Componentes visuales simples que se repiten en todas las pantallas.

import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import type { EstadoPermiso } from '@/lib/permisos';

export const colores = {
  primario: '#1e3a8a',
  fondo: '#f3f4f6',
  tarjeta: '#ffffff',
  texto: '#111827',
  suave: '#6b7280',
  verde: '#15803d',
  amarillo: '#b45309',
  rojo: '#b91c1c',
};

export function Pantalla({ children }: { children: ReactNode }) {
  return <ScrollView contentContainerStyle={estilos.pantalla}>{children}</ScrollView>;
}

export function Tarjeta({ children }: { children: ReactNode }) {
  return <View style={estilos.tarjeta}>{children}</View>;
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
        (pressed || deshabilitado) && { opacity: 0.6 },
      ]}>
      <Text style={[estilos.botonTexto, secundario && { color: colores.primario }]}>{titulo}</Text>
    </Pressable>
  );
}

export function Chip({ texto, activo, onPress }: { texto: string; activo: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[estilos.chip, activo && estilos.chipActivo]}>
      <Text style={{ color: activo ? '#fff' : colores.texto }}>{texto}</Text>
    </Pressable>
  );
}

export function Cargando({ texto = 'Consultando permiso…' }: { texto?: string }) {
  return (
    <View style={estilos.centro}>
      <ActivityIndicator size="large" color={colores.primario} />
      <Texto suave>{texto}</Texto>
    </View>
  );
}

const ETIQUETAS: Record<EstadoPermiso, { texto: string; color: string }> = {
  cargando: { texto: 'Cargando', color: colores.suave },
  concedido: { texto: 'Concedido', color: colores.verde },
  preguntable: { texto: 'Preguntable', color: colores.amarillo },
  bloqueado: { texto: 'Bloqueado', color: colores.rojo },
};

export function EtiquetaEstado({ estado }: { estado: EstadoPermiso }) {
  const { texto, color } = ETIQUETAS[estado];
  return <Text style={[estilos.etiqueta, { backgroundColor: color }]}>{texto}</Text>;
}

export const estilos = StyleSheet.create({
  pantalla: { padding: 16, gap: 12, backgroundColor: colores.fondo, flexGrow: 1 },
  tarjeta: { backgroundColor: colores.tarjeta, borderRadius: 12, padding: 16, gap: 8 },
  titulo: { fontSize: 20, fontWeight: '700', color: colores.texto },
  texto: { fontSize: 15, color: colores.texto, lineHeight: 21 },
  boton: { backgroundColor: colores.primario, padding: 14, borderRadius: 10, alignItems: 'center' },
  botonSecundario: { backgroundColor: 'transparent', borderWidth: 1, borderColor: colores.primario },
  botonTexto: { color: '#fff', fontWeight: '600', fontSize: 15 },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#fff',
  },
  chipActivo: { backgroundColor: colores.primario, borderColor: colores.primario },
  fila: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24 },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
  },
  etiqueta: {
    color: '#fff',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    overflow: 'hidden',
    fontSize: 13,
    fontWeight: '600',
  },
});
