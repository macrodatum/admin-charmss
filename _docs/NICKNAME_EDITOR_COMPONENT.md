# NicknameEditor — Componente de Edición de Nickname con Validación de Unicidad

## Tabla de Contenidos

1. [Contexto y Motivación](#1-contexto-y-motivación)
2. [Arquitectura General](#2-arquitectura-general)
3. [Endpoint de la API](#3-endpoint-de-la-api)
4. [Cambios en el Servicio](#4-cambios-en-el-servicio)
5. [Componente NicknameEditor](#5-componente-nicknameeditor)
   - [Props](#props)
   - [Estado interno](#estado-interno)
   - [Validación client-side](#validación-client-side)
   - [Manejo de errores de API](#manejo-de-errores-de-api)
   - [Máquina de estados (Status)](#máquina-de-estados-status)
   - [Código fuente completo](#código-fuente-completo)
6. [Integración en ProfileTab](#6-integración-en-profiletab)
7. [UX: Flujos de Usuario](#7-ux-flujos-de-usuario)
8. [Comportamiento visual por estado](#8-comportamiento-visual-por-estado)
9. [Dependencias requeridas](#9-dependencias-requeridas)
10. [Cómo reutilizar en otros proyectos](#10-cómo-reutilizar-en-otros-proyectos)
11. [Decisiones de diseño](#11-decisiones-de-diseño)
12. [Resumen de archivos modificados](#12-resumen-de-archivos-modificados)

---

## 1. Contexto y Motivación

El nickname de un performer reside en la entidad `performerProfile` (relación 1:1 con `performer`). A diferencia de otros campos del perfil que se actualizan en bloque mediante `PATCH /api/performers/{id}/profile`, el nickname **requiere un endpoint dedicado** porque el backend verifica que no esté siendo usado por ningún otro performer al momento de guardarlo.

Esta restricción hace inviable incluirlo en el formulario general del perfil: si el usuario modifica otros datos y presiona "Guardar", el payload incluiría el nickname actual (sin cambio) pero el backend podría rechazarlo si el proceso de validación de unicidad falla por algún motivo de concurrencia, o en el futuro retornar 409. Por tanto, se separó en un componente autocontenido con su propio ciclo save/validate.

---

## 2. Arquitectura General

```
PerformerProfile (modal)
  └── ProfileTab
        └── NicknameEditor          ← componente nuevo
              └── PerformerProfileService.updateNickname()
                    └── PATCH /api/performers/{id}/profile/nickname
```

El componente vive dentro de la pestaña "Profile" del modal `PerformerProfile`. Es completamente independiente del formulario general; tiene su propio estado, su propia llamada HTTP y su propio feedback visual.

---

## 3. Endpoint de la API

```
PATCH /api/performers/{id}/profile/nickname
```

### Parámetros

| Nombre | Tipo   | Ubicación | Descripción         |
|--------|--------|-----------|---------------------|
| `id`   | number | path      | ID del performer    |

### Request Body

```json
{
  "nickName": "StarPerformer"
}
```

### Reglas de negocio del backend

| Regla                            | Detalle                                    |
|----------------------------------|--------------------------------------------|
| Longitud mínima                  | 5 caracteres                               |
| Longitud máxima                  | 50 caracteres                              |
| Debe contener al menos una letra | No puede ser solo números o símbolos       |
| Unicidad global                  | No puede estar en uso por otro performer   |

### Respuestas

| Código | Significado                  | Cuerpo de respuesta                                                        |
|--------|------------------------------|----------------------------------------------------------------------------|
| `200`  | Nickname actualizado         | `{ "nickName": "StarPerformer" }`                                          |
| `400`  | Datos inválidos              | `{ "message": ["El nickname debe tener al menos 5 caracteres"], "error": "Bad Request", "statusCode": 400 }` |
| `404`  | Performer no encontrado      | `{ "message": "Performer with ID 999 not found", "error": "Not Found", "statusCode": 404 }` |
| `409`  | Nickname ya en uso           | `{ "message": "El nickname \"StarPerformer\" ya está en uso", "error": "Conflict", "statusCode": 409 }` |

> **Nota:** El campo `message` en el error 400 llega como **array de strings** (patrón NestJS class-validator). El componente extrae el primer elemento con `Array.isArray(raw) ? raw[0] : raw`.

---

## 4. Cambios en el Servicio

**Archivo:** `src/app/services/performerProfile.service.ts`

Se agregó el método `updateNickname` a la clase `PerformerProfileService`:

```typescript
/**
 * Actualiza únicamente el nickname del perfil del performer.
 * PATCH /api/performers/{id}/profile/nickname
 */
async updateNickname(
  performerId: string | number,
  nickName: string
): Promise<{ nickName: string }> {
  const response = await ApiClient.patch<{ nickName: string }>(
    `${BASE}/${performerId}/profile/nickname`,
    { nickName }
  );
  return response.data;
}
```

### Por qué no se añadió try/catch en el servicio

A diferencia de los otros métodos de la clase, `updateNickname` **deja que el error se propague al caller** (el componente). Esto permite que el componente inspeccione `err.response.status` y `err.response.data.message` para mostrar mensajes de error específicos al usuario según el código HTTP (`400`, `404`, `409`). Si el servicio capturara y re-lanzara un error genérico, se perdería esa información.

---

## 5. Componente NicknameEditor

**Archivo:** `src/components/performerProfile/NicknameEditor.tsx`

### Props

```typescript
interface NicknameEditorProps {
  performerId: string | number;           // ID del performer — se pasa al servicio
  currentNickname: string | null | undefined; // Valor inicial leído desde performerProfile.nickName
  onNicknameUpdated?: (newNickname: string) => void; // Callback opcional tras éxito
}
```

| Prop               | Requerida | Descripción                                                                      |
|--------------------|-----------|----------------------------------------------------------------------------------|
| `performerId`      | ✅        | ID numérico o string del performer. Se incluye en la URL del PATCH.              |
| `currentNickname`  | ✅        | Valor actual del nickname. Acepta `null` y `undefined` (muestra "Sin nickname"). |
| `onNicknameUpdated`| ❌        | Callback que recibe el nuevo nickname tras guardarse con éxito. Útil para sincronizar estado en el padre si es necesario. |

### Estado interno

```typescript
const [status, setStatus] = useState<Status>('idle');
const [inputValue, setInputValue] = useState(currentNickname ?? '');
const [localNickname, setLocalNickname] = useState(currentNickname ?? '');
const [validationError, setValidationError] = useState<string | null>(null);
const [apiError, setApiError] = useState<string | null>(null);
```

| Variable         | Descripción                                                                           |
|------------------|---------------------------------------------------------------------------------------|
| `status`         | Máquina de estados que controla qué modo renderiza el componente (ver sección abajo). |
| `inputValue`     | Valor del `<input>` mientras el usuario edita. Separado de `localNickname`.           |
| `localNickname`  | Último nickname confirmado por el servidor. Solo se actualiza tras un 200 exitoso.    |
| `validationError`| Error de validación client-side (longitud, letras). Se limpia al crear la API error.  |
| `apiError`       | Error proveniente del servidor (409, 400, etc.).                                      |

> **Separación `inputValue` / `localNickname`:** Si el usuario escribe un valor, presiona guardar y recibe un 409, al cancelar el campo vuelve al último nickname válido (`localNickname`), no al valor rechazado.

### Validación client-side

```typescript
const MIN_LENGTH = 5;
const MAX_LENGTH = 50;
const AT_LEAST_ONE_LETTER = /[a-zA-Z]/;

function validateNickname(value: string): string | null {
  if (value.length < MIN_LENGTH) return `Mínimo ${MIN_LENGTH} caracteres`;
  if (value.length > MAX_LENGTH) return `Máximo ${MAX_LENGTH} caracteres`;
  if (!AT_LEAST_ONE_LETTER.test(value)) return 'Debe contener al menos una letra';
  return null;
}
```

La validación se ejecuta:
1. **En cada keystroke** (`handleInputChange`) — feedback en tiempo real.
2. **Antes del submit** (`handleSave`) — barrera de seguridad antes de llamar a la API.

El botón de guardar queda **deshabilitado** mientras:
- Hay un `validationError` activo, **o**
- `inputValue === localNickname` (no hubo cambio real).

### Manejo de errores de API

```typescript
catch (err: unknown) {
  const axiosErr = err as {
    response?: { status?: number; data?: { message?: string | string[] } }
  };
  const status = axiosErr.response?.status;
  const raw = axiosErr.response?.data?.message;
  const message = Array.isArray(raw) ? raw[0] : (raw ?? 'Error al actualizar el nickname');

  if (status === 409) {
    setApiError(`El nickname "${inputValue}" ya está en uso`);
  } else if (status === 400) {
    setApiError(message);
  } else if (status === 404) {
    setApiError('Performer no encontrado');
  } else {
    setApiError(message);
  }

  setStatus('editing');  // Regresa al modo edición para que el usuario pueda corregir
}
```

| Código HTTP | Mensaje mostrado al usuario                              |
|-------------|----------------------------------------------------------|
| `400`       | Mensaje del backend (primer elemento del array si aplica)|
| `404`       | `"Performer no encontrado"`                              |
| `409`       | `"El nickname \"<valor>\" ya está en uso"`               |
| Otros       | Mensaje del backend o fallback genérico                  |

### Máquina de estados (Status)

```typescript
type Status = 'idle' | 'editing' | 'saving' | 'success' | 'error';
```

```
     [handleEditClick]          [handleSave + API OK]
idle ─────────────────► editing ──────────────────────► success
 ▲                        │  ▲                              │
 │   [handleCancel]       │  │  [API Error → editing]       │ [setTimeout 2500ms]
 └────────────────────────┘  └──────────────────────        └──────────────────► idle

                  [handleSave]
         editing ──────────────► saving
                                   │
                          (espera respuesta API)
                                   │
                    ┌──────────────┴──────────────┐
                    ▼ (200 OK)                    ▼ (4xx/5xx)
                 success                       editing
```

Derivados booleanos para simplificar el JSX:

```typescript
const isSaving  = status === 'saving';
const isEditing = status === 'editing' || isSaving;
const isSuccess = status === 'success';
const hasError  = !!validationError || !!apiError;
const displayError = validationError ?? apiError; // validación tiene prioridad
```

### Código fuente completo

```tsx
import React, { useState } from 'react';
import { Check, Pencil, X, Loader2 } from 'lucide-react';
import PerformerProfileService from '../../app/services/performerProfile.service';

interface NicknameEditorProps {
  performerId: string | number;
  currentNickname: string | null | undefined;
  onNicknameUpdated?: (newNickname: string) => void;
}

type Status = 'idle' | 'editing' | 'saving' | 'success' | 'error';

const MIN_LENGTH = 5;
const MAX_LENGTH = 50;
const AT_LEAST_ONE_LETTER = /[a-zA-Z]/;

function validateNickname(value: string): string | null {
  if (value.length < MIN_LENGTH) return `Mínimo ${MIN_LENGTH} caracteres`;
  if (value.length > MAX_LENGTH) return `Máximo ${MAX_LENGTH} caracteres`;
  if (!AT_LEAST_ONE_LETTER.test(value)) return 'Debe contener al menos una letra';
  return null;
}

export default function NicknameEditor({
  performerId,
  currentNickname,
  onNicknameUpdated,
}: NicknameEditorProps) {
  const [status, setStatus] = useState<Status>('idle');
  const [inputValue, setInputValue] = useState(currentNickname ?? '');
  const [localNickname, setLocalNickname] = useState(currentNickname ?? '');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const handleEditClick = () => {
    setInputValue(localNickname);
    setValidationError(null);
    setApiError(null);
    setStatus('editing');
  };

  const handleCancel = () => {
    setStatus('idle');
    setValidationError(null);
    setApiError(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    setValidationError(validateNickname(val));
    setApiError(null);
  };

  const handleSave = async () => {
    const error = validateNickname(inputValue);
    if (error) {
      setValidationError(error);
      return;
    }

    setStatus('saving');
    setApiError(null);

    try {
      const result = await PerformerProfileService.updateNickname(performerId, inputValue);
      setLocalNickname(result.nickName);
      setStatus('success');
      onNicknameUpdated?.(result.nickName);
      setTimeout(() => setStatus('idle'), 2500);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { status?: number; data?: { message?: string | string[] } } };
      const status = axiosErr.response?.status;
      const raw = axiosErr.response?.data?.message;
      const message = Array.isArray(raw) ? raw[0] : (raw ?? 'Error al actualizar el nickname');

      if (status === 409) {
        setApiError(`El nickname "${inputValue}" ya está en uso`);
      } else if (status === 400) {
        setApiError(message);
      } else if (status === 404) {
        setApiError('Performer no encontrado');
      } else {
        setApiError(message);
      }

      setStatus('editing');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSave();
    if (e.key === 'Escape') handleCancel();
  };

  const isSaving = status === 'saving';
  const isEditing = status === 'editing' || isSaving;
  const isSuccess = status === 'success';
  const hasError = !!validationError || !!apiError;
  const displayError = validationError ?? apiError;

  return (
    <div>
      <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Nickname
      </label>

      {isEditing ? (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              disabled={isSaving}
              maxLength={MAX_LENGTH}
              autoFocus
              className={`flex-1 bg-white dark:bg-slate-900 border px-3 py-2 rounded-lg text-sm md:text-base
                text-gray-900 dark:text-white focus:outline-none focus:ring-2 transition-colors
                ${hasError
                  ? 'border-red-500 focus:ring-red-400'
                  : 'border-gray-300 dark:border-slate-700 focus:ring-pink-500'
                } disabled:opacity-60`}
              placeholder="Ingresa el nickname"
            />
            <button
              onClick={handleSave}
              disabled={isSaving || !!validationError || inputValue === localNickname}
              title="Guardar"
              className="p-2 rounded-lg bg-pink-600 hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-colors"
            >
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            </button>
            <button
              onClick={handleCancel}
              disabled={isSaving}
              title="Cancelar"
              className="p-2 rounded-lg border border-gray-300 dark:border-slate-600 hover:bg-gray-100
                dark:hover:bg-slate-700 text-gray-600 dark:text-gray-300 transition-colors disabled:opacity-50"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex items-center justify-between">
            {displayError ? <p className="text-xs text-red-500">{displayError}</p> : <span />}
            <span className="text-xs text-gray-400 dark:text-gray-500">
              {inputValue.length}/{MAX_LENGTH}
            </span>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <span className={`text-xl md:text-2xl font-bold ${isSuccess ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-white'}`}>
            {localNickname || (
              <span className="text-gray-400 dark:text-gray-500 text-base font-normal italic">
                Sin nickname
              </span>
            )}
          </span>
          {isSuccess && (
            <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
              <Check className="h-3 w-3" /> Guardado
            </span>
          )}
          <button
            onClick={handleEditClick}
            title="Editar nickname"
            className="p-1.5 rounded-lg text-gray-400 hover:text-pink-600 dark:hover:text-pink-400
              hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
          >
            <Pencil className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
```

---

## 6. Integración en ProfileTab

**Archivo:** `src/components/performerProfile/ProfileTab.tsx`

### Import agregado

```typescript
import NicknameEditor from './NicknameEditor';
```

### Bloque reemplazado

**Antes** (campo estático, solo lectura):

```tsx
<div className="mt-4">
  <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
    NickName
  </label>
  <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-2">
    {profile.nickName || stageName}
  </h2>
</div>
```

**Después** (componente interactivo):

```tsx
<div className="mt-4">
  <NicknameEditor
    performerId={performerId}
    currentNickname={profile.nickName}
  />
</div>
```

### Por qué no se usa `onNicknameUpdated` en ProfileTab

El `profile` que recibe `ProfileTab` proviene de `performer.performerProfile`, que es un objeto estático pasado como prop desde el padre (`PerformerProfile` modal). Actualizar ese estado requeriría elevar el cambio hasta el modal y refrescar el performer completo o pasar un setter. En la integración actual no fue necesario porque el `NicknameEditor` mantiene su propio `localNickname` sincronizado. Si en el futuro se necesita propagar el cambio, se puede pasar el callback.

---

## 7. UX: Flujos de Usuario

### Flujo A — Cambio exitoso

```
Usuario ve: [StarPerformer ✏️]
  → Click en ✏️
  → Input se abre con "StarPerformer" prellenado, foco automático
  → Usuario cambia a "NewStar123"
  → Click en ✅ (o presiona Enter)
  → Botón muestra spinner (saving)
  → API retorna 200: { nickName: "NewStar123" }
  → Se muestra: [NewStar123 ✓ Guardado ✏️] (verde por 2.5 segundos)
  → Vuelve a: [NewStar123 ✏️]
```

### Flujo B — Nickname en uso (409)

```
Usuario escribe "StarPerformer" (en uso por otro)
  → Click en ✅
  → API retorna 409
  → Se muestra error en rojo: 'El nickname "StarPerformer" ya está en uso'
  → Input permanece abierto para que el usuario corrija
  → Botón guardar queda activo para reintentar
```

### Flujo C — Validación client-side

```
Usuario escribe "aa" (menos de 5 chars)
  → En tiempo real aparece: "Mínimo 5 caracteres"
  → Botón guardar queda deshabilitado (opacity-50, cursor-not-allowed)
  → No se realiza ninguna llamada HTTP
```

### Flujo D — Cancelar sin guardar

```
Usuario abre edición
  → Escribe algo nuevo
  → Click en ✕ (o presiona Escape)
  → Input se cierra
  → El nickname mostrado vuelve al último guardado (localNickname)
  → No se realiza ninguna llamada HTTP
```

### Flujo E — Performer no encontrado (404)

```
  → Click en ✅ (ID inválido o performer eliminado)
  → API retorna 404
  → Se muestra: "Performer no encontrado"
  → Input permanece abierto
```

---

## 8. Comportamiento visual por estado

| Estado      | Input   | Botón guardar       | Botón cancelar | Texto nickname          |
|-------------|---------|---------------------|----------------|-------------------------|
| `idle`      | Oculto  | —                   | —              | Gris/blanco + ícono ✏️  |
| `editing`   | Visible | Activo (rosa)       | Activo         | Oculto                  |
| `saving`    | Visible (disabled) | Spinner + disabled | Disabled  | Oculto             |
| `success`   | Oculto  | —                   | —              | Verde + "✓ Guardado"    |
| `error`*    | —       | —                   | —              | — (regresa a `editing`)|

> *El estado `error` no se renderiza directamente; el componente regresa a `editing` con `apiError` seteado.

### Clases de color por situación

| Situación                    | Color del borde del input | Color del ring focus |
|------------------------------|---------------------------|----------------------|
| Sin error                    | `border-gray-300`         | `focus:ring-pink-500`|
| Con error (validación o API) | `border-red-500`          | `focus:ring-red-400` |

---

## 9. Dependencias requeridas

| Paquete       | Uso                                              |
|---------------|--------------------------------------------------|
| `react`       | Hooks: `useState`                                |
| `lucide-react`| Iconos: `Check`, `Pencil`, `X`, `Loader2`        |
| `tailwindcss` | Estilos utilitarios y soporte dark mode          |
| `axios`       | Cliente HTTP (via `ApiClient` del proyecto)      |

No se necesita instalar ningún paquete adicional si el proyecto ya cuenta con estas dependencias.

---

## 10. Cómo reutilizar en otros proyectos

### Paso 1 — Adaptar el servicio

El componente espera un servicio con el método:

```typescript
updateNickname(performerId: string | number, nickName: string): Promise<{ nickName: string }>
```

En otro proyecto, puede ser una función independiente, un hook, o un método de clase. Solo asegúrate de **no capturar el error internamente**: el componente necesita acceder a `err.response.status` y `err.response.data.message`.

```typescript
// Ejemplo con fetch nativo
async function updateNickname(performerId: number, nickName: string) {
  const res = await fetch(`/api/performers/${performerId}/profile/nickname`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nickName }),
  });
  if (!res.ok) {
    const data = await res.json();
    const error = new Error(data.message) as Error & { response: { status: number; data: typeof data } };
    error.response = { status: res.status, data };
    throw error;
  }
  return res.json();
}
```

### Paso 2 — Adaptar las constantes de validación

```typescript
// Al inicio de NicknameEditor.tsx
const MIN_LENGTH = 5;   // ← ajustar según reglas del backend
const MAX_LENGTH = 50;  // ← ajustar según reglas del backend
const AT_LEAST_ONE_LETTER = /[a-zA-Z]/; // ← ajustar según reglas del backend
```

### Paso 3 — Adaptar los colores de la marca

El componente usa `pink-600` como color primario (color de marca de charmss). Reemplaza:

```
bg-pink-600 hover:bg-pink-700
text-pink-600 dark:text-pink-400
focus:ring-pink-500
hover:text-pink-600 dark:hover:text-pink-400
```

por el color de tu sistema de diseño (ej. `indigo-600`, `blue-600`, etc.).

### Paso 4 — Usar el componente

```tsx
import NicknameEditor from './NicknameEditor';

// Uso básico
<NicknameEditor
  performerId={performer.id}
  currentNickname={performer.performerProfile?.nickName}
/>

// Uso con callback para sincronizar estado en el padre
<NicknameEditor
  performerId={performer.id}
  currentNickname={performer.performerProfile?.nickName}
  onNicknameUpdated={(newNickname) => {
    setPerformer(prev => ({
      ...prev,
      performerProfile: { ...prev.performerProfile, nickName: newNickname }
    }));
  }}
/>
```

---

## 11. Decisiones de diseño

### ¿Por qué no un campo del formulario general?

El endpoint de nickname es `PATCH /api/performers/{id}/profile/nickname`, separado del `PATCH /api/performers/{id}/profile`. Mezclarlos en el mismo submit implicaría hacer dos llamadas HTTP o que el backend general también validara unicidad, lo cual acoplaría responsabilidades. Al tenerlo separado:

- La actualización de nickname no puede bloquear la actualización de otros campos.
- El usuario recibe feedback inmediato específico al nickname.
- La validación de unicidad es explícita e intencional.

### ¿Por qué `localNickname` separado de `inputValue`?

Para garantizar que al cancelar una edición fallida, el valor mostrado sea siempre el último **confirmado por el servidor**, no el que el usuario tecleó. `localNickname` solo se actualiza cuando el servidor retorna 200.

### ¿Por qué `setTimeout` para `success → idle`?

Dar 2.5 segundos de feedback visual verde sin forzar al usuario a hacer click adicional. Es un patrón común en formularios inline (similar a GitHub al editar un campo de perfil).

### ¿Por qué `autoFocus` en el input?

Al hacer click en el lápiz, el cursor debe quedar listo para escribir de inmediato. Reduce la fricción de la interacción.

---

## 12. Resumen de archivos modificados

| Archivo                                                        | Tipo de cambio | Descripción                                            |
|----------------------------------------------------------------|----------------|--------------------------------------------------------|
| `src/app/services/performerProfile.service.ts`                 | Modificado     | Nuevo método `updateNickname()` en la clase `PerformerProfileService` |
| `src/components/performerProfile/NicknameEditor.tsx`           | **Creado**     | Componente completo con validación y manejo de errores |
| `src/components/performerProfile/ProfileTab.tsx`               | Modificado     | Import de `NicknameEditor` y reemplazo del bloque estático |
