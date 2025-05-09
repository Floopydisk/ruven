import { neon } from "@neondatabase/serverless"

// Create a SQL client with the Neon connection
export const sql = neon(process.env.DATABASE_URL!)

// Helper function to execute SQL queries with tagged template literals
export async function query(text: string, params: any[] = []) {
  try {
    // Convert conventional parameterized query to tagged template literal
    const queryText = text
    let index = 0

    // Replace $1, $2, etc. with ${params[0]}, ${params[1]}, etc.
    const templateParts = queryText.split(/\$\d+/).map((part, i, array) => {
      // If this is the last part, don't append a parameter
      if (i === array.length - 1) return part
      return part + "${params[" + index++ + "]}"
    })

    // Join the parts into a template string
    const templateString = templateParts.join("")

    // Use Function constructor to create a function that will execute the tagged template
    const templateFn = new Function("sql", "params", `return sql\`${templateString}\`;`)

    // Execute the query
    return await templateFn(sql, params)
  } catch (error) {
    console.error("Database query error:", error)
    throw error
  }
}
