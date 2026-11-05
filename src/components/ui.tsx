// Componentes visuales que se repiten en todas las pantallas.
// Los colores salen de la identidad del IPF: azul y verde del escudo, crema de sus letras
// y madera de la fachada del edificio.

import { Ionicons } from '@expo/vector-icons';
import { Children, type ComponentProps, type ReactNode } from 'react';
import {
  ActivityIndicator,
  type ColorValue,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { EstadoPermiso } from '@/lib/permisos';
import type { EstadoReporte } from '@/lib/store';

export type NombreIcono = ComponentProps<typeof Ionicons>['name'];

export const colores = {
  primario: '#2c3e50', // azul del escudo
  primarioClaro: '#e9edf1',
  acento: '#15803d', // verde de la "P"
  crema: '#f5efdc', // letras del escudo
  madera: '#9a4f22', // fachada del edificio
  maderaClara: '#f7ece3',
  fondo: '#f6f5f1',
  tarjeta: '#ffffff',
  borde: '#e5e2d9',
  bordeFuerte: '#cdc9bc',
  texto: '#1c2733',
  suave: '#5f6b76',
  marcador: '#8a949e', // texto de ejemplo de los campos
  verde: '#15803d',
  verdeClaro: '#e8f4ec',
  rojo: '#a8322a',
  rojoClaro: '#faeceb',
};

export function Pantalla({ children }: { children: ReactNode }) {
  return <ScrollView contentContainerStyle={estilos.pantalla}>{children}</ScrollView>;
}

export function Icono({
  nombre,
  color = colores.primario,
  tam = 22,
}: {
  nombre: NombreIcono;
  color?: ColorValue;
  tam?: number;
}) {
  return <Ionicons name={nombre} color={color} size={tam} />;
}

// Ícono dentro de un cuadrado suave: identifica cada fila de una lista.
export function CajaIcono({ nombre, tam = 20 }: { nombre: NombreIcono; tam?: number }) {
  const lado = tam * 2;
  return (
    <View style={[estilos.cajaIcono, { width: lado, height: lado, borderRadius: lado / 4 }]}>
      <Icono nombre={nombre} tam={tam} />
    </View>
  );
}

// Botón redondo de un solo ícono (por ejemplo, los ajustes en un encabezado).
export function BotonIcono({
  nombre,
  etiqueta,
  onPress,
}: {
  nombre: NombreIcono;
  etiqueta: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={etiqueta}
      style={({ pressed }) => [estilos.botonIcono, pressed && { opacity: 0.7 }]}>
      <Icono nombre={nombre} color="#fff" tam={20} />
    </Pressable>
  );
}

// Encabezado de las pestañas: va arriba de todo, por eso deja lugar para la barra de estado.
export function Encabezado({
  titulo,
  subtitulo,
  accion,
}: {
  titulo: string;
  subtitulo?: string;
  accion?: ReactNode;
}) {
  const { top } = useSafeAreaInsets();
  return (
    <View style={[estilos.encabezado, { paddingTop: top + 20 }]}>
      <View style={{ flex: 1 }}>
        <Text style={estilos.encabezadoTitulo}>{titulo}</Text>
        {subtitulo && <Text style={estilos.encabezadoSubtitulo}>{subtitulo}</Text>}
      </View>
      {accion}
    </View>
  );
}

export function Tarjeta({ children }: { children: ReactNode }) {
  return <View style={estilos.tarjeta}>{children}</View>;
}

// Tarjeta con filas separadas por una línea fina.
export function Lista({ children }: { children: ReactNode }) {
  return (
    <View style={estilos.lista}>
      {Children.toArray(children).map((hijo, i) => (
        <View key={i}>
          {i > 0 && <View style={estilos.separador} />}
          {hijo}
        </View>
      ))}
    </View>
  );
}

export function Fila({
  icono,
  titulo,
  detalle,
  derecha,
  onPress,
}: {
  icono?: NombreIcono;
  titulo: string;
  detalle?: string;
  derecha?: ReactNode;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [estilos.fila, pressed && { backgroundColor: colores.fondo }]}>
      {icono && <CajaIcono nombre={icono} />}
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={estilos.filaTitulo}>{titulo}</Text>
        {detalle && <Text style={estilos.filaDetalle}>{detalle}</Text>}
      </View>
      {derecha}
      {onPress && <Icono nombre="chevron-forward" color={colores.marcador} tam={18} />}
    </Pressable>
  );
}

export function Titulo({ children }: { children: ReactNode }) {
  return <Text style={estilos.titulo}>{children}</Text>;
}

// Rótulo chico arriba de cada grupo de contenido.
export function Seccion({ children }: { children: ReactNode }) {
  return <Text style={estilos.seccion}>{children}</Text>;
}

export function Texto({ children, suave }: { children: ReactNode; suave?: boolean }) {
  return <Text style={[estilos.texto, suave && estilos.textoSuave]}>{children}</Text>;
}

// Etiqueta arriba de un campo de formulario.
export function Campo({ etiqueta, children }: { etiqueta: string; children: ReactNode }) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={estilos.campoEtiqueta}>{etiqueta}</Text>
      {children}
    </View>
  );
}

type BotonProps = {
  titulo: string;
  onPress: () => void;
  icono?: NombreIcono;
  secundario?: boolean; // blanco con borde fino
  acento?: boolean; // verde: la acción principal de la pantalla
  chico?: boolean;
  deshabilitado?: boolean;
};

