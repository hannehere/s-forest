"use client"

import { Battery, Wifi, HardDrive, Wind, Droplets, Flame, ThermometerSun, Clock, Zap } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from "recharts"

const drones = [
  { id: "VTOL-01", battery: 78, signal: 92, storage: 34 },
  { id: "VTOL-02", battery: 45, signal: 88, storage: 67 },
  { id: "VTOL-03", battery: 100, signal: 0, storage: 12, status: "Docked" },
]

const envData = [
  { icon: Wind, label: "Wind Speed", value: "12", unit: "km/h", color: "text-[#00aaff]" },
  { icon: Droplets, label: "Humidity", value: "45", unit: "%", color: "text-[#00aaff]" },
  { icon: Flame, label: "Fire Risk", value: "HIGH", unit: "", color: "text-[#ff3333]" },
  { icon: ThermometerSun, label: "Temp", value: "34", unit: "°C", color: "text-[#ffaa00]" },
]

const chartData = [
  { hour: "00", fire: 1, traps: 1 },
  { hour: "04", fire: 0, traps: 1 },
  { hour: "08", fire: 2, traps: 1 },
  { hour: "12", fire: 1, traps: 1 },
  { hour: "16", fire: 2, traps: 2 },
  { hour: "20", fire: 5, traps: 3 },
  { hour: "Now", fire: 8, traps: 4 },
]

