import { Tabs } from 'expo-router';
import { Text } from 'react-native';

import { colores } from '@/components/ui';

function Icono({ emoji, activo }: { emoji: string; activo: boolean }) {
  return <Text style={{ fontSize: 24, opacity: activo ? 1 : 0.45 }}>{emoji}</Text>;
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: colores.primarioOscuro },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: '800', fontSize: 20 },
        tabBarActiveTintColor: colores.primario,
        tabBarInactiveTintColor: colores.suave,
        tabBarLabelStyle: { fontSize: 13, fontWeight: '700' },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Reportes',
          tabBarIcon: ({ focused }) => <Icono emoji="🛠️" activo={focused} />,
        }}
      />
      <Tabs.Screen
        name="avisos"
        options={{
          title: 'Avisos',
          tabBarIcon: ({ focused }) => <Icono emoji="🔔" activo={focused} />,
        }}
      />
      <Tabs.Screen
        name="permisos"
        options={{
          title: 'Permisos',
          tabBarIcon: ({ focused }) => <Icono emoji="🔐" activo={focused} />,
        }}
      />
    </Tabs>
  );
}
