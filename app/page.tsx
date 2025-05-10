import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import LandingPage from "./landing/page"

export default function Home() {
  // Check if user is logged in
  const authSession = cookies().get("auth_session")?.value

  // If logged in, redirect to home page
  if (authSession) {
    redirect("/home")
  }

  // Otherwise, show landing page
  return <LandingPage />
}
