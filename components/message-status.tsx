import { Check, CheckCheck, Clock } from "lucide-react"

interface MessageStatusProps {
  status: "sent" | "delivered" | "read" | undefined
  className?: string
}

export function MessageStatus({ status, className = "" }: MessageStatusProps) {
  if (!status) {
    return null
  }

  return (
    <span className={`inline-flex items-center ${className}`}>
      {status === "sent" && <Clock className="h-3 w-3" />}
      {status === "delivered" && <Check className="h-3 w-3" />}
      {status === "read" && <CheckCheck className="h-3 w-3" />}
    </span>
  )
}
