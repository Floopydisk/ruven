"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Paperclip, X, File, ImageIcon, FileText, Film, Music, Download } from "lucide-react"
import { cn } from "@/lib/utils"

interface FileAttachmentProps {
  onFileSelect: (file: File | null) => void
  className?: string
}

export function FileAttachment({ onFileSelect, className }: FileAttachmentProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setSelectedFile(file)
    onFileSelect(file)
  }

  const handleRemoveFile = () => {
    setSelectedFile(null)
    onFileSelect(null)
  }

  return (
    <div className={cn("flex items-center", className)}>
      {!selectedFile ? (
        <label className="cursor-pointer">
          <input
            type="file"
            className="hidden"
            onChange={handleFileChange}
            accept="image/*,application/pdf,video/*,audio/*"
          />
          <Button type="button" variant="ghost" size="icon" className="h-8 w-8">
            <Paperclip className="h-4 w-4" />
          </Button>
        </label>
      ) : (
        <div className="flex items-center gap-2 bg-secondary/50 rounded-md p-1 pl-2">
          <FileIcon type={selectedFile.type} />
          <span className="text-xs truncate max-w-[100px]">{selectedFile.name}</span>
          <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={handleRemoveFile}>
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}
    </div>
  )
}

interface FilePreviewProps {
  url: string
  type: string
  name: string
}

export function FilePreview({ url, type, name }: FilePreviewProps) {
  const isImage = type.startsWith("image/")
  const isPdf = type === "application/pdf"
  const isVideo = type.startsWith("video/")
  const isAudio = type.startsWith("audio/")

  return (
    <div className="rounded-md overflow-hidden border border-border">
      {isImage && (
        <div className="relative h-48 w-full">
          <img src={url || "/placeholder.svg"} alt={name} className="object-contain w-full h-full" />
        </div>
      )}
      {!isImage && (
        <div className="bg-secondary/30 p-4 flex items-center gap-3">
          <FileIcon type={type} size={24} />
          <div className="flex-1 truncate">
            <p className="text-sm font-medium truncate">{name}</p>
            <p className="text-xs text-muted-foreground">{formatFileSize(getFileSizeFromUrl(url))}</p>
          </div>
          <a href={url} download={name} target="_blank" rel="noopener noreferrer">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Download className="h-4 w-4" />
            </Button>
          </a>
        </div>
      )}
      {isVideo && (
        <video controls className="w-full max-h-48">
          <source src={url} type={type} />
          Your browser does not support the video tag.
        </video>
      )}
      {isAudio && (
        <audio controls className="w-full mt-2">
          <source src={url} type={type} />
          Your browser does not support the audio tag.
        </audio>
      )}
    </div>
  )
}

function FileIcon({ type, size = 16 }: { type: string; size?: number }) {
  if (type.startsWith("image/")) {
    return <ImageIcon className={`h-${size / 4} w-${size / 4}`} />
  } else if (type === "application/pdf") {
    return <FileText className={`h-${size / 4} w-${size / 4}`} />
  } else if (type.startsWith("video/")) {
    return <Film className={`h-${size / 4} w-${size / 4}`} />
  } else if (type.startsWith("audio/")) {
    return <Music className={`h-${size / 4} w-${size / 4}`} />
  } else {
    return <File className={`h-${size / 4} w-${size / 4}`} />
  }
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes"
  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}

function getFileSizeFromUrl(url: string): number {
  // In a real app, you would get this from the server
  // For now, return a placeholder size
  return 1024 * 1024 // 1MB
}
