"use client"

import { useEffect, useRef, useState } from "react"
import type React from "react"

interface RealMapProps {
    selectedAlertId: number | null
    onSelectAlert: (id: number | null) => void
    thermalMode: boolean
    showHeatmap: boolean
    onCursorMove: (pos: { lat: number; lng: number } | null) => void
}

// Real coordinates for Sơn Trà Peninsula, Da Nang, Vietnam
const SON_TRA_CENTER = { lat: 16.1100, lng: 108.2800 }

// Monitoring markers
const droneMarkers = [
    { id: "UAV-01", lat: 16.1350, lng: 108.2650, battery: 78, status: "Scanning" },
    { id: "UAV-02", lat: 16.1100, lng: 108.2900, battery: 45, status: "Returning" },
    { id: "UAV-03", lat: 16.0850, lng: 108.2700, battery: 92, status: "Patrolling" },
    { id: "UAV-04", lat: 16.1200, lng: 108.2500, battery: 67, status: "Scanning" },
    { id: "UAV-05", lat: 16.1050, lng: 108.3200, battery: 81, status: "Returning" },
]

const fireMarkers = [
    { id: "FIRE-01", lat: 16.1150, lng: 108.2750, temp: 68, alertId: 1 },
]

const trapMarkers = [
    { id: "TRAP-01", lat: 16.1000, lng: 108.2850, type: "Wire Snare", alertId: 2 },
    { id: "TRAP-02", lat: 16.1280, lng: 108.2700, type: "Cage Trap", alertId: null },
]

const rangerTeams = [
    { id: "Alpha", lat: 16.1200, lng: 108.2600, members: 4, alertId: 3 },
    { id: "Bravo", lat: 16.0900, lng: 108.2800, members: 3, alertId: null },
    { id: "Charlie", lat: 16.1350, lng: 108.2750, members: 4, alertId: null },
    { id: "Delta", lat: 16.1050, lng: 108.3100, members: 3, alertId: null },
    { id: "Echo", lat: 16.0950, lng: 108.2550, members: 3, alertId: null },
]

