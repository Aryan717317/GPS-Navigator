"use client";

import { motion } from "framer-motion";
import { Navigation, RotateCcw, ArrowRightLeft, Loader2, MapPin, Flag } from "lucide-react";
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
            <div className="glass-card p-5 max-w-xl mx-auto relative overflow-hidden">
                {/* Gradient accent line at top */}
                <div
                    className="absolute top-0 left-0 right-0 h-1"
                    style={{ background: "linear-gradient(90deg, #00e676 0%, #00e5ff 50%, #7c4dff 100%)" }}
                />

                {/* Location Inputs */}
                <div className="space-y-3 mb-5">
                    {/* Start Location */}
                    <motion.div
                        className="flex items-center gap-3"
                        whileHover={{ x: 4 }}
                        transition={{ type: "spring", stiffness: 300 }}
                    >
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00e676] to-[#00b85d] flex items-center justify-center shadow-lg shadow-[#00e67640]">
                            <MapPin className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 bg-[var(--muted)] rounded-xl px-4 py-3 border border-[var(--card-border)] hover:border-[#00e67660] transition-colors">
                            {startLocation ? (
                                <div>
                                    <span className="text-xs text-[var(--muted-foreground)] block">Start</span>
                                    <span className="text-[var(--foreground)] font-medium">
                                        {startLocation.lat.toFixed(4)}, {startLocation.lng.toFixed(4)}
                                    </span>
                                </div>
                            ) : (
                                <span className="text-[var(--muted-foreground)]">
                                    Click map to set start
                                </span>
                            )}
                        </div>
                    </motion.div>

                    {/* Swap Button */}
                    <div className="flex justify-center relative">
                        <div className="absolute left-12 right-12 top-1/2 h-px bg-gradient-to-r from-transparent via-[var(--card-border)] to-transparent" />
                        <motion.button
                            whileHover={{ scale: 1.1, rotate: 180 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={onSwap}
                            disabled={!canSwap}
                            className={cn(
                                "p-3 rounded-full transition-all duration-300 z-10 border-2",
                                canSwap
                                    ? "bg-[var(--muted)] border-[var(--primary)] hover:bg-[var(--primary)] hover:text-[var(--background)] text-[var(--primary)]"
                                    : "opacity-30 cursor-not-allowed border-transparent bg-[var(--muted)]"
                            )}
                        >
                            <ArrowRightLeft className="w-4 h-4 rotate-90" />
                        </motion.button>
                    </div>

                    {/* End Location */}
                    <motion.div
                        className="flex items-center gap-3"
                        whileHover={{ x: 4 }}
                        transition={{ type: "spring", stiffness: 300 }}
                    >
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#ff5252] to-[#d32f2f] flex items-center justify-center shadow-lg shadow-[#ff525240]">
                            <Flag className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 bg-[var(--muted)] rounded-xl px-4 py-3 border border-[var(--card-border)] hover:border-[#ff525260] transition-colors">
                            {endLocation ? (
                                <div>
                                    <span className="text-xs text-[var(--muted-foreground)] block">Destination</span>
                                    <span className="text-[var(--foreground)] font-medium">
                                        {endLocation.lat.toFixed(4)}, {endLocation.lng.toFixed(4)}
                                    </span>
                                </div>
                            ) : (
                                <span className="text-[var(--muted-foreground)]">
                                    Click map to set destination
                                </span>
                            )}
                        </div>
                    </motion.div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={onReset}
                        className="flex-1 flex items-center justify-center gap-2 bg-[var(--muted)] hover:bg-[var(--destructive)] text-[var(--foreground)] py-3.5 px-4 rounded-xl font-medium transition-all duration-300 border border-transparent hover:border-[var(--destructive)]"
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
                            "flex-[2] flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-semibold transition-all duration-300",
                            canFindRoute
                                ? "text-[#0f0f1a] hover:brightness-110"
                                : "bg-[var(--muted)] text-[var(--muted-foreground)] cursor-not-allowed"
                        )}
                        style={canFindRoute ? {
                            background: "linear-gradient(135deg, #00e5ff 0%, #7c4dff 100%)",
                            boxShadow: "0 4px 20px rgba(0, 229, 255, 0.4)"
                        } : {}}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Calculating...
                            </>
                        ) : (
                            <>
                                <Navigation className="w-5 h-5" />
                                {hasRoute ? "Recalculate" : "Find Route"}
                            </>
                        )}
                    </motion.button>
                </div>

                {/* Hint text */}
                {!startLocation && (
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center text-sm text-[var(--muted-foreground)] mt-4 flex items-center justify-center gap-2"
                    >
                        <span className="w-2 h-2 rounded-full bg-[var(--primary)] animate-pulse" />
                        Tap anywhere on the map to begin
                    </motion.p>
                )}
            </div>
        </motion.div>
    );
}
