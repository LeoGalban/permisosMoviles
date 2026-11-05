// Ruta: /reporte/foto
// - "Sacar foto": usa la CÁMARA → necesita permiso (se pide al tocar el botón).
// - "Elegir de la galería": usa el SELECTOR DEL SISTEMA → NO necesita permiso.
//   La persona elige una foto en una pantalla del sistema y la app solo recibe esa foto,
//   nunca ve el resto de la galería. Por eso no declaramos READ_MEDIA_IMAGES.

import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { View } from 'react-native';

import { Boton, colores, Fila, Icono, Lista, Pantalla, Tarjeta, Texto } from '@/components/ui';
import { usePermiso } from '@/hooks/usePermiso';
import { usarConPermiso } from '@/lib/permisos';
import { editarBorrador, useApp } from '@/lib/store';

const OPCIONES: ImagePicker.ImagePickerOptions = { mediaTypes: ['images'], quality: 0.5 };

export default function Foto() {
  const { borrador } = useApp();
  const { estado } = usePermiso('camara');

  function guardar(resultado: ImagePicker.ImagePickerResult) {
    if (!resultado.canceled) editarBorrador({ fotoUri: resultado.assets[0].uri });
  }

  async function sacarFoto() {
    guardar(await ImagePicker.launchCameraAsync(OPCIONES));
  }

  async function elegirDeGaleria() {
    // Sin pedir ningún permiso de galería.
    guardar(await ImagePicker.launchImageLibraryAsync(OPCIONES));
  }

  return (
    <Pantalla>
      {borrador.fotoUri ? (
        <Image
          source={{ uri: borrador.fotoUri }}
          style={{ height: 240, borderRadius: 12 }}
          contentFit="cover"
        />
      ) : (
        <Tarjeta>
          <View style={{ alignItems: 'center', gap: 8, paddingVertical: 24 }}>
            <Icono nombre="image-outline" color={colores.marcador} tam={36} />
            <Texto suave>Todavía no adjuntaste ninguna foto.</Texto>
          </View>
        </Tarjeta>
      )}

      <Lista>
        <Fila
          icono="camera-outline"
          titulo="Sacar foto"
          detalle={
            estado === 'bloqueado'
              ? 'Cámara bloqueada: podés elegirla de la galería'
              : 'Usa la cámara del teléfono'
          }
          onPress={() => usarConPermiso('camara', sacarFoto)}
        />
        <Fila
          icono="images-outline"
          titulo="Elegir de la galería"
          detalle="No requiere permisos"
          onPress={elegirDeGaleria}
        />
      </Lista>

      {borrador.fotoUri && <Boton titulo="Listo" acento onPress={() => router.back()} />}
    </Pantalla>
  );
}
