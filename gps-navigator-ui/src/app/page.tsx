"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import ControlPanel from "@/components/controls/ControlPanel";
import RouteInfo from "@/components/controls/RouteInfo";
import type { LatLng, RouteData } from "@/types";

// Dynamic import for Leaflet (client-side only)
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

export default function Home() {
  const [startLocation, setStartLocation] = useState<LatLng | null>(null);
  const [endLocation, setEndLocation] = useState<LatLng | null>(null);
  const [routeData, setRouteData] = useState<RouteData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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
      {/* Full-screen Map */}
      <MapView
        startLocation={startLocation}
        endLocation={endLocation}
        onMapClick={handleMapClick}
        onRouteFound={handleRouteFound}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
      />

      {/* Top Bar - Logo/Title */}
      <motion.header
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="absolute top-0 left-0 right-0 z-[1000] p-4"
      >
        <div className="glass-card px-6 py-3 inline-flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-[var(--primary)] animate-pulse-glow" />
          <h1 className="text-xl font-bold tracking-tight text-[var(--foreground)]">
            GPS Navigator
          </h1>
        </div>
      </motion.header>

      {/* Route Info Panel - Shows when route is calculated */}
      <AnimatePresence>
        {routeData && (
          <RouteInfo
            distance={routeData.distance}
            duration={routeData.duration}
            instructions={routeData.instructions}
          />
        )}
      </AnimatePresence>

      {/* Bottom Control Panel */}
      <ControlPanel
        startLocation={startLocation}
        endLocation={endLocation}
        onReset={handleReset}
        onSwap={handleSwapLocations}
        onFindRoute={() => setIsLoading(true)}
        isLoading={isLoading}
        hasRoute={!!routeData}
      />
    </main>
  );
}
