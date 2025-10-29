"use client";

import { io, type Socket } from "socket.io-client";

// Singleton socket instance
let socket: Socket | null = null;

// Socket configuration optimized for production at scale
const socketConfig = {
  url: process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3000",
  options: {
    transports: ["websocket"], // Use WebSocket only for better performance
    upgrade: false, // Disable transport upgrade
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 10000,
    autoConnect: false, // Manual connection control
  },
};

/**
 * Get or create socket instance (singleton pattern)
 */
export const getSocket = (): Socket => {
  if (!socket) {
    socket = io(socketConfig.url, socketConfig.options);

    // Connection event handlers
    socket.on("connect", () => {
      console.log("[Socket] Connected:", socket?.id);
    });

    socket.on("disconnect", (reason) => {
      console.log("[Socket] Disconnected:", reason);
    });

    socket.on("connect_error", (error) => {
      console.error("[Socket] Connection error:", error);
    });

    socket.on("reconnect", (attemptNumber) => {
      console.log("[Socket] Reconnected after", attemptNumber, "attempts");
    });

    socket.on("reconnect_attempt", (attemptNumber) => {
      console.log("[Socket] Reconnection attempt:", attemptNumber);
    });

    socket.on("reconnect_error", (error) => {
      console.error("[Socket] Reconnection error:", error);
    });

    socket.on("reconnect_failed", () => {
      console.error("[Socket] Reconnection failed after all attempts");
    });
  }

  return socket;
};

/**
 * Connect to socket server
 */
export const connectSocket = (): void => {
  const socket = getSocket();
  if (!socket.connected) {
    socket.connect();
  }
};

/**
 * Disconnect from socket server
 */
export const disconnectSocket = (): void => {
  if (socket?.connected) {
    socket.disconnect();
  }
};

/**
 * Emit an event with acknowledgment support
 * @param event Event name
 * @param data Event data
 * @returns Promise that resolves when acknowledged
 */
export const emitWithAck = <T>(event: string, data?: unknown): Promise<T> => {
  return new Promise((resolve, reject) => {
    const socket = getSocket();
    if (!socket.connected) {
      reject(new Error("Socket not connected"));
      return;
    }

    socket.emit(event, data, (response: T) => {
      resolve(response);
    });

    // Timeout after 10 seconds
    setTimeout(() => {
      reject(new Error("Socket acknowledgment timeout"));
    }, 10000);
  });
};

/**
 * Subscribe to an event
 * @param event Event name
 * @param callback Event handler
 */
export const onEvent = <T>(
  event: string,
  callback: (data: T) => void,
): void => {
  const socket = getSocket();
  socket.on(event, callback);
};

/**
 * Unsubscribe from an event
 * @param event Event name
 * @param callback Event handler (optional, removes all if not provided)
 */
export const offEvent = <T>(
  event: string,
  callback?: (data: T) => void,
): void => {
  const socket = getSocket();
  if (callback) {
    socket.off(event, callback);
  } else {
    socket.off(event);
  }
};

/**
 * Join a room
 * @param room Room name
 */
export const joinRoom = async (room: string): Promise<void> => {
  await emitWithAck("join-room", { room });
};

/**
 * Leave a room
 * @param room Room name
 */
export const leaveRoom = async (room: string): Promise<void> => {
  await emitWithAck("leave-room", { room });
};

// Export socket helpers
export const socketHelpers = {
  getSocket,
  connectSocket,
  disconnectSocket,
  emitWithAck,
  onEvent,
  offEvent,
  joinRoom,
  leaveRoom,
};

export default socketHelpers;