export function Boton({ titulo, onPress, icono, secundario, acento, chico, deshabilitado }: BotonProps) {
  const colorTexto = secundario ? colores.primario : '#fff';
  return (
    <Pressable
      onPress={onPress}
      disabled={deshabilitado}
      accessibilityRole="button"
      style={({ pressed }) => [
        estilos.boton,
        chico && estilos.botonChico,
        acento && { backgroundColor: colores.acento },
        secundario && estilos.botonSecundario,
        pressed && { opacity: 0.8 },
        deshabilitado && { opacity: 0.4 },
      ]}>
      {icono && <Icono nombre={icono} color={colorTexto} tam={chico ? 16 : 18} />}
      <Text style={[estilos.botonTexto, chico && { fontSize: 14 }, { color: colorTexto }]}>
        {titulo}
      </Text>
    </Pressable>
  );
}

export function Chip({
  texto,
  icono,
  activo,
  onPress,
}: {
  texto: string;
  icono?: NombreIcono;
  activo: boolean;
  onPress: () => void;
}) {
  const color = activo ? '#fff' : colores.texto;
  return (
    <Pressable onPress={onPress} style={[estilos.chip, activo && estilos.chipActivo]}>
      {icono && <Icono nombre={icono} color={color} tam={16} />}
      <Text style={[estilos.chipTexto, { color }]}>{texto}</Text>
    </Pressable>
  );
}

type EstiloPastilla = { texto: string; color: string; fondo: string };

// Etiqueta chica de color para los estados.
export function Pastilla({ texto, color, fondo }: EstiloPastilla) {
  return (
    <View style={[estilos.pastilla, { backgroundColor: fondo }]}>
      <Text style={[estilos.pastillaTexto, { color }]}>{texto}</Text>
    </View>
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

export const ESTILO_ESTADO: Record<EstadoPermiso, EstiloPastilla> = {
  cargando: { texto: 'Cargando', color: colores.suave, fondo: colores.primarioClaro },
  concedido: { texto: 'Concedido', color: colores.verde, fondo: colores.verdeClaro },
  preguntable: { texto: 'Preguntable', color: colores.madera, fondo: colores.maderaClara },
  bloqueado: { texto: 'Bloqueado', color: colores.rojo, fondo: colores.rojoClaro },
};

export const ESTILO_REPORTE: Record<EstadoReporte, EstiloPastilla> = {
  pendiente: { texto: 'Pendiente', color: colores.primario, fondo: colores.primarioClaro },
  'en curso': { texto: 'En curso', color: colores.madera, fondo: colores.maderaClara },
  resuelto: { texto: 'Resuelto', color: colores.verde, fondo: colores.verdeClaro },
};

export function EtiquetaEstado({ estado }: { estado: EstadoPermiso }) {
  return <Pastilla {...ESTILO_ESTADO[estado]} />;
}

const LINEA = StyleSheet.hairlineWidth;

export const estilos = StyleSheet.create({
  pantalla: { padding: 16, gap: 12, backgroundColor: colores.fondo, flexGrow: 1 },
  cajaIcono: { backgroundColor: colores.primarioClaro, alignItems: 'center', justifyContent: 'center' },
  botonIcono: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(28,39,51,0.6)', // oscuro: se lee tanto sobre la foto como sobre el azul
  },
  encabezado: {
    marginTop: -16,
    marginHorizontal: -16,
    marginBottom: 4,
    paddingHorizontal: 20,
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colores.primario,
  },
  encabezadoTitulo: { color: '#fff', fontSize: 26, fontWeight: '700', letterSpacing: -0.3 },
  encabezadoSubtitulo: { color: colores.crema, fontSize: 14, lineHeight: 20, marginTop: 4 },
  tarjeta: {
    backgroundColor: colores.tarjeta,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colores.borde,
    padding: 16,
    gap: 12,
  },
  lista: {
    backgroundColor: colores.tarjeta,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colores.borde,
    overflow: 'hidden',
  },
  separador: { height: Math.max(LINEA, 1), backgroundColor: colores.borde, marginLeft: 16 },
  fila: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, minHeight: 60 },
  filaTitulo: { fontSize: 16, fontWeight: '600', color: colores.texto },
  filaDetalle: { fontSize: 14, lineHeight: 19, color: colores.suave },
  titulo: { fontSize: 18, fontWeight: '700', color: colores.texto },
  seccion: {
    fontSize: 13,
    fontWeight: '600',
    color: colores.suave,
    marginTop: 12,
    marginLeft: 4,
  },
  texto: { fontSize: 15, color: colores.texto, lineHeight: 22 },
  textoSuave: { fontSize: 14, lineHeight: 20, color: colores.suave },
  campoEtiqueta: { fontSize: 13, fontWeight: '600', color: colores.suave },
  boton: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: colores.primario,
    minHeight: 48,
    paddingHorizontal: 18,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  botonChico: { minHeight: 36, paddingHorizontal: 14, borderRadius: 8, alignSelf: 'flex-start' },
  botonSecundario: { backgroundColor: '#fff', borderWidth: 1, borderColor: colores.bordeFuerte },
  botonTexto: { fontWeight: '600', fontSize: 16 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: 38,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colores.bordeFuerte,
    backgroundColor: '#fff',
  },
  chipActivo: { backgroundColor: colores.primario, borderColor: colores.primario },
  chipTexto: { fontSize: 14, fontWeight: '500', textTransform: 'capitalize' },
  grupo: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  centro: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 24,
    backgroundColor: colores.fondo,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: colores.bordeFuerte,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: 15,
    color: colores.texto,
  },
  pastilla: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  pastillaTexto: { fontSize: 12, fontWeight: '600' },
});
