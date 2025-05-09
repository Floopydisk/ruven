import { neon } from "@neondatabase/serverless"

// Create a SQL client with the Neon connection
export const sql = neon(process.env.DATABASE_URL!)
