import { NextResponse } from "next/server"

export async function GET() {
  // Only return the public project ID, not any keys
  const publicConfig = {
    projectId: process.env.NEXT_PUBLIC_STACK_PROJECT_ID || "",
    // Do not include any sensitive keys
  }

  return NextResponse.json(publicConfig)
}
