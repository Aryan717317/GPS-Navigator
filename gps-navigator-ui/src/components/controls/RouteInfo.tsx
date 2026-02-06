"use client";

import { motion } from "framer-motion";
import { Clock, Route, ChevronDown, ChevronUp, Navigation2, TrendingUp } from "lucide-react";
import { useState } from "react";
import type { RouteInstruction } from "@/types";

interface RouteInfoProps {
    distance: number;
    duration: number;
    instructions: RouteInstruction[];
}

function formatDistance(meters: number): string {
    if (meters >= 1000) {
        return `${(meters / 1000).toFixed(1)} km`;
    }
    return `${Math.round(meters)} m`;
}

function formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
        return `${hours}h ${minutes}m`;
    }
    return `${minutes} min`;
}

export default function RouteInfo({
    distance,
    duration,
    instructions,
}: RouteInfoProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <motion.div
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 100, opacity: 0 }}
            transition={{ type: "spring", stiffness: 100 }}
            className="absolute top-20 right-4 z-[1000] w-80"
        >
            <div className="glass-card overflow-hidden relative">
                {/* Gradient accent line */}
                <div
                    className="absolute top-0 left-0 right-0 h-1"
                    style={{ background: "linear-gradient(90deg, #00e5ff 0%, #7c4dff 100%)" }}
                />

                {/* Main Stats */}
                <div className="p-5 pt-6">
                    <div className="flex items-stretch gap-4">
                        {/* Distance */}
                        <motion.div
                            className="flex-1 bg-gradient-to-br from-[#1e1e2e] to-[#252540] rounded-2xl p-4 border border-[var(--card-border)]"
                            whileHover={{ scale: 1.02 }}
                        >
                            <div className="flex items-center gap-2 text-[var(--muted-foreground)] text-xs mb-2">
                                <Route className="w-4 h-4 text-[var(--primary)]" />
                                Distance
                            </div>
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="text-2xl font-bold"
                                style={{
                                    background: "linear-gradient(135deg, #00e5ff, #7c4dff)",
                                    WebkitBackgroundClip: "text",
                                    WebkitTextFillColor: "transparent"
                                }}
                            >
                                {formatDistance(distance)}
                            </motion.div>
                        </motion.div>

                        {/* Duration */}
                        <motion.div
                            className="flex-1 bg-gradient-to-br from-[#1e1e2e] to-[#252540] rounded-2xl p-4 border border-[var(--card-border)]"
                            whileHover={{ scale: 1.02 }}
                        >
                            <div className="flex items-center gap-2 text-[var(--muted-foreground)] text-xs mb-2">
                                <Clock className="w-4 h-4 text-[var(--accent)]" />
                                Duration
                            </div>
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.1 }}
                                className="text-2xl font-bold"
                                style={{
                                    background: "linear-gradient(135deg, #00e676, #00e5ff)",
                                    WebkitBackgroundClip: "text",
                                    WebkitTextFillColor: "transparent"
                                }}
                            >
                                {formatDuration(duration)}
                            </motion.div>
                        </motion.div>
                    </div>

                    {/* Traffic Status */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="mt-4 flex items-center gap-3 bg-[var(--muted)] rounded-xl px-4 py-3"
                    >
                        <div className="w-3 h-3 rounded-full bg-[var(--accent)] animate-pulse shadow-lg shadow-[#00e67640]" />
                        <div className="flex-1">
                            <span className="text-sm text-[var(--foreground)]">
                                Traffic is light
                            </span>
                            <span className="text-xs text-[var(--muted-foreground)] ml-2">
                                • Best time to travel
                            </span>
                        </div>
                        <TrendingUp className="w-4 h-4 text-[var(--accent)]" />
                    </motion.div>
                </div>

                {/* Directions Toggle */}
                {instructions.length > 0 && (
                    <>
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="w-full flex items-center justify-between px-5 py-4 bg-[var(--muted)] hover:bg-[var(--muted)]/80 transition-all duration-300 border-t border-[var(--card-border)] group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#7c4dff] to-[#536dfe] flex items-center justify-center">
                                    <Navigation2 className="w-4 h-4 text-white" />
                                </div>
                                <span className="text-sm font-medium">
                                    {instructions.length} Directions
                                </span>
                            </div>
                            <motion.div
                                animate={{ rotate: isExpanded ? 180 : 0 }}
                                transition={{ duration: 0.2 }}
                                className="w-8 h-8 rounded-full bg-[var(--background)] flex items-center justify-center group-hover:bg-[var(--primary)] group-hover:text-[var(--background)] transition-colors"
                            >
                                <ChevronDown className="w-4 h-4" />
                            </motion.div>
                        </button>

                        {/* Expandable Directions List */}
                        <motion.div
                            initial={false}
                            animate={{
                                height: isExpanded ? "auto" : 0,
                                opacity: isExpanded ? 1 : 0,
                            }}
                            className="overflow-hidden"
                        >
                            <div className="max-h-56 overflow-y-auto p-4 space-y-3">
                                {instructions.slice(0, 10).map((instruction, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="flex items-start gap-3 text-sm group"
                                    >
                                        <div
                                            className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 transition-all"
                                            style={{
                                                background: index === 0
                                                    ? "linear-gradient(135deg, #00e676, #00b85d)"
                                                    : index === instructions.length - 1
                                                        ? "linear-gradient(135deg, #ff5252, #d32f2f)"
                                                        : "var(--muted)",
                                                color: index === 0 || index === instructions.length - 1 ? "white" : "inherit"
                                            }}
                                        >
                                            {index + 1}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors">
                                                {instruction.text}
                                            </p>
                                            <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                                                {formatDistance(instruction.distance)}
                                            </p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    </>
                )}
            </div>
        </motion.div>
    );
}
