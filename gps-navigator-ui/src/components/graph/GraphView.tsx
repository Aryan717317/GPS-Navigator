"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { Play, Pause, RotateCcw, ZoomIn, ZoomOut } from "lucide-react";
import type { LatLng, RouteData } from "@/types";

interface GraphViewProps {
    routeData: RouteData;
    startLocation: LatLng;
    endLocation: LatLng;
}

export default function GraphView({ routeData, startLocation, endLocation }: GraphViewProps) {
    const [isPlaying, setIsPlaying] = useState(true);
    const [progress, setProgress] = useState(0);
    const [zoom, setZoom] = useState(1);
    const animationRef = useRef<number | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Normalize coordinates to fit in SVG viewBox
    const coordinates = routeData.coordinates;
    const minLat = Math.min(...coordinates.map(c => c.lat));
    const maxLat = Math.max(...coordinates.map(c => c.lat));
    const minLng = Math.min(...coordinates.map(c => c.lng));
    const maxLng = Math.max(...coordinates.map(c => c.lng));

    const padding = 50;
    const width = 800;
    const height = 600;

    const scaleX = (lng: number) => padding + ((lng - minLng) / (maxLng - minLng || 1)) * (width - 2 * padding);
    const scaleY = (lat: number) => height - padding - ((lat - minLat) / (maxLat - minLat || 1)) * (height - 2 * padding);

    // Create path data
    const pathData = coordinates.map((coord, i) => {
        const x = scaleX(coord.lng);
        const y = scaleY(coord.lat);
        return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
    }).join(" ");

    // Calculate total path length for animation
    const visiblePoints = Math.floor(progress * coordinates.length);

    // Animation loop
    useEffect(() => {
        if (isPlaying && progress < 1) {
            animationRef.current = requestAnimationFrame(() => {
                setProgress(prev => Math.min(prev + 0.005, 1));
            });
        }
        return () => {
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
        };
    }, [isPlaying, progress]);

    const handleReset = () => {
        setProgress(0);
        setIsPlaying(true);
    };

    const formatDistance = (meters: number) => {
        if (meters >= 1000) return `${(meters / 1000).toFixed(1)} km`;
        return `${Math.round(meters)} m`;
    };

    const formatDuration = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        if (hours > 0) return `${hours}h ${minutes}m`;
        return `${minutes} min`;
    };

    return (
        <div ref={containerRef} className="absolute inset-0 bg-[var(--background)] z-[500] flex flex-col">
            {/* Header Stats */}
            <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="p-4 flex items-center justify-between border-b border-[var(--card-border)]"
            >
                <div className="flex items-center gap-6">
                    <div className="glass-card px-4 py-2">
                        <span className="text-xs text-[var(--muted-foreground)]">Distance</span>
                        <p className="text-lg font-bold text-[var(--primary)]">{formatDistance(routeData.distance)}</p>
                    </div>
                    <div className="glass-card px-4 py-2">
                        <span className="text-xs text-[var(--muted-foreground)]">Duration</span>
                        <p className="text-lg font-bold text-[var(--accent)]">{formatDuration(routeData.duration)}</p>
                    </div>
                    <div className="glass-card px-4 py-2">
                        <span className="text-xs text-[var(--muted-foreground)]">Waypoints</span>
                        <p className="text-lg font-bold text-[var(--secondary)]">{coordinates.length}</p>
                    </div>
                </div>

                {/* Playback Controls */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setZoom(z => Math.max(0.5, z - 0.25))}
                        className="p-2 rounded-lg bg-[var(--muted)] hover:bg-[var(--primary)] hover:text-[var(--background)] transition-colors"
                    >
                        <ZoomOut className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setZoom(z => Math.min(2, z + 0.25))}
                        className="p-2 rounded-lg bg-[var(--muted)] hover:bg-[var(--primary)] hover:text-[var(--background)] transition-colors"
                    >
                        <ZoomIn className="w-4 h-4" />
                    </button>
                    <div className="w-px h-6 bg-[var(--card-border)] mx-2" />
                    <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="p-2 rounded-lg bg-[var(--primary)] text-[var(--background)] hover:brightness-110 transition-all"
                    >
                        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </button>
                    <button
                        onClick={handleReset}
                        className="p-2 rounded-lg bg-[var(--muted)] hover:bg-[var(--destructive)] transition-colors"
                    >
                        <RotateCcw className="w-4 h-4" />
                    </button>
                </div>
            </motion.div>

            {/* SVG Graph Visualization */}
            <div className="flex-1 overflow-hidden flex items-center justify-center p-4">
                <motion.svg
                    viewBox={`0 0 ${width} ${height}`}
                    className="w-full h-full max-w-4xl"
                    style={{ transform: `scale(${zoom})` }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    {/* Background Grid */}
                    <defs>
                        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--card-border)" strokeWidth="0.5" opacity="0.3" />
                        </pattern>
                        <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#00e676" />
                            <stop offset="50%" stopColor="#00e5ff" />
                            <stop offset="100%" stopColor="#7c4dff" />
                        </linearGradient>
                        <filter id="glow">
                            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                            <feMerge>
                                <feMergeNode in="coloredBlur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>
                    <rect width={width} height={height} fill="url(#grid)" />

                    {/* Full Path (faded) */}
                    <path
                        d={pathData}
                        fill="none"
                        stroke="var(--muted)"
                        strokeWidth="2"
                        strokeDasharray="5,5"
                        opacity="0.3"
                    />

                    {/* Animated Path */}
                    <motion.path
                        d={pathData}
                        fill="none"
                        stroke="url(#pathGradient)"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        filter="url(#glow)"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: progress }}
                        transition={{ duration: 0 }}
                    />

                    {/* Waypoint Nodes (sampled) */}
                    {coordinates.filter((_, i) => i % Math.max(1, Math.floor(coordinates.length / 20)) === 0).map((coord, i, arr) => {
                        const x = scaleX(coord.lng);
                        const y = scaleY(coord.lat);
                        const nodeProgress = i / arr.length;
                        const isVisible = nodeProgress <= progress;

                        return (
                            <motion.g key={i}>
                                {isVisible && (
                                    <>
                                        <motion.circle
                                            cx={x}
                                            cy={y}
                                            r="6"
                                            fill="var(--muted)"
                                            stroke="var(--primary)"
                                            strokeWidth="2"
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ delay: nodeProgress * 2 }}
                                        />
                                        <motion.text
                                            x={x}
                                            y={y - 12}
                                            textAnchor="middle"
                                            fill="var(--muted-foreground)"
                                            fontSize="10"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: nodeProgress * 2 + 0.2 }}
                                        >
                                            {i + 1}
                                        </motion.text>
                                    </>
                                )}
                            </motion.g>
                        );
                    })}

                    {/* Start Point */}
                    <motion.g initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}>
                        <circle
                            cx={scaleX(startLocation.lng)}
                            cy={scaleY(startLocation.lat)}
                            r="14"
                            fill="#00e676"
                            filter="url(#glow)"
                        />
                        <text
                            x={scaleX(startLocation.lng)}
                            y={scaleY(startLocation.lat) + 4}
                            textAnchor="middle"
                            fill="#0f0f1a"
                            fontSize="12"
                            fontWeight="bold"
                        >
                            S
                        </text>
                        <text
                            x={scaleX(startLocation.lng)}
                            y={scaleY(startLocation.lat) - 24}
                            textAnchor="middle"
                            fill="var(--foreground)"
                            fontSize="11"
                            fontWeight="bold"
                        >
                            Start
                        </text>
                    </motion.g>

                    {/* End Point */}
                    <motion.g
                        initial={{ scale: 0 }}
                        animate={{ scale: progress > 0.9 ? 1 : 0.5 }}
                        transition={{ type: "spring" }}
                    >
                        <circle
                            cx={scaleX(endLocation.lng)}
                            cy={scaleY(endLocation.lat)}
                            r="14"
                            fill="#ff5252"
                            filter="url(#glow)"
                            opacity={progress > 0.9 ? 1 : 0.5}
                        />
                        <text
                            x={scaleX(endLocation.lng)}
                            y={scaleY(endLocation.lat) + 4}
                            textAnchor="middle"
                            fill="#0f0f1a"
                            fontSize="12"
                            fontWeight="bold"
                            opacity={progress > 0.9 ? 1 : 0.5}
                        >
                            E
                        </text>
                        <text
                            x={scaleX(endLocation.lng)}
                            y={scaleY(endLocation.lat) - 24}
                            textAnchor="middle"
                            fill="var(--foreground)"
                            fontSize="11"
                            fontWeight="bold"
                            opacity={progress > 0.9 ? 1 : 0.5}
                        >
                            End
                        </text>
                    </motion.g>

                    {/* Current Position Indicator */}
                    {progress > 0 && progress < 1 && (
                        <motion.circle
                            cx={scaleX(coordinates[Math.min(Math.floor(progress * coordinates.length), coordinates.length - 1)].lng)}
                            cy={scaleY(coordinates[Math.min(Math.floor(progress * coordinates.length), coordinates.length - 1)].lat)}
                            r="8"
                            fill="var(--primary)"
                            filter="url(#glow)"
                            animate={{ scale: [1, 1.3, 1] }}
                            transition={{ repeat: Infinity, duration: 1 }}
                        />
                    )}
                </motion.svg>
            </div>

            {/* Progress Bar */}
            <div className="p-4 border-t border-[var(--card-border)]">
                <div className="flex items-center gap-4">
                    <span className="text-xs text-[var(--muted-foreground)] w-16">
                        {Math.round(progress * 100)}%
                    </span>
                    <div className="flex-1 h-2 bg-[var(--muted)] rounded-full overflow-hidden">
                        <motion.div
                            className="h-full rounded-full"
                            style={{
                                background: "linear-gradient(90deg, #00e676, #00e5ff, #7c4dff)",
                                width: `${progress * 100}%`
                            }}
                        />
                    </div>
                    <span className="text-xs text-[var(--muted-foreground)] w-20 text-right">
                        {visiblePoints} / {coordinates.length}
                    </span>
                </div>
            </div>
        </div>
    );
}
