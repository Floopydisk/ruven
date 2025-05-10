"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ShoppingBag, PlusCircle, Edit, Trash2, ArrowLeft, Loader2 } from "lucide-react"
import { ImageUpload } from "@/components/ui/image-upload"

type Product = {
  id: number
  name: string
  price: number
  description: string
  image: string
}

export default function ProductsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [products, setProducts] = useState<Product[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [productImage, setProductImage] = useState("/placeholder.svg?height=200&width=200")
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState<number | null>(null)
  const [vendorId, setVendorId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadVendorAndProducts() {
      if (!user) return

      try {
        // First get vendor ID
        const vendorResponse = await fetch(`/api/vendors/check?userId=${user.id}`)
        if (!vendorResponse.ok) {
          throw new Error("Failed to verify vendor status")
        }

        const vendorData = await vendorResponse.json()
        if (!vendorData.isVendor || !vendorData.vendor) {
          setError("You don't have a vendor account yet")
          setIsLoading(false)
          return
        }

        const vendorId = vendorData.vendor.id
        setVendorId(vendorId)

        // Then load products
        const productsResponse = await fetch(`/api/vendors/${vendorId}/products`)
        if (!productsResponse.ok) {
          throw new Error("Failed to load products")
        }

        const productsData = await productsResponse.json()
        setProducts(productsData.products || [])
      } catch (error) {
        console.error("Error loading vendor products:", error)
        setError("Failed to load products. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    loadVendorAndProducts()
  }, [user])

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product)
    setProductImage(product.image || "/placeholder.svg?height=200&width=200")
    setIsDialogOpen(true)
  }

  const handleNewProduct = () => {
    setEditingProduct(null)
    setProductImage("/placeholder.svg?height=200&width=200")
    setIsDialogOpen(true)
  }

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!vendorId) {
      toast({
        title: "Error",
        description: "Vendor account not found",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)

    try {
      // Get form data
      const formData = new FormData(e.target as HTMLFormElement)
      const name = formData.get("name") as string
      const price = formData.get("price") as string
      const description = formData.get("description") as string

      // Remove currency symbol if present
      const cleanPrice = price.replace(/[^0-9.]/g, "")

      const productData = {
        name,
        price: Number.parseFloat(cleanPrice),
        description,
        image: productImage,
      }

      let response
      let newProduct

      if (editingProduct) {
        // Update existing product
        response = await fetch(`/api/vendors/${vendorId}/products/${editingProduct.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(productData),
        })

        if (!response.ok) {
          throw new Error("Failed to update product")
        }

        const result = await response.json()
        newProduct = result.product

        // Update products array
        setProducts(products.map((p) => (p.id === editingProduct.id ? newProduct : p)))

        toast({
          title: "Success",
          description: "Product updated successfully",
        })
      } else {
        // Create new product
        response = await fetch(`/api/vendors/${vendorId}/products`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(productData),
        })

        if (!response.ok) {
          throw new Error("Failed to create product")
        }

        const result = await response.json()
        newProduct = result.product

        // Add to products array
        setProducts([...products, newProduct])

        toast({
          title: "Success",
          description: "Product created successfully",
        })
      }

      setIsDialogOpen(false)
    } catch (error) {
      console.error("Error saving product:", error)
      toast({
        title: "Error",
        description: "Failed to save product. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteProduct = async (id: number) => {
    if (!vendorId) return

    setIsDeleting(id)

    try {
      const response = await fetch(`/api/vendors/${vendorId}/products/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete product")
      }

      // Remove from products array
      setProducts(products.filter((p) => p.id !== id))

      toast({
        title: "Success",
        description: "Product deleted successfully",
      })
    } catch (error) {
      console.error("Error deleting product:", error)
      toast({
        title: "Error",
        description: "Failed to delete product. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(null)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading products...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Error</h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Link href="/dashboard/vendor">
            <Button>Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <div className="border-b">
        <div className="container flex h-16 items-center px-4">
          <Link href="/dashboard/vendor" className="flex items-center">
            <ArrowLeft className="h-5 w-5 mr-2" />
            <span className="font-medium">Back to Dashboard</span>
          </Link>
          <div className="ml-auto flex items-center gap-2">
            <Link href="/" className="flex items-center">
              <ShoppingBag className="h-6 w-6 mr-2" />
              <span className="font-bold text-xl">UniVendor</span>
            </Link>
          </div>
        </div>
      </div>

      <main className="flex-1 container px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Products & Services</h1>
          <Button onClick={handleNewProduct}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <Card key={product.id}>
              <div className="aspect-video relative">
                <Image
                  src={product.image || "/placeholder.svg?height=200&width=200"}
                  alt={product.name}
                  fill
                  className="object-cover rounded-t-lg"
                />
                <div className="absolute top-2 right-2 flex gap-1">
                  <Button
                    variant="secondary"
                    size="icon"
                    className="h-8 w-8 rounded-full"
                    onClick={() => handleEditProduct(product)}
                  >
                    <Edit className="h-4 w-4" />
                    <span className="sr-only">Edit</span>
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon"
                    className="h-8 w-8 rounded-full"
                    onClick={() => handleDeleteProduct(product.id)}
                    disabled={isDeleting === product.id}
                  >
                    {isDeleting === product.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                    <span className="sr-only">Delete</span>
                  </Button>
                </div>
              </div>
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold">{product.name}</h3>
                  <span className="font-medium">${product.price.toFixed(2)}</span>
                </div>
                <p className="text-sm text-muted-foreground">{product.description}</p>
              </CardContent>
            </Card>
          ))}

          <Card className="flex flex-col items-center justify-center border-dashed p-6" onClick={handleNewProduct}>
            <div className="mb-4 rounded-full bg-muted p-3">
              <PlusCircle className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="mb-1 font-medium">Add New Product</h3>
            <p className="mb-4 text-sm text-muted-foreground text-center">Add details about your product or service</p>
            <Button variant="secondary">Add Product</Button>
          </Card>
        </div>
      </main>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingProduct ? "Edit Product" : "Add New Product"}</DialogTitle>
            <DialogDescription>
              {editingProduct
                ? "Update your product information below"
                : "Fill in the details for your new product or service"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveProduct}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="productImage">Product Image</Label>
                <ImageUpload
                  value={productImage}
                  onChange={setProductImage}
                  onRemove={() => setProductImage("/placeholder.svg?height=200&width=200")}
                  aspectRatio="landscape"
                  placeholder="Upload a product image"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Product Name</Label>
                <Input id="name" name="name" defaultValue={editingProduct?.name || ""} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Price</Label>
                <Input
                  id="price"
                  name="price"
                  defaultValue={editingProduct ? `$${editingProduct.price.toFixed(2)}` : "$"}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  rows={3}
                  defaultValue={editingProduct?.description || ""}
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Saving..." : editingProduct ? "Update Product" : "Add Product"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
