# Mantenimiento IPF

App para que alumnos y docentes del Instituto Politécnico Formosa **reporten desperfectos del edificio** (una luz quemada, una canilla que pierde, un proyector roto) y reciban un aviso cuando se resuelven.

TP N° 3 — Permisos móviles · Taller Complementario React Native II
**Alumno:** Leonel Galban · **Stack:** Expo SDK 57 · Expo Router · TypeScript

Las respuestas de las Partes A a F están en [RESPUESTAS.md](RESPUESTAS.md).

---

## Cómo correrla

```bash
npm install
npx expo start            # probar en Expo Go (escanear el QR)
npx expo run:android      # development build en Android (necesita Android Studio)
```

---

## Árbol de carpetas de `src/app`

```
src/app/
├── _layout.tsx              Stack principal (acá se define el modal)
├── (tabs)/                  grupo: el paréntesis NO aparece en la URL
│   ├── _layout.tsx          las 3 pestañas
│   ├── index.tsx            /                    Tab "Reportes"
│   ├── avisos.tsx           /avisos              Tab "Avisos"
│   └── permisos.tsx         /permisos            Tab "Permisos"
├── reporte/
│   ├── nuevo.tsx            /reporte/nuevo
│   ├── escanear.tsx         /reporte/escanear
│   ├── foto.tsx             /reporte/foto
│   ├── ubicacion.tsx        /reporte/ubicacion
│   └── [id].tsx             /reporte/[id]        (los corchetes = parámetro)
├── permisos/
│   └── [recurso].tsx        /permisos/[recurso]  presentation: "modal"
└── ajustes-app.tsx          /ajustes-app
```

Las rutas estáticas (`nuevo`, `escanear`, `foto`, `ubicacion`) tienen prioridad sobre `[id]`, por eso `/reporte/nuevo` no se confunde con un id.

### Resto del código

```
src/
├── components/   ui.tsx (botones, tarjetas…) · PermisoBloqueado.tsx
├── hooks/        usePermiso.ts (hook unificado) · useRevisarAlVolver.ts (AppState)
└── lib/          permisos.ts (toda la lógica de permisos) · ubicacion.ts
                  notificaciones.ts · store.ts (datos en memoria)
```

---

## Cómo funcionan los permisos en la app

```
Persona toca una función (ej: "Escanear QR")
        │
        ▼
usarConPermiso('camara', abrirEscaner)       ← src/lib/permisos.ts
        │  consulta con get…() (sin diálogo)
        ├── concedido   → abre el escáner directo
        └── no concedido → pantalla previa /permisos/camara (modal)
                              ├── preguntable → botón "Continuar" → diálogo del sistema
                              │        ├── Permitir → abre el escáner
                              │        └── No permitir → vuelve; queda la alternativa
                              └── bloqueado  → camino en Ajustes + botón "Abrir Ajustes"
```

El hook [`usePermiso(recurso)`](src/hooks/usePermiso.ts) devuelve `estado` (`'cargando' | 'concedido' | 'preguntable' | 'bloqueado'`), `parcial`, `matiz`, `pedir()` y `abrirAjustes()`. Se actualiza al entrar a la pantalla y **al volver de Ajustes** (con `AppState`).

La decisión entre "Continuar" y "Abrir Ajustes" la toma `estadoDe()` en [`src/lib/permisos.ts`](src/lib/permisos.ts), mirando **`granted`** y **`canAskAgain`**.

---

## Tabla de permisos

| Recurso | Módulo | Cuándo se pide | Alternativa si se deniega |
|---|---|---|---|
| Cámara (escanear QR) | `expo-camera` (`useCameraPermissions`) | Al tocar "Escanear QR del aula" | Escribir el código del aula a mano |
| Cámara (sacar foto) | `expo-image-picker` (`launchCameraAsync`) | Al tocar "Sacar foto" | Elegir la foto de la galería |
| Fotos (galería) | `expo-image-picker` (`launchImageLibraryAsync`) | **Nunca**: es el selector del sistema, no necesita permiso | — |
| Ubicación (primer plano) | `expo-location` | Al tocar "Usar mi ubicación actual" | Elegir el sector a mano (patio, pasillo, estacionamiento…) |
| Notificaciones | `expo-notifications` | Al activar el interruptor de `/ajustes-app` | Los avisos aparecen en la bandeja `/avisos` |

