"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"

interface LeafletMapProps {
  selectedAlertId: number | null
  onSelectAlert: (id: number | null) => void
  thermalMode: boolean
  showHeatmap: boolean
  onCursorMove: (pos: { lat: number; lng: number } | null) => void
}

// Map markers data - positions normalized to SVG viewport (0-100)
const droneMarkers = [
  { id: "UAV-01", x: 45, y: 35, lat: 16.125, lng: 108.275, battery: 78, status: "Scanning" },
  { id: "UAV-02", x: 70, y: 55, lat: 16.115, lng: 108.29, battery: 45, status: "Returning" },
]

const fireMarkers = [{ id: "FIRE-01", x: 55, y: 28, lat: 16.128, lng: 108.282, temp: 68, alertId: 1 }]

const trapMarkers = [{ id: "TRAP-01", x: 30, y: 65, lat: 16.112, lng: 108.268, type: "Wire Snare", alertId: 2 }]

const rangerTeams = [
  { id: "Alpha", x: 48, y: 50, lat: 16.118, lng: 108.278, members: 4, alertId: 3 },
  { id: "Bravo", x: 25, y: 75, lat: 16.108, lng: 108.265, members: 3, alertId: null },
  { id: "Charlie", x: 78, y: 40, lat: 16.122, lng: 108.295, members: 4, alertId: null },
]

// Risk zone polygon points
const riskZonePoints = "25,20 75,15 85,45 70,70 30,65 20,40"

