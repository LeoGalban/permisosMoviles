import { Tabs } from 'expo-router';
import type { ColorValue } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colores, Icono, type NombreIcono } from '@/components/ui';

type PropsIcono = { focused: boolean; color: ColorValue };

function iconoDe(activo: NombreIcono, inactivo: NombreIcono) {
  return function IconoTab({ focused, color }: PropsIcono) {
    return <Icono nombre={focused ? activo : inactivo} color={color} tam={22} />;
  };
}

export default function TabsLayout() {
  // Sumamos la zona segura de abajo para que no la tape la barra de gestos del celular.
  const { bottom } = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        // Cada pestaña dibuja su propio encabezado.
        headerShown: false,
        tabBarActiveTintColor: colores.primario,
        tabBarInactiveTintColor: colores.marcador,
        tabBarLabelStyle: { fontSize: 12, lineHeight: 16, fontWeight: '600' },
        tabBarStyle: {
          backgroundColor: colores.tarjeta,
          borderTopColor: colores.borde,
          height: 72 + bottom,
          paddingTop: 8,
          paddingBottom: 8 + bottom,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{ title: 'Reportes', tabBarIcon: iconoDe('construct', 'construct-outline') }}
      />
      <Tabs.Screen
        name="avisos"
        options={{ title: 'Avisos', tabBarIcon: iconoDe('notifications', 'notifications-outline') }}
      />
      <Tabs.Screen
        name="permisos"
        options={{ title: 'Permisos', tabBarIcon: iconoDe('lock-closed', 'lock-closed-outline') }}
      />
    </Tabs>
  );
}
