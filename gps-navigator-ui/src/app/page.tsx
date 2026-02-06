"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { Map, GitBranch } from "lucide-react";
import ControlPanel from "@/components/controls/ControlPanel";
import RouteInfo from "@/components/controls/RouteInfo";
import type { LatLng, RouteData } from "@/types";

// Dynamic imports for client-side only components
const MapView = dynamic(() => import("@/components/map/MapView"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-[var(--background)]">
      <motion.div
        className="w-16 h-16 border-4 border-[var(--primary)] border-t-transparent rounded-full"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
    </div>
  ),
});

const GraphView = dynamic(() => import("@/components/graph/GraphView"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-[var(--background)]">
      <motion.div
        className="w-16 h-16 border-4 border-[var(--secondary)] border-t-transparent rounded-full"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
    </div>
  ),
});

export default function Home() {
  const [startLocation, setStartLocation] = useState<LatLng | null>(null);
  const [endLocation, setEndLocation] = useState<LatLng | null>(null);
  const [routeData, setRouteData] = useState<RouteData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<"map" | "graph">("map");

  const handleMapClick = (latlng: LatLng) => {
    if (!startLocation) {
      setStartLocation(latlng);
    } else if (!endLocation) {
      setEndLocation(latlng);
    }
  };

  const handleReset = () => {
    setStartLocation(null);
    setEndLocation(null);
    setRouteData(null);
    setViewMode("map");
  };

  const handleSwapLocations = () => {
    const temp = startLocation;
    setStartLocation(endLocation);
    setEndLocation(temp);
    setRouteData(null);
  };

  const handleRouteFound = (data: RouteData) => {
    setRouteData(data);
    setIsLoading(false);
  };

  return (
    <main className="relative w-screen h-screen overflow-hidden">
      {/* Map View */}
      <AnimatePresence mode="wait">
        {viewMode === "map" && (
          <motion.div
            key="map"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0"
          >
            <MapView
              startLocation={startLocation}
              endLocation={endLocation}
              onMapClick={handleMapClick}
              onRouteFound={handleRouteFound}
              isLoading={isLoading}
              setIsLoading={setIsLoading}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Graph View */}
      <AnimatePresence>
        {viewMode === "graph" && routeData && startLocation && endLocation && (
          <motion.div
            key="graph"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute inset-0"
          >
            <GraphView
              routeData={routeData}
              startLocation={startLocation}
              endLocation={endLocation}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Bar - Logo/Title + View Toggle */}
      <motion.header
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="absolute top-0 left-0 right-0 z-[1000] p-4 flex items-center justify-between"
      >
        <div className="glass-card px-6 py-3 inline-flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-[var(--primary)] animate-pulse-glow" />
          <h1 className="text-xl font-bold tracking-tight text-[var(--foreground)]">
            GPS Navigator
          </h1>
        </div>

        {/* View Toggle Button */}
        {routeData && (
          <motion.div
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="glass-card p-1 flex items-center gap-1"
          >
            <button
              onClick={() => setViewMode("map")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all duration-300 ${viewMode === "map"
                  ? "bg-[var(--primary)] text-[var(--background)]"
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                }`}
            >
              <Map className="w-4 h-4" />
              Map
            </button>
            <button
              onClick={() => setViewMode("graph")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all duration-300 ${viewMode === "graph"
                  ? "bg-[var(--secondary)] text-white"
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                }`}
            >
              <GitBranch className="w-4 h-4" />
              Graph
            </button>
          </motion.div>
        )}
      </motion.header>

      {/* Route Info Panel - Shows when route is calculated (only in map view) */}
      <AnimatePresence>
        {routeData && viewMode === "map" && (
          <RouteInfo
            distance={routeData.distance}
            duration={routeData.duration}
            instructions={routeData.instructions}
          />
        )}
      </AnimatePresence>

      {/* Bottom Control Panel (only in map view) */}
      {viewMode === "map" && (
        <ControlPanel
          startLocation={startLocation}
          endLocation={endLocation}
          onReset={handleReset}
          onSwap={handleSwapLocations}
          onFindRoute={() => setIsLoading(true)}
          isLoading={isLoading}
          hasRoute={!!routeData}
        />
      )}

      {/* Back to Map button in Graph View */}
      {viewMode === "graph" && (
        <motion.button
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          onClick={() => setViewMode("map")}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[1000] glass-card px-6 py-3 flex items-center gap-2 font-medium hover:bg-[var(--primary)] hover:text-[var(--background)] transition-all duration-300"
        >
          <Map className="w-4 h-4" />
          Back to Map
        </motion.button>
      )}
    </main>
  );
}