Ninguna pantalla pide permisos al abrirse, y la pantalla previa **nunca aparece sola**: solo cuando la persona toca la función (no insistir).

---

## Bloque `plugins` de `app.json` (comentado)

> JSON no acepta comentarios: esta versión comentada es solo para leer. El archivo real es [app.json](app.json).

```jsonc
"plugins": [
  "expo-router",
  ["expo-splash-screen", { ... }],

  // CÁMARA: texto de propósito propio (iOS) y SIN micrófono.
  ["expo-camera", {
    "cameraPermission": "Usamos tu cámara para leer el QR del aula y sacar la foto del desperfecto que reportás.",
    "microphonePermission": false,   // iOS: no se agrega NSMicrophoneUsageDescription
    "recordAudioAndroid": false      // Android: no se agrega RECORD_AUDIO
  }],

  // UBICACIÓN: solo "mientras se usa la app". Nada de segundo plano.
  ["expo-location", {
    "locationWhenInUsePermission": "Usamos tu ubicación para marcar en qué parte del edificio está el desperfecto que reportás.",
    "isIosBackgroundLocationEnabled": false,
    "isAndroidBackgroundLocationEnabled": false
  }],

  // IMAGE PICKER: usamos el selector del sistema, así que NO pedimos acceso a fotos.
  ["expo-image-picker", {
    "photosPermission": false,       // iOS: sin NSPhotoLibraryUsageDescription
    "cameraPermission": "Usamos tu cámara para leer el QR del aula y sacar la foto del desperfecto que reportás.",
    "microphonePermission": false    // sin micrófono (si no, agrega RECORD_AUDIO)
  }],

  // NOTIFICACIONES: en iOS no llevan texto de propósito. El canal "reportes"
  // se crea en código antes de pedir el permiso (src/lib/permisos.ts).
  "expo-notifications"
]
```

### `blockedPermissions` (Android) y por qué

| Permiso bloqueado | Por qué la app no lo necesita |
|---|---|
| `RECORD_AUDIO` | Nunca grabamos audio (escanear y sacar fotos no lo usan). |
| `SYSTEM_ALERT_WINDOW` | No dibujamos encima de otras apps. |
| `ACCESS_BACKGROUND_LOCATION` | La ubicación se usa solo con la app abierta. |
| `READ_MEDIA_IMAGES` | Usamos el selector de fotos del sistema (sin permiso). |
| `READ_MEDIA_VIDEO` | No usamos videos. |
| `READ_MEDIA_VISUAL_USER_SELECTED` | No accedemos a la galería (ni siquiera parcialmente). |
| `READ_EXTERNAL_STORAGE` | Lo agregan `expo-image-picker`, `expo-file-system` y `expo-image`, pero el selector del sistema no lo necesita. |
| `WRITE_EXTERNAL_STORAGE` | No guardamos archivos fuera de la carpeta de la app. |

---

## Auditoría del manifiesto (desafío opcional)

Resultado de `npx expo prebuild --clean --platform android` (`android/app/src/main/AndroidManifest.xml`) más los manifiestos de las librerías, que Android fusiona al compilar:

| Permiso | Quién lo agrega | ¿Queda? |
|---|---|---|
| `INTERNET` | React Native / `expo-file-system` / `expo-image` | ✅ Sí (necesario para cargar la app) |
| `CAMERA` | `expo-camera` y `expo-image-picker` | ✅ Sí |
| `ACCESS_COARSE_LOCATION` | `expo-location` | ✅ Sí |
| `ACCESS_FINE_LOCATION` | `expo-location` | ✅ Sí (la persona igual puede elegir "aproximada") |
| `POST_NOTIFICATIONS` | `expo-notifications` | ✅ Sí |
| `RECEIVE_BOOT_COMPLETED` | `expo-notifications` (reprogramar notificaciones al reiniciar) | ✅ Sí (de instalación) |
| `ACCESS_NETWORK_STATE` | `expo-image` | ✅ Sí (de instalación) |
| `VIBRATE` | Plantilla nativa que genera `expo prebuild` | ✅ Sí (de instalación) |
| `RECORD_AUDIO` | `expo-camera` / `expo-image-picker` por defecto | ❌ Quitado (`recordAudioAndroid` / `microphonePermission: false` + `blockedPermissions`) |
| `READ_EXTERNAL_STORAGE` | `expo-image-picker`, `expo-file-system`, `expo-image` | ❌ Quitado (`blockedPermissions`) |
| `WRITE_EXTERNAL_STORAGE` | `expo-image-picker`, `expo-file-system` | ❌ Quitado (`blockedPermissions`) |
| `SYSTEM_ALERT_WINDOW` | React Native, en el manifiesto de **debug** (menú de desarrollo) | ❌ Quitado (`blockedPermissions`) |
| `ACCESS_BACKGROUND_LOCATION`, `READ_MEDIA_*` | (ninguna, bloqueados por seguridad) | ❌ Quitados (`blockedPermissions`) |

