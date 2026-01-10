# StreamingChat - Componente de Chat para Streaming

## 📝 Descripción

`StreamingChat` es un componente de chat en tiempo real diseñado para integrarse con el modal de streaming de performers. Implementa la estructura de mensajes socket definida en `estructura_socket.md`, soportando diferentes tipos de mensajes: texto, multimedia, eventos de sistema, tokens y objetivos/metas.

## ✨ Características

- **Chat en tiempo real** usando Socket.IO
- **Múltiples tipos de mensajes**: texto, multimedia, sistema, tokens, goals
- **Auto-scroll** a los mensajes más recientes
- **Indicador de conexión** en tiempo real
- **Estilos diferenciados** por tipo de mensaje:
  - Mensajes de sistema (amarillo)
  - Mensajes destacados de tokens/goals (morado)
  - Mensajes normales (gris)
- **Formato de timestamp** para cada mensaje
- **Botón de regalo** integrado (opcional)
- **Diseño responsive** adaptado a diferentes tamaños de pantalla

## 🚀 Uso

### Integración básica

```tsx
import StreamingChat from './components/performers/StreamingChat';

function MiComponente() {
  return (
    <StreamingChat
      room="performer_123"
      performerName="Performer Name"
      className="h-full"
    />
  );
}
```

### Props

| Prop | Tipo | Requerido | Descripción |
|------|------|-----------|-------------|
| `room` | `string` | Sí | ID de la sala de chat (ej: `performer_123`) |
| `performerName` | `string` | Sí | Nombre del performer para mostrar en el placeholder |
| `className` | `string` | No | Clases CSS adicionales para el contenedor |
| `onGiftClick` | `() => void` | No | Callback al hacer clic en el botón de regalo |

### Ejemplo completo en StreamingModal

```tsx
<StreamingChat
  room={`performer_${performer.id}`}
  performerName={performer.stage_name || 'Performer'}
  className="h-full"
  onGiftClick={() => setShowGiftModal(true)}
/>
```

## 📦 Estructura de Archivos

### Archivos creados

```
src/
├── shared/
│   ├── types/
│   │   └── SocketMessage.ts          # Tipos TypeScript para mensajes
│   └── utils/
│       └── messageUtils.ts           # Utilidades para manejo de mensajes
└── components/
    └── performers/
        ├── StreamingChat.tsx         # Componente de chat
        └── StreamingModal.tsx        # Modal actualizado con el chat
```

## 🔧 Dependencias

- **React**: Framework base
- **Socket.IO Client**: Para comunicación en tiempo real
- **Lucide React**: Iconos
- **Tailwind CSS**: Estilos

## 📊 Tipos de Mensajes Soportados

### 1. Mensaje de Texto
```typescript
{
  type: 'text',
  content: 'Hola, ¿cómo estás?',
  timestamp: 1641234567890
}
```

### 2. Mensaje Multimedia
```typescript
{
  type: 'media',
  content: 'https://example.com/image.jpg',
  mediaType: 'image',
  fileName: 'photo.jpg',
  timestamp: 1641234567890
}
```

### 3. Evento del Sistema
```typescript
{
  type: 'system',
  content: 'client123_connected',
  timestamp: 1641234567890
}
```

### 4. Mensaje de Tokens
```typescript
{
  type: 'tokens',
  content: 'client123_25',
  timestamp: 1641234567890
}
```

### 5. Mensaje de Objetivo/Meta
```typescript
{
  type: 'goal',
  content: 'TipGoal_performer454_100',
  timestamp: 1641234567890
}
```

## 🎨 Personalización de Estilos

El componente usa Tailwind CSS. Los estilos se pueden personalizar modificando las clases en el componente o mediante la prop `className`.

### Colores por tipo de mensaje

- **Sistema**: `text-yellow-400`, `text-yellow-300`
- **Destacados (tokens/goals)**: `bg-purple-900/30`, `text-purple-200`
- **Normales**: `text-gray-300`

## 🔌 Integración con SocketProvider

El componente requiere que esté envuelto en un `SocketProvider`:

```tsx
import { SocketProvider } from './app/providers/SocketProvider';

function App() {
  return (
    <SocketProvider>
      {/* Tu aplicación */}
      <StreamingChat ... />
    </SocketProvider>
  );
}
```

## 📝 Funciones Utilitarias Disponibles

### Creación de mensajes

```typescript
import {
  createTextMessage,
  createMediaMessage,
  createSystemMessage,
  createTokensMessage,
  createGoalMessage,
} from '../shared/utils/messageUtils';

// Crear mensaje de texto
const textMsg = createTextMessage('Hola mundo');

// Crear mensaje de tokens
const tokensMsg = createTokensMessage('client123', 50);
```

### Validación y parsing

```typescript
import {
  validateMessageContent,
  parseTokensContent,
  getDisplayText,
  isSystemMessage,
  isHighlightMessage,
} from '../shared/utils/messageUtils';

// Validar mensaje
const isValid = validateMessageContent(messageContent);

// Parsear contenido de tokens
const parsed = parseTokensContent('client123_50');
// { clientId: 'client123', amount: 50 }

// Obtener texto para mostrar
const displayText = getDisplayText(messageContent);
```

## 🧪 Testing

Para probar el componente:

1. Asegúrate de que el servidor Socket está corriendo
2. Configura la variable de entorno `VITE_SOCKET_URL`
3. Abre el modal de streaming de un performer
4. El chat debe mostrar el indicador de conexión en verde
5. Escribe un mensaje y verifica que se envía
6. Si hay otros clientes conectados, deberías ver sus mensajes

## 🔄 Retrocompatibilidad

El sistema mantiene compatibilidad con mensajes legacy (strings simples) mediante conversión automática en el `SocketProvider`.

## 🐛 Solución de Problemas

### El chat no se conecta

- Verifica que `VITE_SOCKET_URL` esté configurada correctamente
- Asegúrate de que el servidor Socket.IO esté corriendo
- Revisa la consola del navegador para errores de conexión

### Los mensajes no se muestran

- Verifica que la sala (`room`) sea correcta
- Revisa que el `SocketProvider` esté envolviendo tu aplicación
- Verifica los logs en consola para mensajes recibidos

### Estilos no se aplican correctamente

- Asegúrate de que Tailwind CSS esté configurado
- Verifica que las clases no estén siendo purgadas en producción

## 📚 Referencias

- [Documento estructura_socket.md](../_docs/estructura_socket.md)
- [Socket.IO Documentation](https://socket.io/docs/v4/)
- [React Hooks](https://react.dev/reference/react)

## 🤝 Contribución

Al modificar este componente:

1. Mantén la compatibilidad con la estructura de mensajes
2. Actualiza los tests si cambias la lógica
3. Documenta cualquier nueva funcionalidad
4. Sigue las convenciones de código del proyecto

## 📄 Licencia

Este componente es parte del proyecto Charmss - Administrador.

---

**Última actualización**: 9 de enero de 2026
