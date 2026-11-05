// Aviso que se muestra cuando un permiso está BLOQUEADO (canAskAgain = false).
// El sistema ya no va a mostrar el diálogo: lo único que queda es mandar a Ajustes.

import { Text, View } from 'react-native';

import { abrirAjustes, caminoEnAjustes, INFO, type Recurso } from '@/lib/permisos';

import { Boton, colores, Tarjeta, Texto, Titulo } from './ui';

export function PermisoBloqueado({ recurso }: { recurso: Recurso }) {
  return (
    <Tarjeta color={colores.rojo}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <Text style={{ fontSize: 30 }}>⛔</Text>
        <Titulo>{INFO[recurso].nombre} bloqueada</Titulo>
      </View>
      <Texto>Para activarlo tenés que ir a los Ajustes del teléfono:</Texto>
      <Text
        style={{
          backgroundColor: colores.rojoClaro,
          color: colores.rojo,
          fontWeight: '700',
          fontSize: 15,
          padding: 12,
          borderRadius: 10,
          overflow: 'hidden',
        }}>
        {caminoEnAjustes(recurso)}
      </Text>
      <Texto suave>💡 {INFO[recurso].alternativa}</Texto>
      <Boton titulo="⚙️  Abrir Ajustes" onPress={abrirAjustes} />
    </Tarjeta>
  );
}
