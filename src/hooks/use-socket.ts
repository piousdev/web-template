"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Socket } from "socket.io-client";
import {
  connectSocket,
  disconnectSocket,
  emitWithAck,
  getSocket,
  joinRoom,
  leaveRoom,
  offEvent,
  onEvent,
} from "@/lib/socket";

export interface UseSocketOptions {
  autoConnect?: boolean;
  rooms?: string[];
}

interface UseSocketReturn {
  socket: Socket | null;
  isConnected: boolean;
  connect: () => void;
  disconnect: () => void;
  emit: <T>(event: string, data?: unknown) => Promise<T>;
  on: <T>(event: string, callback: (data: T) => void) => void;
  off: <T>(event: string, callback?: (data: T) => void) => void;
  joinRoom: (room: string) => Promise<void>;
  leaveRoom: (room: string) => Promise<void>;
}

/**
 * Custom hook for WebSocket connections using Socket.io
 *
 * Provides socket connection management, event handling, and room joining/leaving.
 * Automatically handles connection lifecycle and cleanup.
 *
 * @param options Configuration options
 * @returns Socket utilities and connection state
 *
 * @example
 * ```tsx
 * function ChatComponent() {
 *   const { socket, isConnected, emit, on, joinRoom } = useSocket({
 *     autoConnect: true,
 *     rooms: ['chat-room-1']
 *   });
 *
 *   useEffect(() => {
 *     on('message', (data) => {
 *       console.log('New message:', data);
 *     });
 *   }, [on]);
 *
 *   const sendMessage = async (message: string) => {
 *     await emit('send-message', { message });
 *   };
 *
 *   return (
 *     <div>
 *       {isConnected ? 'Connected' : 'Disconnected'}
 *       <button onClick={() => sendMessage('Hello')}>Send</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useSocket(options: UseSocketOptions = {}): UseSocketReturn {
  const { autoConnect = false, rooms = [] } = options;
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const joinedRoomsRef = useRef<Set<string>>(new Set());

  /**
   * Initialize socket and connection handlers
   */
  useEffect(() => {
    socketRef.current = getSocket();

    const handleConnect = () => {
      console.log("[useSocket] Connected");
      setIsConnected(true);

      // Rejoin rooms on reconnection
      if (joinedRoomsRef.current.size > 0) {
        console.log("[useSocket] Rejoining rooms after reconnection");
        for (const room of joinedRoomsRef.current) {
          joinRoom(room).catch((error) => {
            console.error(`[useSocket] Failed to rejoin room ${room}:`, error);
          });
        }
      }
    };

    const handleDisconnect = () => {
      console.log("[useSocket] Disconnected");
      setIsConnected(false);
    };

    const handleConnectError = (error: Error) => {
      console.error("[useSocket] Connection error:", error);
      setIsConnected(false);
    };

    // Set up connection event handlers
    onEvent("connect", handleConnect);
    onEvent("disconnect", handleDisconnect);
    onEvent("connect_error", handleConnectError);

    // Auto-connect if enabled
    if (autoConnect) {
      connectSocket();
    }

    // Cleanup on unmount
    return () => {
      offEvent("connect", handleConnect);
      offEvent("disconnect", handleDisconnect);
      offEvent("connect_error", handleConnectError);

      // Leave all rooms
      if (joinedRoomsRef.current.size > 0) {
        for (const room of joinedRoomsRef.current) {
          leaveRoom(room).catch((error) => {
            console.error(`[useSocket] Failed to leave room ${room}:`, error);
          });
        }
        joinedRoomsRef.current.clear();
      }

      // Disconnect socket
      if (socketRef.current?.connected) {
        disconnectSocket();
      }
    };
  }, [autoConnect]);

  /**
   * Join initial rooms when connected
   */
  useEffect(() => {
    if (!isConnected || rooms.length === 0) return;

    const joinInitialRooms = async () => {
      for (const room of rooms) {
        try {
          await joinRoom(room);
          joinedRoomsRef.current.add(room);
          console.log(`[useSocket] Joined room: ${room}`);
        } catch (error) {
          console.error(`[useSocket] Failed to join room ${room}:`, error);
        }
      }
    };

    joinInitialRooms();
  }, [isConnected, rooms]);

  /**
   * Connect to socket server
   */
  const connect = useCallback(() => {
    if (!socketRef.current?.connected) {
      connectSocket();
    }
  }, []);

  /**
   * Disconnect from socket server
   */
  const disconnect = useCallback(() => {
    if (socketRef.current?.connected) {
      disconnectSocket();
    }
  }, []);

  /**
   * Emit an event with acknowledgment
   */
  const emit = useCallback(
    async <T>(event: string, data?: unknown): Promise<T> => {
      try {
        return await emitWithAck<T>(event, data);
      } catch (error) {
        console.error(`[useSocket] Failed to emit event ${event}:`, error);
        throw error;
      }
    },
    [],
  );

  /**
   * Subscribe to an event
   */
  const on = useCallback(
    <T>(event: string, callback: (data: T) => void): void => {
      onEvent(event, callback);
    },
    [],
  );

  /**
   * Unsubscribe from an event
   */
  const off = useCallback(
    <T>(event: string, callback?: (data: T) => void): void => {
      offEvent(event, callback);
    },
    [],
  );

  /**
   * Join a room
   */
  const handleJoinRoom = useCallback(async (room: string): Promise<void> => {
    try {
      await joinRoom(room);
      joinedRoomsRef.current.add(room);
      console.log(`[useSocket] Joined room: ${room}`);
    } catch (error) {
      console.error(`[useSocket] Failed to join room ${room}:`, error);
      throw error;
    }
  }, []);

  /**
   * Leave a room
   */
  const handleLeaveRoom = useCallback(async (room: string): Promise<void> => {
    try {
      await leaveRoom(room);
      joinedRoomsRef.current.delete(room);
      console.log(`[useSocket] Left room: ${room}`);
    } catch (error) {
      console.error(`[useSocket] Failed to leave room ${room}:`, error);
      throw error;
    }
  }, []);

  return {
    socket: socketRef.current,
    isConnected,
    connect,
    disconnect,
    emit,
    on,
    off,
    joinRoom: handleJoinRoom,
    leaveRoom: handleLeaveRoom,
  };
}
