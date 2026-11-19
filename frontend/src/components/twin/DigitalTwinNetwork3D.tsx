import { useEffect, useRef } from 'react'

interface DigitalTwinNetwork3DProps {
  employeeName: string
  threatScore: number
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  department: string
}

export function DigitalTwinNetwork3D({
  employeeName,
  threatScore,
  riskLevel,
  department,
}: DigitalTwinNetwork3DProps) {
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

    // Peripheral infrastructure nodes
    const networkNodes = [
      { name: 'S3 Secure Vault', type: 'STORAGE', radius: 105, angleOffset: 0, alert: threatScore > 0.6 },
      { name: 'Prod Postgres DB', type: 'DATABASE', radius: 115, angleOffset: 1.25, alert: threatScore > 0.4 },
      { name: 'WireGuard VPN Gateway', type: 'NETWORK', radius: 95, angleOffset: 2.5, alert: false },
      { name: 'Keycloak SSO Identity', type: 'AUTH', radius: 110, angleOffset: 3.75, alert: false },
      { name: 'Internal Gitlab Registry', type: 'CODE', radius: 100, angleOffset: 5.0, alert: threatScore > 0.5 },
    ]

    const render = () => {
      const rect = canvas.getBoundingClientRect()
      const width = rect.width
      const height = rect.height
      const cx = width / 2
      const cy = height / 2

      ctx.clearRect(0, 0, width, height)

      // Background subtle grid
      ctx.strokeStyle = 'rgba(241, 245, 249, 0.9)'
      ctx.lineWidth = 1
      const gridSize = 28
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

      targetRotX += (mouseY * 0.4 - targetRotX) * 0.05
      targetRotY += (mouseX * 0.5 - targetRotY) * 0.05
      angle += 0.012

      // Draw Orbiting Background Rings
      ctx.beginPath()
      ctx.ellipse(cx, cy, 110, 60 + targetRotX * 20, targetRotY, 0, Math.PI * 2)
      ctx.strokeStyle = 'rgba(226, 232, 240, 0.8)'
      ctx.setLineDash([4, 6])
      ctx.stroke()
      ctx.setLineDash([])

      // Center Node: Digital Employee Twin
      const centerTheme =
        riskLevel === 'CRITICAL'
          ? '#ef4444'
          : riskLevel === 'HIGH'
            ? '#f97316'
            : riskLevel === 'MEDIUM'
              ? '#f59e0b'
              : '#2563eb'

      // Pulse ring around central employee twin
      const pulse = 24 + Math.sin(angle * 3) * 4
      ctx.beginPath()
      ctx.arc(cx, cy, pulse, 0, Math.PI * 2)
      ctx.fillStyle = riskLevel === 'CRITICAL' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(37, 99, 235, 0.12)'
      ctx.fill()

      // Center Core Circle
      ctx.beginPath()
      ctx.arc(cx, cy, 16, 0, Math.PI * 2)
      ctx.fillStyle = centerTheme
      ctx.fill()
      ctx.strokeStyle = '#ffffff'
      ctx.lineWidth = 2.5
      ctx.stroke()

      // Center Label
      ctx.fillStyle = '#0f172a'
      ctx.font = 'bold 11px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'top'
      ctx.fillText(employeeName, cx, cy + 22)
      ctx.fillStyle = '#64748b'
      ctx.font = '9px sans-serif'
      ctx.fillText(`Digital Twin (${department})`, cx, cy + 36)

      // Draw Peripheral Connected Nodes
      networkNodes.forEach((node) => {
        const curAngle = angle * 0.8 + node.angleOffset
        const nx = cx + Math.cos(curAngle) * node.radius
        const ny = cy + Math.sin(curAngle) * (node.radius * (0.55 + targetRotX * 0.3))

        // Connection Arc
        ctx.beginPath()
        ctx.moveTo(cx, cy)
        ctx.lineTo(nx, ny)
        ctx.strokeStyle = node.alert ? 'rgba(239, 68, 68, 0.6)' : 'rgba(148, 163, 184, 0.4)'
        ctx.lineWidth = node.alert ? 2 : 1
        ctx.stroke()

        // Traveling packet on link
        const packetProgress = (angle * 2 + node.angleOffset) % 1
        const pktX = cx + (nx - cx) * packetProgress
        const pktY = cy + (ny - cy) * packetProgress
        ctx.beginPath()
        ctx.arc(pktX, pktY, 2.5, 0, Math.PI * 2)
        ctx.fillStyle = node.alert ? '#ef4444' : '#2563eb'
        ctx.fill()

        // Node Circle
        ctx.beginPath()
        ctx.arc(nx, ny, 7, 0, Math.PI * 2)
        ctx.fillStyle = node.alert ? '#ef4444' : '#ffffff'
        ctx.fill()
        ctx.strokeStyle = node.alert ? '#b91c1c' : '#2563eb'
        ctx.lineWidth = 2
        ctx.stroke()

        // Node Label
        ctx.fillStyle = node.alert ? '#991b1b' : '#334155'
        ctx.font = node.alert ? 'bold 9px sans-serif' : '9px sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText(node.name, nx, ny + 11)
      })

      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('resize', handleResize)
      canvas.removeEventListener('mousemove', handleMouseMove)
    }
  }, [employeeName, threatScore, riskLevel, department])

  return (
    <div className="relative w-full h-72 rounded-2xl border border-slate-200/90 bg-white overflow-hidden shadow-xs">
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
      />
      <div className="absolute top-3 left-4 flex items-center gap-2 pointer-events-none">
        <span className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
          Digital Twin Network Topology (Spatial View)
        </span>
      </div>
      <div className="absolute bottom-2.5 right-4 text-[10px] text-slate-400 font-mono pointer-events-none">
        Interactive 3D Network Graph
      </div>
    </div>
  )
}
