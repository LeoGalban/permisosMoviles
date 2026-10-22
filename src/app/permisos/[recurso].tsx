// Ruta: /permisos/[recurso]  (modal)
// PANTALLA PREVIA: se muestra ANTES del diálogo del sistema.
// - Beneficio en una frase + UN solo botón ("Continuar"). Sin "Ahora no" ni "Cerrar" (pauta 5.1.1(iv) de Apple).
// - Si el permiso está bloqueado, explica cómo habilitarlo y el botón pasa a ser "Abrir Ajustes".
// Nunca se abre sola: solo cuando la persona toca una función (no insistir).

import { router, useLocalSearchParams } from 'expo-router';

import { PermisoBloqueado } from '@/components/PermisoBloqueado';
import { Boton, Cargando, Pantalla, Tarjeta, Texto, Titulo } from '@/components/ui';
import { usePermiso } from '@/hooks/usePermiso';
import {
  descartarPendiente,
  ejecutarPendiente,
  esRecurso,
  INFO,
  type Recurso,
} from '@/lib/permisos';

export default function PantallaPrevia() {
  const { recurso } = useLocalSearchParams<{ recurso: string }>();

  if (!esRecurso(recurso)) {
    return (
      <Pantalla>
        <Texto>El permiso «{recurso}» no existe en esta app.</Texto>
      </Pantalla>
    );
  }
  return <Contenido recurso={recurso} />;
}

function Contenido({ recurso }: { recurso: Recurso }) {
  const { estado, pedir } = usePermiso(recurso);
  const info = INFO[recurso];

  async function continuar() {
    const respuesta = estado === 'concedido' ? null : await pedir(); // acá aparece el diálogo del sistema
    router.back();
    if (respuesta === null || respuesta.granted) {
      ejecutarPendiente(); // ej: abrir el escáner, sacar la foto, obtener la ubicación
    } else {
      descartarPendiente(); // dijo que no: la pantalla anterior ofrece la alternativa
    }
  }

  if (estado === 'cargando') return <Cargando />;

  if (estado === 'bloqueado') {
    return (
      <Pantalla>
        <PermisoBloqueado recurso={recurso} />
      </Pantalla>
    );
  }

  return (
    <Pantalla>
      <Tarjeta>
        <Titulo>{info.nombre}</Titulo>
        <Texto>{info.beneficio}</Texto>
        <Texto suave>Podés cambiar esta decisión cuando quieras desde Ajustes.</Texto>
        <Boton titulo="Continuar" onPress={continuar} />
      </Tarjeta>
    </Pantalla>
  );
}
