/* eslint-disable react-refresh/only-export-components */
import * as React from 'react';
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from 'react';
import { io, type Socket } from 'socket.io-client';
import { useAuthStore, validateAuthState } from '../stores/auth.store';
import type {
  SocketMessage,
  SocketMessageContent,
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

/* --- Tipos locales --- */
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
  // Do not expose ref values directly during render. Provide a getter instead.
  getSocket?: () => Socket | null;
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
      if (ack) {
        socketRef.current?.emit('messageToRoom', { room, message: messageContent }, ack);
      } else {
        emit('messageToRoom', { room, message: messageContent });
      }
    },
    [emit]
  );

  const sendRoomTextMessage = useCallback(
    (room: string, message: string, ack?: (resp: unknown) => void) => {
      const messageContent = createTextMessage(message);
      sendRoomMessage(room, messageContent, ack);
    },
    [sendRoomMessage]
  );

  const onRoomMessage = useCallback(
    (handler: (data: ReceivedRoomMessage) => void) => {
      on('message', (data) => {
        // Parsear el mensaje entrante y convertir si es legacy
        const rawData = data as { room: string; message: SocketMessage | string };

        let parsedMessage: SocketMessage;

        // Si el mensaje es un string (legacy), convertirlo
        if (typeof rawData.message === 'string') {
          parsedMessage = convertLegacyMessage(rawData.message, rawData.room);
        }
        // Si ya es un SocketMessage, validar su contenido
        else if (rawData.message && typeof rawData.message === 'object') {
          parsedMessage = rawData.message;

          // Validar el messageContent
          if (!validateMessageContent(parsedMessage.messageContent)) {
            console.warn('Mensaje recibido con formato inválido:', parsedMessage);
            // Convertir a mensaje de texto si el formato es inválido
            parsedMessage = convertLegacyMessage(
              JSON.stringify(parsedMessage.messageContent),
              rawData.room
            );
          }
        } else {
          console.warn('Formato de mensaje desconocido:', rawData);
          return;
        }

        handler({ room: rawData.room, message: parsedMessage });
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
        socketRef.current?.emit('privateMessage', { to, message }, ack);
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

  const getSocket = useCallback(() => socketRef.current, []);

  const value = useMemo(
    () => ({
      getSocket,
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
    }),
    [
      getSocket,
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
      joinRoom,
      leaveRoom,
      sendRoomMessage,
      sendRoomTextMessage,
      onRoomMessage,
      onUserJoined,
      sendPrivateMessage,
      onPrivateMessage,
    ]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  // some callbacks reference refs internally which is safe because refs are read only when those
  // callbacks are executed (not during render). Disable the rule here to avoid false positives.
  // eslint-disable-next-line react-hooks/refs
  return React.createElement(SocketContext.Provider, { value }, children);
};

export default SocketProvider;
