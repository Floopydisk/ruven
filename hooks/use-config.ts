"use client"

import { useState, useEffect } from "react"

type Config = {
  pusherKey: string
  pusherCluster: string
  appUrl: string
  [key: string]: string
}

export function useConfig() {
  const [config, setConfig] = useState<Config | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchConfig() {
      try {
        const response = await fetch("/api/config")
        if (!response.ok) {
          throw new Error("Failed to load configuration")
        }
        const data = await response.json()
        setConfig(data)
      } catch (err) {
        console.error("Error loading config:", err)
        setError("Failed to load application configuration")
      } finally {
        setIsLoading(false)
      }
    }

    fetchConfig()
  }, [])

  return { config, isLoading, error }
}
