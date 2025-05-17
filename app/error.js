"use client"

import { useEffect } from "react"

export default function Error({ error, reset }) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
      <div className="space-y-6 max-w-md">
        <h1 className="text-4xl font-bold">Something went wrong</h1>
        <p>We're sorry, but an error occurred while processing your request.</p>
        <button
          onClick={reset}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Try again
        </button>
        <div>
          <a href="/home" className="text-blue-600 hover:underline">
            Return to Home
          </a>
        </div>
      </div>
    </div>
  )
}
