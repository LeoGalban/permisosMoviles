# TP N° 3 — Permisos móviles: Android, iOS y Expo · RESPUESTAS

**Alumno:** Leonel Galban
**Proyecto:** Mantenimiento IPF (Expo SDK 57 · Expo Router · TypeScript)

> En varias respuestas hay referencias al código de la app de la Parte G
> (por ejemplo [`src/lib/permisos.ts`](src/lib/permisos.ts)).

---

## Parte A · ¿Qué es un permiso y por qué existe?

### A1. Conceptos

**a)** Un permiso es una **autorización** para que una app pueda usar algo sensible del teléfono (cámara, ubicación, contactos, notificaciones…).
- **La app** *pide* el acceso (y antes lo tiene que haber declarado).
- **El sistema operativo** es el que *controla*: muestra el diálogo, guarda la respuesta y bloquea el acceso si no hay permiso.
- **La persona usuaria** es la que *decide* si lo da o no, y puede cambiar de opinión en Ajustes.

**b)** La **caja de arena (sandbox)** es el "encierro" en el que vive cada app: solo puede ver sus propios archivos y datos, no los de otras apps ni los del sistema. Los permisos son las **puertas** controladas para salir de esa caja.
Sin ningún permiso una app puede: mostrar pantallas, guardar datos en su propia carpeta, hacer cálculos, y usar los **selectores del sistema** (por ejemplo, el selector de fotos: la persona elige una foto y la app recibe solo esa).

**c)** Las cuatro razones:
| Razón | Ejemplo concreto |
|---|---|
| **Privacidad** | Una linterna no tiene por qué leer mis contactos. |
| **Seguridad** | Evitar que una app maliciosa grabe audio o lea mis fotos sin que me entere. |
| **Control / consentimiento** | Yo decido si una app de delivery sabe dónde estoy, y puedo sacarle el permiso cuando quiera. |
| **Recursos (batería y datos)** | La ubicación en segundo plano gasta batería: por eso es un permiso aparte y más difícil de obtener. |

**d)** En la analogía del edificio:
- **La visita** = la app (quiere entrar).
- **El portero** = el sistema operativo (pregunta y controla quién pasa).
- **El dueño del departamento** = la persona usuaria (decide).

"**El portero se acuerda de la respuesta**" significa que el sistema **guarda la decisión**: la próxima vez no vuelve a preguntarle al dueño, aplica lo que ya se dijo. Si el dueño dijo "no, y no me molestes más", la visita ni siquiera puede volver a tocar el timbre (permiso **bloqueado**).

### A2. Declarar y solicitar

| | **Declarar (al compilar)** | **Solicitar (al ejecutar)** |
|---|---|---|
| **¿Qué se hace?** | Avisar de antemano qué permisos *podría* usar la app. | Pedirle a la persona, en el momento, que lo conceda (aparece el diálogo del sistema). |
| **Android** | `<uses-permission android:name="android.permission.CAMERA" />` en el `AndroidManifest.xml`. | Pedido en tiempo de ejecución (`requestPermissions`), desde Android 6. |
| **iOS** | Clave `NS…UsageDescription` en el `Info.plist` **con el texto de propósito**. | Llamando a la API del framework (por ejemplo `AVCaptureDevice.requestAccess`). |
| **Expo** | En `app.json`: el **plugin** de cada módulo (textos de propósito), `android.permissions` / `android.blockedPermissions`, `ios.infoPlist`. Se aplica en `prebuild` / build. | `request…PermissionsAsync()` o los hooks `use…Permissions()` de cada módulo (`expo-camera`, `expo-location`, etc.). |
| **¿Qué pasa si se omite?** | Android: el pedido se **deniega solo, sin diálogo**. iOS: la app **se cierra (crash)** al usar la API y Apple **rechaza la build** (ITMS-90683). | La función no anda: Android da error de seguridad, iOS devuelve sin acceso. Hay que pedirlo antes de usarlo. |

### A3. Verdadero o falso

| | V/F | Justificación |
|---|---|---|
| a | **F** | El diálogo lo dibuja **el sistema operativo**, no la app. La app solo puede mostrar una pantalla *previa* propia. |
| b | **V** | Las carpetas `android/` e `ios/` se generan desde `app.json` (prebuild). |
| c | **F** | El `Info.plist` es parte del binario nativo. Una OTA solo cambia JavaScript e imágenes: hace falta una **build nueva** y pasar por la tienda. |
| d | **F** | Si no está en el manifiesto, Android lo **deniega directamente sin mostrar diálogo**. |
| e | **F** | `expo-permissions` está **deprecado y eliminado**. Hoy cada módulo trae sus funciones (`Camera.requestCameraPermissionsAsync`, `useCameraPermissions`…). |
| f | **V** | En iOS las notificaciones no llevan clave de texto de propósito. |
| g | **V** | `status: 'granted'` + `accessPrivileges: 'limited'`. |
| h | **F** | No es confiable (en iOS algunos permisos, como las notificaciones, se pueden "recordar"; además es lento). Lo confiable es `adb` en Android, `xcrun simctl privacy` en el simulador de iOS, o cambiarlo en Ajustes. |

