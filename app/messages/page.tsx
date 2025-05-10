import { redirect } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { NavBar } from "@/components/nav-bar"
import { BottomNavigation } from "@/components/bottom-navigation"
import { getCurrentUser } from "@/lib/auth"
import { neon } from "@neondatabase/serverless"
import { PlusCircle, MessageSquare } from "lucide-react"

export const dynamic = "force-dynamic"

async function getConversations(userId: number) {
  const sql = neon(process.env.DATABASE_URL!)

  // Get conversations
  const conversationsResult = await sql`
    SELECT 
      c.id, 
      c.vendor_id,
      v.business_name as vendor_name,
      v.logo_image as vendor_image,
      (
        SELECT COUNT(*) FROM messages m 
        WHERE m.conversation_id = c.id AND m.recipient_id = ${userId} AND m.is_read = false
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
    JOIN vendors v ON c.vendor_id = v.id
    WHERE c.user_id = ${userId}
    ORDER BY last_message_time DESC
  `

  return conversationsResult.map((conv) => ({
    id: conv.id,
    vendorId: conv.vendor_id,
    vendorName: conv.vendor_name,
    vendorImage: conv.vendor_image,
    unreadCount: Number.parseInt(conv.unread_count),
    lastMessage: conv.last_message,
    lastMessageTime: conv.last_message_time,
  }))
}

export default async function MessagesPage() {
  const user = await getCurrentUser()
  if (!user) {
    redirect("/auth/login")
  }

  const conversations = await getConversations(user.id)

  return (
    <div className="flex min-h-screen flex-col pb-16 md:pb-0">
      <NavBar />

      <div className="container px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Messages</h1>
          <Link href="/browse">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Find Vendors
            </Button>
          </Link>
        </div>

        {conversations.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="rounded-full bg-primary/10 p-3 mb-4">
                <MessageSquare className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-medium mb-2">No messages yet</h3>
              <p className="text-muted-foreground text-center mb-6 max-w-md">
                Start a conversation with a vendor to inquire about their products or services.
              </p>
              <Link href="/browse">
                <Button>Browse Vendors</Button>
              </Link>
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
                  <Link key={conversation.id} href={`/messages/${conversation.id}`}>
                    <div className="flex items-center p-4 hover:bg-muted/50 transition-colors">
                      <div className="relative h-12 w-12 rounded-full overflow-hidden mr-4">
                        <Image
                          src={conversation.vendorImage || "/placeholder.svg?height=48&width=48"}
                          alt={conversation.vendorName}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline mb-1">
                          <h3 className="font-medium truncate">{conversation.vendorName}</h3>
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

      <BottomNavigation />
    </div>
  )
}
