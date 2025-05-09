"use client"

import type React from "react"

import { useState, useRef } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Upload, X, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface ImageUploadProps {
  value?: string
  onChange: (value: string) => void
  onRemove: () => void
  disabled?: boolean
  className?: string
  aspectRatio?: "square" | "portrait" | "landscape" | "banner"
  placeholder?: string
}

export function ImageUpload({
  value,
  onChange,
  onRemove,
  disabled,
  className,
  aspectRatio = "square",
  placeholder = "Upload an image",
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const aspectRatioClass = {
    square: "aspect-square",
    portrait: "aspect-[3/4]",
    landscape: "aspect-[4/3]",
    banner: "aspect-[16/9]",
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setIsUploading(true)

      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Upload failed")
      }

      const data = await response.json()
      onChange(data.url)
    } catch (error) {
      console.error("Error uploading image:", error)
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  return (
    <div className={cn("relative", className)}>
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        ref={fileInputRef}
        className="hidden"
        disabled={disabled || isUploading}
      />

      {value ? (
        <div className={cn("relative overflow-hidden rounded-md border", aspectRatioClass[aspectRatio])}>
          <Image src={value || "/placeholder.svg"} alt="Uploaded image" fill className="object-cover" />
          <div className="absolute inset-0 bg-black/30 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleButtonClick}
              disabled={disabled || isUploading}
            >
              Change
            </Button>
            <Button type="button" variant="destructive" size="sm" onClick={onRemove} disabled={disabled || isUploading}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div
          onClick={handleButtonClick}
          className={cn(
            "flex flex-col items-center justify-center rounded-md border border-dashed cursor-pointer bg-muted/50 hover:bg-muted transition-colors",
            aspectRatioClass[aspectRatio],
          )}
        >
          {isUploading ? (
            <div className="flex flex-col items-center justify-center">
              <Loader2 className="h-10 w-10 text-muted-foreground animate-spin" />
              <p className="mt-2 text-sm text-muted-foreground">Uploading...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center">
              <Upload className="h-10 w-10 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">{placeholder}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