### A4. Los estados de un permiso

**a)** Diagramas:

```
ANDROID (desde 11)
                       Permitir
  Sin decidir ─────────────────────────────► Concedido
       │                                         ▲
       │ No permitir (1ª vez)                    │ (desde Ajustes)
       ▼                     Permitir            │
  Denegado (se puede volver ─────────────────────┤
  a preguntar)                                   │
       │ No permitir (2ª vez)                    │
       ▼                                         │
  Bloqueado ─────────── solo desde Ajustes ──────┘

iOS
                Permitir
  Sin decidir ──────────────► Concedido
       │                          ▲
       │ No permitir              │ (desde Ajustes)
       ▼                          │
  Bloqueado ── solo Ajustes ──────┘
```

**Diferencia central:** Android da **dos oportunidades** de preguntar; iOS da **una sola**. En iOS, después del primer "No", ya solo queda mandar a la persona a Ajustes.

**b)**

| Estado | status | canAskAgain | ¿Puede aparecer el diálogo? |
|---|---|---|---|
| Sin decidir | `'undetermined'` | `true` | **Sí** |
| Concedido | `'granted'` | `true` | No (no hace falta) |
| Denegado (se puede volver a pedir) | `'denied'` | `true` | **Sí** (solo Android) |
| Bloqueado | `'denied'` | `false` | **No** → solo Ajustes |

---

## Parte B · Android: tipos de permisos y manifiesto

### B1. Clasificá los permisos

| Permiso | Tipo | ¿Cómo se obtiene? |
|---|---|---|
| `INTERNET` | De instalación (normal) | Automático al instalar, con solo declararlo. |
| `CAMERA` | De tiempo de ejecución (peligroso) | Declarar + diálogo del sistema. |
| `VIBRATE` | De instalación | Automático al instalar. |
| `SYSTEM_ALERT_WINDOW` | Especial | La persona lo activa en Ajustes ("Mostrar sobre otras apps"); la app solo puede abrir esa pantalla. |
| `POST_NOTIFICATIONS` | De tiempo de ejecución (Android 13+) | Declarar + diálogo. |
| `ACCESS_NETWORK_STATE` | De instalación | Automático al instalar. |
| `READ_CONTACTS` | De tiempo de ejecución | Declarar + diálogo. |
| `SCHEDULE_EXACT_ALARM` | Especial | Ajustes → "Alarmas y recordatorios". |
| `RECORD_AUDIO` | De tiempo de ejecución | Declarar + diálogo. |
| `MANAGE_EXTERNAL_STORAGE` | Especial | Ajustes → "Acceso a todos los archivos" (y Google Play lo restringe mucho). |

### B2. Grupos y nombres

**a)** Un **grupo de permisos** junta permisos relacionados para mostrarlos en **un solo diálogo** (por ejemplo, todo lo de ubicación). Si la app pide `ACCESS_FINE_LOCATION` y `ACCESS_COARSE_LOCATION` juntos, la persona ve **un solo diálogo**, donde además puede elegir "Precisa" o "Aproximada".

**b)** El prefijo es **`android.permission.`** → `android.permission.CAMERA`.

**c)** Los permisos de **firma (signature)** solo se le conceden a apps firmadas con **el mismo certificado** que la app (o el sistema) que define el permiso. Una app común no tiene la firma del fabricante ni de Google, así que no puede obtenerlos. Sirven para que apps del mismo desarrollador o del sistema se comuniquen entre sí.

### B3. Leé el manifiesto

**a)**
- Se conceden **solos al instalar**: `INTERNET`.
- Hay que pedirlos **en tiempo de ejecución**: `CAMERA`, `ACCESS_COARSE_LOCATION` / `ACCESS_FINE_LOCATION`, `POST_NOTIFICATIONS` (Android 13+) y `READ_EXTERNAL_STORAGE` (solo hasta Android 12).
- `RECORD_AUDIO` **no queda**: está marcado para eliminarse.

**b)** `android:maxSdkVersion="32"` = "declaralo **solo hasta Android 12L (API 32)**". En Android 13+ ese permiso no aparece. Lo reemplazan `READ_MEDIA_IMAGES`, `READ_MEDIA_VIDEO` y `READ_MEDIA_AUDIO` (y en Android 14, `READ_MEDIA_VISUAL_USER_SELECTED` para el acceso parcial).

**c)** `tools:node="remove"` le dice a Android: "al juntar los manifiestos de todas las librerías, **borrá este permiso**, aunque alguna librería lo agregue". Se genera así:

```json
{
  "expo": {
    "android": {
      "blockedPermissions": ["android.permission.RECORD_AUDIO"]
    }
  }
}
```

**d)** En `expo.android.permissions`:

```json
"android": { "permissions": ["android.permission.SCHEDULE_EXACT_ALARM"] }
```

