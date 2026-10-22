// Ruta: /ajustes-app
// El permiso de notificaciones se pide ÚNICAMENTE al activar este interruptor (en contexto).

import { Switch, View } from 'react-native';

import { PermisoBloqueado } from '@/components/PermisoBloqueado';
import { colores, estilos, Pantalla, Tarjeta, Texto } from '@/components/ui';
import { usePermiso } from '@/hooks/usePermiso';
import { usarConPermiso } from '@/lib/permisos';
import { setAvisarResolucion, useApp } from '@/lib/store';

export default function AjustesApp() {
  const { avisarResolucion } = useApp();
  const { estado, matiz } = usePermiso('notificaciones');

  // El interruptor solo se ve prendido si la persona lo quiere Y hay permiso.
  const activo = avisarResolucion && estado === 'concedido';

  function cambiar(valor: boolean) {
    if (valor) {
      // Si no hay permiso, primero abre la pantalla previa y después el diálogo del sistema.
      usarConPermiso('notificaciones', () => setAvisarResolucion(true));
    } else {
      setAvisarResolucion(false);
    }
  }

  return (
    <Pantalla>
      <Tarjeta>
        <View style={[estilos.fila, { alignItems: 'center', justifyContent: 'space-between' }]}>
          <View style={{ flex: 1 }}>
            <Texto>Avisarme cuando se resuelva mi reporte</Texto>
          </View>
          <Switch
            value={activo}
            onValueChange={cambiar}
            disabled={estado === 'cargando' || estado === 'bloqueado'}
            trackColor={{ true: colores.primario }}
          />
        </View>
        {matiz && <Texto suave>Modo: {matiz}</Texto>}
        <Texto suave>
          Aunque esté apagado, los avisos siempre aparecen en la pestaña «Avisos».
        </Texto>
      </Tarjeta>

      {estado === 'bloqueado' && <PermisoBloqueado recurso="notificaciones" />}
    </Pantalla>
  );
}
