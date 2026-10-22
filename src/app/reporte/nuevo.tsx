// Ruta: /reporte/nuevo
// Al ABRIR esta pantalla no se pide ningún permiso. Cada permiso se pide recién
// cuando la persona toca la función que lo necesita.

import { Image } from 'expo-image';
import { router } from 'expo-router';
import { TextInput, View } from 'react-native';

import { Boton, Chip, estilos, Pantalla, Tarjeta, Texto, Titulo } from '@/components/ui';
import { usarConPermiso } from '@/lib/permisos';
import { CATEGORIAS, editarBorrador, guardarReporte, useApp } from '@/lib/store';

export default function NuevoReporte() {
  const { borrador } = useApp();

  function guardar() {
    const reporte = guardarReporte();
    router.replace({ pathname: '/reporte/[id]', params: { id: reporte.id } });
  }

  return (
    <Pantalla>
      <Tarjeta>
        <Titulo>Datos</Titulo>
        <TextInput
          style={estilos.input}
          placeholder="Título (ej: canilla que pierde)"
          value={borrador.titulo}
          onChangeText={(titulo) => editarBorrador({ titulo })}
        />
        <TextInput
          style={[estilos.input, { minHeight: 70 }]}
          placeholder="Descripción"
          multiline
          value={borrador.descripcion}
          onChangeText={(descripcion) => editarBorrador({ descripcion })}
        />
        {/* Alternativa a la cámara: el aula se puede escribir a mano */}
        <TextInput
          style={estilos.input}
          placeholder="Aula (escribila o escaneá el QR)"
          autoCapitalize="characters"
          value={borrador.aula}
          onChangeText={(aula) => editarBorrador({ aula })}
        />
        <Boton
          titulo="📷 Escanear QR del aula"
          secundario
          onPress={() => usarConPermiso('camara', () => router.push('/reporte/escanear'))}
        />
      </Tarjeta>

      <Tarjeta>
        <Titulo>Categoría</Titulo>
        <Texto suave>Elegí una:</Texto>
        <ChipsCategoria />
      </Tarjeta>

      <Tarjeta>
        <Titulo>Foto</Titulo>
        {borrador.fotoUri ? (
          <Image source={{ uri: borrador.fotoUri }} style={{ height: 160, borderRadius: 8 }} />
        ) : (
          <Texto suave>Sin foto.</Texto>
        )}
        <Boton titulo="🖼️ Adjuntar foto" secundario onPress={() => router.push('/reporte/foto')} />
      </Tarjeta>

      <Tarjeta>
        <Titulo>Ubicación</Titulo>
        <Texto suave>
          {borrador.ubicacion
            ? borrador.ubicacion.aproximada
              ? 'Ubicación aproximada'
              : `${borrador.ubicacion.latitud.toFixed(5)}, ${borrador.ubicacion.longitud.toFixed(5)}`
            : (borrador.sector ?? 'Sin marcar.')}
        </Texto>
        <Boton
          titulo="📍 Marcar ubicación"
          secundario
          onPress={() => router.push('/reporte/ubicacion')}
        />
      </Tarjeta>

      <Boton titulo="Guardar reporte" onPress={guardar} deshabilitado={!borrador.titulo.trim()} />
    </Pantalla>
  );
}

function ChipsCategoria() {
  const { borrador } = useApp();
  return (
    <View style={estilos.fila}>
      {CATEGORIAS.map((c) => (
        <Chip
          key={c}
          texto={c}
          activo={borrador.categoria === c}
          onPress={() => editarBorrador({ categoria: c })}
        />
      ))}
    </View>
  );
}