**e)** Porque en Expo la carpeta `android/` es **generada** (Continuous Native Generation): cada `npx expo prebuild --clean` la vuelve a crear desde `app.json` y se pierden los cambios hechos a mano. La fuente de verdad es `app.json`.
`blockedPermissions` **no funciona en Expo Go**: Expo Go es una app ya compilada, con su propio manifiesto; tu `app.json` solo se aplica cuando compilás tu propia app (development build o build final).

### B4. Así pregunta Android

**a)** **No.** El diálogo de Android solo muestra el texto del sistema. La explicación la tenés que dar **en tu propia pantalla, antes** del diálogo (la "pantalla previa").

**b)**
- **"Mientras la app está en uso"**: el permiso queda concedido y vale cada vez que la app está abierta.
- **"Solo esta vez"**: es temporal; cuando la persona sale de la app (y pasa un rato), se revoca solo y la próxima vez se vuelve a preguntar.
Existe (desde Android 11) para **ubicación, cámara y micrófono**.

**c)** Dos "No permitir" equivalen a "**no volver a preguntar**": el diálogo ya no aparece. `canAskAgain` pasa a **`false`**.

**d)**
- Anda bien: "Puntos de reciclaje de tu barrio", el clima, farmacias de la zona.
- No anda: navegación paso a paso, seguir al repartidor en el mapa, marcar un aula exacta del edificio.

**e)** Android **mata el proceso** de la app. Cuando la persona vuelve, la app se reinicia (lo que estaba en memoria se pierde).

### B5. Android, versión por versión

| Cambio | Versión (API) | Qué implica para el código |
|---|---|---|
| Nacen los permisos en tiempo de ejecución | **Android 6.0 (API 23)** | Ya no alcanza con declarar: hay que **pedir** y manejar el "no". |
| Ubicación en segundo plano aparte | **Android 10 (API 29)** | `ACCESS_BACKGROUND_LOCATION` se pide **después** de la de primer plano (desde Android 11, solo desde Ajustes). |
| Dos rechazos = "no volver a preguntar" | **Android 11 (API 30)** | Manejar `canAskAgain: false` y ofrecer "Abrir Ajustes". |
| Ubicación precisa o aproximada | **Android 12 (API 31)** | Pedir FINE y COARSE juntos y funcionar con la aproximada (`android.accuracy === 'coarse'`). |
| Notificaciones como permiso (`POST_NOTIFICATIONS`) | **Android 13 (API 33)** | Pedirlo en contexto y **crear el canal antes** de pedir. |
| Acceso parcial a fotos ("Seleccionar fotos") | **Android 14 (API 34)** | Manejar acceso limitado o, mejor, usar el **selector de fotos** del sistema. |
| Permiso de red local (`ACCESS_LOCAL_NETWORK`) | **Android 17 (API 37)** | Las apps que hablan con dispositivos de la red local (impresoras, Chromecast, IoT) tendrán que pedirlo en tiempo de ejecución. |

**`targetSdkVersion`** = la versión de Android para la que la app dice estar preparada. Cuanto más alta, más reglas nuevas se aplican (por ejemplo, las de arriba). **Expo SDK 57 apunta a la API 36 (Android 16)** — lo verifiqué en el proyecto (`targetSdk = "36"`). **Google Play, desde el 31 de agosto de 2026**, exige que las apps nuevas y las actualizaciones apunten a **API 36** como mínimo.

---

## Parte C · iOS: textos de propósito y acceso parcial

### C1. Claves del Info.plist

| Recurso | Clave en Info.plist |
|---|---|
| Cámara | `NSCameraUsageDescription` |
| Micrófono | `NSMicrophoneUsageDescription` |
| Ubicación en uso | `NSLocationWhenInUseUsageDescription` |
| Ubicación siempre | `NSLocationAlwaysAndWhenInUseUsageDescription` (además de la de "en uso") |
| Fotos (leer) | `NSPhotoLibraryUsageDescription` |
| Fotos (solo guardar) | `NSPhotoLibraryAddUsageDescription` |
| Contactos | `NSContactsUsageDescription` |
| Face ID | `NSFaceIDUsageDescription` |
| Rastreo entre apps (ATT) | `NSUserTrackingUsageDescription` |
| Notificaciones | **No lleva clave** |

### C2. Sin texto, no hay permiso

**a)** Si falta el texto y la app usa la cámara, la app **se cierra al instante (crash)** con el mensaje *"This app has crashed because it attempted to access privacy-sensitive data without a usage description"*. Al subir la build, **App Store Connect la rechaza** con el error **ITMS-90683** ("Missing purpose string in Info.plist").

**b)** **Una sola vez.** Si la persona dice que no, a la app le queda: explicar por qué sirve, ofrecer un botón "Abrir Ajustes" (`Linking.openSettings()`) y una **alternativa** para seguir usando la app.

