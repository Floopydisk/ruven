"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
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
import { ShoppingBag, PlusCircle, Edit, Trash2, ArrowLeft } from "lucide-react"
import { ImageUpload } from "@/components/ui/image-upload"

// Mock data for products
const initialProducts = [
  {
    id: 1,
    name: "House Blend Coffee",
    price: "$3.50",
    description: "Our signature blend with notes of chocolate and caramel.",
    image: "/placeholder.svg?height=200&width=200",
  },
  {
    id: 2,
    name: "Iced Matcha Latte",
    price: "$4.75",
    description: "Premium matcha with your choice of milk over ice.",
    image: "/placeholder.svg?height=200&width=200",
  },
  {
    id: 3,
    name: "Breakfast Sandwich",
    price: "$5.25",
    description: "Egg, cheese, and your choice of bacon or sausage on a croissant.",
    image: "/placeholder.svg?height=200&width=200",
  },
  {
    id: 4,
    name: "Fresh Baked Muffin",
    price: "$2.95",
    description: "Baked daily. Ask about today's flavors!",
    image: "/placeholder.svg?height=200&width=200",
  },
]

export default function ProductsPage() {
  const [products, setProducts] = useState(initialProducts)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<any>(null)
  const [productImage, setProductImage] = useState("/placeholder.svg?height=200&width=200")
  const [isSaving, setIsSaving] = useState(false)

  const handleEditProduct = (product: any) => {
    setEditingProduct(product)
    setProductImage(product.image)
    setIsDialogOpen(true)
  }

  const handleNewProduct = () => {
    setEditingProduct(null)
    setProductImage("/placeholder.svg?height=200&width=200")
    setIsDialogOpen(true)
  }

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    // Get form data
    const formData = new FormData(e.target as HTMLFormElement)
    const name = formData.get("name") as string
    const price = formData.get("price") as string
    const description = formData.get("description") as string

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    if (editingProduct) {
      // Update existing product
      setProducts(
        products.map((p) => (p.id === editingProduct.id ? { ...p, name, price, description, image: productImage } : p)),
      )
    } else {
      // Add new product
      const newProduct = {
        id: Math.max(0, ...products.map((p) => p.id)) + 1,
        name,
        price,
        description,
        image: productImage,
      }
      setProducts([...products, newProduct])
    }

    setIsSaving(false)
    setIsDialogOpen(false)
  }

  const handleDeleteProduct = (id: number) => {
    setProducts(products.filter((p) => p.id !== id))
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
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
      </header>

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
                  src={product.image || "/placeholder.svg"}
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
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Delete</span>
                  </Button>
                </div>
              </div>
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold">{product.name}</h3>
                  <span className="font-medium">{product.price}</span>
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
                <Input id="price" name="price" defaultValue={editingProduct?.price || "$"} required />
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
