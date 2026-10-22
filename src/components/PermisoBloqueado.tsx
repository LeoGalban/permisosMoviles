// Aviso que se muestra cuando un permiso está BLOQUEADO (canAskAgain = false).
// El sistema ya no va a mostrar el diálogo: lo único que queda es mandar a Ajustes.

import { abrirAjustes, caminoEnAjustes, INFO, type Recurso } from '@/lib/permisos';

import { Boton, Tarjeta, Texto, Titulo } from './ui';

export function PermisoBloqueado({ recurso }: { recurso: Recurso }) {
  return (
    <Tarjeta>
      <Titulo>{INFO[recurso].nombre}: bloqueado</Titulo>
      <Texto>Para activarlo tenés que ir a los Ajustes del teléfono:</Texto>
      <Texto suave>{caminoEnAjustes(recurso)}</Texto>
      <Texto suave>{INFO[recurso].alternativa}</Texto>
      <Boton titulo="Abrir Ajustes" onPress={abrirAjustes} />
    </Tarjeta>
  );
}