**c)** El sistema arma el **título** ("«Mantenimiento IPF» quiere acceder a la cámara") y los **botones**. Vos escribís el **texto de propósito** (el mensaje del medio). En Expo se configura en `app.json`, en las opciones del **plugin** de cada módulo (por ejemplo `"cameraPermission"` de `expo-camera`) o en `ios.infoPlist`.

**d)** Apple **analiza el binario**: si el código de una librería *enlaza* una API protegida, exige el texto de propósito aunque tu app nunca la llame. Se resuelve agregando un texto de propósito honesto para esa clave en `app.json`, o quitando/configurando la librería para que no incluya esa función.

### C3. Probador de textos de propósito

| Texto propuesto | ¿Aprobado? | Versión mejorada |
|---|---|---|
| "Necesitamos tu ubicación." | ❌ No dice para qué. | "Usamos tu ubicación para ordenar las farmacias de turno de la más cercana a la más lejana." |
| "Para mejorar tu experiencia." | ❌ Vago, no dice qué dato ni qué beneficio. | "Usamos tu ubicación para mostrarte las farmacias de turno de tu barrio." |
| "Usamos tu ubicación para mostrarte las farmacias de turno más cercanas." | ✅ Sí: dato + beneficio concreto. | — |
| "La app no funciona sin ubicación." | ❌ Es presión y además falso (la app debe tener alternativa). | "Usamos tu ubicación para calcular a cuántas cuadras está cada farmacia de turno." |
| "Ubicación requerida por el sistema." | ❌ Falso: no lo pide el sistema, lo pide la app. | "Usamos tu ubicación para marcarte en el mapa las farmacias de turno cercanas." |

### C4. Acceso parcial y gradual

| Caso | iOS | En Expo |
|---|---|---|
| Fotos limitadas | 14 | `accessPrivileges === 'limited'` (en la respuesta de `expo-media-library` / `expo-image-picker`). |
| Ubicación aproximada | 14 | `respuesta.ios.accuracy === 'reduced'` (`expo-location`). |
| "Permitir una vez" | 13 | Da `granted` mientras la app está abierta; al reabrirla vuelve a `undetermined`. Se detecta **volviendo a consultar** con `getForegroundPermissionsAsync()`. |
| De "al usar la app" a "Siempre" | 13 | Primero `requestForegroundPermissionsAsync()`, después `requestBackgroundPermissionsAsync()`; `ios.scope === 'always'`. |
| Notificaciones provisionales | 12 | `Notifications.requestPermissionsAsync({ ios: { allowProvisional: true } })`; se detecta con `ios.status === IosAuthorizationStatus.PROVISIONAL`. |
| Rastreo entre apps (ATT) | 14 (obligatorio desde 14.5) | `expo-tracking-transparency`: `requestTrackingPermissionsAsync()`. |

**Versión mínima de iOS en Expo SDK 57: iOS 16.4** (lo verifiqué en `ExpoModulesCore.podspec`). **Consecuencia:** todas las funciones de la tabla (iOS 12 a 14.5) **existen siempre** en cualquier iPhone donde corra la app. No hace falta preguntar por la versión: hay que manejar todos esos casos siempre.

### C5. Android vs iOS, lado a lado

| | Android | iOS |
|---|---|---|
| ¿Dónde se declara? | `AndroidManifest.xml` (`<uses-permission>`) | `Info.plist` (`NS…UsageDescription`) |
| Texto en el diálogo | No: solo el texto del sistema | Sí: tu texto de propósito (obligatorio) |
| Oportunidades para preguntar | 2 (desde Android 11) | 1 |
| "Solo esta vez" / "Permitir una vez" | Ubicación, cámara y micrófono (Android 11+) | Solo ubicación (iOS 13+) |
| Notificaciones | Permiso en tiempo de ejecución desde Android 13; antes, activas por defecto. Requiere canal. | Siempre se piden; sin texto de propósito; existe el modo provisional. |
| Ubicación en segundo plano | Permiso aparte (`ACCESS_BACKGROUND_LOCATION`), desde Android 11 se elige en Ajustes; Google Play pide declaración. | Escalonado: primero "en uso", después iOS ofrece "Cambiar a Siempre". Requiere `UIBackgroundModes`. |
| Si falta la declaración | Se deniega sin diálogo | Crash + rechazo ITMS-90683 |

---

## Parte D · Expo: una API, dos plataformas

### D1. Módulos y funciones

| Necesidad | Módulo | Hook / función de permiso |
|---|---|---|
| Escanear un QR | `expo-camera` | `useCameraPermissions()` |
| Grabar video con sonido | `expo-camera` | `useCameraPermissions()` + `useMicrophonePermissions()` |
| Farmacias cercanas | `expo-location` | `useForegroundPermissions()` / `requestForegroundPermissionsAsync()` |
| Seguir un envío en segundo plano | `expo-location` (+ `expo-task-manager`) | `requestForegroundPermissionsAsync()` y **después** `requestBackgroundPermissionsAsync()` |
| Mostrar un recordatorio | `expo-notifications` | `requestPermissionsAsync()` / `getPermissionsAsync()` |
| Grabar una nota de voz | `expo-audio` | `requestRecordingPermissionsAsync()` |
| Galería propia dentro de la app | `expo-media-library` | `usePermissions()` / `requestPermissionsAsync()` |
| Publicidad personalizada entre apps (iOS) | `expo-tracking-transparency` | `requestTrackingPermissionsAsync()` |

