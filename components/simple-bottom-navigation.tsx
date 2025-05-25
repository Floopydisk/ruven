"use client"

import { Home, Search, MessageCircle, User } from "lucide-react"

export function SimpleBottomNavigation() {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden">
      <div className="flex justify-around py-2">
        <a href="/home" className="flex flex-col items-center p-2 text-gray-600">
          <Home size={20} />
          <span className="text-xs mt-1">Home</span>
        </a>
        <a href="/browse" className="flex flex-col items-center p-2 text-gray-600">
          <Search size={20} />
          <span className="text-xs mt-1">Browse</span>
        </a>
        <a href="/messages" className="flex flex-col items-center p-2 text-gray-600">
          <MessageCircle size={20} />
          <span className="text-xs mt-1">Messages</span>
        </a>
        <a href="/profile" className="flex flex-col items-center p-2 text-gray-600">
          <User size={20} />
          <span className="text-xs mt-1">Profile</span>
        </a>
      </div>
    </div>
  )
}
