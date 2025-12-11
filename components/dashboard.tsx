"use client"

import { useState } from "react"
import { StatusBar } from "./status-bar"
import { LeftPanel } from "./left-panel"
import { CenterPanel } from "./center-panel"
import { RightPanel } from "./right-panel"

export type AlertType = {
  id: number
  type: "critical" | "warning" | "info"
  coords: { x: number; y: number }
}

export function Dashboard() {
  const [selectedAlertId, setSelectedAlertId] = useState<number | null>(null)

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#121212] text-[#E0E0E0] flex flex-col">
      <StatusBar />

      {/* Desktop: 3-column grid, Tablet: 2-column, Mobile: stack */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-[30%_70%] lg:grid-cols-[20%_55%_25%] gap-2 p-2 overflow-hidden">
        {/* Left Panel - Events Feed */}
        <div className="transition-all duration-500 ease-out transform hover:scale-[1.005] order-2 md:order-1">
          <LeftPanel selectedAlertId={selectedAlertId} onSelectAlert={setSelectedAlertId} />
        </div>

        {/* Center Panel - Map */}
        <div className="transition-all duration-500 ease-out min-h-[400px] md:min-h-0 order-1 md:order-2">
          <CenterPanel selectedAlertId={selectedAlertId} onSelectAlert={setSelectedAlertId} />
        </div>

        {/* Right Panel - Analytics (hidden on mobile/tablet, visible on lg) */}
        <div className="hidden lg:flex transition-all duration-500 ease-out transform hover:scale-[1.005] order-3">
          <RightPanel />
        </div>
      </div>
    </div>
  )
}
