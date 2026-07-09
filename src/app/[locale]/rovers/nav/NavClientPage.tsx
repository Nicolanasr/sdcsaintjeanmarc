"use client";

import React, { useState, useEffect, useRef } from "react";
import NodeCard from "./NodeCard";
import { getLiveGeoNodes, checkInByQR } from "@/app/actions/rovers";

interface NavClientPageProps {
    nodes: {
        id: string;
        name: string;
        latitude: number;
        longitude: number;
        radiusMeters: number;
        controllingFaction: "ALPHA" | "BRAVO" | null;
        isHotSpot: boolean;
    }[];
    userFaction: string;
    locale: string;
    userId: string;
}

export default function NavClientPage({ nodes: initialNodes, userFaction, locale, userId }: NavClientPageProps) {
    const [nodes, setNodes] = useState(initialNodes);
    const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
    const [gpsError, setGpsError] = useState<string | null>(null);
    const [showQrScanner, setShowQrScanner] = useState(false);
    const [watchId, setWatchId] = useState<number | null>(null);

    // Poll nodes every 3 seconds to update coordinate status in real-time
    useEffect(() => {
        const interval = setInterval(async () => {
            try {
                const res = await getLiveGeoNodes();
                if (res.success && res.nodes) {
                    setNodes(res.nodes as any);
                }
            } catch (err) {
                console.error("Failed to poll live nodes:", err);
            }
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    const mapRef = useRef<any>(null);
    const markersRef = useRef<any[]>([]);
    const circlesRef = useRef<any[]>([]);
    const userMarkerRef = useRef<any>(null);

    useEffect(() => {
        if (!navigator.geolocation) {
            setGpsError("Geolocation is not supported by your browser.");
            return;
        }

        // High accuracy watch position to support real-time navigation
        const id = navigator.geolocation.watchPosition(
            (position) => {
                setCoords({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                });
                setGpsError(null);
            },
            (err) => {
                console.error("GPS Watch Position Error:", err);
                setGpsError(`GPS Lock Error: ${err.message || "Coordinates unavailable."}`);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0,
            }
        );

        setWatchId(id);

        return () => {
            if (id !== null) {
                navigator.geolocation.clearWatch(id);
            }
        };
    }, []);

    useEffect(() => {
        if (typeof window === "undefined") return;
        const scriptId = "html5-qrcode-js";
        let script = document.getElementById(scriptId) as HTMLScriptElement | null;
        if (!script) {
            script = document.createElement("script");
            script.id = scriptId;
            script.src = "https://unpkg.com/html5-qrcode";
            script.async = true;
            document.head.appendChild(script);
        }
    }, []);

    useEffect(() => {
        if (!showQrScanner) return;
        const timer = setTimeout(() => {
            const L = (window as any).Html5QrcodeScanner;
            if (!L) {
                alert("QR Scanner library loading... Try again in a second.");
                setShowQrScanner(false);
                return;
            }

            const onScanSuccess = async (decodedText: string) => {
                try {
                    scanner.clear();
                } catch (e) {}
                setShowQrScanner(false);

                // Check in using passcode capture via checkInByQR server action
                const res = await checkInByQR(decodedText);
                if (res.success) {
                    alert(res.message || "QR Code Check-in successful!");
                } else {
                    alert(res.error || "QR Code Check-in failed.");
                }
            };

            const onScanFailure = (error: any) => {
                // Ignore scanning cycle errors
            };

            const scanner = new L("qr-reader", {
                fps: 10,
                qrbox: { width: 250, height: 250 },
                rememberLastUsedCamera: true
            });

            scanner.render(onScanSuccess, onScanFailure);
            (window as any).currentScanner = scanner;
        }, 200);

        return () => {
            clearTimeout(timer);
            const scanner = (window as any).currentScanner;
            if (scanner) {
                try {
                    scanner.clear().catch((e: any) => console.error("Error clearing scanner:", e));
                } catch (err) {}
                (window as any).currentScanner = null;
            }
        };
    }, [showQrScanner, nodes]);

    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
    const [mapMode, setMapMode] = useState<"dark" | "satellite">("satellite");
    const tileLayerRef = useRef<any>(null);

    // Client-side Haversine helper
    function getDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number) {
        const R = 6371000;
        const phi1 = (lat1 * Math.PI) / 180;
        const phi2 = (lat2 * Math.PI) / 180;
        const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
        const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;
        const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) + Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    useEffect(() => {
        if (typeof window === "undefined") return;

        // Inject stylesheet
        const cssId = "leaflet-css";
        if (!document.getElementById(cssId)) {
            const link = document.createElement("link");
            link.id = cssId;
            link.rel = "stylesheet";
            link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
            document.head.appendChild(link);
        }

        // Inject script
        const scriptId = "leaflet-js";
        let script = document.getElementById(scriptId) as HTMLScriptElement | null;

        const initMap = () => {
            const L = (window as any).L;
            if (!L) return;

            if (!mapRef.current) {
                // Default center is camp coordinates: 34.1220, 35.6482 (Jaj camp area)
                let centerLat = 34.122;
                let centerLng = 35.648;

                if (nodes.length > 0) {
                    centerLat = nodes[0].latitude;
                    centerLng = nodes[0].longitude;
                } else if (coords) {
                    centerLat = coords.latitude;
                    centerLng = coords.longitude;
                }

                mapRef.current = L.map("leaflet-map", {
                    zoomControl: true,
                    attributionControl: false,
                    dragging: true,
                    touchZoom: true,
                    scrollWheelZoom: true,
                    doubleClickZoom: true,
                    boxZoom: true,
                    keyboard: true,
                    tap: false
                }).setView([centerLat, centerLng], 14);

                const initialUrl = mapMode === "satellite"
                    ? "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                    : "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";

                tileLayerRef.current = L.tileLayer(initialUrl, {
                    maxZoom: 20
                }).addTo(mapRef.current);
            }

            // Clear previous markers
            markersRef.current.forEach((m) => mapRef.current.removeLayer(m));
            markersRef.current = [];
            circlesRef.current.forEach((c) => mapRef.current.removeLayer(c));
            circlesRef.current = [];



            // Draw active node range circles & blips
            nodes.forEach((node) => {
                let color = "#71717a"; // Neutral gray
                let factionText = "Neutral Node";
                if (node.isHotSpot) {
                    color = "#eab308"; // Amber
                    factionText = "🚨 CONTENDED HOT-ZONE";
                } else if (node.controllingFaction === "ALPHA") {
                    color = "#3b82f6"; // Blue
                    factionText = "FACTION ALPHA (BLUE) CONTROLLED";
                } else if (node.controllingFaction === "BRAVO") {
                    color = "#ef4444"; // Red
                    factionText = "FACTION BRAVO (RED) CONTROLLED";
                }

                // Draw node control bounds
                const circle = L.circle([node.latitude, node.longitude], {
                    color: color,
                    fillColor: color,
                    fillOpacity: node.isHotSpot ? 0.35 : 0.15,
                    radius: node.radiusMeters,
                    weight: node.isHotSpot ? 3 : 1.5
                }).addTo(mapRef.current);
                circlesRef.current.push(circle);

                // Blip design marker
                const blipIcon = L.divIcon({
                    className: "custom-leaflet-blip",
                    html: `<div class="w-6 h-6 rounded-full border-2 flex items-center justify-center font-extrabold text-[8px] text-white shadow-lg animate-pulse" style="background:${color}; border-color:#fff;">
            ${node.isHotSpot ? "🚨" : node.name.split(" ").pop()?.substring(0, 2) || "ND"}
          </div>`,
                    iconSize: [24, 24],
                    iconAnchor: [12, 12]
                });

                const marker = L.marker([node.latitude, node.longitude], { icon: blipIcon }).addTo(mapRef.current);
                markersRef.current.push(marker);

                // Popup content markup with focus actions
                const popupContent = `
          <div style="font-family:monospace; background:#09090b; padding:8px; border:1px solid rgba(245,158,11,0.3); border-radius:4px; min-width:130px; text-transform:uppercase;">
            <strong style="color:#fff; font-size:11px;">${node.name}</strong><br/>
            <span style="color:${color}; font-size:9px; font-weight:bold;">${factionText}</span><br/>
            <span style="color:#71717a; font-size:8px;">LAT: ${node.latitude.toFixed(6)}</span><br/>
            <span style="color:#71717a; font-size:8px;">LNG: ${node.longitude.toFixed(6)}</span><br/>
            <button onclick="window.focusNodeCard('${node.id}')" style="margin-top:6px; background:#f59e0b; color:#000; border:none; padding:4px 6px; font-size:9px; font-weight:bold; border-radius:2px; cursor:pointer; width:100%;">Focus Sector</button>
          </div>
        `;
                marker.bindPopup(popupContent, { closeButton: false });
            });
        };

        (window as any).focusNodeCard = (id: string) => {
            setSelectedNodeId(id);
            const el = document.getElementById(`node-card-${id}`);
            if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
        };

        if (!script) {
            script = document.createElement("script");
            script.id = scriptId;
            script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
            script.async = true;
            script.onload = initMap;
            document.head.appendChild(script);
        } else {
            if ((window as any).L) {
                initMap();
            } else {
                script.addEventListener("load", initMap);
            }
        }

        return () => {
            if (script) {
                script.removeEventListener("load", initMap);
            }
        };
    }, [nodes]);

    // Update user position marker dynamically without clearing other layers
    useEffect(() => {
        const L = (window as any).L;
        if (!L || !mapRef.current || !coords) return;

        if (userMarkerRef.current) {
            userMarkerRef.current.setLatLng([coords.latitude, coords.longitude]);
        } else {
            const liveIcon = L.divIcon({
                className: "user-leaflet-blip",
                html: `<div class="relative flex items-center justify-center w-6 h-6">
          <span class="absolute w-6 h-6 border-2 border-green-500 rounded-full animate-ping"></span>
          <span class="w-3 h-3 bg-green-500 rounded-full border-2 border-white shadow-[0_0_10px_#22c55e]"></span>
        </div>`,
                iconSize: [24, 24],
                iconAnchor: [12, 12]
            });

            userMarkerRef.current = L.marker([coords.latitude, coords.longitude], { icon: liveIcon })
                .addTo(mapRef.current)
                .bindPopup("<strong style='color:#22c55e; font-family:monospace;'>YOUR POSITION</strong>");
        }
    }, [coords]);

    useEffect(() => {
        if (mapRef.current && tileLayerRef.current) {
            const L = (window as any).L;
            if (L) {
                const newUrl = mapMode === "satellite"
                    ? "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                    : "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
                tileLayerRef.current.setUrl(newUrl);
            }
        }
    }, [mapMode]);

    return (
        <div className="flex flex-col gap-6 pb-12">
            {/* GPS Status Dashboard */}
            <section className="bg-zinc-950/40 border border-amber-500/20 rounded-lg p-5 shadow-[0_0_15px_rgba(0,0,0,0.6)]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-amber-500/20 pb-4">
                    <h2 className="text-xl font-bold tracking-widest text-amber-400 uppercase">
                        HELIOS_TACTICAL_MAP_
                    </h2>
                    <button
                        onClick={() => setShowQrScanner(true)}
                        className="bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-[10px] px-3.5 py-2 rounded uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-1.5 shadow-[0_0_10px_rgba(245,158,11,0.2)] w-full sm:w-auto"
                    >
                        📷 Scan Offline QR Code
                    </button>
                </div>

                {/* GPS Coordinate Monitor */}
                <div className="mt-4 p-3 bg-black/60 border border-amber-500/10 rounded flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${coords ? "bg-green-500 animate-pulse" : "bg-red-500 animate-pulse"}`} />
                        <span className="text-amber-500/60 uppercase">GPS Gateway Status:</span>
                        <span className={coords ? "text-green-400 font-bold" : "text-red-500 font-bold"}>
                            {coords ? "LOCKED" : "ACQUIRING_SAT_LINK..."}
                        </span>
                    </div>

                    <div className="font-mono text-zinc-400">
                        {coords ? (
                            <>
                                LAT: <span className="text-amber-400">{coords.latitude.toFixed(6)}</span> // LNG:{" "}
                                <span className="text-amber-400">{coords.longitude.toFixed(6)}</span>
                            </>
                        ) : gpsError ? (
                            <span className="text-red-400">{gpsError}</span>
                        ) : (
                            <span className="text-zinc-600">WAITING_FOR_SATELLITE_LOCK_</span>
                        )}
                    </div>
                </div>

                {gpsError && (
                    <div className="mt-4 p-4 bg-red-950/20 border-2 border-red-500/30 rounded-lg text-xs text-red-400 tracking-wider">
                        <p className="font-extrabold uppercase mb-1.5 flex items-center gap-1.5">
                            <span>⚠️</span> GPS TELEMETRY_LOCK_FAILED_
                        </p>
                        <ul className="list-disc list-inside text-[11px] text-zinc-400 font-sans leading-relaxed space-y-1">
                            <li>Ensure <strong>Location Services</strong> are enabled in your device settings.</li>
                            <li>Verify that your browser has <strong>Location permissions</strong> allowed for this website.</li>
                            <li>If you are indoors or under heavy tree cover, step into a clearer area to acquire a lock.</li>
                            <li>Try refreshing the page to restart the satellite acquisition loop.</li>
                        </ul>
                    </div>
                )}
            </section>

            {/* Visual Radar Map Section */}
            <section className="bg-zinc-950/40 border border-amber-500/20 rounded-lg p-5 flex flex-col items-center gap-4">
                <div className="w-full flex justify-between items-center text-xs border-b border-amber-500/25 pb-2">
                    <span className="text-amber-400 font-bold tracking-widest">📡 LIVE SECTOR CONQUEST RADAR</span>
                    <span className="text-zinc-500 font-mono">GRID: 500m x 500m</span>
                </div>

                {/* Legend */}
                <div className="flex flex-wrap justify-center gap-4 text-[10px] uppercase font-bold tracking-wider mb-2">
                    <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_8px_#3b82f6]" />
                        <span className="text-blue-400">Faction Alpha (Blue)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444]" />
                        <span className="text-red-400">Faction Bravo (Red)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-full bg-zinc-600 shadow-[0_0_8px_#52525b]" />
                        <span className="text-zinc-400">Neutral Node</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-full bg-amber-500 animate-ping" />
                        <span className="text-amber-400">🚨 Active Hot-Spot</span>
                    </div>
                </div>

                {/* The Leaflet Container */}
                <div className="w-full max-w-[650px] aspect-[4/3] relative border border-amber-500/30 rounded-lg overflow-hidden shadow-[0_0_20px_rgba(0,0,0,0.8)] z-10 pointer-events-auto">
                    {/* Map Layer Mode Toggler */}
                    <div className="absolute top-3 right-3 z-[1000] flex gap-1 bg-black/80 backdrop-blur-md border border-amber-500/30 p-1.5 rounded-lg shadow-lg">
                        <button
                            onClick={() => setMapMode("satellite")}
                            className={`px-2.5 py-1 text-[10px] uppercase font-extrabold tracking-wider rounded transition-all cursor-pointer ${mapMode === "satellite"
                                    ? "bg-amber-500 text-black font-extrabold"
                                    : "text-zinc-400 hover:text-zinc-200"
                                }`}
                        >
                            🛰️ Satellite
                        </button>
                        <button
                            onClick={() => setMapMode("dark")}
                            className={`px-2.5 py-1 text-[10px] uppercase font-extrabold tracking-wider rounded transition-all cursor-pointer ${mapMode === "dark"
                                    ? "bg-amber-500 text-black font-extrabold"
                                    : "text-zinc-400 hover:text-zinc-200"
                                }`}
                        >
                            🌑 Dark Vector
                        </button>
                    </div>

                    <div id="leaflet-map" className="w-full h-full bg-zinc-950" />
                </div>

                {/* Dark map overrides */}
                <style dangerouslySetInnerHTML={{
                    __html: `
          .leaflet-popup-content-wrapper {
            background: #09090b !important;
            border: 1px solid rgba(245, 158, 11, 0.3) !important;
            border-radius: 6px !important;
            padding: 0 !important;
            box-shadow: 0 4px 12px rgba(0,0,0,0.5);
          }
          .leaflet-popup-content {
            margin: 0 !important;
          }
          .leaflet-popup-tip {
            background: #09090b !important;
            border-left: 1px solid rgba(245, 158, 11, 0.3) !important;
            border-bottom: 1px solid rgba(245, 158, 11, 0.3) !important;
          }
          .leaflet-bar {
            border: 1px solid rgba(245, 158, 11, 0.3) !important;
            background: #09090b !important;
          }
          .leaflet-bar a {
            background: #09090b !important;
            color: #f59e0b !important;
            border-bottom: 1px solid rgba(245, 158, 11, 0.2) !important;
          }
          .leaflet-bar a:hover {
            background: rgba(245, 158, 11, 0.1) !important;
          }
        `}} />
            </section>

            {/* Grid Node list */}
            <div className="flex flex-col gap-4">
                <div className="flex items-center gap-4">
                    <h3 className="text-xs font-bold text-amber-400/90 tracking-widest uppercase bg-amber-950/20 border border-amber-500/20 px-3 py-1.5 rounded">
                        📡 SECTOR_NODES_IN_RANGE
                    </h3>
                    <div className="h-[1px] bg-amber-500/10 flex-grow" />
                </div>

                {nodes.length === 0 ? (
                    <p className="text-zinc-500 text-xs py-8 text-center border border-dashed border-amber-500/20 rounded-lg">
                        No active sector nodes found. Grid control initialized.
                    </p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {nodes.map((node) => (
                            <div key={node.id} id={`node-card-${node.id}`}>
                                <NodeCard
                                    node={node}
                                    userFaction={userFaction}
                                    userCoords={coords}
                                    locale={locale}
                                    userId={userId}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal: QR Code Scanner */}
            {showQrScanner && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 overflow-y-auto">
                    <div className="bg-zinc-950 border-2 border-amber-500/40 rounded-lg max-w-md w-full p-6 shadow-[0_0_50px_rgba(245,158,11,0.25)] text-left font-mono my-8">
                        <div className="flex justify-between items-center border-b border-amber-500/20 pb-2 mb-4">
                            <h3 className="text-sm font-bold text-amber-400 uppercase tracking-widest">
                                📷 SCAN OFFLINE QR CODE
                            </h3>
                            <button
                                onClick={() => setShowQrScanner(false)}
                                className="text-zinc-500 hover:text-amber-400 text-xs font-bold uppercase transition"
                            >
                                CLOSE [X]
                            </button>
                        </div>
                        <p className="text-[10px] text-zinc-500 uppercase leading-relaxed tracking-wider mb-4 font-sans text-center">
                            Scan the printed QR Code card placed at the physical node station. Scanning will automatically register your check-in, bypassing GPS coordinate locks.
                        </p>
                        <div className="bg-black border border-amber-500/20 rounded-lg overflow-hidden p-2">
                            <div id="qr-reader" className="w-full"></div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