Si un tutorial usa `import * as Permissions from 'expo-permissions'`, el tutorial es **viejo**: ese paquete se deprecó (SDK 41) y después se eliminó. Hoy cada módulo trae sus propias funciones de permiso.

### D2. Consultar, pedir y el hook

**a)** `get…PermissionsAsync()` solo **consulta** el estado actual: **nunca** muestra diálogo. `request…PermissionsAsync()` **pide**: **puede** mostrar el diálogo (si el permiso está sin decidir o se puede volver a preguntar).

**b)** `const [permiso, pedirPermiso, consultarPermiso]`:
- `permiso`: la respuesta actual (`PermissionResponse`) o `null`.
- `pedirPermiso`: hace el `request` (puede mostrar diálogo).
- `consultarPermiso`: hace el `get` (no muestra diálogo).
En el **primer render `permiso` vale `null`** (todavía no se consultó). Mientras tanto la pantalla tiene que mostrar un **indicador de carga**.

**c)** Si `canAskAgain` es `false`, `request…()` **devuelve enseguida `denied` sin mostrar el diálogo**. Si se llama en un bucle (por ejemplo en cada render), la pantalla queda **trabada** pidiendo una y otra vez (cada respuesta re-renderiza y vuelve a pedir), sin que la persona vea nada.

### D3. Leé la respuesta

| Respuesta | Qué hace la app |
|---|---|
| `null` | Todavía está consultando: muestra **cargando**. |
| `{ status: 'granted', granted: true }` | Usa la función (abre la cámara, etc.). |
| `{ status: 'undetermined', canAskAgain: true }` | Muestra la **pantalla previa** con "Continuar" → `request`. |
| `{ status: 'denied', canAskAgain: true }` | No insiste. Cuando la persona vuelva a tocar la función, muestra la pantalla previa otra vez. Ofrece la alternativa. |
| `{ status: 'denied', canAskAgain: false }` | **Bloqueado**: explica cómo habilitarlo, botón "Abrir Ajustes" y alternativa. |
| `{ status: 'granted', accessPrivileges: 'limited' }` | Funciona con las fotos elegidas y ofrece "elegir más fotos". |
| `{ status: 'granted', android: { accuracy: 'coarse' } }` | Funciona con ubicación **aproximada** (no muestra coordenadas exactas). |

Los **dos campos** que deciden casi todo:
- **`granted`** → *¿lo puedo usar ahora?*
- **`canAskAgain`** → *¿puedo volver a mostrar el diálogo, o tengo que mandar a Ajustes?*

(En la app está en `estadoDe()` de [`src/lib/permisos.ts`](src/lib/permisos.ts).)

### D4. Simulación del ciclo completo (Android 14)

| # | Acción | status | canAskAgain | ¿Diálogo? |
|---|---|---|---|---|
| 1 | `getForegroundPermissionsAsync()` | `undetermined` | `true` | No |
| 2 | `request…` → "No permitir" | `denied` | `true` | **Sí** |
| 3 | `request…` → "No permitir" | `denied` | `false` | **Sí** |
| 4 | `request…` | `denied` | `false` | **No** (responde al instante) |
| 5 | `openSettings()` → habilita → vuelve y consulta | `granted` | `true` | No |
| 6 | Igual que 5 pero **no** consulta | Sigue mostrando `denied` / `false` ("bloqueado") | | No |

En el paso 6 la app muestra un dato **viejo**: por eso hay que volver a consultar con `AppState`.

**En iOS** el resultado cambia en el **paso 2**: después del primer "No permitir" ya queda `denied` + `canAskAgain: false` (bloqueado), porque iOS da **una sola oportunidad**. Los pasos 3 y 4 no muestran diálogo.
Si la persona elige **"Permitir una vez"** y después cierra y reabre la app, el permiso **vuelve a `undetermined`** y se puede volver a mostrar el diálogo.

### D5. Configurar app.json

```json
{
  "expo": {
    "android": {
      "blockedPermissions": [
        "android.permission.RECORD_AUDIO",
        "android.permission.SYSTEM_ALERT_WINDOW"
      ]
    },
    "plugins": [
      [
        "expo-camera",
        {
          "cameraPermission": "Usamos tu cámara para leer el código QR de cada punto de reciclaje.",
          "microphonePermission": false,
          "recordAudioAndroid": false
        }
      ],
      [
        "expo-location",
        {
          "locationWhenInUsePermission": "Usamos tu ubicación para mostrarte los puntos de reciclaje más cercanos.",
          "isIosBackgroundLocationEnabled": false,
          "isAndroidBackgroundLocationEnabled": false
        }
      ]
    ]
  }
}
```

