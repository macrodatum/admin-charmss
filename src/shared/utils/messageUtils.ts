import {
  SocketMessage,
  SocketMessageContent,
  TextMessageContent,
  MediaMessageContent,
  SystemMessageContent,
  TokensMessageContent,
  GoalMessageContent,
} from '../types/SocketMessage';

/**
 * Crea un mensaje de texto
 */
export const createTextMessage = (content: string): TextMessageContent => ({
  type: 'text',
  content,
  timestamp: Date.now(),
});

/**
 * Crea un mensaje multimedia
 */
export const createMediaMessage = (
  url: string,
  mediaType: 'image' | 'video' = 'image',
  fileName?: string
): MediaMessageContent => ({
  type: 'media',
  content: url,
  mediaType,
  fileName,
  timestamp: Date.now(),
});

/**
 * Crea un mensaje de sistema
 */
export const createSystemMessage = (
  event: 'connected' | 'disconnected' | 'joined' | 'left',
  clientId: string
): SystemMessageContent => ({
  type: 'system',
  content: `${clientId}_${event}`,
  event,
  clientId,
  timestamp: Date.now(),
});

/**
 * Crea un mensaje de tokens
 */
export const createTokensMessage = (clientId: string, amount: number): TokensMessageContent => ({
  type: 'tokens',
  content: `${clientId}_${amount}`,
  clientId,
  amount,
  timestamp: Date.now(),
});

/**
 * Crea un mensaje de objetivo/meta
 */
export const createGoalMessage = (
  goalName: string,
  performerId: string,
  tokens: number
): GoalMessageContent => ({
  type: 'goal',
  content: `${goalName}_${performerId}_${tokens}`,
  goalName,
  performerId,
  tokens,
  timestamp: Date.now(),
});

/**
 * Crea un mensaje completo de socket
 * `sender` puede ser un objeto {id,name,clientId} o un id string
 */
export const createSocketMessage = (
  room: string,
  messageContent: SocketMessageContent,
  sender?: { id: string; name?: string; clientId?: string } | string,
  senderName?: string,
  clientId?: string
): SocketMessage => {
  const id = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  let senderObj: { id: string; name?: string; clientId?: string } | undefined;
  if (!sender) {
    senderObj = undefined;
  } else if (typeof sender === 'object') {
    senderObj = { id: sender.id, name: sender.name || 'Usuario', clientId: sender.clientId };
  } else {
    senderObj = { id: sender, name: senderName || 'Usuario', clientId };
  }

  return {
    id,
    room,
    sender: senderObj,
    timestamp: Date.now(),
    messageContent,
  };
};

/**
 * Parsea el contenido de un mensaje del sistema
 */
export const parseSystemContent = (content: string): { clientId: string; event: string } | null => {
  const idx = content.indexOf('_');
  if (idx === -1) return null;

  return {
    clientId: content.substring(0, idx),
    event: content.substring(idx + 1),
  };
};

/**
 * Parsea el contenido de un mensaje de tokens
 */
export const parseTokensContent = (
  content: string
): { clientId: string; amount: number } | null => {
  const parts = content.split('_');
  if (parts.length !== 2) return null;

  const amount = parseInt(parts[1]);
  if (isNaN(amount)) return null;

  return {
    clientId: parts[0],
    amount,
  };
};

/**
 * Parsea el contenido de un mensaje de objetivo
 */
export const parseGoalContent = (
  content: string
): { goalName: string; performerId: string; tokens: number } | null => {
  const parts = content.split('_');
  if (parts.length !== 3) return null;

  const tokens = parseInt(parts[2]);
  if (isNaN(tokens)) return null;

  return {
    goalName: parts[0],
    performerId: parts[1],
    tokens,
  };
};

/**
 * Valida la estructura de un mensaje
 */
export const validateMessageContent = (
  messageContent: unknown
): messageContent is SocketMessageContent => {
  if (!messageContent || typeof messageContent !== 'object') {
    return false;
  }

  const obj = messageContent as Record<string, unknown>;
  const type = obj.type as string | undefined;
  const content = obj.content as string | undefined;
  const timestamp = obj.timestamp as number | undefined;

  if (!type || !['text', 'media', 'system', 'tokens', 'goal'].includes(type)) {
    return false;
  }

  if (typeof content !== 'string' || !content) {
    return false;
  }

  if (typeof timestamp !== 'number' || timestamp <= 0) {
    return false;
  }

  // Validaciones específicas por tipo
  switch (type) {
    case 'system':
      return parseSystemContent(content) !== null;
    case 'tokens':
      return parseTokensContent(content) !== null;
    case 'goal':
      return parseGoalContent(content) !== null;
    case 'media':
      try {
        new URL(content);
        return true;
      } catch {
        return false;
      }
    case 'text':
    default:
      return true;
  }
};

/**
 * Convierte un mensaje simple de string a estructura completa
 */
export const convertLegacyMessage = (
  message: string,
  room: string,
  senderId?: string,
  senderName?: string
): SocketMessage => {
  const textContent = createTextMessage(message);
  return createSocketMessage(room, textContent, senderId, senderName);
};

/**
 * Obtiene el texto mostrable de un mensaje
 */
export const getDisplayText = (messageContent: SocketMessageContent): string => {
  switch (messageContent.type) {
    case 'text':
      return messageContent.content;
    case 'media':
      return messageContent.fileName ? `📎 ${messageContent.fileName}` : `🖼️ Imagen`;
    case 'system': {
      const systemData = parseSystemContent(messageContent.content);
      if (systemData) {
        const eventText = {
          connected: 'se conectó',
          disconnected: 'se desconectó',
          joined: 'se unió',
          left: 'salió',
        };
        return `${systemData.clientId} ${
          eventText[systemData.event as keyof typeof eventText] || systemData.event
        }`;
      }
      return messageContent.content;
    }
    case 'tokens': {
      const tokensData = parseTokensContent(messageContent.content);
      return tokensData
        ? `💰 ${tokensData.clientId} envió ${tokensData.amount} tokens`
        : messageContent.content;
    }
    case 'goal': {
      const goalData = parseGoalContent(messageContent.content);
      return goalData
        ? `🎯 ${goalData.goalName}: ${goalData.tokens} tokens para ${goalData.performerId}`
        : messageContent.content;
    }
  }
};

/**
 * Determina si un mensaje es del sistema
 */
export const isSystemMessage = (messageContent: SocketMessageContent): boolean => {
  return messageContent.type === 'system';
};

/**
 * Determina si un mensaje requiere atención especial (tokens, goals)
 */
export const isHighlightMessage = (messageContent: SocketMessageContent): boolean => {
  return ['tokens', 'goal'].includes(messageContent.type);
};

/**
 * Formatea un timestamp a "HH:MM" con ceros a la izquierda.
 * Si el timestamp no es válido, retorna cadena vacía.
 */
export const formatMessageTime = (timestamp?: number | null): string => {
  if (typeof timestamp !== 'number' || !isFinite(timestamp) || timestamp <= 0) return '';
  const date = new Date(timestamp);
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};