export function RightPanel() {
  return (
    <div className="flex flex-col gap-2 overflow-hidden">
      {/* Drone Status */}
      <div className="bg-[#0a0a0a]/40 backdrop-blur-2xl rounded-lg border border-white/10 flex flex-col shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
        <div className="p-3 border-b border-white/5 bg-[#0a0a0a]/50">
          <h2 className="font-semibold text-sm tracking-wide text-[#E0E0E0]">FLEET STATUS</h2>
        </div>
        <div className="p-3 space-y-3">
          {drones.map((drone) => (
            <DroneStatus key={drone.id} drone={drone} />
          ))}
        </div>
      </div>

      {/* System Latency */}
      <div className="bg-[#0a0a0a]/40 backdrop-blur-2xl rounded-lg border border-white/10 flex flex-col shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
        <div className="p-3 border-b border-white/5 bg-[#0a0a0a]/50">
          <h2 className="font-semibold text-sm tracking-wide text-[#E0E0E0]">SYSTEM LATENCY</h2>
        </div>
        <div className="p-3 grid grid-cols-2 gap-2">
          <div className="bg-[#0a0a0a]/60 rounded-lg p-3 border border-[#00dd66]/20">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="h-3.5 w-3.5 text-[#00dd66]" />
              <span className="text-[10px] text-[#6a6a6a] font-mono">4G Zone</span>
            </div>
            <div className="text-lg font-bold font-mono text-[#00dd66] animate-latency-pulse">
              28<span className="text-xs font-normal text-[#6a6a6a]">s</span>
            </div>
            <div className="text-[8px] font-mono text-[#00dd66]/60 mt-1">TARGET: &lt;30s</div>
          </div>
          <div className="bg-[#0a0a0a]/60 rounded-lg p-3 border border-[#ffaa33]/20">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="h-3.5 w-3.5 text-[#ffaa33]" />
              <span className="text-[10px] text-[#6a6a6a] font-mono">LoRa Zone</span>
            </div>
            <div className="text-lg font-bold font-mono text-[#ffaa33]">
              12<span className="text-xs font-normal text-[#6a6a6a]">min</span>
            </div>
            <div className="text-[8px] font-mono text-[#ffaa33]/60 mt-1">DATA MULE</div>
          </div>
        </div>
      </div>

      {/* Environment */}
      <div className="bg-[#0a0a0a]/40 backdrop-blur-2xl rounded-lg border border-white/10 flex flex-col shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
        <div className="p-3 border-b border-white/5 bg-[#0a0a0a]/50">
          <h2 className="font-semibold text-sm tracking-wide text-[#E0E0E0]">ENVIRONMENT</h2>
        </div>
        <div className="p-3 grid grid-cols-2 gap-2">
          {envData.map((item) => (
            <EnvCard key={item.label} item={item} />
          ))}
        </div>
      </div>

      {/* Analytics Chart */}
      <div className="bg-[#0a0a0a]/40 backdrop-blur-2xl rounded-lg border border-white/10 flex-1 flex flex-col min-h-0 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
        <div className="p-3 border-b border-white/5 bg-[#0a0a0a]/50">
          <h2 className="font-semibold text-sm tracking-wide text-[#E0E0E0]">DETECTIONS (24H)</h2>
        </div>
        <div className="flex-1 p-3 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <XAxis dataKey="hour" stroke="#6a6a6a" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="#6a6a6a" fontSize={10} tickLine={false} axisLine={false} width={20} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0a0a0a",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
                labelStyle={{ color: "#6a6a6a" }}
              />
              <Legend
                wrapperStyle={{ fontSize: "10px", fontFamily: "monospace" }}
                iconSize={8}
                formatter={(value) => <span className="text-[#6a6a6a]">{value}</span>}
              />
              <Line
                type="monotone"
                dataKey="fire"
                name="Fire"
                stroke="#ff5544"
                strokeWidth={2}
                dot={{ fill: "#ff5544", strokeWidth: 0, r: 3 }}
                activeDot={{ r: 5, fill: "#ff5544", stroke: "#0a0a0a", strokeWidth: 2 }}
              />
              <Line
                type="monotone"
                dataKey="traps"
                name="Traps"
                stroke="#ffaa33"
                strokeWidth={2}
                dot={{ fill: "#ffaa33", strokeWidth: 0, r: 3 }}
                activeDot={{ r: 5, fill: "#ffaa33", stroke: "#0a0a0a", strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="px-3 pb-3 flex items-center justify-between text-[10px] font-mono text-[#6a6a6a]">
          <span>PostGIS Analysis</span>
          <span className="text-[#ff5544]">↑ 150% spike detected</span>
        </div>
      </div>
    </div>
  )
}

function DroneStatus({ drone }: { drone: (typeof drones)[0] }) {
  const isOnline = drone.signal > 0

  return (
    <div className="bg-[#0a0a0a]/50 rounded-lg p-3 border border-white/5">
      <div className="flex items-center justify-between mb-2">
        <span className="font-mono text-sm text-[#E0E0E0]">{drone.id}</span>
        <span
          className={`text-[10px] font-mono px-2 py-0.5 rounded ${
            isOnline ? "bg-[#00dd66]/15 text-[#00dd66]" : "bg-[#6a6a6a]/15 text-[#6a6a6a]"
          }`}
        >
          {drone.status || (isOnline ? "ACTIVE" : "OFFLINE")}
        </span>
      </div>
      <div className="space-y-2">
        <ProgressBar
          icon={Battery}
          label="Battery"
          value={drone.battery}
          color={drone.battery > 50 ? "#00dd66" : drone.battery > 20 ? "#ffaa33" : "#ff5544"}
        />
        <ProgressBar
          icon={Wifi}
          label="Signal"
          value={drone.signal}
          color={drone.signal > 50 ? "#00dd66" : "#ffaa33"}
        />
        <ProgressBar icon={HardDrive} label="Storage" value={drone.storage} color="#4a9eff" />
      </div>
    </div>
  )
}

function ProgressBar({
  icon: Icon,
  label,
  value,
  color,
}: { icon: typeof Battery; label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="h-3 w-3 text-[#888888]" />
      <span className="text-[10px] text-[#888888] w-12 font-mono">{label}</span>
      <div className="flex-1 h-1.5 bg-[#2a2a2a] rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${value}%`, backgroundColor: color }} />
      </div>
      <span className="text-[10px] text-[#888888] w-8 text-right font-mono">{value}%</span>
    </div>
  )
}

function EnvCard({ item }: { item: (typeof envData)[0] }) {
  const Icon = item.icon
  const isHighRisk = item.label === "Fire Risk"

  return (
    <div
      className={`
      bg-[#0a0a0a]/50 rounded-lg p-3 border border-white/5
      ${isHighRisk ? "border-[#ff5544]/30 shadow-[0_0_12px_rgba(255,85,68,0.12)]" : ""}
    `}
    >
      <div className="flex items-center gap-2 mb-1">
        <Icon className={`h-3.5 w-3.5 ${item.color}`} />
        <span className="text-[10px] text-[#6a6a6a] font-mono">{item.label}</span>
      </div>
      <div className={`text-lg font-bold font-mono ${item.color}`}>
        {item.value}
        <span className="text-xs font-normal text-[#6a6a6a]">{item.unit}</span>
      </div>
    </div>
  )
}
