// Ruta: /ajustes-app
// El permiso de notificaciones se pide ÚNICAMENTE al activar este interruptor (en contexto).

import { Switch } from 'react-native';

import { PermisoBloqueado } from '@/components/PermisoBloqueado';
import { colores, Fila, Lista, Pantalla, Texto } from '@/components/ui';
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
      <Lista>
        <Fila
          icono="notifications-outline"
          titulo="Avisarme cuando se resuelva mi reporte"
          detalle={matiz ? `Modo: ${matiz}` : undefined}
          derecha={
            <Switch
              value={activo}
              onValueChange={cambiar}
              disabled={estado === 'cargando' || estado === 'bloqueado'}
              trackColor={{ true: colores.acento }}
            />
          }
        />
      </Lista>
      <Texto suave>Aunque esté apagado, los avisos siempre aparecen en la pestaña «Avisos».</Texto>

      {estado === 'bloqueado' && <PermisoBloqueado recurso="notificaciones" />}
    </Pantalla>
  );
}
