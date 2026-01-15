import * as React from 'react';
import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { io, type Socket } from 'socket.io-client';
import { useAuthStore, validateAuthState } from '../stores/auth.store';
import {
  SocketMessage,
  SocketMessageContent,
  RoomMessagePayload,
  ReceivedRoomMessage,
} from '../../shared/types/SocketMessage';
import {
  createTextMessage,
  validateMessageContent,
  convertLegacyMessage,
} from '../../shared/utils/messageUtils';

type SocketHandler = (...args: unknown[]) => void;

// Tipos para los eventos del servidor
interface ClientConnectEvent {
  nickname: string;
  appUserId: string;
}

interface ClientReceivedMessageEvent {
  nickname: string;
  type: 'chat' | 'media' | 'inbox';
  message: string;
}

interface ClientPurchaseEvent {
  nickname: string;
  product: string;
  value: string;
}

/* --- Nuevos tipos --- */
interface UserJoinedEvent {
  clientId: string;
  userId: string;
  room: string;
}
interface PrivateMessageEvent {
  from: string;
  fromUserId?: string;
  message: string;
}

interface SocketContextValue {
  socket: Socket | null;
  connected: boolean;
  emit: (event: string, ...args: unknown[]) => void;
  on: (event: string, handler: SocketHandler) => void;
  off: (event: string, handler?: SocketHandler) => void;
  disconnect: () => void;
  connect: () => void;
  // Métodos específicos para los eventos del servidor
  onClientConnect: (handler: (data: ClientConnectEvent) => void) => void;
  onClientReceivedMessage: (handler: (data: ClientReceivedMessageEvent) => void) => void;
  onClientPurchase: (handler: (data: ClientPurchaseEvent) => void) => void;
  // Método para enviar ping
  sendPing: () => void;
  // ---- Nuevos helpers para salas y PMs ----
  joinRoom: (room: string) => void;
  leaveRoom: (room: string) => void;
  sendRoomMessage: (
    room: string,
    messageContent: SocketMessageContent,
    ack?: (resp: unknown) => void
  ) => void;
  sendRoomTextMessage: (room: string, message: string, ack?: (resp: unknown) => void) => void;
  onRoomMessage: (handler: (data: ReceivedRoomMessage) => void) => void;
  onUserJoined: (handler: (data: UserJoinedEvent) => void) => void;
  sendPrivateMessage: (to: string, message: string, ack?: (resp: unknown) => void) => void;
  onPrivateMessage: (handler: (data: PrivateMessageEvent) => void) => void;
}

const SocketContext = createContext<SocketContextValue | undefined>(undefined);

export const useSocketStore = () => {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error('useSocketStore must be used within a SocketProvider');
  return ctx;
};

interface SocketProviderProps {
  children: React.ReactNode;
  pingInterval?: number; // Intervalo de ping en ms (opcional)
}

