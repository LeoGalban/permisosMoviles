// Ruta: /   (tab "Reportes") — no pide ningún permiso.

import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import {
  Boton,
  colores,
  Encabezado,
  ESTILO_REPORTE,
  estilos,
  Pantalla,
  Pastilla,
  Tarjeta,
  Texto,
  Titulo,
} from '@/components/ui';
import { ICONO_CATEGORIA, useApp, type EstadoReporte } from '@/lib/store';

function Contador({ estado, cantidad }: { estado: EstadoReporte; cantidad: number }) {
  const { color, fondo } = ESTILO_REPORTE[estado];
  return (
    <View style={{ flex: 1, backgroundColor: fondo, borderRadius: 12, padding: 12, alignItems: 'center' }}>
      <Text style={{ fontSize: 28, fontWeight: '800', color }}>{cantidad}</Text>
      <Text style={{ fontSize: 13, fontWeight: '700', color }}>{estado.toUpperCase()}</Text>
    </View>
  );
}

export default function Inicio() {
  const { reportes } = useApp();
  const contar = (e: EstadoReporte) => reportes.filter((r) => r.estado === e).length;

  return (
    <Pantalla>
      <Encabezado
        icono="🏫"
        titulo="Mantenimiento IPF"
        subtitulo="Reportá desperfectos del edificio"
      />

      <View style={[estilos.fila, { flexWrap: 'nowrap' }]}>
        <Contador estado="pendiente" cantidad={contar('pendiente')} />
        <Contador estado="en curso" cantidad={contar('en curso')} />
        <Contador estado="resuelto" cantidad={contar('resuelto')} />
      </View>

      <Boton titulo="➕  Nuevo reporte" onPress={() => router.push('/reporte/nuevo')} />
      <Boton titulo="⚙️  Ajustes de avisos" secundario onPress={() => router.push('/ajustes-app')} />

      <Titulo>Mis reportes</Titulo>
      {reportes.length === 0 && <Texto suave>Todavía no hiciste ningún reporte.</Texto>}

      {reportes.map((r) => (
        <Pressable
          key={r.id}
          onPress={() => router.push({ pathname: '/reporte/[id]', params: { id: r.id } })}>
          <Tarjeta color={ESTILO_REPORTE[r.estado].color}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Text style={{ fontSize: 32 }}>{ICONO_CATEGORIA[r.categoria]}</Text>
              <View style={{ flex: 1, gap: 4 }}>
                <Titulo>{r.titulo}</Titulo>
                <Texto suave>
                  Aula {r.aula || '—'} · {r.categoria}
                </Texto>
              </View>
              <Text style={{ fontSize: 24, color: colores.suave }}>›</Text>
            </View>
            <Pastilla {...ESTILO_REPORTE[r.estado]} />
          </Tarjeta>
        </Pressable>
      ))}
    </Pantalla>
  );
}
