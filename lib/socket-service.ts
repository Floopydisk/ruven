import { io, type Socket } from "socket.io-client"

// Singleton pattern for socket connection
class SocketService {
  private static instance: SocketService
  private socket: Socket | null = null
  private connectionPromise: Promise<Socket> | null = null
  private typingTimeouts: Map<number, NodeJS.Timeout> = new Map()

  private constructor() {}

  public static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService()
    }
    return SocketService.instance
  }

  public connect(): Promise<Socket> {
    if (this.socket && this.socket.connected) {
      return Promise.resolve(this.socket)
    }

    if (this.connectionPromise) {
      return this.connectionPromise
    }

    this.connectionPromise = new Promise((resolve, reject) => {
      try {
        this.socket = io("/api/socket")

        this.socket.on("connect", () => {
          console.log("Socket connected")
          resolve(this.socket as Socket)
        })

        this.socket.on("connect_error", (error) => {
          console.error("Socket connection error:", error)
          reject(error)
        })

        this.socket.on("disconnect", () => {
          console.log("Socket disconnected")
        })
      } catch (error) {
        console.error("Socket initialization error:", error)
        reject(error)
      }
    })

    return this.connectionPromise
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
      this.connectionPromise = null
    }
  }

  public async sendMessage(data: any): Promise<void> {
    const socket = await this.connect()
    socket.emit("message", data)
  }

  public async sendTypingStatus(conversationId: number, isTyping: boolean): Promise<void> {
    const socket = await this.connect()
    socket.emit("typing", { conversationId, isTyping })

    // Clear existing timeout if any
    if (this.typingTimeouts.has(conversationId)) {
      clearTimeout(this.typingTimeouts.get(conversationId))
      this.typingTimeouts.delete(conversationId)
    }

    // If typing, set a timeout to automatically stop typing indicator after 3 seconds
    if (isTyping) {
      const timeout = setTimeout(async () => {
        await this.sendTypingStatus(conversationId, false)
      }, 3000)
      this.typingTimeouts.set(conversationId, timeout)
    }
  }

  public async sendReadReceipt(conversationId: number, messageId: number): Promise<void> {
    const socket = await this.connect()
    socket.emit("read_receipt", { conversationId, messageId })
  }

  public async onMessage(callback: (data: any) => void): Promise<() => void> {
    const socket = await this.connect()
    socket.on("message", callback)
    return () => socket.off("message", callback)
  }

  public async onTyping(callback: (data: any) => void): Promise<() => void> {
    const socket = await this.connect()
    socket.on("typing", callback)
    return () => socket.off("typing", callback)
  }

  public async onReadReceipt(callback: (data: any) => void): Promise<() => void> {
    const socket = await this.connect()
    socket.on("read_receipt", callback)
    return () => socket.off("read_receipt", callback)
  }

  public async onNotification(callback: (data: any) => void): Promise<() => void> {
    const socket = await this.connect()
    socket.on("notification", callback)
    return () => socket.off("notification", callback)
  }
}

export default SocketService.getInstance()
