"use client";

import { motion } from "framer-motion";
import { Clock, Route, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import type { RouteInstruction } from "@/types";
import { cn } from "@/lib/utils";

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
            className="absolute top-20 right-4 z-[1000] w-72"
        >
            <div className="glass-card overflow-hidden">
                {/* Main Stats */}
                <div className="p-4">
                    <div className="flex items-center gap-4">
                        {/* Distance */}
                        <div className="flex-1">
                            <div className="flex items-center gap-2 text-[var(--muted-foreground)] text-xs mb-1">
                                <Route className="w-3 h-3" />
                                Distance
                            </div>
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="text-2xl font-bold text-[var(--primary)]"
                            >
                                {formatDistance(distance)}
                            </motion.div>
                        </div>

                        {/* Divider */}
                        <div className="w-px h-12 bg-[var(--card-border)]" />

                        {/* Duration */}
                        <div className="flex-1">
                            <div className="flex items-center gap-2 text-[var(--muted-foreground)] text-xs mb-1">
                                <Clock className="w-3 h-3" />
                                Duration
                            </div>
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.1 }}
                                className="text-2xl font-bold text-[var(--accent)]"
                            >
                                {formatDuration(duration)}
                            </motion.div>
                        </div>
                    </div>

                    {/* Traffic Status (Simulated) */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="mt-4 flex items-center gap-2 text-sm"
                    >
                        <div className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse" />
                        <span className="text-[var(--muted-foreground)]">
                            Traffic is light
                        </span>
                    </motion.div>
                </div>

                {/* Directions Toggle */}
                {instructions.length > 0 && (
                    <>
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="w-full flex items-center justify-between px-4 py-3 bg-[var(--muted)] hover:bg-[var(--muted)]/80 transition-colors border-t border-[var(--card-border)]"
                        >
                            <span className="text-sm font-medium">
                                {instructions.length} Directions
                            </span>
                            {isExpanded ? (
                                <ChevronUp className="w-4 h-4" />
                            ) : (
                                <ChevronDown className="w-4 h-4" />
                            )}
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
                            <div className="max-h-48 overflow-y-auto p-3 space-y-2">
                                {instructions.slice(0, 10).map((instruction, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="flex items-start gap-3 text-sm"
                                    >
                                        <div className="w-6 h-6 rounded-full bg-[var(--muted)] flex items-center justify-center text-xs font-bold shrink-0">
                                            {index + 1}
                                        </div>
                                        <div>
                                            <p className="text-[var(--foreground)]">
                                                {instruction.text}
                                            </p>
                                            <p className="text-xs text-[var(--muted-foreground)]">
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
