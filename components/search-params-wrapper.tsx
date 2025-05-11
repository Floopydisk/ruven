"use client"

import { Suspense, type ReactNode } from "react"

export function SearchParamsWrapper({ children }: { children: ReactNode }) {
  return <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
}
