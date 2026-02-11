'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
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

    // Conectar ao socket quando usuário estiver autenticado
    useEffect(() => {
        if (isAuthenticated && user && !socket) {
            console.log('SocketContext: Iniciando conexão...');

            const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

            if (!token) {
                console.warn('SocketContext: Token não encontrado');
                return;
            }

            // Criar conexão com autenticação
            const newSocket = io(env.wsUrl, {
                auth: {
                    token,
                },
                transports: ['websocket'],
                reconnection: true,
                reconnectionAttempts: 5,
                reconnectionDelay: 1000,
            });

            // Event listeners
            newSocket.on('connect', () => {
                console.log('SocketContext: Conectado', newSocket.id);
                setIsConnected(true);
            });

            newSocket.on('disconnect', (reason) => {
                console.log('SocketContext: Desconectado', reason);
                setIsConnected(false);
            });

            newSocket.on('connect_error', (error) => {
                console.error('SocketContext: Erro de conexão', error);
                setIsConnected(false);
            });

            newSocket.on('error', (error) => {
                console.error('SocketContext: Erro no socket', error);
            });

            setSocket(newSocket);

            // Cleanup ao desmontar
            return () => {
                console.log('SocketContext: Limpando conexão');
                newSocket.close();
            };
        }
    }, [isAuthenticated, user, socket]);

    // Desconectar quando usuário fizer logout
    useEffect(() => {
        if (!isAuthenticated && socket) {
            console.log('SocketContext: Usuário deslogou, desconectando socket');
            socket.close();
            setSocket(null);
            setIsConnected(false);
        }
    }, [isAuthenticated, socket]);

    const connect = useCallback(() => {
        if (socket && !socket.connected) {
            console.log('SocketContext: Reconectando manualmente...');
            socket.connect();
        }
    }, [socket]);

    const disconnect = useCallback(() => {
        if (socket) {
            console.log('SocketContext: Desconectando manualmente...');
            socket.disconnect();
        }
    }, [socket]);

    const emit = useCallback(
        (event: string, data?: any) => {
            if (socket && isConnected) {
                console.log(`SocketContext: Emitindo evento "${event}"`, data);
                socket.emit(event, data);
            } else {
                console.warn(`SocketContext: Não é possível emitir "${event}" - socket não conectado`);
            }
        },
        [socket, isConnected]
    );

    const on = useCallback(
        (event: string, handler: (data: any) => void) => {
            if (socket) {
                console.log(`SocketContext: Registrando listener para "${event}"`);
                socket.on(event, handler);
            }
        },
        [socket]
    );

    const off = useCallback(
        (event: string, handler?: (data: any) => void) => {
            if (socket) {
                console.log(`SocketContext: Removendo listener para "${event}"`);
                if (handler) {
                    socket.off(event, handler);
                } else {
                    socket.off(event);
                }
            }
        },
        [socket]
    );

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
