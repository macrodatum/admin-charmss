import type {
  SocketMessage,
  SocketMessageContent,
  TextMessageContent,
  MediaMessageContent,
  SystemMessageContent,
  TokensMessageContent,
  GoalMessageContent,
  ParsedSystemContent,
  ParsedTokensContent,
  ParsedGoalContent,
  MessageSender,
} from '../types/SocketMessage';

/**
 * Genera un ID único para un mensaje
 */
export const generateMessageId = (): string => {
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// ============================================================================
// FUNCIONES DE CREACIÓN DE MENSAJES
// ============================================================================

/**
 * Crea un mensaje de texto simple
 */
export const createTextMessage = (content: string): TextMessageContent => {
  return {
    type: 'text',
    content,
    timestamp: Date.now(),
  };
};

/**
 * Crea un mensaje multimedia
 */
export const createMediaMessage = (
  url: string,
  mediaType?: 'image' | 'video' | 'audio',
  fileName?: string
): MediaMessageContent => {
  return {
    type: 'media',
    content: url,
    mediaType,
    fileName,
    timestamp: Date.now(),
  };
};

/**
 * Crea un mensaje de evento del sistema
 */
export const createSystemMessage = (event: string, clientId: string): SystemMessageContent => {
  return {
    type: 'system',
    content: `${clientId}_${event}`,
    timestamp: Date.now(),
  };
};

/**
 * Crea un mensaje de tokens
 */
export const createTokensMessage = (clientId: string, amount: number): TokensMessageContent => {
  return {
    type: 'tokens',
    content: `${clientId}_${amount}`,
    timestamp: Date.now(),
  };
};

/**
 * Crea un mensaje de objetivo/meta
 */
export const createGoalMessage = (
  goalName: string,
  performerId: string,
  tokens: number
): GoalMessageContent => {
  return {
    type: 'goal',
    content: `${goalName}_${performerId}_${tokens}`,
    timestamp: Date.now(),
  };
};

/**
 * Crea un mensaje de socket completo con metadatos
 */
export const createSocketMessage = (
  room: string,
  messageContent: SocketMessageContent,
  sender?: MessageSender
): SocketMessage => {
  return {
    id: generateMessageId(),
    room,
    messageContent,
    sender,
    timestamp: Date.now(),
  };
};

// ============================================================================
// FUNCIONES DE PARSING DE CONTENIDO
// ============================================================================

/**
 * Parsea el contenido de un mensaje de sistema
 * Formato esperado: "clientId_evento"
 */
export const parseSystemContent = (content: string): ParsedSystemContent | null => {
  const parts = content.split('_');
  if (parts.length < 2) return null;

  const clientId = parts[0];
  const event = parts.slice(1).join('_'); // Por si el evento contiene underscores

  return { clientId, event };
};

/**
 * Parsea el contenido de un mensaje de tokens
 * Formato esperado: "clientId_cantidad"
 */
export const parseTokensContent = (content: string): ParsedTokensContent | null => {
  const parts = content.split('_');
  if (parts.length !== 2) return null;

  const clientId = parts[0];
  const amount = parseInt(parts[1], 10);

  if (isNaN(amount)) return null;

  return { clientId, amount };
};

/**
 * Parsea el contenido de un mensaje de objetivo/meta
 * Formato esperado: "goalName_performerId_tokens"
 */
export const parseGoalContent = (content: string): ParsedGoalContent | null => {
  const parts = content.split('_');
  if (parts.length !== 3) return null;

  const goalName = parts[0];
  const performerId = parts[1];
  const tokens = parseInt(parts[2], 10);

  if (isNaN(tokens)) return null;

  return { goalName, performerId, tokens };
};

// ============================================================================
// FUNCIONES DE VALIDACIÓN
// ============================================================================

/**
 * Valida si una URL es válida
 */
const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Valida la estructura de un mensaje según su tipo
 */
export const validateMessageContent = (messageContent: SocketMessageContent): boolean => {
  if (!messageContent || !messageContent.type || !messageContent.content) {
    return false;
  }

  // Validar timestamp
  if (
    !messageContent.timestamp ||
    typeof messageContent.timestamp !== 'number' ||
    messageContent.timestamp <= 0
  ) {
    return false;
  }

  // Validaciones específicas por tipo
  switch (messageContent.type) {
    case 'text':
      return typeof messageContent.content === 'string' && messageContent.content.length > 0;

    case 'media':
      return isValidUrl(messageContent.content);

    case 'system':
      return parseSystemContent(messageContent.content) !== null;

    case 'tokens':
      return parseTokensContent(messageContent.content) !== null;

    case 'goal':
      return parseGoalContent(messageContent.content) !== null;

    default:
      return false;
  }
};

// ============================================================================
// FUNCIONES DE CONVERSIÓN Y RETROCOMPATIBILIDAD
// ============================================================================

/**
 * Convierte un mensaje legacy (string simple) a la nueva estructura
 */
export const convertLegacyMessage = (message: string, room: string): SocketMessage => {
  return {
    id: generateMessageId(),
    room,
    messageContent: createTextMessage(message),
    timestamp: Date.now(),
  };
};

// ============================================================================
// FUNCIONES DE UTILIDAD PARA UI
// ============================================================================

/**
 * Genera el texto a mostrar en la UI según el tipo de mensaje
 */
export const getDisplayText = (messageContent: SocketMessageContent): string => {
  switch (messageContent.type) {
    case 'text':
      return messageContent.content;

    case 'media': {
      const mediaType = (messageContent as MediaMessageContent).mediaType;
      const fileName = (messageContent as MediaMessageContent).fileName;
      if (fileName) return `📎 ${fileName}`;
      if (mediaType === 'image') return '🖼️ Imagen';
      if (mediaType === 'video') return '🎥 Video';
      if (mediaType === 'audio') return '🎵 Audio';
      return '📎 Archivo multimedia';
    }

    case 'system': {
      const parsed = parseSystemContent(messageContent.content);
      if (!parsed) return messageContent.content;
      const eventText = parsed.event === 'connected' ? 'se conectó' : parsed.event;
      return `${parsed.clientId} ${eventText}`;
    }

    case 'tokens': {
      const parsed = parseTokensContent(messageContent.content);
      if (!parsed) return messageContent.content;
      return `💰 ${parsed.clientId} envió ${parsed.amount} tokens`;
    }

    case 'goal': {
      const parsed = parseGoalContent(messageContent.content);
      if (!parsed) return messageContent.content;
      return `🎯 ${parsed.goalName}: ${parsed.tokens} tokens para ${parsed.performerId}`;
    }

    default:
      return '';
  }
};

/**
 * Determina si un mensaje es de tipo sistema
 */
export const isSystemMessage = (messageContent: SocketMessageContent): boolean => {
  return messageContent.type === 'system';
};

/**
 * Determina si un mensaje debe destacarse (tokens, goals)
 */
export const isHighlightMessage = (messageContent: SocketMessageContent): boolean => {
  return messageContent.type === 'tokens' || messageContent.type === 'goal';
};

/**
 * Obtiene el color de tema para un tipo de mensaje
 */
export const getMessageThemeColor = (messageContent: SocketMessageContent): string => {
  switch (messageContent.type) {
    case 'system':
      return 'yellow';
    case 'tokens':
    case 'goal':
      return 'purple';
    default:
      return 'gray';
  }
};

/**
 * Formatea un timestamp a una hora legible
 */
export const formatMessageTime = (timestamp: number): string => {
  const date = new Date(timestamp);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};