En el manifiesto generado los quitados aparecen como `<uses-permission … tools:node="remove"/>`.

---

## Desafíos opcionales hechos

- ✅ **Auditoría del manifiesto** (tabla de arriba).
- ✅ **Bloqueo por plataforma**: [`PermisoBloqueado.tsx`](src/components/PermisoBloqueado.tsx) muestra el camino exacto en Ajustes según `Platform.OS` (`caminoEnAjustes()` en `src/lib/permisos.ts`).
- ➖ **Notificaciones provisionales**: el panel `/permisos` ya **detecta y muestra** el estado provisional de iOS (`matizDe()`), pero no se pide con `allowProvisional`.

---

## Capturas

> Reemplazar cada línea por la imagen: `![descripción](capturas/archivo.png)`

| Qué | Captura |
|---|---|
| Escáner – cargando | _pendiente_ |
| Escáner – concedido (cámara) | _pendiente_ |
| Escáner – preguntable ("Continuar") | _pendiente_ |
| Escáner – bloqueado ("Abrir Ajustes") | _pendiente_ |
| Ubicación concedida | _pendiente_ |
| Ubicación denegada (sector a mano) | _pendiente_ |
| Foto desde el selector | _pendiente_ |
| Notificación recibida | _pendiente_ |
| Panel de permisos antes de ir a Ajustes | _pendiente_ |
| Panel de permisos después de volver de Ajustes | _pendiente_ |
| **Diálogo del sistema con mi texto de propósito (development build)** | _pendiente_ |

---

## Guía para la defensa oral

**1. ¿Qué código decide entre "Continuar" y "Abrir Ajustes"?**
`estadoDe()` en [`src/lib/permisos.ts`](src/lib/permisos.ts). Si `granted` es `true` → concedido. Si no, lo decide **`canAskAgain`**: `true` → "Continuar" (todavía puede aparecer el diálogo); `false` → "Abrir Ajustes" (el sistema ya no lo va a mostrar).

**2. Revoco la cámara desde Ajustes con la app abierta y vuelvo.**
Android **mata el proceso** de la app y, al volver, la reinicia. Mi código se entera porque `usePermiso` y el escáner usan `useRevisarAlVolver`, que escucha `AppState` y vuelve a consultar (`get…`) cuando la app pasa de `background` a `active`. También consulto cada vez que la pantalla recibe foco.

**3. ¿Por qué no pido permiso para elegir una foto pero sí para sacarla?**
Para elegir uso el **selector del sistema** (`launchImageLibraryAsync`): la persona elige una foto en una pantalla del sistema y la app solo recibe esa, nunca ve el resto de la galería. Para sacarla, la app usa la **cámara** directamente, y eso sí es un recurso protegido.

**4. ¿Qué cambia si la persona elige ubicación aproximada? ¿Y si la deniega?**
Aproximada: el reporte se guarda igual, pero **no muestro coordenadas** sino "Ubicación aproximada" (`android.accuracy === 'coarse'` / `ios.accuracy === 'reduced'`). Denegada: `obtenerUbicacion()` devuelve `null` y la persona **elige el sector a mano**; el reporte se puede crear igual.

**5. ¿Por qué mis textos de propósito no aparecían en Expo Go?**
Porque Expo Go es **otra app ya compilada**, con su propio `Info.plist`. Mi `app.json` solo se aplica cuando se compila **mi** app (development build).

**6. Si agrego la nota de voz, ¿alcanza con una actualización OTA?**
**No.** Necesito declarar el micrófono (`NSMicrophoneUsageDescription` y `RECORD_AUDIO`, y sacarlo de `blockedPermissions`). Eso es **código nativo** (Info.plist / manifiesto), y una OTA solo cambia JavaScript. Hace falta una **build nueva** y publicarla en las tiendas.
