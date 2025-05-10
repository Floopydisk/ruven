export type UserRole = "user" | "admin" | "vendor"

export interface User {
  id: number
  email: string
  firstName: string | null
  lastName: string | null
  profileImage: string | null
  role?: UserRole
  emailVerified?: boolean
  twoFactorEnabled?: boolean
  isVendor?: boolean // Add this property
}

export interface AuthState {
  user: User | null
  isLoading: boolean
  isVendor: boolean
}

export interface Session {
  id: number
  userId: number
  token: string
  expiresAt: string
  userAgent: string
  ipAddress: string
  lastActive: string
  createdAt: string
}

export interface SecurityLog {
  id: number
  userId?: number
  eventType: string
  ipAddress: string
  userAgent: string
  details?: any
  createdAt: string
}
