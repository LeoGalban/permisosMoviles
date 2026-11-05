// Ruta: /   (tab "Reportes") — no pide ningún permiso.

import { router } from 'expo-router';
import { Text, View } from 'react-native';

import { Portada } from '@/components/Portada';
import {
  Boton,
  colores,
  ESTILO_REPORTE,
  Fila,
  Lista,
  Pantalla,
  Pastilla,
  Seccion,
  Tarjeta,
  Texto,
} from '@/components/ui';
import { ICONO_CATEGORIA, useApp, type EstadoReporte } from '@/lib/store';

const ESTADOS: EstadoReporte[] = ['pendiente', 'en curso', 'resuelto'];

export default function Inicio() {
  const { reportes } = useApp();

  return (
    <Pantalla>
      <Portada />

      {/* Resumen: cuántos reportes hay en cada estado */}
      <Tarjeta>
        <View style={{ flexDirection: 'row' }}>
          {ESTADOS.map((estado) => (
            <View key={estado} style={{ flex: 1, alignItems: 'center', gap: 2 }}>
              <Text style={{ fontSize: 24, fontWeight: '700', color: ESTILO_REPORTE[estado].color }}>
                {reportes.filter((r) => r.estado === estado).length}
              </Text>
              <Text style={{ fontSize: 13, color: colores.suave }}>{ESTILO_REPORTE[estado].texto}</Text>
            </View>
          ))}
        </View>
      </Tarjeta>

      <Boton titulo="Nuevo reporte" icono="add" acento onPress={() => router.push('/reporte/nuevo')} />

      <Seccion>Mis reportes</Seccion>
      {reportes.length === 0 ? (
        <Tarjeta>
          <Texto suave>Todavía no hiciste ningún reporte.</Texto>
        </Tarjeta>
      ) : (
        <Lista>
          {reportes.map((r) => (
            <Fila
              key={r.id}
              icono={ICONO_CATEGORIA[r.categoria]}
              titulo={r.titulo}
              detalle={`Aula ${r.aula || '—'} · ${r.categoria}`}
              derecha={<Pastilla {...ESTILO_REPORTE[r.estado]} />}
              onPress={() => router.push({ pathname: '/reporte/[id]', params: { id: r.id } })}
            />
          ))}
        </Lista>
      )}
    </Pantalla>
  );
}
