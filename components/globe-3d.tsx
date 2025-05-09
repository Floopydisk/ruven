"use client"

import { useEffect, useRef } from "react"
import { useTheme } from "next-themes"

export function Globe3D() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { theme } = useTheme()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    const setCanvasDimensions = () => {
      // Use the parent element's dimensions if available, otherwise use window dimensions
      const parent = canvas.parentElement
      const width = parent ? parent.clientWidth : window.innerWidth
      const height = parent ? parent.clientHeight : Math.min(window.innerHeight * 0.7, 600)

      canvas.width = width
      canvas.height = height
    }

    setCanvasDimensions()
    window.addEventListener("resize", setCanvasDimensions)

    // Globe parameters
    const dots: { x: number; y: number; z: number; radius: number }[] = []
    const numDots = 800
    const radius = canvas.width / 2.2
    const rotationSpeed = 0.0005

    // Create dots
    for (let i = 0; i < numDots; i++) {
      const theta = Math.random() * 2 * Math.PI
      const phi = Math.acos(2 * Math.random() - 1)

      dots.push({
        x: radius * Math.sin(phi) * Math.cos(theta),
        y: radius * Math.sin(phi) * Math.sin(theta),
        z: radius * Math.cos(phi),
        radius: Math.random() * 1.5 + 0.5,
      })
    }

    let angle = 0

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Sort dots by z-coordinate for proper rendering
      const sortedDots = [...dots].sort((a, b) => a.z - b.z)

      // Rotate and draw dots
      for (const dot of sortedDots) {
        // Rotate around Y axis
        const cosAngle = Math.cos(angle)
        const sinAngle = Math.sin(angle)

        const x = dot.x * cosAngle - dot.z * sinAngle
        const z = dot.z * cosAngle + dot.x * sinAngle

        // Project 3D to 2D
        const scale = radius / (radius + z)
        const projectedX = x * scale + canvas.width / 2
        const projectedY = dot.y * scale + canvas.height / 2

        // Calculate opacity based on z position
        const opacity = (z + radius) / (2 * radius)

        // Draw dot
        ctx.beginPath()
        ctx.arc(projectedX, projectedY, dot.radius * scale, 0, 2 * Math.PI)

        // Use theme-appropriate colors
        const dotColor = `rgba(46, 229, 157, ${opacity * 0.8})`
        ctx.fillStyle = dotColor
        ctx.fill()

        // Draw connections between nearby dots
        for (const otherDot of sortedDots) {
          const dx = x - (otherDot.x * cosAngle - otherDot.z * sinAngle)
          const dy = dot.y - otherDot.y
          const dz = z - (otherDot.z * cosAngle + otherDot.x * sinAngle)
          const distance = Math.sqrt(dx * dx + dy * dy + dz * dz)

          if (distance < radius * 0.15) {
            const lineOpacity = (1 - distance / (radius * 0.15)) * opacity * 0.2
            ctx.beginPath()
            ctx.moveTo(projectedX, projectedY)

            const otherScale = radius / (radius + (otherDot.z * cosAngle + otherDot.x * sinAngle))
            const otherX = (otherDot.x * cosAngle - otherDot.z * sinAngle) * otherScale + canvas.width / 2
            const otherY = otherDot.y * otherScale + canvas.height / 2

            ctx.lineTo(otherX, otherY)
            ctx.strokeStyle = `rgba(46, 229, 157, ${lineOpacity})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        }
      }

      angle += rotationSpeed
      requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener("resize", setCanvasDimensions)
    }
  }, [theme])

  return <canvas ref={canvasRef} className="w-full h-full" />
}
