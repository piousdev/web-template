import { renderHook, waitFor } from "@testing-library/react";
import type { Socket } from "socket.io-client";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useSocket } from "./use-socket";

// Mock socket.io library
const mockSocket = {
  connected: false,
  connect: vi.fn(),
  disconnect: vi.fn(),
  on: vi.fn(),
  off: vi.fn(),
  emit: vi.fn(),
} as unknown as Socket;

const mockGetSocket = vi.fn(() => mockSocket);
const mockConnectSocket = vi.fn();
const mockDisconnectSocket = vi.fn();
const mockOnEvent = vi.fn();
const mockOffEvent = vi.fn();
const mockEmitWithAck = vi.fn();
const mockJoinRoom = vi.fn();
const mockLeaveRoom = vi.fn();

vi.mock("@/lib/socket", () => ({
  getSocket: () => mockGetSocket(),
  connectSocket: () => mockConnectSocket(),
  disconnectSocket: () => mockDisconnectSocket(),
  onEvent: (...args: unknown[]) => mockOnEvent(...args),
  offEvent: (...args: unknown[]) => mockOffEvent(...args),
  emitWithAck: (...args: unknown[]) => mockEmitWithAck(...args),
  joinRoom: (...args: unknown[]) => mockJoinRoom(...args),
  leaveRoom: (...args: unknown[]) => mockLeaveRoom(...args),
}));

