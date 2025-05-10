import { redirect } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { NavBar } from "@/components/nav-bar"
import { BottomNavigation } from "@/components/bottom-navigation"
import { MessageList } from "@/components/message-list"
import { MessageInput } from "@/components/message-input"
import { getCurrentUser } from "@/lib/auth"
import { neon } from "@neondatabase/serverless"
import { ArrowLeft } from "lucide-react"

export const dynamic = "force-dynamic"

async function getConversationData(conversationId: number, userId: number) {
  const sql = neon(process.env.DATABASE_URL!)

  // Get conversation details
  const conversationResult = await sql`
    SELECT 
      c.id, 
      c.user_id, 
      c.vendor_id,
      v.business_name as vendor_name,
      v.logo_image as vendor_image
    FROM conversations c
    JOIN vendors v ON c.vendor_id = v.id
    WHERE c.id = ${conversationId} AND c.user_id = ${userId}
  `

  if (conversationResult.length === 0) {
    return null
  }

  const conversation = {
    id: conversationResult[0].id,
    userId: conversationResult[0].user_id,
    vendorId: conversationResult[0].vendor_id,
    vendorName: conversationResult[0].vendor_name,
    vendorImage: conversationResult[0].vendor_image,
  }

  // Mark all messages as read
  await sql`
    UPDATE messages
    SET is_read = true
    WHERE conversation_id = ${conversationId} AND recipient_id = ${userId} AND is_read = false
  `

  return {
    conversation,
  }
}

export default async function ConversationPage({ params }: { params: { id: string } }) {
  const conversationId = Number.parseInt(params.id)
  if (isNaN(conversationId)) {
    redirect("/messages")
  }

  const user = await getCurrentUser()
  if (!user) {
    redirect("/auth/login")
  }

  const data = await getConversationData(conversationId, user.id)
  if (!data) {
    redirect("/messages")
  }

  const { conversation } = data

  return (
    <div className="flex min-h-screen flex-col pb-16 md:pb-0">
      <NavBar />

      <div className="container px-4 py-6 flex-1 flex flex-col">
        <div className="flex items-center mb-4">
          <Link href="/messages" className="mr-4">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex items-center">
            <div className="relative h-10 w-10 rounded-full overflow-hidden mr-3">
              <Image
                src={conversation.vendorImage || "/placeholder.svg?height=40&width=40"}
                alt={conversation.vendorName}
                fill
                className="object-cover"
              />
            </div>
            <div>
              <h1 className="font-semibold">{conversation.vendorName}</h1>
              <p className="text-xs text-muted-foreground">Vendor</p>
            </div>
          </div>
        </div>

        <Card className="flex-1 flex flex-col">
          <CardHeader className="px-4 py-3 border-b">
            <CardTitle className="text-base">Conversation</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col p-0">
            <MessageList conversationId={conversation.id} currentUserId={user.id} />
            <MessageInput conversationId={conversation.id} />
          </CardContent>
        </Card>
      </div>

      <BottomNavigation />
    </div>
  )
}
