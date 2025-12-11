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
      <div className="flex-1 grid grid-cols-[20%_55%_25%] gap-2 p-2 overflow-hidden">
        <LeftPanel selectedAlertId={selectedAlertId} onSelectAlert={setSelectedAlertId} />
        <CenterPanel selectedAlertId={selectedAlertId} onSelectAlert={setSelectedAlertId} />
        <RightPanel />
      </div>
    </div>
  )
}