`expo-camera` agrega `RECORD_AUDIO` por defecto porque la librería **también sirve para grabar video con sonido**, y no sabe si tu app lo va a hacer. Por eso hay que apagarlo a mano (`recordAudioAndroid: false`).

### D6. Expo Go no es tu app

**a)** Porque Expo Go es **otra app**, ya compilada, con su propio `Info.plist` y manifiesto (con los textos de Expo). Tu `app.json` solo se aplica cuando se compila **tu** app.

**b)**
- **Expo Go**: probar la lógica (estados, pantallas previas, alternativas), cámara, ubicación en primer plano, selector de fotos y notificaciones locales.
- **Development build**: ver **tus** textos de propósito, `blockedPermissions`, **notificaciones push en Android** (no están en Expo Go) y **ubicación en segundo plano**.

**c)**
```bash
npx expo prebuild --clean          # genera android/ e ios/ para verlos
npx expo install expo-dev-client   # agrega el cliente de desarrollo
npx expo run:android               # compila e instala la development build (local)
# o en la nube:
npx eas-cli@latest build --profile development --platform android
```

**d)**
```bash
# Android: borrar los datos de la app (vuelve todo a "sin decidir")
adb shell pm clear ar.edu.ipf.mantenimiento
# o solo un permiso:
adb shell pm revoke ar.edu.ipf.mantenimiento android.permission.CAMERA
adb shell pm clear-permission-flags ar.edu.ipf.mantenimiento android.permission.CAMERA user-set user-fixed

# Simulador de iOS
xcrun simctl privacy booted reset camera ar.edu.ipf.mantenimiento
xcrun simctl privacy booted reset all ar.edu.ipf.mantenimiento
```

---

## Parte E · Recetas: leer y corregir código

### E1. Encontrá los errores (cámara)

Errores:
1. **`permiso` es `null` en el primer render** → `permiso.status` rompe la app (TypeError).
2. **No maneja el estado bloqueado**: si `canAskAgain` es `false`, el botón no hace nada (falta "Abrir Ajustes").
3. El botón dice **"Permitir"**: debe decir **"Continuar"** (no concede nada, solo lleva al diálogo).
4. **No se actualiza al volver de Ajustes** (falta `AppState` + `consultarPermiso`).
5. **No hay alternativa** si la persona dice que no (escribir el código del aula a mano). Además falta importar `Explicacion`.

Versión corregida (la versión completa está en [`src/app/reporte/escanear.tsx`](src/app/reporte/escanear.tsx)):

```tsx
import { CameraView, useCameraPermissions } from 'expo-camera';
import { ActivityIndicator, Button, Linking, Text, View } from 'react-native';
import { useRevisarAlVolver } from '@/hooks/useRevisarAlVolver';

export default function Escanear() {
  const [permiso, pedirPermiso, consultarPermiso] = useCameraPermissions();
  useRevisarAlVolver(consultarPermiso); // se entera si cambió en Ajustes

  // 1) cargando
  if (!permiso) return <ActivityIndicator />;

  // 2) concedido
  if (permiso.granted) return <CameraView style={{ flex: 1 }} facing="back" />;

  // 3) preguntable
  if (permiso.canAskAgain) {
    return (
      <View>
        <Text>Usamos la cámara para leer el QR del aula.</Text>
        <Button title="Continuar" onPress={pedirPermiso} />
        {/* + campo para escribir el código a mano */}
      </View>
    );
  }

  // 4) bloqueado
  return (
    <View>
      <Text>La cámara está bloqueada. Activala en Ajustes o escribí el código a mano.</Text>
      <Button title="Abrir Ajustes" onPress={() => Linking.openSettings()} />
      {/* + campo para escribir el código a mano */}
    </View>
  );
}
```

### E2. El orden importa (ubicación)

**a)** Pide **"siempre" antes que "en uso"**. El orden correcto es al revés.
- **iOS**: no se puede pedir "Siempre" sin tener antes "en uso": no aparece el diálogo y devuelve denegado.
- **Android 11+**: la ubicación en segundo plano solo se puede dar **después** de tener la de primer plano (y se elige en Ajustes). Pedida primero, se deniega.
→ La función **siempre devuelve `false`**.

**b)**
```ts
export async function activarSeguimiento() {
  const enUso = await Location.requestForegroundPermissionsAsync();
  if (!enUso.granted) return false;

  const siempre = await Location.requestBackgroundPermissionsAsync();
  return siempre.granted;
}
```

**c)** (está en [`src/lib/ubicacion.ts`](src/lib/ubicacion.ts))
```ts
export async function obtenerUbicacion() {
  try {
    const permiso = await Location.getForegroundPermissionsAsync();
    if (!permiso.granted) return null;

    const posicion = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    const aproximada =
      permiso.android?.accuracy === 'coarse' || permiso.ios?.accuracy === 'reduced';

    return { latitud: posicion.coords.latitude, longitud: posicion.coords.longitude, aproximada };
  } catch {
    return null; // nunca rompe la app
  }
}
```

