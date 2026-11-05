// Aviso que se muestra cuando un permiso está BLOQUEADO (canAskAgain = false).
// El sistema ya no va a mostrar el diálogo: lo único que queda es mandar a Ajustes.

import { Text, View } from 'react-native';

import { abrirAjustes, caminoEnAjustes, INFO, type Recurso } from '@/lib/permisos';

import { Boton, colores, Icono, Tarjeta, Texto, Titulo } from './ui';

export function PermisoBloqueado({ recurso }: { recurso: Recurso }) {
  return (
    <Tarjeta>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Icono nombre="lock-closed" color={colores.rojo} tam={20} />
        <View style={{ flex: 1 }}>
          <Titulo>{INFO[recurso].nombre}: bloqueado</Titulo>
        </View>
      </View>
      <Texto>Para activarlo tenés que ir a los Ajustes del teléfono:</Texto>
      <Text
        style={{
          backgroundColor: colores.fondo,
          color: colores.texto,
          fontWeight: '500',
          fontSize: 14,
          lineHeight: 20,
          padding: 12,
          borderRadius: 8,
          overflow: 'hidden',
        }}>
        {caminoEnAjustes(recurso)}
      </Text>
      <Texto suave>{INFO[recurso].alternativa}</Texto>
      <Boton titulo="Abrir Ajustes" onPress={abrirAjustes} />
    </Tarjeta>
  );
}
