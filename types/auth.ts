export interface User {
  id: number
  email: string
  firstName: string
  lastName: string
  profileImage: string | null
  role?: string
  isVendor?: boolean
}

export interface Vendor {
  id: number
  userId: number
  businessName: string
  description: string | null
  logoImage: string | null
  bannerImage: string | null
  location: string | null
  businessHours: string | null
  phone: string | null
  website: string | null
}

export interface Session {
  id: number
  userId: number
  token: string
  expiresAt: string
  userAgent: string
  ipAddress: string
  lastActive: string
}

export interface SecurityLog {
  id: number
  userId: number | null
  event: string
  ipAddress: string
  userAgent: string
  details: string | null
  createdAt: string
}
