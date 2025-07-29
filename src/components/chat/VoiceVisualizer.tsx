'use client'

import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

interface VoiceVisualizerProps {
  isActive: boolean
}

export function VoiceVisualizer({ isActive }: VoiceVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number | undefined>(undefined)
  const barsRef = useRef<number[]>([])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Initialize bars
    const barCount = 40
    barsRef.current = Array.from({ length: barCount }, () => Math.random() * 0.5 + 0.1)

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const barWidth = canvas.width / barCount
      const centerY = canvas.height / 2

      barsRef.current.forEach((height, index) => {
        const x = index * barWidth
        const barHeight = isActive 
          ? height * canvas.height * 0.8 * (Math.sin(Date.now() * 0.01 + index * 0.5) * 0.5 + 0.5)
          : height * canvas.height * 0.1

        // Create gradient
        const gradient = ctx.createLinearGradient(0, centerY - barHeight/2, 0, centerY + barHeight/2)
        gradient.addColorStop(0, '#06b6d4') // cyan-500
        gradient.addColorStop(0.5, '#8b5cf6') // purple-500
        gradient.addColorStop(1, '#ec4899') // pink-500

        ctx.fillStyle = gradient
        ctx.shadowColor = isActive ? '#06b6d4' : 'transparent'
        ctx.shadowBlur = isActive ? 10 : 0
        
        // Draw bar
        ctx.fillRect(x + 1, centerY - barHeight/2, barWidth - 2, barHeight)

        // Update height for next frame
        if (isActive) {
          barsRef.current[index] += (Math.random() - 0.5) * 0.1
          barsRef.current[index] = Math.max(0.1, Math.min(1, barsRef.current[index]))
        } else {
          barsRef.current[index] *= 0.95
        }
      })

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isActive])

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="relative w-full max-w-md mx-auto"
    >
      {/* Main visualizer */}
      <div className="relative bg-black/30 rounded-lg p-4 border border-purple-500/30 backdrop-blur-sm">
        <canvas
          ref={canvasRef}
          width={400}
          height={80}
          className="w-full h-20 rounded"
        />
        
        {/* Overlay effects */}
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10 rounded-lg pointer-events-none" />
        
        {/* Glow effect */}
        {isActive && (
          <motion.div
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 to-purple-500/20 rounded-lg blur-xl -z-10"
          />
        )}
      </div>

      {/* Status indicator */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-center mt-3 space-x-2"
      >
        <motion.div
          animate={isActive ? { scale: [1, 1.2, 1] } : { scale: 1 }}
          transition={{ repeat: isActive ? Infinity : 0, duration: 1 }}
          className={`w-2 h-2 rounded-full ${
            isActive ? 'bg-green-400' : 'bg-gray-500'
          }`}
        />
        <span className="text-xs text-gray-400">
          {isActive ? 'Audio actif' : 'Audio inactif'}
        </span>
      </motion.div>

      {/* Particle effects */}
      {isActive && (
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 6 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ 
                opacity: [0, 1, 0],
                scale: [0, 1, 0],
                x: [0, Math.random() * 100 - 50],
                y: [0, Math.random() * 50 - 25]
              }}
              transition={{
                repeat: Infinity,
                duration: 2 + Math.random() * 2,
                delay: Math.random() * 2
              }}
              className="absolute top-1/2 left-1/2 w-1 h-1 bg-cyan-400 rounded-full"
            />
          ))}
        </div>
      )}
    </motion.div>
  )
}
