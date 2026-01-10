import React, { useState, useEffect, useRef } from 'react';
import { Send, Gift } from 'lucide-react';
import { useSocketStore } from '../../app/providers/SocketProvider';
import type { SocketMessage, ReceivedRoomMessage } from '../../shared/types/SocketMessage';
import {
  getDisplayText,
  isSystemMessage,
  isHighlightMessage,
  formatMessageTime,
} from '../../shared/utils/messageUtils';

interface StreamingChatProps {
  room: string;
  performerName: string;
  className?: string;
  onGiftClick?: () => void;
}

/**
 * Componente de chat para streaming que implementa la estructura de mensajes socket
 * Diseñado para integrarse con StreamingModal.tsx
 */
const StreamingChat: React.FC<StreamingChatProps> = ({
  room,
  performerName,
  className = '',
  onGiftClick,
}) => {
  const { connected, joinRoom, leaveRoom, sendRoomTextMessage, onRoomMessage } = useSocketStore();
  const [messages, setMessages] = useState<SocketMessage[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll al último mensaje
  const scrollToBottom = () => {
    if (messagesEndRef.current?.scrollIntoView) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Unirse a la sala al montar el componente
  useEffect(() => {
    if (connected && room) {
      console.log(`[StreamingChat] Uniéndose a la sala: ${room}`);
      joinRoom(room);

      return () => {
        console.log(`[StreamingChat] Saliendo de la sala: ${room}`);
        leaveRoom(room);
      };
    }
  }, [connected, room, joinRoom, leaveRoom]);

  // Escuchar mensajes de la sala
  useEffect(() => {
    const handleRoomMessage = (data: ReceivedRoomMessage) => {
      if (data.room === room) {
        console.log(`[StreamingChat] Mensaje recibido en ${room}:`, data.message);
        setMessages((prev) => [...prev, data.message]);
      }
    };

    onRoomMessage(handleRoomMessage);

    // Nota: onRoomMessage no retorna función de limpieza, 
    // el SocketProvider maneja la limpieza de listeners
  }, [room, onRoomMessage]);

  // Enviar mensaje
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();

    if (!messageInput.trim() || !connected) return;

    console.log(`[StreamingChat] Enviando mensaje a ${room}:`, messageInput);

    sendRoomTextMessage(room, messageInput, (response) => {
      console.log('[StreamingChat] ACK del servidor:', response);
    });

    setMessageInput('');
  };

  return (
    <div className={`flex flex-col bg-slate-800 border border-slate-700 rounded-lg ${className}`}>
      {/* Header del Chat */}
      <div className="flex items-center justify-between p-3 border-b border-slate-700">
        <div>
          <h3 className="text-white font-semibold">Chat en Vivo</h3>
          <p className="text-xs text-gray-400">
            {connected ? (
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Conectado
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                Desconectado
              </span>
            )}
          </p>
        </div>
        {onGiftClick && (
          <button
            onClick={onGiftClick}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-pink-400 hover:text-pink-300"
            title="Enviar regalo"
          >
            <Gift className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Lista de Mensajes */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-3 space-y-2 min-h-75 max-h-125"
      >
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500 text-sm">
            No hay mensajes aún. ¡Sé el primero en escribir!
          </div>
        ) : (
          messages.map((msg) => {
            const isSystem = isSystemMessage(msg.messageContent);
            const isHighlight = isHighlightMessage(msg.messageContent);

            return (
              <div
                key={msg.id}
                className={`flex items-start gap-2 ${
                  isSystem
                    ? 'text-yellow-400 text-xs'
                    : isHighlight
                      ? 'bg-purple-900/30 rounded px-2 py-1'
                      : ''
                }`}
              >
                <div className="flex-1">
                  {/* Nombre del remitente (solo para mensajes normales) */}
                  {!isSystem && (
                    <div className="flex items-baseline gap-2">
                      <span className="text-xs font-semibold text-white">
                        {msg.sender?.name || 'Usuario'}
                      </span>
                      {msg.timestamp && (
                        <span className="text-[10px] text-gray-500">
                          {formatMessageTime(msg.timestamp)}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Contenido del mensaje */}
                  <div
                    className={`text-xs ${
                      isSystem
                        ? 'text-yellow-300 font-medium'
                        : isHighlight
                          ? 'text-purple-200 font-medium'
                          : 'text-gray-300'
                    }`}
                  >
                    {getDisplayText(msg.messageContent)}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input de Mensaje */}
      <div className="p-3 border-t border-slate-700">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="text"
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            placeholder={
              connected ? `Mensaje a ${performerName}...` : 'Conectando al chat...'
            }
            disabled={!connected}
            className="flex-1 bg-slate-900 text-white border border-slate-600 rounded-lg px-3 py-2 text-sm 
                       focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent
                       disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <button
            type="submit"
            disabled={!connected || !messageInput.trim()}
            className="bg-pink-600 hover:bg-pink-700 disabled:bg-slate-700 disabled:cursor-not-allowed 
                       text-white rounded-lg px-4 py-2 transition-colors flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Enviar</span>
          </button>
        </form>

        {/* Info adicional */}
        <div className="mt-2 text-xs text-gray-500 flex items-center justify-between">
          <span>{messages.length} mensajes</span>
          <span>Sala: {room}</span>
        </div>
      </div>
    </div>
  );
};

export default StreamingChat;
