"use client"

import type React from "react"

import { Shield, Cpu, Wifi, Radio } from "lucide-react"

export function StatusBar() {
  return (
    <header className="h-12 bg-[#1a1a1a]/80 backdrop-blur-md border-b border-white/10 px-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Shield className="h-6 w-6 text-[#00ff88]" />
        <span className="font-bold text-lg tracking-wider">S-FOREST SENTINEL</span>
        <span className="text-xs text-[#888888] font-mono">v2.4.1</span>
      </div>

      <div className="flex items-center gap-6 font-mono text-xs">
        <StatusIndicator icon={<Cpu className="h-3.5 w-3.5" />} label="System" value="ONLINE" color="text-[#00ff88]" />
        <StatusIndicator
          icon={<Radio className="h-3.5 w-3.5" />}
          label="AI Inference"
          value="ACTIVE"
          color="text-[#00ff88]"
        />
        <StatusIndicator
          icon={<Wifi className="h-3.5 w-3.5" />}
          label="Connection"
          value="4G/LTE"
          color="text-[#00aaff]"
        />
        <div className="text-[#888888]">{new Date().toLocaleTimeString("en-US", { hour12: false })} UTC+7</div>
      </div>
    </header>
  )
}

function StatusIndicator({
  icon,
  label,
  value,
  color,
}: { icon: React.ReactNode; label: string; value: string; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className={color}>{icon}</span>
      <span className="text-[#888888]">{label}:</span>
      <span className={color}>{value}</span>
    </div>
  )
}
