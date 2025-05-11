"use client"

import type React from "react"

import { Suspense } from "react"

export function SearchParamsWrapper({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
}
