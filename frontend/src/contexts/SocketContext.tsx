'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { env } from '@/config/env';

interface SocketContextData {
  socket: Socket | null;
  isConnected: boolean;
  connect: () => void;
  disconnect: () => void;
  emit: (event: string, data?: any) => void;
  on: (event: string, handler: (data: any) => void) => void;
  off: (event: string, handler?: (data: any) => void) => void;
}

const SocketContext = createContext<SocketContextData>({} as SocketContextData);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

interface SocketProviderProps {
  children: React.ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const socketRef = useRef<Socket | null>(null);

  // Conectar ao socket quando usuário estiver autenticado
  useEffect(() => {
    if (isAuthenticated && user) {
      // Já tem socket ativo — não recria
      if (socketRef.current) {
        return;
      }

      console.log('SocketContext: Iniciando conexão...');

      const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

      if (!token) {
        console.warn('SocketContext: Token não encontrado no localStorage');
        return;
      }

      console.log('SocketContext: Token encontrado, conectando a', env.wsUrl);

      // Criar conexão com autenticação
      const newSocket = io(env.wsUrl, {
        auth: {
          token,
        },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
      });

      socketRef.current = newSocket;

      // Event listeners
      newSocket.on('connect', () => {
        console.log('SocketContext: Conectado!', newSocket.id);
        setIsConnected(true);
      });

      newSocket.on('disconnect', (reason) => {
        console.log('SocketContext: Desconectado -', reason);
        setIsConnected(false);
      });

      newSocket.on('connect_error', (error) => {
        console.error('SocketContext: Erro de conexão -', error.message);
        setIsConnected(false);
      });

      newSocket.on('error', (error) => {
        console.error('SocketContext: Erro no socket', error);
      });

      setSocket(newSocket);
    }

    // Cleanup apenas quando o componente desmonta de verdade
    return () => {
      if (socketRef.current) {
        console.log('SocketContext: Cleanup - fechando conexão');
        socketRef.current.removeAllListeners();
        socketRef.current.close();
        socketRef.current = null;
        setSocket(null);
        setIsConnected(false);
      }
    };
  }, [isAuthenticated, user]);

  // Desconectar quando usuário fizer logout
  useEffect(() => {
    if (!isAuthenticated && socketRef.current) {
      console.log('SocketContext: Usuário deslogou, desconectando socket');
      socketRef.current.removeAllListeners();
      socketRef.current.close();
      socketRef.current = null;
      setSocket(null);
      setIsConnected(false);
    }
  }, [isAuthenticated]);

  const connect = useCallback(() => {
    if (socketRef.current && !socketRef.current.connected) {
      console.log('SocketContext: Reconectando manualmente...');
      socketRef.current.connect();
    }
  }, []);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      console.log('SocketContext: Desconectando manualmente...');
      socketRef.current.disconnect();
    }
  }, []);

  const emit = useCallback((event: string, data?: any) => {
    if (socketRef.current?.connected) {
      console.log(`SocketContext: Emitindo evento "${event}"`, data);
      socketRef.current.emit(event, data);
    } else {
      console.warn(`SocketContext: Não é possível emitir "${event}" - socket não conectado`);
    }
  }, []);

  const on = useCallback((event: string, handler: (data: any) => void) => {
    if (socketRef.current) {
      socketRef.current.on(event, handler);
    }
  }, []);

  const off = useCallback((event: string, handler?: (data: any) => void) => {
    if (socketRef.current) {
      if (handler) {
        socketRef.current.off(event, handler);
      } else {
        socketRef.current.off(event);
      }
    }
  }, []);

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        connect,
        disconnect,
        emit,
        on,
        off,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};