describe("useSocket", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSocket.connected = false;
    mockEmitWithAck.mockResolvedValue({ success: true });
    mockJoinRoom.mockResolvedValue(undefined);
    mockLeaveRoom.mockResolvedValue(undefined);
  });

  describe("Initialization", () => {
    it("should initialize with disconnected state", () => {
      const { result } = renderHook(() => useSocket());

      expect(result.current.isConnected).toBe(false);
      expect(result.current.socket).toBe(mockSocket);
    });

    it("should auto-connect when autoConnect is true", () => {
      renderHook(() => useSocket({ autoConnect: true }));

      expect(mockConnectSocket).toHaveBeenCalled();
    });

    it("should not auto-connect when autoConnect is false", () => {
      renderHook(() => useSocket({ autoConnect: false }));

      expect(mockConnectSocket).not.toHaveBeenCalled();
    });

    it("should set up connection event handlers", () => {
      renderHook(() => useSocket());

      expect(mockOnEvent).toHaveBeenCalledWith("connect", expect.any(Function));
      expect(mockOnEvent).toHaveBeenCalledWith(
        "disconnect",
        expect.any(Function),
      );
      expect(mockOnEvent).toHaveBeenCalledWith(
        "connect_error",
        expect.any(Function),
      );
    });
  });

  describe("Connection State", () => {
    it("should update isConnected on connect event", () => {
      let connectHandler: (() => void) | undefined;
      mockOnEvent.mockImplementation((event: string, handler: () => void) => {
        if (event === "connect") {
          connectHandler = handler;
        }
      });

      const { result } = renderHook(() => useSocket());

      expect(result.current.isConnected).toBe(false);

      // Simulate connect event
      connectHandler?.();

      waitFor(() => {
        expect(result.current.isConnected).toBe(true);
      });
    });

    it("should update isConnected on disconnect event", () => {
      let disconnectHandler: (() => void) | undefined;
      mockOnEvent.mockImplementation((event: string, handler: () => void) => {
        if (event === "disconnect") {
          disconnectHandler = handler;
        }
      });

      const { result } = renderHook(() => useSocket());

      // Simulate disconnect event
      disconnectHandler?.();

      waitFor(() => {
        expect(result.current.isConnected).toBe(false);
      });
    });

    it("should handle connect_error event", () => {
      const consoleErrorSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      let errorHandler: ((error: Error) => void) | undefined;
      mockOnEvent.mockImplementation(
        (event: string, handler: (error: Error) => void) => {
          if (event === "connect_error") {
            errorHandler = handler;
          }
        },
      );

      const { result } = renderHook(() => useSocket());

      const error = new Error("Connection failed");
      errorHandler?.(error);

      waitFor(() => {
        expect(result.current.isConnected).toBe(false);
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          "[useSocket] Connection error:",
          error,
        );
      });

      consoleErrorSpy.mockRestore();
    });
  });

  describe("connect/disconnect", () => {
    it("should call connectSocket when connect is called", () => {
      mockSocket.connected = false;

      const { result } = renderHook(() => useSocket());

      result.current.connect();

      expect(mockConnectSocket).toHaveBeenCalled();
    });

    it("should not connect if already connected", () => {
      mockSocket.connected = true;

      const { result } = renderHook(() => useSocket());

      result.current.connect();

      expect(mockConnectSocket).not.toHaveBeenCalled();
    });

    it("should call disconnectSocket when disconnect is called", () => {
      mockSocket.connected = true;

      const { result } = renderHook(() => useSocket());

      result.current.disconnect();

      expect(mockDisconnectSocket).toHaveBeenCalled();
    });

    it("should not disconnect if already disconnected", () => {
      mockSocket.connected = false;

      const { result } = renderHook(() => useSocket());

      result.current.disconnect();

      expect(mockDisconnectSocket).not.toHaveBeenCalled();
    });
  });

  describe("Event Handling", () => {
    it("should emit event with data", async () => {
      const mockResponse = { result: "success" };
      mockEmitWithAck.mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() => useSocket());

      const response = await result.current.emit("test-event", {
        data: "test",
      });

      expect(mockEmitWithAck).toHaveBeenCalledWith("test-event", {
        data: "test",
      });
      expect(response).toEqual(mockResponse);
    });

    it("should handle emit errors", async () => {
      const consoleErrorSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      const error = new Error("Emit failed");
      mockEmitWithAck.mockRejectedValueOnce(error);

      const { result } = renderHook(() => useSocket());

      await expect(result.current.emit("test-event")).rejects.toThrow(
        "Emit failed",
      );
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });

    it("should subscribe to events", () => {
      const { result } = renderHook(() => useSocket());
      const callback = vi.fn();

      result.current.on("test-event", callback);

      expect(mockOnEvent).toHaveBeenCalledWith("test-event", callback);
    });

    it("should unsubscribe from events", () => {
      const { result } = renderHook(() => useSocket());
      const callback = vi.fn();

      result.current.off("test-event", callback);

      expect(mockOffEvent).toHaveBeenCalledWith("test-event", callback);
    });

    it("should unsubscribe from all listeners when no callback provided", () => {
      const { result } = renderHook(() => useSocket());

      result.current.off("test-event");

      expect(mockOffEvent).toHaveBeenCalledWith("test-event", undefined);
    });
  });

  describe("Room Management", () => {
    it("should join room successfully", async () => {
      const consoleLogSpy = vi
        .spyOn(console, "log")
        .mockImplementation(() => {});

      const { result } = renderHook(() => useSocket());

      await result.current.joinRoom("test-room");

      expect(mockJoinRoom).toHaveBeenCalledWith("test-room");
      expect(consoleLogSpy).toHaveBeenCalledWith(
        "[useSocket] Joined room: test-room",
      );

      consoleLogSpy.mockRestore();
    });

    it("should handle join room errors", async () => {
      const consoleErrorSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      const error = new Error("Join failed");
      mockJoinRoom.mockRejectedValueOnce(error);

      const { result } = renderHook(() => useSocket());

      await expect(result.current.joinRoom("test-room")).rejects.toThrow(
        "Join failed",
      );
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });

    it("should leave room successfully", async () => {
      const consoleLogSpy = vi
        .spyOn(console, "log")
        .mockImplementation(() => {});

      const { result } = renderHook(() => useSocket());

      // First join the room
      await result.current.joinRoom("test-room");

      // Then leave it
      await result.current.leaveRoom("test-room");

      expect(mockLeaveRoom).toHaveBeenCalledWith("test-room");
      expect(consoleLogSpy).toHaveBeenCalledWith(
        "[useSocket] Left room: test-room",
      );

      consoleLogSpy.mockRestore();
    });

    it("should handle leave room errors", async () => {
      const consoleErrorSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      const error = new Error("Leave failed");
      mockLeaveRoom.mockRejectedValueOnce(error);

      const { result } = renderHook(() => useSocket());

      await expect(result.current.leaveRoom("test-room")).rejects.toThrow(
        "Leave failed",
      );
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });

    it("should join initial rooms when connected", async () => {
      const consoleLogSpy = vi
        .spyOn(console, "log")
        .mockImplementation(() => {});
      let connectHandler: (() => void) | undefined;
      mockOnEvent.mockImplementation((event: string, handler: () => void) => {
        if (event === "connect") {
          connectHandler = handler;
        }
      });

      renderHook(() =>
        useSocket({
          autoConnect: true,
          rooms: ["room1", "room2"],
        }),
      );

      // Simulate connection
      connectHandler?.();

      await waitFor(() => {
        expect(mockJoinRoom).toHaveBeenCalledWith("room1");
        expect(mockJoinRoom).toHaveBeenCalledWith("room2");
      });

      consoleLogSpy.mockRestore();
    });
  });

  describe("Cleanup", () => {
    it("should remove event handlers on unmount", () => {
      const { unmount } = renderHook(() => useSocket());

      unmount();

      expect(mockOffEvent).toHaveBeenCalledWith(
        "connect",
        expect.any(Function),
      );
      expect(mockOffEvent).toHaveBeenCalledWith(
        "disconnect",
        expect.any(Function),
      );
      expect(mockOffEvent).toHaveBeenCalledWith(
        "connect_error",
        expect.any(Function),
      );
    });

    it("should disconnect socket on unmount when connected", () => {
      mockSocket.connected = true;

      const { unmount } = renderHook(() => useSocket({ autoConnect: true }));

      unmount();

      expect(mockDisconnectSocket).toHaveBeenCalled();
    });

    it("should leave all joined rooms on unmount", async () => {
      const consoleErrorSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      let connectHandler: (() => void) | undefined;
      mockOnEvent.mockImplementation((event: string, handler: () => void) => {
        if (event === "connect") {
          connectHandler = handler;
        }
      });

      const { unmount } = renderHook(() =>
        useSocket({
          autoConnect: true,
          rooms: ["room1"],
        }),
      );

      // Simulate connection
      connectHandler?.();

      await waitFor(() => {
        expect(mockJoinRoom).toHaveBeenCalledWith("room1");
      });

      unmount();

      await waitFor(() => {
        expect(mockLeaveRoom).toHaveBeenCalledWith("room1");
      });

      consoleErrorSpy.mockRestore();
    });
  });
});
