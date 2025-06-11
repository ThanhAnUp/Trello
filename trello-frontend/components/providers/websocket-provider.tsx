"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { io, type Socket } from "socket.io-client"

interface WebSocketContextType {
  socket: Socket | null
  isConnected: boolean
  emitEvent: (eventName: string, data?: any) => void
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined)

const WEBSOCKET_URL = process.env.NEXT_PUBLIC_WEBSOCKET_URL || "http://localhost:4000";

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    const newSocket = io(WEBSOCKET_URL, {
      transports: ["websocket"],
    });

    newSocket.on("connect", () => {
      console.log("WebSocket connected with ID:", newSocket.id);
      setIsConnected(true);
    });

    newSocket.on("disconnect", () => {
      console.log("WebSocket disconnected");
      setIsConnected(false);
    });

    setSocket(newSocket);

    return () => {
      console.log("Disconnecting WebSocket...");
      newSocket.disconnect();
    };
  }, [])

  const emitEvent = (eventName: string, data?: any) => {
    if (socket && isConnected) {
      socket.emit(eventName, data);
    } else {
      console.warn("Socket is not connected. Cannot emit event:", eventName);
    }
  }

  const value = {
    socket,
    isConnected,
    emitEvent,
  }

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  )
}

export function useWebSocket() {
  const context = useContext(WebSocketContext)
  if (context === undefined) {
    throw new Error("useWebSocket must be used within a WebSocketProvider")
  }
  return context
}