export default function RealMap({
    selectedAlertId,
    onSelectAlert,
    thermalMode,
    showHeatmap,
    onCursorMove,
}: RealMapProps) {
    const mapRef = useRef<any>(null)
    const mapContainerRef = useRef<HTMLDivElement>(null)
    const [isLoaded, setIsLoaded] = useState(false)
    const markersRef = useRef<any[]>([])

    useEffect(() => {
        const initMap = async () => {
            if (typeof window === "undefined" || !mapContainerRef.current) return

            const L = (await import("leaflet")).default
            await import("leaflet/dist/leaflet.css")

            delete (L.Icon.Default.prototype as any)._getIconUrl
            L.Icon.Default.mergeOptions({
                iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
                iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
                shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
            })

            const map = L.map(mapContainerRef.current, {
                center: [SON_TRA_CENTER.lat, SON_TRA_CENTER.lng],
                zoom: 13,
                zoomControl: false,
                attributionControl: true,
            })

            const baseLayer = L.tileLayer("https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", {
                maxZoom: 17,
                attribution: 'Map data: © OpenStreetMap contributors, SRTM | Map style: © OpenTopoMap',
            })

            const satelliteLayer = L.tileLayer(
                "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
                {
                    maxZoom: 19,
                    attribution: 'Tiles © Esri',
                }
            )

            if (thermalMode) {
                satelliteLayer.addTo(map)
            } else {
                baseLayer.addTo(map)
            }

            L.control.zoom({ position: "topright" }).addTo(map)

            const createCustomIcon = (color: string, iconHtml: string) => {
                return L.divIcon({
                    className: "custom-marker",
                    html: `<div style="background: ${color}; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.5);">${iconHtml}</div>`,
                    iconSize: [32, 32],
                    iconAnchor: [16, 16],
                })
            }

            const fireIcon = createCustomIcon("#ff3333", "🔥")
            const trapIcon = createCustomIcon("#ffaa00", "⚠️")
            const droneIcon = createCustomIcon("#00dd66", "🛸")
            const rangerIcon = createCustomIcon("#00dd66", "👤")

            markersRef.current.forEach((marker) => marker.remove())
            markersRef.current = []

            // Add fire markers
            fireMarkers.forEach((fire) => {
                const marker = L.marker([fire.lat, fire.lng], { icon: fireIcon })
                    .addTo(map)
                    .bindPopup(`<div style="color: #000; font-family: monospace;"><strong>${fire.id}</strong><br/>Temp: ${fire.temp}°C</div>`)
                    .on("click", () => onSelectAlert(fire.alertId))
                markersRef.current.push(marker)

                const circle = L.circle([fire.lat, fire.lng], {
                    color: "#ff3333",
                    fillColor: "#ff3333",
                    fillOpacity: 0.2,
                    radius: 200,
                }).addTo(map)
                markersRef.current.push(circle)
            })

            // Add trap markers
            trapMarkers.forEach((trap) => {
                const marker = L.marker([trap.lat, trap.lng], { icon: trapIcon })
                    .addTo(map)
                    .bindPopup(`<div style="color: #000; font-family: monospace;"><strong>${trap.id}</strong><br/>Type: ${trap.type}</div>`)
                    .on("click", () => trap.alertId && onSelectAlert(trap.alertId))
                markersRef.current.push(marker)
            })

            // Add drone markers
            droneMarkers.forEach((drone) => {
                const marker = L.marker([drone.lat, drone.lng], { icon: droneIcon })
                    .addTo(map)
                    .bindPopup(`<div style="color: #000; font-family: monospace;"><strong>${drone.id}</strong><br/>Battery: ${drone.battery}%<br/>Status: ${drone.status}</div>`)
                markersRef.current.push(marker)
            })

            // Add ranger team markers
            rangerTeams.forEach((team) => {
                const marker = L.marker([team.lat, team.lng], { icon: rangerIcon })
                    .addTo(map)
                    .bindPopup(`<div style="color: #000; font-family: monospace;"><strong>Team ${team.id}</strong><br/>Members: ${team.members}</div>`)
                    .on("click", () => team.alertId && onSelectAlert(team.alertId))
                markersRef.current.push(marker)
            })

            // Sơn Trà Peninsula boundary - TIGHT to actual coastline only
            const sonTraBoundary = L.polygon(
                [
                    // MAIN PENINSULA - strictly on land
                    // West coast starting from southwest
                    [16.0950, 108.2350], // Southwest corner near QL14B bridge
                    [16.1050, 108.2250], // West coast - expanded more west
                    [16.1150, 108.2220], // West coast mid - expanded more west
                    [16.1300, 108.2230], // Northwest slope - expanded more northwest
                    [16.1420, 108.2300], // Northwest ridge - expanded more northwest
                    [16.1520, 108.2400], // North slope west - expanded more north
                    [16.1580, 108.2530], // 621m peak area - expanded more north
                    [16.1600, 108.2680], // North peak - expanded more north
                    [16.1580, 108.2820], // North ridge - smoother curve
                    [16.1540, 108.2960], // Northeast curve 1 - expanded
                    [16.1500, 108.3120], // Northeast curve 2 - expanded more
                    [16.1430, 108.3250], // Northeast curve 3 - expanded more
                    [16.1350, 108.3330], // Northeast curve 4 - expanded more
                    [16.1260, 108.3380], // East ridge - expanded more northeast
                    [16.1160, 108.3280], // East coast upper
                    [16.1100, 108.3180], // Main peninsula east tip
                    // Gap - water between main and 384m island
                    // 384m Island
                    [16.1120, 108.3220], // Approach to 384m island
                    [16.1160, 108.3280], // 384m island west
                    [16.1220, 108.3340], // 384m island north - expanded
                    [16.1200, 108.3400], // 384m island east - expanded
                    [16.1140, 108.3380], // 384m island south
                    [16.1080, 108.3280], // Back from island
                    [16.1050, 108.3150], // East coast
                    // Southeast coastline - tight to shore
                    [16.1000, 108.3080], // Southeast
                    [16.0950, 108.3000], // South coast east
                    [16.0920, 108.2920], // South coast
                    [16.0900, 108.2820], // South mid
                    [16.0900, 108.2720], // South coast - near label
                    [16.0920, 108.2620], // South coast west
                    [16.0930, 108.2520], // Southwest coast
                    [16.0920, 108.2420], // Southwest
                ],
                {
                    color: "#00dd66",
                    weight: 3,
                    fillOpacity: 0.10,
                    dashArray: "8, 8",
                }
            )
                .addTo(map)
                .bindPopup("<strong>Khu Bảo tồn Thiên nhiên Sơn Trà</strong><br/>Toàn bộ khu vực rừng núi")

            markersRef.current.push(sonTraBoundary)

            // Track cursor position
            map.on("mousemove", (e: any) => {
                onCursorMove({ lat: e.latlng.lat, lng: e.latlng.lng })
            })

            map.on("mouseout", () => {
                onCursorMove(null)
            })

            mapRef.current = map
            setIsLoaded(true)
        }

        initMap()

        return () => {
            if (mapRef.current) {
                mapRef.current.remove()
                mapRef.current = null
            }
        }
    }, [])

    // Handle thermal mode toggle
    useEffect(() => {
        if (!mapRef.current || !isLoaded) return

        const updateTileLayer = async () => {
            const L = (await import("leaflet")).default

            mapRef.current.eachLayer((layer: any) => {
                if (layer instanceof L.TileLayer) {
                    mapRef.current.removeLayer(layer)
                }
            })

            if (thermalMode) {
                L.tileLayer(
                    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
                    { maxZoom: 19, attribution: 'Tiles © Esri' }
                ).addTo(mapRef.current)
            } else {
                L.tileLayer("https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", {
                    maxZoom: 17,
                    attribution: 'Map data: © OpenStreetMap contributors, SRTM | Map style: © OpenTopoMap',
                }).addTo(mapRef.current)
            }
        }

        updateTileLayer()
    }, [thermalMode, isLoaded])

    // Fly to selected alert
    useEffect(() => {
        if (!mapRef.current || !selectedAlertId || !isLoaded) return

        let target = null
        if (selectedAlertId === 1) {
            target = fireMarkers.find((f) => f.alertId === 1)
        } else if (selectedAlertId === 2) {
            target = trapMarkers.find((t) => t.alertId === 2)
        } else if (selectedAlertId === 3) {
            target = rangerTeams.find((r) => r.alertId === 3)
        }

        if (target) {
            mapRef.current.flyTo([target.lat, target.lng], 15, { duration: 1.5 })
        }
    }, [selectedAlertId, isLoaded])

    return (
        <div className="w-full h-full relative overflow-hidden bg-[#030308]">
            <div ref={mapContainerRef} className="absolute inset-0 w-full h-full" />

            {thermalMode && (
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-purple-900/30 via-transparent to-orange-900/30 mix-blend-color" />
            )}

            <div
                className="absolute inset-0 pointer-events-none opacity-10"
                style={{
                    backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)",
                }}
            />

            <div className="absolute top-2 left-2 w-4 h-4 border-l-2 border-t-2 border-[#4a9eff]/30" />
            <div className="absolute top-2 right-2 w-4 h-4 border-r-2 border-t-2 border-[#4a9eff]/30" />
            <div className="absolute bottom-2 left-2 w-4 h-4 border-l-2 border-b-2 border-[#4a9eff]/30" />
            <div className="absolute bottom-2 right-2 w-4 h-4 border-r-2 border-b-2 border-[#4a9eff]/30" />

            <div className="absolute bottom-16 left-4 bg-[#0a0a12]/90 backdrop-blur-xl rounded px-3 py-2 border border-[#2a3a4a]/50 z-[1000]">
                <div className="font-mono text-[9px] text-[#5a7a9a] mb-2">LEGEND</div>
                <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-[#00dd66]" />
                        <span className="font-mono text-[9px] text-[#6a8aaa]">Drone ({droneMarkers.length})</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-[#ff3333]" />
                        <span className="font-mono text-[9px] text-[#6a8aaa]">Fire</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-0 h-0 border-l-[4px] border-r-[4px] border-b-[6px] border-l-transparent border-r-transparent border-b-[#ffaa00]" />
                        <span className="font-mono text-[9px] text-[#6a8aaa]">Trap ({trapMarkers.length})</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-[#00dd66] border border-white" />
                        <span className="font-mono text-[9px] text-[#6a8aaa]">Ranger ({rangerTeams.length})</span>
                    </div>
                </div>
            </div>

            <div className="absolute top-4 left-4 bg-[#0a0a12]/90 backdrop-blur-xl rounded px-3 py-2 border border-[#2a3a4a]/50 z-[1000]">
                <div className="font-mono text-[9px] text-[#5a7a9a] mb-1">KHU BẢO TỒN</div>
                <div className="font-mono text-[11px] text-[#00dd66] font-bold">Sơn Trà Peninsula</div>
                <div className="font-mono text-[9px] text-[#6a8aaa]">Đà Nẵng, Việt Nam</div>
                <div className="font-mono text-[8px] text-[#4a6a8a] mt-1">
                    Coverage: {SON_TRA_CENTER.lat.toFixed(4)}°N, {SON_TRA_CENTER.lng.toFixed(4)}°E
                </div>
            </div>
        </div>
    )
}
