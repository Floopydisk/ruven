import Pusher from "pusher-js"

let pusher: Pusher | null = null
let channel: any = null

export async function initializeNotifications(userId: number) {
  if (!pusher) {
    try {
      const response = await fetch("/api/config/pusher")
      const config = await response.json()

      pusher = new Pusher(config.key, {
        cluster: config.cluster,
        authEndpoint: "/api/pusher/auth",
        forceTLS: true,
      })
    } catch (error) {
      console.error("Failed to initialize Pusher:", error)
      return { pusher: null, channel: null }
    }
  }

  if (!channel) {
    const channelName = `private-user-${userId}`
    channel = pusher.subscribe(channelName)
  }

  return { pusher, channel }
}

export function cleanupNotifications() {
  if (channel && pusher) {
    pusher.unsubscribe(channel.name)
    channel = null
  }
}

export function onNewMessage(callback: (data: any) => void) {
  if (!channel) return () => {}

  channel.bind("message", callback)
  return () => {
    channel.unbind("message", callback)
  }
}

export function onNotification(callback: (data: any) => void) {
  if (!channel) return () => {}

  channel.bind("notification", callback)
  return () => {
    channel.unbind("notification", callback)
  }
}
