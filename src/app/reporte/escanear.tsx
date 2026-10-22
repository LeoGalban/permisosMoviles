// Ruta: /reporte/escanear
// Escáner con LOS CUATRO ESTADOS: cargando → concedido → preguntable → bloqueado.
// (Es la versión corregida del ejercicio E1.)

import { CameraView, useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { Text, TextInput, View } from 'react-native';

import { PermisoBloqueado } from '@/components/PermisoBloqueado';
import { Boton, Cargando, estilos, Pantalla, Tarjeta, Texto, Titulo } from '@/components/ui';
import { useRevisarAlVolver } from '@/hooks/useRevisarAlVolver';
import { estadoDe, INFO } from '@/lib/permisos';
import { editarBorrador, useApp } from '@/lib/store';

export default function Escanear() {
  const [permiso, pedirPermiso, consultarPermiso] = useCameraPermissions();
  // Si vuelve de Ajustes, consultamos de nuevo (los hooks de Expo no se enteran solos).
  useRevisarAlVolver(consultarPermiso);

  const yaLeyo = useRef(false);
  const estado = estadoDe(permiso);

  function completarAula(codigo: string) {
    if (yaLeyo.current) return; // el escáner dispara muchas veces por segundo
    yaLeyo.current = true;
    editarBorrador({ aula: codigo.trim().toUpperCase() });
    router.back();
  }

  // 1) CARGANDO: permiso todavía es null
  if (estado === 'cargando') return <Cargando />;

  // 2) CONCEDIDO: mostramos la cámara
  if (estado === 'concedido') {
    return (
      <View style={{ flex: 1 }}>
        <CameraView
          style={{ flex: 1 }}
          facing="back"
          barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
          onBarcodeScanned={({ data }) => completarAula(data)}
        />
        <Text style={{ padding: 16, backgroundColor: '#000', color: '#fff', textAlign: 'center' }}>
          Apuntá al QR pegado en la puerta del aula.
        </Text>
      </View>
    );
  }

  return (
    <Pantalla>
      {/* 3) PREGUNTABLE: explicación + "Continuar" (canAskAgain = true) */}
      {estado === 'preguntable' && (
        <Tarjeta>
          <Titulo>Escanear el QR del aula</Titulo>
          <Texto>{INFO.camara.beneficio}</Texto>
          <Texto suave>Podés cambiarlo cuando quieras desde Ajustes.</Texto>
          <Boton titulo="Continuar" onPress={pedirPermiso} />
        </Tarjeta>
      )}

      {/* 4) BLOQUEADO: aviso + "Abrir Ajustes" (canAskAgain = false) */}
      {estado === 'bloqueado' && <PermisoBloqueado recurso="camara" />}

      {/* Alternativa: escribir el código a mano. La app nunca se bloquea. */}
      <CodigoManual onListo={completarAula} />
    </Pantalla>
  );
}

function CodigoManual({ onListo }: { onListo: (codigo: string) => void }) {
  const { borrador } = useApp();
  const [codigo, setCodigo] = useState(borrador.aula);

  return (
    <Tarjeta>
      <Titulo>O escribí el código a mano</Titulo>
      <TextInput
        style={estilos.input}
        placeholder="Ej: A12"
        autoCapitalize="characters"
        value={codigo}
        onChangeText={setCodigo}
      />
      <Boton
        titulo="Usar este código"
        secundario
        deshabilitado={!codigo.trim()}
        onPress={() => onListo(codigo)}
      />
    </Tarjeta>
  );
}
