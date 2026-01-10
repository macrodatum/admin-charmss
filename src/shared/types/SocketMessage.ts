/**
 * Tipos de mensajes soportados por el sistema de chat socket
 */
export type MessageType = 'text' | 'media' | 'system' | 'tokens' | 'goal';

/**
 * Contenido base común para todos los tipos de mensajes
 */
export interface BaseMessageContent {
  type: MessageType;
  content: string;
  timestamp: number;
}

/**
 * Mensaje de texto simple
 */
export interface TextMessageContent extends BaseMessageContent {
  type: 'text';
  content: string;
}

/**
 * Mensaje multimedia (imágenes, videos, etc.)
 */
export interface MediaMessageContent extends BaseMessageContent {
  type: 'media';
  content: string; // URL del archivo multimedia
  mediaType?: 'image' | 'video' | 'audio';
  fileName?: string;
}

/**
 * Evento del sistema (conexiones, desconexiones, etc.)
 */
export interface SystemMessageContent extends BaseMessageContent {
  type: 'system';
  content: string; // Formato: "clientId_evento" ej: "client123_connected"
}

/**
 * Mensaje de envío de tokens
 */
export interface TokensMessageContent extends BaseMessageContent {
  type: 'tokens';
  content: string; // Formato: "clientId_cantidad" ej: "client123_25"
}

/**
 * Mensaje de objetivo/meta (TipGoal)
 */
export interface GoalMessageContent extends BaseMessageContent {
  type: 'goal';
  content: string; // Formato: "goalName_performerId_tokens" ej: "TipGoal_performer454_100"
}

/**
 * Union type de todos los contenidos de mensaje posibles
 */
export type SocketMessageContent =
  | TextMessageContent
  | MediaMessageContent
  | SystemMessageContent
  | TokensMessageContent
  | GoalMessageContent;

/**
 * Información del remitente del mensaje
 */
export interface MessageSender {
  id: string;
  name?: string;
  avatar?: string;
  role?: 'performer' | 'client' | 'system' | 'admin';
}

/**
 * Estructura completa del mensaje socket con metadatos
 */
export interface SocketMessage {
  id: string;
  room: string;
  messageContent: SocketMessageContent;
  sender?: MessageSender;
  timestamp?: number;
}

/**
 * Payload para enviar mensajes a una sala
 */
export interface RoomMessagePayload {
  room: string;
  message: SocketMessageContent;
}

/**
 * Estructura de mensaje recibido desde el servidor
 */
export interface ReceivedRoomMessage {
  room: string;
  message: SocketMessage;
}

/**
 * Datos parseados del contenido de un mensaje de sistema
 */
export interface ParsedSystemContent {
  clientId: string;
  event: string;
}

/**
 * Datos parseados del contenido de un mensaje de tokens
 */
export interface ParsedTokensContent {
  clientId: string;
  amount: number;
}

/**
 * Datos parseados del contenido de un mensaje de objetivo/meta
 */
export interface ParsedGoalContent {
  goalName: string;
  performerId: string;
  tokens: number;
}