**d)** **No.** Para "farmacias cercanas" alcanza con primer plano (y hasta con la aproximada). Si se pide segundo plano, Google Play exige completar una **declaración** en Play Console justificando que es una función central, un **video** que muestre la función y un **aviso destacado** dentro de la app antes de pedirlo.

### E3. Notificaciones mudas

**a)** La causa más probable: **no se creó un canal de notificaciones** antes de pedir. En Android 13+ hay que llamar a `Notifications.setNotificationChannelAsync('...')` **antes** de `requestPermissionsAsync()`. (También puede ser que ya esté bloqueado por dos rechazos.) En la app: `pedir('notificaciones')` en [`src/lib/permisos.ts`](src/lib/permisos.ts) crea el canal `"reportes"` antes de pedir.

**b)** En **Android 12 o anterior** no existe como permiso de tiempo de ejecución: las notificaciones están **permitidas por defecto** al instalar (la persona las puede apagar en Ajustes). `requestPermissionsAsync()` devuelve `granted` sin diálogo.

**c)** Las **notificaciones provisionales** (iOS 12+): llegan en silencio al centro de notificaciones sin mostrar diálogo. Se piden con `requestPermissionsAsync({ ios: { allowProvisional: true } })` y se detectan con `ios.status === Notifications.IosAuthorizationStatus.PROVISIONAL`.

**d)** Cuando la persona **entiende el beneficio**.
- ✅ Buen momento: al activar "Avisarme cuando se resuelva mi reporte", o justo después de sacar un turno ("¿Querés que te avisemos el día anterior?").
- ❌ Mal momento: apenas se abre la app por primera vez, antes de que sepa para qué sirve.

### E4. Fotos sin pedir permiso

| Necesidad | Herramienta | Permiso |
|---|---|---|
| Elegir una foto de perfil | `ImagePicker.launchImageLibraryAsync()` (selector del sistema) | **Ninguno** |
| Sacar una foto en el momento | `ImagePicker.launchCameraAsync()` o `expo-camera` | **Cámara** |
| Editor que muestra toda la galería | `expo-media-library` | Galería (`READ_MEDIA_IMAGES/VIDEO` en Android, `NSPhotoLibraryUsageDescription` en iOS) + manejar acceso limitado |
| Adjuntar la foto de un comprobante | `ImagePicker.launchImageLibraryAsync()` (o `expo-document-picker`) | **Ninguno** |

Google Play restringe `READ_MEDIA_IMAGES` y `READ_MEDIA_VIDEO` porque dan acceso a **todas** las fotos y videos (datos muy personales), y la mayoría de las apps solo necesita **una** foto puntual. La política se anunció en 2023 y es **obligatoria desde 2025**: solo pueden usarlos las apps cuya función principal es la galería (y lo tienen que declarar); el resto debe usar el **selector de fotos** del sistema.
**"El mejor permiso es el que no se pide"**: si existe un selector del sistema que resuelve la necesidad, no pidas el permiso.

### E5. Volver de Ajustes

```ts
const estabaAfuera = anterior.current.match(/inactive|background/) !== null;
if (estabaAfuera && nuevo === 'active') revisar();
anterior.current = nuevo;
// ...
return () => sub.remove();
```
(Está en [`src/hooks/useRevisarAlVolver.ts`](src/hooks/useRevisarAlVolver.ts).)

**a)** Porque los hooks de Expo consultan solo al montarse y cuando llamás a pedir/consultar. **No existe un aviso del sistema** de "el permiso cambió": Ajustes es otra app. Hay que volver a consultar cuando la app vuelve a primer plano.

**b)** `consultarPermiso`: el **tercer** elemento de `useCameraPermissions()` (hace el `get`, sin diálogo).

**c)** Porque el permiso puede cambiar **fuera de la app** en cualquier momento (Ajustes, "Solo esta vez" que vence, Android que resetea permisos de apps que no se usan). Un valor guardado "para siempre" queda **viejo**. La fuente de verdad es siempre el sistema operativo: hay que consultarlo.

---

## Parte F · Buenas prácticas y tiendas

### F1. Pedir en contexto

| App y permiso | ¿Cuándo pedirlo? | Alternativa si lo deniegan |
|---|---|---|
| Delivery · ubicación | Al tocar "Usar mi ubicación actual" en la dirección de entrega. | Escribir la dirección a mano. |
| Billetera virtual · cámara | Al tocar "Pagar con QR". | Ingresar el alias/CVU a mano o elegir la imagen del QR desde la galería. |
| Red social · contactos | Al tocar "Buscar amigos de mis contactos". | Buscar por nombre de usuario o compartir un link de invitación. |
| Mensajería · micrófono | Al mantener apretado el botón de nota de voz. | Escribir el mensaje. |
| Turnos médicos · notificaciones | Después de confirmar un turno: "¿Te avisamos el día anterior?". | Ver los turnos dentro de la app, recordatorio por email o agregarlo al calendario. |
| Editor de fotos · galería completa | Al abrir la galería dentro del editor. | Elegir fotos sueltas con el selector del sistema (o acceso limitado). |

