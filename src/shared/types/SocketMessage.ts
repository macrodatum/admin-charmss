/**
 * Tipos de mensajes soportados por el sistema de chat
 */
export type MessageType = 'text' | 'media' | 'system' | 'tokens' | 'goal';

/**
 * Contenido base para todos los tipos de mensajes
 */
export interface BaseMessageContent {
  type: MessageType;
  timestamp: number; // Unix timestamp
}

/**
 * Mensaje de texto simple
 */
export interface TextMessageContent extends BaseMessageContent {
  type: 'text';
  content: string;
}

/**
 * Mensaje con contenido multimedia (imagen/video)
 */
export interface MediaMessageContent extends BaseMessageContent {
  type: 'media';
  content: string; // URL del archivo multimedia
  mediaType?: 'image' | 'video';
  fileName?: string;
}

/**
 * Mensaje de evento del sistema
 */
export interface SystemMessageContent extends BaseMessageContent {
  type: 'system';
  content: string; // Formato: "{clientId}_connected" o similar
  event: 'connected' | 'disconnected' | 'joined' | 'left';
  clientId?: string;
}

/**
 * Mensaje de tokens
 */
export interface TokensMessageContent extends BaseMessageContent {
  type: 'tokens';
  content: string; // Formato: "{clientId}_{cantidad}"
  clientId: string;
  amount: number;
}

/**
 * Mensaje de objetivo/meta
 */
export interface GoalMessageContent extends BaseMessageContent {
  type: 'goal';
  content: string; // Formato: "goal_{performerId}_{tokens}"
  goalName: string;
  performerId: string;
  tokens: number;
}

/**
 * Unión de todos los tipos de contenido de mensaje
 */
export type SocketMessageContent =
  | TextMessageContent
  | MediaMessageContent
  | SystemMessageContent
  | TokensMessageContent
  | GoalMessageContent;

/**
 * Representa al remitente de un mensaje
 */
export interface MessageSender {
  id: string;
  name?: string;
  clientId?: string;
}

/**
 * Estructura completa del mensaje de socket
 */
export interface SocketMessage {
  id: string;
  room: string;
  sender?: MessageSender;
  timestamp: number; // momento de creación del mensaje (ms)
  messageContent: SocketMessageContent;
}

/**
 * Payload para envío de mensajes a salas
 */
export interface RoomMessagePayload {
  room: string;
  messageContent: SocketMessageContent;
}

/**
 * Evento de mensaje recibido desde el servidor
 */
export interface ReceivedRoomMessage {
  room: string;
  message: SocketMessage;
}
