// Ruta: /reporte/nuevo
// Al ABRIR esta pantalla no se pide ningún permiso. Cada permiso se pide recién
// cuando la persona toca la función que lo necesita.

import { Image } from 'expo-image';
import { router } from 'expo-router';
import { TextInput, View } from 'react-native';

import {
  Boton,
  Campo,
  Chip,
  colores,
  estilos,
  Fila,
  Lista,
  Pantalla,
  Seccion,
  Tarjeta,
} from '@/components/ui';
import { usarConPermiso } from '@/lib/permisos';
import { CATEGORIAS, editarBorrador, guardarReporte, ICONO_CATEGORIA, useApp } from '@/lib/store';

export default function NuevoReporte() {
  const { borrador } = useApp();
  const u = borrador.ubicacion;

  function guardar() {
    const reporte = guardarReporte();
    router.replace({ pathname: '/reporte/[id]', params: { id: reporte.id } });
  }

  return (
    <Pantalla>
      <Tarjeta>
        <Campo etiqueta="Título">
          <TextInput
            style={estilos.input}
            placeholder="Ej: canilla que pierde"
            placeholderTextColor={colores.marcador}
            value={borrador.titulo}
            onChangeText={(titulo) => editarBorrador({ titulo })}
          />
        </Campo>
        <Campo etiqueta="Descripción">
          <TextInput
            style={[estilos.input, { minHeight: 80, textAlignVertical: 'top' }]}
            placeholder="Contanos qué pasa"
            placeholderTextColor={colores.marcador}
            multiline
            value={borrador.descripcion}
            onChangeText={(descripcion) => editarBorrador({ descripcion })}
          />
        </Campo>
        {/* Alternativa a la cámara: el aula se puede escribir a mano */}
        <Campo etiqueta="Aula">
          <TextInput
            style={estilos.input}
            placeholder="Escribila o escaneá el QR"
            placeholderTextColor={colores.marcador}
            autoCapitalize="characters"
            value={borrador.aula}
            onChangeText={(aula) => editarBorrador({ aula })}
          />
        </Campo>
        <Campo etiqueta="Categoría">
          <View style={estilos.grupo}>
            {CATEGORIAS.map((c) => (
              <Chip
                key={c}
                texto={c}
                icono={ICONO_CATEGORIA[c]}
                activo={borrador.categoria === c}
                onPress={() => editarBorrador({ categoria: c })}
              />
            ))}
          </View>
        </Campo>
      </Tarjeta>

      <Seccion>Información adicional</Seccion>
      <Lista>
        <Fila
          icono="qr-code-outline"
          titulo="Escanear QR del aula"
          detalle="Completa el aula automáticamente"
          onPress={() => usarConPermiso('camara', () => router.push('/reporte/escanear'))}
        />
        <Fila
          icono="image-outline"
          titulo="Adjuntar foto"
          detalle={borrador.fotoUri ? 'Foto adjunta' : 'Sin foto'}
          derecha={
            borrador.fotoUri ? (
              <Image source={{ uri: borrador.fotoUri }} style={{ width: 40, height: 40, borderRadius: 6 }} />
            ) : undefined
          }
          onPress={() => router.push('/reporte/foto')}
        />
        <Fila
          icono="location-outline"
          titulo="Marcar ubicación"
          detalle={
            u
              ? u.aproximada
                ? 'Ubicación aproximada'
                : `${u.latitud.toFixed(5)}, ${u.longitud.toFixed(5)}`
              : (borrador.sector ?? 'Sin marcar')
          }
          onPress={() => router.push('/reporte/ubicacion')}
        />
      </Lista>

      <Boton titulo="Guardar reporte" acento onPress={guardar} deshabilitado={!borrador.titulo.trim()} />
    </Pantalla>
  );
}