Pedir cuatro permisos apenas se abre la app "**entrena el No permitir automático**" porque la persona todavía no sabe para qué sirve cada uno, se cansa de los carteles y aprende a apretar "No" sin leer. Y como iOS da una sola oportunidad (y Android dos), esos "no" quedan como **bloqueos**.

### F2. La pantalla previa

**a)** Tres elementos:
1. El **beneficio en una frase** (para qué lo usamos).
2. **Un solo botón "Continuar"** que lleva al diálogo del sistema.
3. La **aclaración** de que se puede cambiar después en Ajustes.

**b)** Porque ese botón **no concede nada**: solo abre el diálogo real del sistema, que es donde se decide. Decir "Permitir" engaña a la persona.

**c)** La pauta **5.1.1(iv)** dice que la app debe **respetar** la decisión de la persona y **no manipularla ni forzarla**. Apple rechaza pantallas previas con botones como **"Ahora no" o "Cerrar"**: después del mensaje previo, la persona **siempre** tiene que llegar al diálogo del sistema (y ahí decide sí o no).

**d)** Si está bloqueado, el diálogo ya no va a aparecer, así que la pantalla **explica cómo habilitarlo** (el camino en Ajustes), el botón pasa a ser **"Abrir Ajustes"** y se ofrece la **alternativa**. (En la app: [`src/components/PermisoBloqueado.tsx`](src/components/PermisoBloqueado.tsx).)

### F3. Mínimo privilegio

**a)** **Aproximada**: para los puntos de reciclaje del barrio alcanza con saber la zona.
**b)** **"En uso"**: la persona inicia y termina la carrera, así que la app sigue "en uso" aunque el celu esté en el bolsillo (con un servicio en primer plano / indicador de ubicación activo). No hace falta "siempre".
**c)** **Selector del sistema**: es una sola foto puntual; no hace falta ver toda la galería.
**d)** **Sin micrófono**: escanear un QR no graba audio (`microphonePermission: false`, `recordAudioAndroid: false`).

### F4. Tiendas

**a)**
- **Google Play**: 1) apuntar a una API reciente (API 36 desde el 31/08/2026); 2) completar el formulario de **Seguridad de los datos** y las **declaraciones de permisos sensibles** (ubicación en segundo plano, fotos y videos, alarmas exactas…), con política de privacidad.
- **App Store**: 1) **texto de propósito** para cada permiso (si no, ITMS-90683); 2) **etiquetas de privacidad** y **manifiesto de privacidad**; además, ATT para rastrear entre apps y no forzar permisos (5.1.1).

**b)** El **manifiesto de privacidad** (`PrivacyInfo.xcprivacy`) es un archivo donde la app declara **qué datos recopila** y qué **APIs de "razón requerida"** usa (por ejemplo `UserDefaults`, fecha de archivos, espacio en disco) y **por qué**. En Expo se configura en `app.json`, en **`expo.ios.privacyManifests`**.

**c)** Android 17 suma un **selector de contactos del sistema**: la persona elige qué contactos compartir y la app los recibe sin necesitar `READ_CONTACTS` (además del permiso de red local). Desde el **27/01/2027**, Google Play va a exigir que las apps que hoy piden `READ_CONTACTS` **usen el selector**, salvo que justifiquen con una **declaración** que el acceso completo a la agenda es una función central de la app.

### F5. Errores comunes

| | Causa | Solución |
|---|---|---|
| **a** | Falta el **texto de propósito** en el `Info.plist`. | Agregarlo en `app.json` (opción del plugin, ej. `cameraPermission`) y **compilar de nuevo** (no sirve OTA). |
| **b** | En Expo Go andaba porque Expo Go declara todo. En la build, el permiso **no está declarado** (falta el plugin en `app.json`, o está en `blockedPermissions`), entonces Android lo deniega sin diálogo. | Agregar el plugin/permiso en `app.json`, `npx expo prebuild --clean` y recompilar. |
| **c** | La app **no vuelve a consultar** al regresar de Ajustes: muestra un dato viejo. | Escuchar `AppState` y llamar a `consultarPermiso` al volver (`useRevisarAlVolver`). |
| **d** | Llama a `request…()` **en el render**: cada respuesta re-renderiza y vuelve a pedir (bucle); si está bloqueado nunca muestra nada. | Consultar (`get`) al montar y **pedir solo cuando la persona toca un botón**. |
| **e** | Exige un permiso **no esencial** para entrar. Mala práctica y Apple lo rechaza (5.1.1). | Dejar entrar igual y ofrecer alternativa: bandeja de avisos dentro de la app, recordatorio por email/calendario, y activar notificaciones más adelante. |
