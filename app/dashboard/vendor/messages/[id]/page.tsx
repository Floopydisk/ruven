import { redirect } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageList } from "@/components/message-list"
import { MessageInput } from "@/components/message-input"
import { getCurrentUser } from "@/lib/auth"
import { neon } from "@neondatabase/serverless"
import { ArrowLeft } from "lucide-react"

export const dynamic = "force-dynamic"

async function getConversationData(conversationId: number, vendorId: number) {
  const sql = neon(process.env.DATABASE_URL!)

  // Get conversation details
  const conversationResult = await sql`
    SELECT 
      c.id, 
      c.user_id, 
      c.vendor_id,
      u.name as user_name,
      u.email as user_email,
      u.profile_image as user_image
    FROM conversations c
    JOIN users u ON c.user_id = u.id
    JOIN vendors v ON c.vendor_id = v.id
    WHERE c.id = ${conversationId} AND c.vendor_id = ${vendorId}
  `

  if (conversationResult.length === 0) {
    return null
  }

  const conversation = {
    id: conversationResult[0].id,
    userId: conversationResult[0].user_id,
    vendorId: conversationResult[0].vendor_id,
    userName: conversationResult[0].user_name || conversationResult[0].user_email.split("@")[0],
    userImage: conversationResult[0].user_image,
  }

  // Mark all messages as read
  await sql`
    UPDATE messages
    SET is_read = true
    WHERE conversation_id = ${conversationId} AND recipient_id = ${vendorId} AND is_read = false
  `

  return {
    conversation,
  }
}

export default async function VendorConversationPage({ params }: { params: { id: string } }) {
  const conversationId = Number.parseInt(params.id)
  if (isNaN(conversationId)) {
    redirect("/dashboard/vendor/messages")
  }

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

  const data = await getConversationData(conversationId, vendorId)
  if (!data) {
    redirect("/dashboard/vendor/messages")
  }

  const { conversation } = data

  return (
    <div className="flex min-h-screen flex-col">
      <div className="border-b">
        <div className="container flex h-16 items-center px-4">
          <Link href="/dashboard/vendor/messages" className="flex items-center">
            <ArrowLeft className="h-5 w-5 mr-2" />
            <span className="font-medium">Back to Messages</span>
          </Link>
        </div>
      </div>

      <div className="container px-4 py-6 flex-1 flex flex-col">
        <div className="flex items-center mb-4">
          <div className="flex items-center">
            <div className="relative h-10 w-10 rounded-full overflow-hidden mr-3">
              <Image
                src={conversation.userImage || "/placeholder.svg?height=40&width=40"}
                alt={conversation.userName}
                fill
                className="object-cover"
              />
            </div>
            <div>
              <h1 className="font-semibold">{conversation.userName}</h1>
              <p className="text-xs text-muted-foreground">Customer</p>
            </div>
          </div>
        </div>

        <Card className="flex-1 flex flex-col">
          <CardHeader className="px-4 py-3 border-b">
            <CardTitle className="text-base">Conversation</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col p-0">
            <MessageList conversationId={conversation.id} currentUserId={user.id} isVendor={true} />
            <MessageInput conversationId={conversation.id} isVendor={true} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