export const SocketProvider: React.FC<SocketProviderProps> = ({
  children,
  pingInterval = 30000, // 30 segundos por defecto
}) => {
  const jwt = useAuthStore((s) => s.jwt);
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);

  const socketRef = useRef<Socket | null>(null);
  const [socketState, setSocketState] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const pendingHandlers = useRef<Record<string, SocketHandler[]>>({});
  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Configurar listeners por defecto
  const setupDefaultListeners = useCallback((socket: Socket) => {
    socket.on('clientconnect', (data: ClientConnectEvent) => {
      console.log('Client connected:', data);
    });

    socket.on('clientreceivedmessage', (data: ClientReceivedMessageEvent) => {
      console.log('Client received message:', data);
    });

    socket.on('clientpurchase', (data: ClientPurchaseEvent) => {
      console.log('Client purchase:', data);
    });
  }, []);

  // Método para enviar ping (estable y memoizado)
  const sendPing = useCallback(() => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('ping', { timestamp: Date.now() });
      console.log('Ping sent');
    }
  }, []);

  // Iniciar ping automático
  const startPing = useCallback(() => {
    if (pingIntervalRef.current) return;

    pingIntervalRef.current = setInterval(() => {
      if (socketRef.current?.connected) {
        sendPing();
      }
    }, pingInterval);
  }, [sendPing, pingInterval]);

  // Detener ping automático
  const stopPing = useCallback(() => {
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
      pingIntervalRef.current = null;
    }
  }, []);

  const disconnect = useCallback(() => {
    stopPing();
    socketRef.current?.disconnect();
    socketRef.current = null;
    setSocketState(null);
    setConnected(false);
  }, [stopPing]);

  // Create connect function
  const connect = useCallback(() => {
    if (!jwt) return;
    if (socketRef.current && socketRef.current.connected) return;
    // Resolve URL from env var or fallback to localhost:3000 for testing
    const url = (import.meta.env.VITE_SOCKET_URL as string) ?? 'http://localhost:3000';
    console.log('Connecting socket to:', url);

    socketRef.current = io(url, {
      auth: { token: jwt },
      transports: ['websocket'],
      // You may add extra options here (reconnection, path, etc.)
    });

    const s = socketRef.current;
    setSocketState(s);

    s.on('connect', () => {
      setConnected(true);
      console.log(
        'Socket connected; id:',
        s.id,
        'manager uri:',
        (s as unknown as { io?: { uri?: string } })?.io?.uri
      );

      // Iniciar el ping automático
      startPing();
    });

    s.on('disconnect', () => {
      setConnected(false);
      console.log('Socket disconnected');

      // Detener el ping automático
      stopPing();
    });

    s.on('connect_error', (error) => {
      console.error('Socket connection error:', error, 'while connecting to', url);
    });

    // Listener para respuesta del ping
    s.on('pong', (data) => {
      console.log('Pong received:', data);
    });

    // Configurar listeners por defecto para los eventos del servidor
    setupDefaultListeners(s);

    // register any pending handlers
    Object.keys(pendingHandlers.current).forEach((evt) => {
      pendingHandlers.current[evt].forEach((h) => s.on(evt, h));
    });
  }, [jwt, startPing, setupDefaultListeners, stopPing]);

  // Reconnect when jwt becomes available and user is logged in
  useEffect(() => {
    if (isLoggedIn && jwt && !validateAuthState()) {
      // token expired: ensure disconnect
      disconnect();
      return;
    }

    if (isLoggedIn && jwt) {
      connect();
      return () => {
        // do not disconnect on immediate cleanup unless unmounting
      };
    }

    // If user logged out or no jwt, disconnect
    if (!isLoggedIn || !jwt) {
      disconnect();
    }
  }, [isLoggedIn, jwt, connect, disconnect]);

  // helpers
  const emit = useCallback((event: string, ...args: unknown[]) => {
    // Log para debugging de eventos salientes (ver en consola del cliente / DevTools)
    try {
      console.log('Socket emit:', event, ...args);
    } catch {
      // safe fallback si console falla
    }

    socketRef.current?.emit(event, ...args);
  }, []);

  const on = useCallback((event: string, handler: SocketHandler) => {
    if (socketRef.current) {
      socketRef.current.on(event, handler);
    } else {
      pendingHandlers.current[event] = pendingHandlers.current[event] || [];
      pendingHandlers.current[event].push(handler);
    }
  }, []);

  const off = useCallback((event: string, handler?: SocketHandler) => {
    if (socketRef.current) {
      // use a safe typed call to avoid 'any' usage
      (
        socketRef.current as unknown as { off: (event: string, handler?: SocketHandler) => void }
      ).off(event, handler);
    }

    if (!handler) {
      pendingHandlers.current[event] = [];
    } else {
      pendingHandlers.current[event] = (pendingHandlers.current[event] || []).filter(
        (h) => h !== handler
      );
    }
  }, []);

  // Métodos específicos para escuchar eventos del servidor
  const onClientConnect = useCallback(
    (handler: (data: ClientConnectEvent) => void) => {
      on('clientconnect', (data) => handler(data as ClientConnectEvent));
    },
    [on]
  );

  const onClientReceivedMessage = useCallback(
    (handler: (data: ClientReceivedMessageEvent) => void) => {
      on('clientreceivedmessage', (data) => handler(data as ClientReceivedMessageEvent));
    },
    [on]
  );

  const onClientPurchase = useCallback(
    (handler: (data: ClientPurchaseEvent) => void) => {
      on('clientpurchase', (data) => handler(data as ClientPurchaseEvent));
    },
    [on]
  );

  /* ---- NUEVOS HELPERS ---- */
  const joinRoom = useCallback(
    (room: string) => {
      emit('joinRoom', room);
    },
    [emit]
  );

  const leaveRoom = useCallback(
    (room: string) => {
      emit('leaveRoom', room);
    },
    [emit]
  );

  const sendRoomMessage = useCallback(
    (room: string, messageContent: SocketMessageContent, ack?: (resp: unknown) => void) => {
      const payload: RoomMessagePayload = {
        room,
        messageContent,
      };

      if (ack) {
        emit('messageToRoom', payload, ack);
      } else {
        emit('messageToRoom', payload);
      }
    },
    [emit]
  );

  const sendRoomTextMessage = useCallback(
    (room: string, message: string, ack?: (resp: unknown) => void) => {
      const textContent = createTextMessage(message);
      sendRoomMessage(room, textContent, ack);
    },
    [sendRoomMessage]
  );

  const onRoomMessage = useCallback(
    (handler: (data: ReceivedRoomMessage) => void) => {
      on('message', (rawData) => {
        try {
          // Intentar parsear como mensaje estructurado
          let message: SocketMessage;

          if (typeof rawData === 'string') {
            // Mensaje legacy - convertir a estructura nueva
            message = convertLegacyMessage(rawData, 'unknown');
          } else if (rawData && typeof rawData === 'object') {
            const data = rawData as Record<string, unknown>;

            // Verificar si ya es un mensaje estructurado
            if (data.messageContent && validateMessageContent(data.messageContent)) {
              message = data as unknown as SocketMessage;
            } else if (typeof data.message === 'string' && typeof data.room === 'string') {
              // Formato legacy con room
              message = convertLegacyMessage(data.message, data.room);
            } else {
              console.warn('Received unknown message format:', rawData);
              return;
            }
          } else {
            console.warn('Received invalid message:', rawData);
            return;
          }

          const receivedMessage: ReceivedRoomMessage = {
            room: message.room,
            message,
          };

          handler(receivedMessage);
        } catch (error) {
          console.error('Error processing room message:', error, rawData);
        }
      });
    },
    [on]
  );

  const onUserJoined = useCallback(
    (handler: (data: UserJoinedEvent) => void) => {
      on('userJoined', (data) => handler(data as UserJoinedEvent));
    },
    [on]
  );

  const sendPrivateMessage = useCallback(
    (to: string, message: string, ack?: (resp: unknown) => void) => {
      if (ack) {
        emit('privateMessage', { to, message }, ack);
      } else {
        emit('privateMessage', { to, message });
      }
    },
    [emit]
  );

  const onPrivateMessage = useCallback(
    (handler: (data: PrivateMessageEvent) => void) => {
      on('privateMessage', (data) => handler(data as PrivateMessageEvent));
    },
    [on]
  );

  const value = {
    socket: socketState,
    connected,
    emit,
    on,
    off,
    disconnect,
    connect,
    sendPing,
    onClientConnect,
    onClientReceivedMessage,
    onClientPurchase,
    // nuevos:
    joinRoom,
    leaveRoom,
    sendRoomMessage,
    sendRoomTextMessage,
    onRoomMessage,
    onUserJoined,
    sendPrivateMessage,
    onPrivateMessage,
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return React.createElement(SocketContext.Provider, { value }, children);
};

export default SocketProvider;
