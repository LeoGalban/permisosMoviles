// Portada de la pantalla de inicio: la foto del instituto de punta a punta,
// con el escudo y el nombre de la app sobre una franja oscura.

import { Image } from 'expo-image';
import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BotonIcono, colores } from './ui';

export function Portada() {
  const { top } = useSafeAreaInsets();
  return (
    <View style={estilos.portada}>
      <Image
        source={require('@/assets/images/ipf-edificio.webp')}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        accessibilityLabel="Entrada del Instituto Politécnico Formosa"
      />
      <View style={[estilos.accion, { top: top + 10 }]}>
        <BotonIcono
          nombre="settings-outline"
          etiqueta="Ajustes de avisos"
          onPress={() => router.push('/ajustes-app')}
        />
      </View>
      <View style={estilos.franja}>
        <Image
          source={require('@/assets/images/ipf-escudo.png')}
          style={estilos.escudo}
          contentFit="contain"
          accessibilityLabel="Escudo del IPF"
        />
        <View style={{ flex: 1 }}>
          <Text style={estilos.titulo}>Mantenimiento IPF</Text>
          <Text style={estilos.subtitulo}>Instituto Politécnico Formosa</Text>
        </View>
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  portada: {
    marginTop: -16,
    marginHorizontal: -16,
    marginBottom: 4,
    height: 250,
    justifyContent: 'flex-end',
    backgroundColor: colores.primario,
  },
  accion: { position: 'absolute', right: 14 },
  franja: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(44,62,80,0.92)',
  },
  escudo: { width: 46, height: 42 },
  titulo: { color: '#fff', fontSize: 20, fontWeight: '700', letterSpacing: -0.2 },
  subtitulo: { color: colores.crema, fontSize: 13, marginTop: 1 },
});
