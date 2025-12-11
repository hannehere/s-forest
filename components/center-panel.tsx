"use client"

import { useState } from "react"
import { ThermometerSun, Send, Layers, Pentagon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { events } from "./left-panel"
import dynamic from "next/dynamic"

// Dynamically import the map component to avoid SSR issues
const RealMap = dynamic(() => import("./real-map"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-[#030308]">
      <div className="text-[#4a9eff] font-mono text-sm animate-pulse">Loading Tactical Map...</div>
    </div>
  ),
})

interface CenterPanelProps {
  selectedAlertId: number | null
  onSelectAlert: (id: number | null) => void
}

export function CenterPanel({ selectedAlertId, onSelectAlert }: CenterPanelProps) {
  const [thermalMode, setThermalMode] = useState(false)
  const [showHeatmap, setShowHeatmap] = useState(true)
  const [cursorPosition, setCursorPosition] = useState<{ lat: number; lng: number } | null>(null)

  const selectedEvent = events.find((e) => e.id === selectedAlertId)

  return (
    <div className="bg-[#080810]/90 backdrop-blur-md rounded-lg border border-[#1a2a3a] flex flex-col overflow-hidden relative">
      <div className="p-4 border-b border-[#1a2a3a] flex items-center justify-between bg-[#0a0a12]/80">
        <h2 className="font-semibold text-sm tracking-wide text-[#4a9eff]">TACTICAL SITUATION MAP</h2>
        <span className="text-xs text-[#4a6a8a] font-mono">SON TRA PENINSULA | LIVE</span>
      </div>

      <div className="flex-1 relative overflow-hidden rounded-lg border border-white/10 bg-[#0a0a0a]/40 backdrop-blur-2xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
        <RealMap
          selectedAlertId={selectedAlertId}
          onSelectAlert={onSelectAlert}
          thermalMode={thermalMode}
          showHeatmap={showHeatmap}
          onCursorMove={setCursorPosition}
        />

        {/* Map Controls Overlay */}
        <TooltipProvider delayDuration={200}>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-[#0a0a12]/90 backdrop-blur-xl rounded-lg p-2 border border-[#2a3a4a]/50 z-[1000]">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setThermalMode(!thermalMode)}
                  className={`bg-[#0a0a12]/90 border-[#2a3a4a]/50 text-[#6a8aaa] hover:bg-[#1a2a3a]/50 hover:text-[#8ab0d0] font-mono text-xs ${thermalMode ? "ring-1 ring-[#ff5533] text-[#ff5533] border-[#ff5533]/40" : ""}`}
                >
                  <ThermometerSun className={`h-3.5 w-3.5 mr-1.5 ${thermalMode ? "text-[#ff5533]" : ""}`} />
                  Thermal
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-[#0a0a12] border-[#2a3a4a]/50 text-[#8ab0d0] font-mono text-xs">
                Toggle Thermal Imaging Layer
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowHeatmap(!showHeatmap)}
                  className={`bg-[#0a0a12]/90 border-[#2a3a4a]/50 text-[#6a8aaa] hover:bg-[#1a2a3a]/50 hover:text-[#8ab0d0] font-mono text-xs ${showHeatmap ? "ring-1 ring-[#ffaa33] text-[#ffaa33] border-[#ffaa33]/40" : ""}`}
                >
                  <Layers className={`h-3.5 w-3.5 mr-1.5 ${showHeatmap ? "text-[#ffaa33]" : ""}`} />
                  Risk Zones
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-[#0a0a12] border-[#2a3a4a]/50 text-[#8ab0d0] font-mono text-xs">
                Toggle High-Risk Zone Overlay
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-[#0a0a12]/90 border-[#2a3a4a]/50 text-[#6a8aaa] hover:bg-[#1a2a3a]/50 hover:text-[#8ab0d0] font-mono text-xs"
                >
                  <Pentagon className="h-3.5 w-3.5 mr-1.5" />
                  Draw Area
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-[#0a0a12] border-[#2a3a4a]/50 text-[#8ab0d0] font-mono text-xs">
                Draw Polygon for Risk-based Path Planning
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  className="bg-[#00dd66] text-[#0a0a0a] hover:bg-[#00cc55] font-mono text-xs font-bold shadow-[0_0_20px_rgba(0,220,100,0.5),0_0_40px_rgba(0,220,100,0.2)]"
                >
                  <Send className="h-3.5 w-3.5 mr-1.5" />
                  Dispatch Team
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-[#0a0a12] border-[#2a3a4a]/50 text-[#8ab0d0] font-mono text-xs">
                Deploy Response Team to Selected Area
              </TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>

        {/* Coordinates Display */}
        <div className="absolute top-4 right-4 bg-[#0a0a12]/95 backdrop-blur-xl rounded px-3 py-2 border border-[#2a3a4a]/50 z-[1000]">
          <div className="font-mono text-[10px] text-[#5a7a9a]">
            {selectedEvent ? "ALERT POSITION" : "CURSOR POSITION"}
          </div>
          <div className="font-mono text-xs text-[#8ab0d0]">
            {cursorPosition
              ? `${cursorPosition.lat.toFixed(4)}°N, ${cursorPosition.lng.toFixed(4)}°E`
              : "16.1200°N, 108.2800°E"}
          </div>
          <div className="font-mono text-[9px] text-[#4a6a8a] mt-1">ALT: 693m</div>
        </div>

        {/* Tracking Info */}
        {selectedEvent && (
          <div className="absolute top-4 left-4 bg-[#0a0a12]/95 backdrop-blur-xl rounded px-3 py-2 border border-[#2a3a4a]/50 z-[1000]">
            <div className="font-mono text-[10px] text-[#5a7a9a]">TRACKING</div>
            <div
              className={`font-mono text-xs ${selectedEvent.type === "critical" ? "text-[#ff5544]" : selectedEvent.type === "warning" ? "text-[#ffaa33]" : "text-[#00dd66]"}`}
            >
              {selectedEvent.title}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
