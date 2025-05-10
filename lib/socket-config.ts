import { io, type Socket } from "socket.io-client"

let socket: Socket | null = null

export function getSocket(): Socket {
  if (!socket) {
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || window.location.origin

    socket = io(socketUrl, {
      path: "/api/socketio",
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    })

    // Add event listeners for connection status
    socket.on("connect", () => {
      console.log("Socket connected")
    })

    socket.on("connect_error", (err) => {
      console.error("Socket connection error:", err)
    })
  }
  return socket
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}
