// Ruta: /reporte/foto
// - "Sacar foto": usa la CÁMARA → necesita permiso (se pide al tocar el botón).
// - "Elegir de la galería": usa el SELECTOR DEL SISTEMA → NO necesita permiso.
//   La persona elige una foto en una pantalla del sistema y la app solo recibe esa foto,
//   nunca ve el resto de la galería. Por eso no declaramos READ_MEDIA_IMAGES.

import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';

import { Boton, Pantalla, Tarjeta, Texto, Titulo } from '@/components/ui';
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
      <Tarjeta>
        <Titulo>Foto del desperfecto</Titulo>
        {borrador.fotoUri ? (
          <Image source={{ uri: borrador.fotoUri }} style={{ height: 220, borderRadius: 8 }} />
        ) : (
          <Texto suave>Todavía no adjuntaste ninguna foto.</Texto>
        )}
      </Tarjeta>

      <Boton titulo="📷 Sacar foto" onPress={() => usarConPermiso('camara', sacarFoto)} />
      {estado === 'bloqueado' && (
        <Texto suave>La cámara está bloqueada. Podés elegir la foto desde la galería.</Texto>
      )}

      <Boton titulo="🖼️ Elegir de la galería" secundario onPress={elegirDeGaleria} />

      {borrador.fotoUri && <Boton titulo="Listo" onPress={() => router.back()} />}
    </Pantalla>
  );
}
