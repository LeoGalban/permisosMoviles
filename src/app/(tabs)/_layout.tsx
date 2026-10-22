import { Tabs } from 'expo-router';
import { Text } from 'react-native';

import { colores } from '@/components/ui';

function Icono({ emoji }: { emoji: string }) {
  return <Text style={{ fontSize: 20 }}>{emoji}</Text>;
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: colores.primario },
        headerTintColor: '#fff',
        tabBarActiveTintColor: colores.primario,
      }}>
      <Tabs.Screen
        name="index"
        options={{ title: 'Reportes', tabBarIcon: () => <Icono emoji="🛠️" /> }}
      />
      <Tabs.Screen
        name="avisos"
        options={{ title: 'Avisos', tabBarIcon: () => <Icono emoji="🔔" /> }}
      />
      <Tabs.Screen
        name="permisos"
        options={{ title: 'Permisos', tabBarIcon: () => <Icono emoji="🔐" /> }}
      />
    </Tabs>
  );
}
