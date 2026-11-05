// Ruta: /permisos/[recurso]  (modal)
// PANTALLA PREVIA: se muestra ANTES del diálogo del sistema.
// - Beneficio en una frase + UN solo botón ("Continuar"). Sin "Ahora no" ni "Cerrar" (pauta 5.1.1(iv) de Apple).
// - Si el permiso está bloqueado, explica cómo habilitarlo y el botón pasa a ser "Abrir Ajustes".
// Nunca se abre sola: solo cuando la persona toca una función (no insistir).

import { router, useLocalSearchParams } from 'expo-router';

import { Text, View } from 'react-native';

import { PermisoBloqueado } from '@/components/PermisoBloqueado';
import { Boton, CajaIcono, Cargando, colores, Pantalla, Texto } from '@/components/ui';
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
      <View style={{ alignItems: 'center', gap: 12, paddingTop: 32, paddingBottom: 20 }}>
        <CajaIcono nombre={info.icono} tam={32} />
        <Text style={{ fontSize: 22, fontWeight: '700', color: colores.texto }}>{info.nombre}</Text>
        <Text
          style={{
            fontSize: 16,
            lineHeight: 24,
            textAlign: 'center',
            color: colores.texto,
            maxWidth: 340,
          }}>
          {info.beneficio}
        </Text>
      </View>
      <Boton titulo="Continuar" onPress={continuar} />
      <Text style={{ textAlign: 'center', color: colores.suave, fontSize: 13, lineHeight: 18 }}>
        Podés cambiar esta decisión cuando quieras desde Ajustes.
      </Text>
    </Pantalla>
  );
}
