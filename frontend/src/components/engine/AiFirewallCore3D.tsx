import { useEffect, useRef } from 'react'

interface AiFirewallCore3DProps {
  threatScore: number
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  activeMonitoring: boolean
  packetCount: number
}

export function AiFirewallCore3D({
  threatScore,
  riskLevel,
  activeMonitoring,
  packetCount,
}: AiFirewallCore3DProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId: number
    let angle = 0
    let mouseX = 0
    let mouseY = 0
    let targetRotX = 0
    let targetRotY = 0

    // Resize handling for high-DPI screens
    const handleResize = () => {
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * window.devicePixelRatio
      canvas.height = rect.height * window.devicePixelRatio
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
    }
    handleResize()
    window.addEventListener('resize', handleResize)

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      mouseX = (e.clientX - rect.left) / rect.width - 0.5
      mouseY = (e.clientY - rect.top) / rect.height - 0.5
    }
    canvas.addEventListener('mousemove', handleMouseMove)

    // Dynamic particles orbiting the core
    const particleCount = 28
    const particles = Array.from({ length: particleCount }, (_, i) => ({
      orbitRadius: 70 + (i % 4) * 26,
      speed: 0.015 + ((i % 3) + 1) * 0.008,
      offset: (i * Math.PI * 2) / particleCount,
      size: 2.5 + (i % 3),
      heightOffset: ((i % 5) - 2) * 12,
    }))

    // Color theme mapping
    const getThemeColor = (alpha = 1) => {
      if (riskLevel === 'CRITICAL' || threatScore > 0.75) {
        return `rgba(239, 68, 68, ${alpha})` // Crimson
      }
      if (riskLevel === 'HIGH' || threatScore > 0.5) {
        return `rgba(249, 115, 22, ${alpha})` // Orange
      }
      if (riskLevel === 'MEDIUM' || threatScore > 0.25) {
        return `rgba(245, 158, 11, ${alpha})` // Amber
      }
      return `rgba(37, 99, 235, ${alpha})` // Enterprise Blue
    }

    const render = () => {
      const rect = canvas.getBoundingClientRect()
      const width = rect.width
      const height = rect.height
      const cx = width / 2
      const cy = height / 2

      ctx.clearRect(0, 0, width, height)

      // Background subtle grid
      ctx.strokeStyle = 'rgba(226, 232, 240, 0.45)'
      ctx.lineWidth = 1
      const gridSize = 32
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, height)
        ctx.stroke()
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(width, y)
        ctx.stroke()
      }

      // Smooth mouse rotation
      targetRotX += (mouseY * 0.4 - targetRotX) * 0.05
      targetRotY += (mouseX * 0.6 - targetRotY) * 0.05
      angle += activeMonitoring ? 0.02 : 0.005

      // 1. Draw outer rotating concentric wireframe rings
      for (let ring = 0; ring < 3; ring++) {
        const radius = 105 - ring * 22
        const ringAngle = angle * (ring % 2 === 0 ? 1 : -1) + (ring * Math.PI) / 3

        ctx.save()
        ctx.translate(cx, cy)
        ctx.rotate(targetRotY)

        ctx.beginPath()
        ctx.ellipse(0, 0, radius, radius * (0.45 + targetRotX * 0.5), ringAngle, 0, Math.PI * 2)
        ctx.strokeStyle = ring === 0 ? getThemeColor(0.65) : 'rgba(203, 213, 225, 0.7)'
        ctx.lineWidth = ring === 0 ? 2 : 1
        ctx.setLineDash(ring === 1 ? [4, 6] : [])
        ctx.stroke()
        ctx.restore()
      }

      // 2. Draw 3D Shield / Icosahedron Nodes in the center
      const nodes = [
        { x: 0, y: -48, z: 0 },
        { x: -36, y: -16, z: 24 },
        { x: 36, y: -16, z: 24 },
        { x: -36, y: 24, z: -16 },
        { x: 36, y: 24, z: -16 },
        { x: 0, y: 46, z: 0 },
      ]

      const projectedNodes = nodes.map((node) => {
        // Rotate around Y
        const cosY = Math.cos(angle * 0.7 + targetRotY)
        const sinY = Math.sin(angle * 0.7 + targetRotY)
        const x1 = node.x * cosY - node.z * sinY
        const z1 = node.x * sinY + node.z * cosY

        // Rotate around X
        const cosX = Math.cos(targetRotX)
        const sinX = Math.sin(targetRotX)
        const y2 = node.y * cosX - z1 * sinX
        const z2 = node.y * sinX + z1 * cosX

        const scale = 240 / (240 + z2)
        return {
          x: cx + x1 * scale,
          y: cy + y2 * scale,
          z: z2,
          scale,
        }
      })

      // Draw wireframe edges between nodes
      ctx.beginPath()
      ctx.strokeStyle = getThemeColor(0.55)
      ctx.lineWidth = 1.5
      ctx.setLineDash([])

      for (let i = 0; i < projectedNodes.length; i++) {
        for (let j = i + 1; j < projectedNodes.length; j++) {
          const n1 = projectedNodes[i]!
          const n2 = projectedNodes[j]!
          const distSq = (n1.x - n2.x) ** 2 + (n1.y - n2.y) ** 2
          if (distSq < 6400) {
            ctx.moveTo(n1.x, n1.y)
            ctx.lineTo(n2.x, n2.y)
          }
        }
      }
      ctx.stroke()

      // Draw node spheres
      projectedNodes.forEach((node) => {
        ctx.beginPath()
        ctx.arc(node.x, node.y, 4.5 * node.scale, 0, Math.PI * 2)
        ctx.fillStyle = getThemeColor(0.9)
        ctx.fill()
        ctx.strokeStyle = '#ffffff'
        ctx.lineWidth = 1.5
        ctx.stroke()
      })

      // 3. Draw Orbiting Data Packets
      particles.forEach((p) => {
        const curAngle = angle * p.speed * 40 + p.offset
        const px = cx + Math.cos(curAngle) * p.orbitRadius
        const py = cy + Math.sin(curAngle) * (p.orbitRadius * 0.42) + p.heightOffset * targetRotX

        ctx.beginPath()
        ctx.arc(px, py, p.size, 0, Math.PI * 2)
        ctx.fillStyle = getThemeColor(0.85)
        ctx.fill()

        // Subtle glow / trail
        ctx.beginPath()
        ctx.moveTo(px, py)
        const trailX = px - Math.cos(curAngle) * 8
        const trailY = py - Math.sin(curAngle) * 4
        ctx.lineTo(trailX, trailY)
        ctx.strokeStyle = getThemeColor(0.3)
        ctx.lineWidth = 2
        ctx.stroke()
      })

      // 4. Central Core Pulsing Circle
      const pulseSize = 18 + Math.sin(angle * 4) * 3
      ctx.beginPath()
      ctx.arc(cx, cy, pulseSize, 0, Math.PI * 2)
      ctx.fillStyle = getThemeColor(0.18)
      ctx.fill()
      ctx.strokeStyle = getThemeColor(0.85)
      ctx.lineWidth = 2
      ctx.stroke()

      // Center Core Icon Text
      ctx.fillStyle = '#0f172a'
      ctx.font = 'bold 9px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('AI CORE', cx, cy)

      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('resize', handleResize)
      canvas.removeEventListener('mousemove', handleMouseMove)
    }
  }, [threatScore, riskLevel, activeMonitoring])

  return (
    <div className="relative w-full h-80 rounded-2xl border border-slate-200/90 bg-white overflow-hidden shadow-xs">
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
      />

      {/* Floating HUD Overlays */}
      <div className="absolute top-4 left-4 flex flex-col gap-1.5 pointer-events-none">
        <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white/90 backdrop-blur-xs px-3 py-1 shadow-2xs">
          <span
            className={`h-2 w-2 rounded-full ${
              activeMonitoring ? 'bg-emerald-500 animate-ping' : 'bg-slate-400'
            }`}
          />
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-700">
            {activeMonitoring ? 'Active Inspection Core' : 'Engine Idle'}
          </span>
        </div>
        <span className="text-[11px] font-mono text-slate-500 bg-white/80 px-2 py-0.5 rounded-md border border-slate-100">
          Packets Processed: {packetCount.toLocaleString()}
        </span>
      </div>

      <div className="absolute top-4 right-4 flex flex-col items-end gap-1 pointer-events-none">
        <div className="rounded-xl border border-slate-200 bg-white/95 backdrop-blur-xs px-3 py-1.5 shadow-2xs text-right">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Inference Flux
          </p>
          <p className="text-base font-extrabold text-blue-600 font-mono">
            {(threatScore * 100).toFixed(1)}%
          </p>
        </div>
      </div>

      <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-[11px] text-slate-400 font-medium pointer-events-none">
        <span>Dynamic 3D Threat Flow Matrix</span>
        <span>Drag / Hover to rotate spatial axis</span>
      </div>
    </div>
  )
}
