"use client"

import { Flame, AlertTriangle, User, Radio } from "lucide-react"

export const events = [
  {
    id: 1,
    type: "critical" as const,
    icon: Flame,
    title: "Fire Detection",
    subtitle: "Sector Tiên Sa",
    badge: "YOLOv8",
    confidence: 99,
    time: "Now",
    borderColor: "border-[#ff4444]",
    glowColor: "shadow-[0_0_20px_rgba(255,68,68,0.3)]",
    coords: { x: 45, y: 40 },
  },
  {
    id: 2,
    type: "warning" as const,
    icon: AlertTriangle,
    title: "Illegal Trap",
    subtitle: "Zone B2",
    badge: "Type: Snare",
    confidence: 87,
    time: "2m ago",
    borderColor: "border-[#ffaa33]",
    glowColor: "",
    coords: { x: 30, y: 65 },
  },
  {
    id: 3,
    type: "info" as const,
    icon: User,
    title: "Ranger Check-in",
    subtitle: "Team Alpha",
    badge: "",
    confidence: 0,
    time: "5m ago",
    borderColor: "border-[#00dd66]",
    glowColor: "",
    coords: { x: 60, y: 55 },
  },
  {
    id: 4,
    type: "info" as const,
    icon: Radio,
    title: "Drone Patrol Complete",
    subtitle: "VTOL-01",
    badge: "Sector A cleared",
    confidence: 0,
    time: "8m ago",
    borderColor: "border-[#00dd66]",
    glowColor: "",
    coords: { x: 35, y: 30 },
  },
]

interface LeftPanelProps {
  selectedAlertId: number | null
  onSelectAlert: (id: number | null) => void
}

export function LeftPanel({ selectedAlertId, onSelectAlert }: LeftPanelProps) {
  return (
    <div className="bg-[#0a0a0a]/40 backdrop-blur-2xl rounded-lg border border-white/10 flex flex-col overflow-hidden shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
      <div className="p-4 border-b border-white/5 flex items-center gap-2 bg-[#0a0a0a]/50">
        <div className="relative">
          <div className="h-2 w-2 rounded-full bg-[#ff4444] animate-pulse-dot" />
          <div className="absolute inset-0 h-2 w-2 rounded-full bg-[#ff4444] animate-ping" />
        </div>
        <h2 className="font-semibold text-sm tracking-wide text-[#E0E0E0]">LIVE EVENTS</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {events.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            isSelected={selectedAlertId === event.id}
            onClick={() => onSelectAlert(selectedAlertId === event.id ? null : event.id)}
          />
        ))}
      </div>
    </div>
  )
}

function ConfidenceBar({ confidence }: { confidence: number }) {
  const getGradient = (conf: number) => {
    if (conf >= 90) return "linear-gradient(90deg, #ffaa33 0%, #ff5544 100%)"
    if (conf >= 70) return "linear-gradient(90deg, #ffcc44 0%, #ffaa33 100%)"
    return "linear-gradient(90deg, #ffdd55 0%, #ffcc44 100%)"
  }

  const getTextColor = (conf: number) => {
    if (conf >= 90) return "text-[#ff5544]"
    if (conf >= 70) return "text-[#ffaa33]"
    return "text-[#ffcc44]"
  }

  return (
    <div className="flex items-center gap-2 mt-2">
      <span className="text-[10px] font-mono text-[#6a6a6a]">AI</span>
      <div className="flex-1 h-1.5 bg-[#1a1a1a] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${confidence}%`, background: getGradient(confidence) }}
        />
      </div>
      <span className={`text-[10px] font-mono font-bold ${getTextColor(confidence)}`}>{confidence}%</span>
    </div>
  )
}

function EventCard({
  event,
  isSelected,
  onClick,
}: {
  event: (typeof events)[0]
  isSelected: boolean
  onClick: () => void
}) {
  const Icon = event.icon
  const isCritical = event.type === "critical"

  return (
    <div
      onClick={onClick}
      className={`
        p-3 rounded-lg bg-[#121215]/70 border-l-2 ${event.borderColor}
        ${isCritical ? "animate-critical-glow" : "border border-white/5"}
        ${isSelected ? "ring-1 ring-white/40 bg-[#1a1a20]/90" : ""}
        transition-all hover:bg-[#1a1a20]/80 cursor-pointer
      `}
    >
      <div className="flex items-start gap-3">
        <div
          className={`p-2 rounded-lg ${
            event.type === "critical"
              ? "bg-[#ff4444]/15 text-[#ff5544] shadow-[0_0_10px_rgba(255,68,68,0.3)]"
              : event.type === "warning"
                ? "bg-[#ffaa33]/15 text-[#ffaa33]"
                : "bg-[#00dd66]/15 text-[#00dd66]"
          }`}
        >
          <Icon className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className={`font-medium text-sm truncate ${isCritical ? "text-[#ff5544]" : "text-[#E0E0E0]"}`}>
              {event.title}
            </h3>
            <span className="text-[10px] text-[#6a6a6a] font-mono shrink-0">{event.time}</span>
          </div>
          <p className="text-xs text-[#6a6a6a] font-mono mt-0.5">{event.subtitle}</p>

          {event.confidence > 0 && <ConfidenceBar confidence={event.confidence} />}

          {event.badge && (
            <span
              className={`
              inline-block mt-2 px-2 py-0.5 rounded text-[10px] font-mono
              ${
                event.type === "critical"
                  ? "bg-[#ff4444]/15 text-[#ff5544]"
                  : event.type === "warning"
                    ? "bg-[#ffaa33]/15 text-[#ffaa33]"
                    : "bg-[#4a9eff]/15 text-[#4a9eff]"
              }
            `}
            >
              {event.badge}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
