// Ruta: /avisos  (tab "Avisos")
// Bandeja dentro de la app: es la ALTERNATIVA si se deniegan las notificaciones.
// Los avisos llegan acá siempre, haya o no permiso.

import { router } from 'expo-router';
import { View } from 'react-native';

import {
  BotonIcono,
  colores,
  Encabezado,
  Fila,
  Icono,
  Lista,
  Pantalla,
  Tarjeta,
  Texto,
  Titulo,
} from '@/components/ui';
import { useApp } from '@/lib/store';

export default function Avisos() {
  const { avisos } = useApp();

  return (
    <Pantalla>
      <Encabezado
        titulo="Avisos"
        subtitulo="Llegan acá aunque las notificaciones estén apagadas."
        accion={
          <BotonIcono
            nombre="settings-outline"
            etiqueta="Ajustes de avisos"
            onPress={() => router.push('/ajustes-app')}
          />
        }
      />

      {avisos.length === 0 ? (
        <Tarjeta>
          <View style={{ alignItems: 'center', gap: 8, paddingVertical: 16 }}>
            <Icono nombre="mail-open-outline" color={colores.marcador} tam={36} />
            <Titulo>No tenés avisos</Titulo>
            <Texto suave>Probá «Simular resolución» en un reporte.</Texto>
          </View>
        </Tarjeta>
      ) : (
        <Lista>
          {avisos.map((a) => (
            <Fila
              key={a.id}
              icono="checkmark-circle"
              titulo={a.titulo}
              detalle={`${a.cuerpo}\n${new Date(a.fecha).toLocaleString()}`}
              onPress={() => router.push({ pathname: '/reporte/[id]', params: { id: a.reporteId } })}
            />
          ))}
        </Lista>
      )}
    </Pantalla>
  );
}
