import { redirect } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getCurrentUser } from "@/lib/auth"
import { neon } from "@neondatabase/serverless"
import { ArrowLeft, MessageSquare } from "lucide-react"

export const dynamic = "force-dynamic"

async function getConversations(vendorId: number) {
  const sql = neon(process.env.DATABASE_URL!)

  // Get conversations
  const conversationsResult = await sql`
    SELECT 
      c.id, 
      c.user_id,
      u.name as user_name,
      u.email as user_email,
      u.profile_image as user_image,
      (
        SELECT COUNT(*) FROM messages m 
        WHERE m.conversation_id = c.id AND m.recipient_id = ${vendorId} AND m.is_read = false
      ) as unread_count,
      (
        SELECT m.content FROM messages m 
        WHERE m.conversation_id = c.id 
        ORDER BY m.created_at DESC LIMIT 1
      ) as last_message,
      (
        SELECT m.created_at FROM messages m 
        WHERE m.conversation_id = c.id 
        ORDER BY m.created_at DESC LIMIT 1
      ) as last_message_time
    FROM conversations c
    JOIN users u ON c.user_id = u.id
    WHERE c.vendor_id = ${vendorId}
    ORDER BY last_message_time DESC
  `

  return conversationsResult.map((conv) => ({
    id: conv.id,
    userId: conv.user_id,
    userName: conv.user_name || conv.user_email.split("@")[0],
    userImage: conv.user_image,
    unreadCount: Number.parseInt(conv.unread_count),
    lastMessage: conv.last_message,
    lastMessageTime: conv.last_message_time,
  }))
}

export default async function VendorMessagesPage() {
  const user = await getCurrentUser()
  if (!user) {
    redirect("/auth/login")
  }

  // Check if user is a vendor
  const sql = neon(process.env.DATABASE_URL!)
  const vendorResult = await sql`
    SELECT id FROM vendors WHERE user_id = ${user.id}
  `

  if (vendorResult.length === 0) {
    redirect("/dashboard/vendor")
  }

  const vendorId = vendorResult[0].id
  const conversations = await getConversations(vendorId)

  return (
    <div className="flex min-h-screen flex-col">
      <div className="border-b">
        <div className="container flex h-16 items-center px-4">
          <Link href="/dashboard/vendor" className="flex items-center">
            <ArrowLeft className="h-5 w-5 mr-2" />
            <span className="font-medium">Back to Dashboard</span>
          </Link>
        </div>
      </div>

      <div className="container px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Customer Messages</h1>
          <p className="text-muted-foreground">Manage and respond to customer inquiries</p>
        </div>

        {conversations.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="rounded-full bg-primary/10 p-3 mb-4">
                <MessageSquare className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-medium mb-2">No messages yet</h3>
              <p className="text-muted-foreground text-center mb-6 max-w-md">
                You haven't received any customer messages yet. When customers contact you, their messages will appear
                here.
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader className="px-4 py-3 border-b">
              <CardTitle className="text-base">Recent Conversations</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {conversations.map((conversation) => (
                  <Link key={conversation.id} href={`/dashboard/vendor/messages/${conversation.id}`}>
                    <div className="flex items-center p-4 hover:bg-muted/50 transition-colors">
                      <div className="relative h-12 w-12 rounded-full overflow-hidden mr-4">
                        <Image
                          src={conversation.userImage || "/placeholder.svg?height=48&width=48"}
                          alt={conversation.userName}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline mb-1">
                          <h3 className="font-medium truncate">{conversation.userName}</h3>
                          <span className="text-xs text-muted-foreground ml-2 whitespace-nowrap">
                            {new Date(conversation.lastMessageTime).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">{conversation.lastMessage}</p>
                      </div>
                      {conversation.unreadCount > 0 && (
                        <div className="ml-4 bg-primary text-primary-foreground text-xs font-medium rounded-full h-5 min-w-5 flex items-center justify-center px-1.5">
                          {conversation.unreadCount}
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
