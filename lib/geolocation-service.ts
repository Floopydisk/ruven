interface GeolocationData {
  ip: string
  city?: string
  region?: string
  country?: string
  location?: string
  timezone?: string
  isp?: string
}

export async function getLocationFromIp(ip: string): Promise<GeolocationData> {
  try {
    // Skip lookup for local IPs
    if (
      ip === "127.0.0.1" ||
      ip === "localhost" ||
      ip === "unknown" ||
      ip.startsWith("192.168.") ||
      ip.startsWith("10.")
    ) {
      return {
        ip,
        city: "Local",
        region: "Local",
        country: "Local",
        location: "Local Network",
        timezone: "Local",
        isp: "Local",
      }
    }

    // Use ipinfo.io API (free tier allows 50,000 requests per month)
    const response = await fetch(`https://ipinfo.io/${ip}/json?token=${process.env.IPINFO_TOKEN || ""}`)

    if (!response.ok) {
      throw new Error(`Failed to fetch geolocation data: ${response.status}`)
    }

    const data = await response.json()

    return {
      ip,
      city: data.city,
      region: data.region,
      country: data.country,
      location: `${data.city}, ${data.region}, ${data.country}`,
      timezone: data.timezone,
      isp: data.org,
    }
  } catch (error) {
    console.error("Error fetching geolocation data:", error)
    // Return basic info if lookup fails
    return {
      ip,
      location: "Unknown location",
    }
  }
}

export function formatLocation(geoData: GeolocationData): string {
  if (geoData.location) {
    return geoData.location
  }

  if (geoData.city && geoData.country) {
    return `${geoData.city}, ${geoData.country}`
  }

  return "Unknown location"
}
