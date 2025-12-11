"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Shield, Cpu, Wifi, Radio, Flame } from "lucide-react"

export function StatusBar() {
  const [currentTime, setCurrentTime] = useState<string>("")

  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(new Date().toLocaleTimeString("en-US", { hour12: false }))
    }
    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <header className="h-12 bg-[#1a1a1a]/80 backdrop-blur-md border-b border-white/10 px-4 flex items-center justify-between transition-all duration-300">
      <div className="flex items-center gap-3">
        <div className="relative">
          <Shield className="h-6 w-6 text-[#00ff88] transition-transform duration-300 hover:scale-110" />
          <div className="absolute inset-0 h-6 w-6 bg-[#00ff88]/20 rounded-full blur-md animate-pulse" />
        </div>
        <span className="font-bold text-lg tracking-wider bg-gradient-to-r from-[#00ff88] to-[#00aaff] bg-clip-text text-transparent">
          S-FOREST SENTINEL
        </span>
        <span className="text-xs text-[#888888] font-mono px-2 py-0.5 rounded bg-[#2a2a2a]/50 border border-white/5">
          v1.0.0
        </span>
      </div>

      <div className="flex items-center gap-6 font-mono text-xs">
        <StatusIndicator
          icon={<Cpu className="h-3.5 w-3.5" />}
          label="System"
          value="ONLINE"
          color="text-[#00ff88]"
        />
        <StatusIndicator
          icon={<Radio className="h-3.5 w-3.5" />}
          label="AI Inference"
          value="ACTIVE"
          color="text-[#00ff88]"
        />
        <StatusIndicator
          icon={<Wifi className="h-3.5 w-3.5" />}
          label="Network"
          value="4G/LTE"
          color="text-[#00aaff]"
        />
        <StatusIndicator
          icon={<Flame className="h-3.5 w-3.5" />}
          label="Fire Risk"
          value="HIGH"
          color="text-[#ff3333]"
          pulse
        />
        <div className="text-[#888888] border-l border-white/10 pl-4 tabular-nums">
          {currentTime || "--:--:--"} <span className="text-[#555555]">UTC+7</span>
        </div>
      </div>
    </header>
  )
}

function StatusIndicator({
  icon,
  label,
  value,
  color,
  pulse = false,
}: { icon: React.ReactNode; label: string; value: string; color: string; pulse?: boolean }) {
  return (
    <div className="flex items-center gap-2 transition-opacity duration-300 hover:opacity-80">
      <span className={`${color} transition-all duration-300 ${pulse ? "animate-pulse" : ""}`}>{icon}</span>
      <span className="text-[#888888]">{label}:</span>
      <span className={`${color} font-semibold`}>{value}</span>
    </div>
  )
}
