"use client";

import { motion } from "framer-motion";
import { Navigation, RotateCcw, ArrowRightLeft, Loader2 } from "lucide-react";
import type { LatLng } from "@/types";
import { cn } from "@/lib/utils";

interface ControlPanelProps {
    startLocation: LatLng | null;
    endLocation: LatLng | null;
    onReset: () => void;
    onSwap: () => void;
    onFindRoute: () => void;
    isLoading: boolean;
    hasRoute: boolean;
}

export default function ControlPanel({
    startLocation,
    endLocation,
    onReset,
    onSwap,
    onFindRoute,
    isLoading,
    hasRoute,
}: ControlPanelProps) {
    const canFindRoute = startLocation && endLocation && !isLoading;
    const canSwap = startLocation && endLocation;

    return (
        <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
            className="absolute bottom-0 left-0 right-0 z-[1000] p-4"
        >
            <div className="glass-card p-5 max-w-xl mx-auto">
                {/* Location Inputs */}
                <div className="space-y-3 mb-4">
                    {/* Start Location */}
                    <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-full bg-[#00ff88] shadow-[0_0_10px_#00ff88]" />
                        <div className="flex-1 bg-[var(--muted)] rounded-lg px-4 py-3 text-sm">
                            {startLocation ? (
                                <span className="text-[var(--foreground)]">
                                    {startLocation.lat.toFixed(4)}, {startLocation.lng.toFixed(4)}
                                </span>
                            ) : (
                                <span className="text-[var(--muted-foreground)]">
                                    Click map to set start location
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Swap Button */}
                    <div className="flex justify-center">
                        <button
                            onClick={onSwap}
                            disabled={!canSwap}
                            className={cn(
                                "p-2 rounded-full transition-all duration-300",
                                canSwap
                                    ? "bg-[var(--muted)] hover:bg-[var(--primary)] hover:text-[var(--background)] text-[var(--muted-foreground)]"
                                    : "opacity-30 cursor-not-allowed"
                            )}
                        >
                            <ArrowRightLeft className="w-4 h-4 rotate-90" />
                        </button>
                    </div>

                    {/* End Location */}
                    <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-full bg-[#ff4444] shadow-[0_0_10px_#ff4444]" />
                        <div className="flex-1 bg-[var(--muted)] rounded-lg px-4 py-3 text-sm">
                            {endLocation ? (
                                <span className="text-[var(--foreground)]">
                                    {endLocation.lat.toFixed(4)}, {endLocation.lng.toFixed(4)}
                                </span>
                            ) : (
                                <span className="text-[var(--muted-foreground)]">
                                    Click map to set destination
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={onReset}
                        className="flex-1 flex items-center justify-center gap-2 bg-[var(--muted)] hover:bg-[var(--destructive)] text-[var(--foreground)] py-3 px-4 rounded-xl font-medium transition-colors duration-300"
                    >
                        <RotateCcw className="w-4 h-4" />
                        Reset
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: canFindRoute ? 1.02 : 1 }}
                        whileTap={{ scale: canFindRoute ? 0.98 : 1 }}
                        onClick={onFindRoute}
                        disabled={!canFindRoute}
                        className={cn(
                            "flex-[2] flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium transition-all duration-300",
                            canFindRoute
                                ? "bg-[var(--primary)] text-[var(--background)] glow-primary hover:brightness-110"
                                : "bg-[var(--muted)] text-[var(--muted-foreground)] cursor-not-allowed"
                        )}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Calculating...
                            </>
                        ) : (
                            <>
                                <Navigation className="w-4 h-4" />
                                {hasRoute ? "Recalculate" : "Find Route"}
                            </>
                        )}
                    </motion.button>
                </div>

                {/* Hint text */}
                {!startLocation && (
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center text-xs text-[var(--muted-foreground)] mt-3"
                    >
                        Tap anywhere on the map to begin
                    </motion.p>
                )}
            </div>
        </motion.div>
    );
}