export default function LeafletMap({
  selectedAlertId,
  onSelectAlert,
  thermalMode,
  showHeatmap,
  onCursorMove,
}: LeafletMapProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [hoveredMarker, setHoveredMarker] = useState<string | null>(null)
  const [viewBox, setViewBox] = useState({ x: 0, y: 0, width: 100, height: 100 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

  // Convert SVG coordinates to lat/lng
  const svgToLatLng = (x: number, y: number) => {
    const lat = 16.14 - (y / 100) * 0.06
    const lng = 108.25 + (x / 100) * 0.07
    return { lat, lng }
  }

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return

    const rect = svgRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * viewBox.width + viewBox.x
    const y = ((e.clientY - rect.top) / rect.height) * viewBox.height + viewBox.y
    const coords = svgToLatLng(x, y)
    onCursorMove(coords)

    if (isDragging) {
      const dx = ((e.clientX - dragStart.x) / rect.width) * viewBox.width * 0.5
      const dy = ((e.clientY - dragStart.y) / rect.height) * viewBox.height * 0.5
      setViewBox((prev) => ({
        ...prev,
        x: Math.max(-20, Math.min(40, prev.x - dx * 0.1)),
        y: Math.max(-20, Math.min(40, prev.y - dy * 0.1)),
      }))
    }
  }

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    const zoomFactor = e.deltaY > 0 ? 1.1 : 0.9
    setViewBox((prev) => {
      const newWidth = Math.max(50, Math.min(120, prev.width * zoomFactor))
      const newHeight = Math.max(50, Math.min(120, prev.height * zoomFactor))
      return {
        x: prev.x + (prev.width - newWidth) / 2,
        y: prev.y + (prev.height - newHeight) / 2,
        width: newWidth,
        height: newHeight,
      }
    })
  }

  // Fly to selected marker
  useEffect(() => {
    if (!selectedAlertId) return

    let targetX = 50,
      targetY = 50

    if (selectedAlertId === 1) {
      const fire = fireMarkers.find((f) => f.alertId === 1)
      if (fire) {
        targetX = fire.x
        targetY = fire.y
      }
    } else if (selectedAlertId === 2) {
      const trap = trapMarkers.find((t) => t.alertId === 2)
      if (trap) {
        targetX = trap.x
        targetY = trap.y
      }
    } else if (selectedAlertId === 3) {
      const ranger = rangerTeams.find((r) => r.alertId === 3)
      if (ranger) {
        targetX = ranger.x
        targetY = ranger.y
      }
    }

    // Animate zoom to target
    setViewBox({
      x: targetX - 30,
      y: targetY - 30,
      width: 60,
      height: 60,
    })
  }, [selectedAlertId])

  return (
    <div className="w-full h-full relative overflow-hidden bg-[#030308]">
      {/* Background terrain texture */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `url("https://tile.opentopomap.org/12/3246/1889.png")`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: thermalMode ? "hue-rotate(180deg) saturate(2)" : "none",
        }}
      />

      {/* SVG Map Layer */}
      <svg
        ref={svgRef}
        viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`}
        className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => onCursorMove(null)}
        onMouseDown={(e) => {
          setIsDragging(true)
          setDragStart({ x: e.clientX, y: e.clientY })
        }}
        onMouseUp={() => setIsDragging(false)}
        onWheel={handleWheel}
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          {/* Gradients */}
          <linearGradient id="terrainGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1a3a2a" />
            <stop offset="50%" stopColor="#2a4a3a" />
            <stop offset="100%" stopColor="#1a2a2a" />
          </linearGradient>

          <linearGradient id="riskGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ff3333" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#ff8833" stopOpacity="0.15" />
          </linearGradient>

          <radialGradient id="fireGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ff3333" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#ff3333" stopOpacity="0" />
          </radialGradient>

          <radialGradient id="droneGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#00dd66" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#00dd66" stopOpacity="0" />
          </radialGradient>

          {/* Scan cone gradient */}
          <linearGradient id="scanCone" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#00dd66" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#00dd66" stopOpacity="0" />
          </linearGradient>

          {/* Filters */}
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="1" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="strongGlow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Terrain contour lines */}
        <g className="terrain-contours" stroke="#2a4a4a" strokeWidth="0.15" fill="none" opacity="0.5">
          <ellipse cx="50" cy="40" rx="35" ry="25" />
          <ellipse cx="50" cy="40" rx="28" ry="20" />
          <ellipse cx="50" cy="40" rx="20" ry="14" />
          <ellipse cx="50" cy="40" rx="12" ry="8" />
          <ellipse cx="50" cy="40" rx="5" ry="3" />
        </g>

        {/* Grid overlay */}
        <g className="grid" stroke="#1a3a4a" strokeWidth="0.1" opacity="0.3">
          {Array.from({ length: 11 }).map((_, i) => (
            <line key={`h${i}`} x1="0" y1={i * 10} x2="100" y2={i * 10} />
          ))}
          {Array.from({ length: 11 }).map((_, i) => (
            <line key={`v${i}`} x1={i * 10} y1="0" x2={i * 10} y2="100" />
          ))}
        </g>

        {/* Risk zone overlay */}
        {showHeatmap && (
          <g className="risk-zone">
            <polygon
              points={riskZonePoints}
              fill="url(#riskGradient)"
              stroke="#ff5533"
              strokeWidth="0.3"
              strokeDasharray="2,1"
              opacity="0.8"
            >
              <animate attributeName="opacity" values="0.6;0.8;0.6" dur="3s" repeatCount="indefinite" />
            </polygon>
          </g>
        )}

        {/* Drone scan cones */}
        {droneMarkers.map((drone) => (
          <g key={`cone-${drone.id}`}>
            <polygon
              points={`${drone.x},${drone.y} ${drone.x - 8},${drone.y + 15} ${drone.x + 8},${drone.y + 15}`}
              fill="url(#scanCone)"
              opacity="0.5"
            >
              <animate attributeName="opacity" values="0.3;0.6;0.3" dur="2s" repeatCount="indefinite" />
            </polygon>
          </g>
        ))}

        {/* Fire markers */}
        {fireMarkers.map((fire) => (
          <g
            key={fire.id}
            className="cursor-pointer"
            onClick={() => onSelectAlert(selectedAlertId === fire.alertId ? null : fire.alertId)}
            onMouseEnter={() => setHoveredMarker(fire.id)}
            onMouseLeave={() => setHoveredMarker(null)}
          >
            {/* Glow effect */}
            <circle cx={fire.x} cy={fire.y} r="8" fill="url(#fireGlow)">
              <animate attributeName="r" values="6;10;6" dur="1s" repeatCount="indefinite" />
            </circle>

            {/* Fire beacon */}
            <line
              x1={fire.x}
              y1={fire.y}
              x2={fire.x}
              y2={fire.y - 20}
              stroke="#ff3333"
              strokeWidth="0.5"
              opacity="0.6"
              filter="url(#glow)"
            >
              <animate
                attributeName="y2"
                values={`${fire.y - 18};${fire.y - 22};${fire.y - 18}`}
                dur="1.5s"
                repeatCount="indefinite"
              />
            </line>

            {/* Fire icon */}
            <g
              transform={`translate(${fire.x - 2.5}, ${fire.y - 3}) scale(${selectedAlertId === fire.alertId ? 1.3 : 1})`}
              filter="url(#strongGlow)"
            >
              <path d="M2.5 0C2.5 0 0 3 0 5C0 6.5 1 8 2.5 8C4 8 5 6.5 5 5C5 3 2.5 0 2.5 0Z" fill="#ff3333" />
              <path
                d="M2.5 3C2.5 3 1.5 4.5 1.5 5.5C1.5 6.25 2 7 2.5 7C3 7 3.5 6.25 3.5 5.5C3.5 4.5 2.5 3 2.5 3Z"
                fill="#ff8833"
              />
            </g>

            {/* Selection ring */}
            {selectedAlertId === fire.alertId && (
              <circle cx={fire.x} cy={fire.y} r="5" fill="none" stroke="#ffffff" strokeWidth="0.3">
                <animate attributeName="r" values="4;7;4" dur="1s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="1;0.3;1" dur="1s" repeatCount="indefinite" />
              </circle>
            )}
          </g>
        ))}

        {/* Trap markers */}
        {trapMarkers.map((trap) => (
          <g
            key={trap.id}
            className="cursor-pointer"
            onClick={() => onSelectAlert(selectedAlertId === trap.alertId ? null : trap.alertId)}
            onMouseEnter={() => setHoveredMarker(trap.id)}
            onMouseLeave={() => setHoveredMarker(null)}
          >
            {/* Warning beacon */}
            <line
              x1={trap.x}
              y1={trap.y}
              x2={trap.x}
              y2={trap.y - 15}
              stroke="#ffaa00"
              strokeWidth="0.4"
              opacity="0.5"
              filter="url(#glow)"
            />

            {/* Triangle icon */}
            <g
              transform={`translate(${trap.x}, ${trap.y}) scale(${selectedAlertId === trap.alertId ? 1.3 : 1})`}
              filter="url(#glow)"
            >
              <polygon points="0,-3.5 3,2.5 -3,2.5" fill="#ffaa00" stroke="#ffcc00" strokeWidth="0.3" />
              <text x="0" y="1.5" textAnchor="middle" fill="#000" fontSize="3" fontWeight="bold">
                !
              </text>
            </g>

            {/* Selection ring */}
            {selectedAlertId === trap.alertId && (
              <circle cx={trap.x} cy={trap.y} r="4" fill="none" stroke="#ffffff" strokeWidth="0.3">
                <animate attributeName="r" values="3;6;3" dur="1s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="1;0.3;1" dur="1s" repeatCount="indefinite" />
              </circle>
            )}
          </g>
        ))}

        {/* Drone markers */}
        {droneMarkers.map((drone) => (
          <g
            key={drone.id}
            className="cursor-pointer"
            onClick={() => onSelectAlert(selectedAlertId === 1 ? null : 1)}
            onMouseEnter={() => setHoveredMarker(drone.id)}
            onMouseLeave={() => setHoveredMarker(null)}
          >
            {/* Drone glow */}
            <circle cx={drone.x} cy={drone.y} r="4" fill="url(#droneGlow)">
              <animate attributeName="r" values="3;5;3" dur="2s" repeatCount="indefinite" />
            </circle>

            {/* Drone icon */}
            <g transform={`translate(${drone.x - 2}, ${drone.y - 1.5}) scale(0.4)`} filter="url(#glow)">
              <path d="M5 0L0 4L5 8L10 4L5 0Z" fill="#00dd66" stroke="#00ff88" strokeWidth="1" />
              <path d="M0 6L5 10L10 6" stroke="#00dd66" strokeWidth="1" fill="none" />
            </g>

            {/* Battery indicator */}
            <g transform={`translate(${drone.x + 3}, ${drone.y - 2})`}>
              <rect x="0" y="0" width="4" height="2" fill="none" stroke="#4a6a8a" strokeWidth="0.2" rx="0.3" />
              <rect
                x="0.2"
                y="0.2"
                width={`${(drone.battery / 100) * 3.6}`}
                height="1.6"
                fill={drone.battery > 50 ? "#00dd66" : "#ffaa33"}
                rx="0.2"
              />
            </g>

            {/* Pulse ring */}
            <circle cx={drone.x} cy={drone.y} r="3" fill="none" stroke="#00dd66" strokeWidth="0.2" opacity="0">
              <animate attributeName="r" values="2;6;2" dur="2s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.8;0;0.8" dur="2s" repeatCount="indefinite" />
            </circle>
          </g>
        ))}

        {/* Ranger team markers */}
        {rangerTeams.map((team) => (
          <g
            key={team.id}
            className="cursor-pointer"
            onClick={() => team.alertId && onSelectAlert(selectedAlertId === team.alertId ? null : team.alertId)}
            onMouseEnter={() => setHoveredMarker(team.id)}
            onMouseLeave={() => setHoveredMarker(null)}
          >
            <circle
              cx={team.x}
              cy={team.y}
              r={selectedAlertId === team.alertId ? 2.5 : 2}
              fill="#00dd66"
              stroke="#ffffff"
              strokeWidth="0.4"
              filter="url(#glow)"
            />
            <text x={team.x} y={team.y - 4} textAnchor="middle" fill="#00dd66" fontSize="2" fontFamily="monospace">
              {team.id}
            </text>
          </g>
        ))}

        {/* Hover tooltip */}
        {hoveredMarker && (
          <g>
            {(() => {
              const marker =
                droneMarkers.find((d) => d.id === hoveredMarker) ||
                fireMarkers.find((f) => f.id === hoveredMarker) ||
                trapMarkers.find((t) => t.id === hoveredMarker) ||
                rangerTeams.find((r) => r.id === hoveredMarker)

              if (!marker) return null

              const x = "x" in marker ? marker.x : 50
              const y = "y" in marker ? marker.y : 50

              return (
                <g transform={`translate(${x + 5}, ${y - 10})`}>
                  <rect x="0" y="0" width="25" height="12" fill="#0a0a12" stroke="#2a3a4a" strokeWidth="0.3" rx="1" />
                  <text x="2" y="4" fill="#8ab0d0" fontSize="2" fontFamily="monospace">
                    {marker.id}
                  </text>
                  <text x="2" y="7" fill="#5a7a9a" fontSize="1.5" fontFamily="monospace">
                    {marker.lat.toFixed(4)}°N
                  </text>
                  <text x="2" y="10" fill="#5a7a9a" fontSize="1.5" fontFamily="monospace">
                    {marker.lng.toFixed(4)}°E
                  </text>
                </g>
              )
            })()}
          </g>
        )}
      </svg>

      {/* Thermal overlay */}
      {thermalMode && (
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-purple-900/30 via-transparent to-orange-900/30 mix-blend-color" />
      )}

      {/* Scanline effect */}
      <div
        className="absolute inset-0 pointer-events-none opacity-10"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)",
        }}
      />

      {/* Corner brackets */}
      <div className="absolute top-2 left-2 w-4 h-4 border-l-2 border-t-2 border-[#4a9eff]/30" />
      <div className="absolute top-2 right-2 w-4 h-4 border-r-2 border-t-2 border-[#4a9eff]/30" />
      <div className="absolute bottom-2 left-2 w-4 h-4 border-l-2 border-b-2 border-[#4a9eff]/30" />
      <div className="absolute bottom-2 right-2 w-4 h-4 border-r-2 border-b-2 border-[#4a9eff]/30" />

      {/* Map legend */}
      <div className="absolute bottom-16 left-4 bg-[#0a0a12]/90 backdrop-blur-xl rounded px-3 py-2 border border-[#2a3a4a]/50">
        <div className="font-mono text-[9px] text-[#5a7a9a] mb-2">LEGEND</div>
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#00dd66]" />
            <span className="font-mono text-[9px] text-[#6a8aaa]">Drone</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#ff3333]" />
            <span className="font-mono text-[9px] text-[#6a8aaa]">Fire</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-0 h-0 border-l-[4px] border-r-[4px] border-b-[6px] border-l-transparent border-r-transparent border-b-[#ffaa00]" />
            <span className="font-mono text-[9px] text-[#6a8aaa]">Trap</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#00dd66] border border-white" />
            <span className="font-mono text-[9px] text-[#6a8aaa]">Ranger</span>
          </div>
        </div>
      </div>
    </div>
  )
}
