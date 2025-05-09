import { sql } from "./db-direct"

// Types
export type User = {
  id: number
  email: string
  firstName: string
  lastName: string
  profileImage: string | null
}

export type Vendor = {
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

export type Product = {
  id: number
  vendorId: number
  name: string
  description: string | null
  price: number
  image: string | null
}

// User functions
export async function getUserById(id: number): Promise<User | null> {
  const users = await sql`SELECT * FROM users WHERE id = ${id}`

  if (users.length === 0) {
    return null
  }

  const user = users[0]
  return {
    id: user.id,
    email: user.email,
    firstName: user.first_name,
    lastName: user.last_name,
    profileImage: user.profile_image,
  }
}

// Vendor functions
export async function getAllVendors(): Promise<Vendor[]> {
  const vendors = await sql`SELECT * FROM vendors ORDER BY business_name`

  return vendors.map((vendor: any) => ({
    id: vendor.id,
    userId: vendor.user_id,
    businessName: vendor.business_name,
    description: vendor.description,
    logoImage: vendor.logo_image,
    bannerImage: vendor.banner_image,
    location: vendor.location,
    businessHours: vendor.business_hours,
    phone: vendor.phone,
    website: vendor.website,
  }))
}

export async function getVendorById(id: number): Promise<Vendor | null> {
  const vendors = await sql`SELECT * FROM vendors WHERE id = ${id}`

  if (vendors.length === 0) {
    return null
  }

  const vendor = vendors[0]
  return {
    id: vendor.id,
    userId: vendor.user_id,
    businessName: vendor.business_name,
    description: vendor.description,
    logoImage: vendor.logo_image,
    bannerImage: vendor.banner_image,
    location: vendor.location,
    businessHours: vendor.business_hours,
    phone: vendor.phone,
    website: vendor.website,
  }
}

export async function getVendorByUserId(userId: number): Promise<Vendor | null> {
  const vendors = await sql`SELECT * FROM vendors WHERE user_id = ${userId}`

  if (vendors.length === 0) {
    return null
  }

  const vendor = vendors[0]
  return {
    id: vendor.id,
    userId: vendor.user_id,
    businessName: vendor.business_name,
    description: vendor.description,
    logoImage: vendor.logo_image,
    bannerImage: vendor.banner_image,
    location: vendor.location,
    businessHours: vendor.business_hours,
    phone: vendor.phone,
    website: vendor.website,
  }
}

// Product functions
export async function getProductsByVendorId(vendorId: number): Promise<Product[]> {
  const products = await sql`SELECT * FROM products WHERE vendor_id = ${vendorId} ORDER BY name`

  return products.map((product: any) => ({
    id: product.id,
    vendorId: product.vendor_id,
    name: product.name,
    description: product.description,
    price: Number.parseFloat(product.price),
    image: product.image,
  }))
}

export async function getProductById(id: number): Promise<Product | null> {
  const products = await sql`SELECT * FROM products WHERE id = ${id}`

  if (products.length === 0) {
    return null
  }

  const product = products[0]
  return {
    id: product.id,
    vendorId: product.vendor_id,
    name: product.name,
    description: product.description,
    price: Number.parseFloat(product.price),
    image: product.image,
  }
}
