"use client";

import { useEffect, useRef, useCallback } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { LatLng, RouteData } from "@/types";

// Fix Leaflet default icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

interface MapViewProps {
    startLocation: LatLng | null;
    endLocation: LatLng | null;
    onMapClick: (latlng: LatLng) => void;
    onRouteFound: (data: RouteData) => void;
    isLoading: boolean;
    setIsLoading: (loading: boolean) => void;
}

// Custom marker icons
const createIcon = (color: string) =>
    L.divIcon({
        className: "custom-marker",
        html: `
      <div style="
        width: 24px;
        height: 24px;
        background: ${color};
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 0 15px ${color}, 0 4px 10px rgba(0,0,0,0.3);
      "></div>
    `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
    });

const startIcon = createIcon("#00ff88");
const endIcon = createIcon("#ff4444");

export default function MapView({
    startLocation,
    endLocation,
    onMapClick,
    onRouteFound,
    isLoading,
    setIsLoading,
}: MapViewProps) {
    const mapRef = useRef<L.Map | null>(null);
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const startMarkerRef = useRef<L.Marker | null>(null);
    const endMarkerRef = useRef<L.Marker | null>(null);
    const routeLineRef = useRef<L.Polyline | null>(null);

    const onMapClickRef = useRef(onMapClick);

    useEffect(() => {
        onMapClickRef.current = onMapClick;
    }, [onMapClick]);

    // Initialize map
    useEffect(() => {
        if (!mapContainerRef.current || mapRef.current) return;

        const map = L.map(mapContainerRef.current, {
            zoomControl: true,
            attributionControl: false,
        }).setView([20, 0], 2);

        // Dark tile layer - CartoDB Dark Matter
        L.tileLayer(
            "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
            {
                maxZoom: 19,
            }
        ).addTo(map);

        map.on("click", (e: L.LeafletMouseEvent) => {
            onMapClickRef.current({ lat: e.latlng.lat, lng: e.latlng.lng });
        });

        mapRef.current = map;

        return () => {
            map.remove();
            mapRef.current = null;
        };
    }, []);

    // Update start marker
    useEffect(() => {
        const map = mapRef.current;
        if (!map) return;

        if (startMarkerRef.current) {
            map.removeLayer(startMarkerRef.current);
            startMarkerRef.current = null;
        }

        if (startLocation) {
            const marker = L.marker([startLocation.lat, startLocation.lng], {
                icon: startIcon,
            })
                .addTo(map)
                .bindPopup(
                    `<div style="color: #0a0a0f; font-weight: bold;">Start Location</div>`
                );
            startMarkerRef.current = marker;
            map.flyTo([startLocation.lat, startLocation.lng], 14, { duration: 1 });
        }
    }, [startLocation]);

    // Update end marker
    useEffect(() => {
        const map = mapRef.current;
        if (!map) return;

        if (endMarkerRef.current) {
            map.removeLayer(endMarkerRef.current);
            endMarkerRef.current = null;
        }

        if (endLocation) {
            const marker = L.marker([endLocation.lat, endLocation.lng], {
                icon: endIcon,
            })
                .addTo(map)
                .bindPopup(
                    `<div style="color: #0a0a0f; font-weight: bold;">Destination</div>`
                );
            endMarkerRef.current = marker;
        }
    }, [endLocation]);

    // Calculate route when loading is triggered
    useEffect(() => {
        const map = mapRef.current;
        if (!map || !isLoading || !startLocation || !endLocation) return;

        // Clear existing route
        if (routeLineRef.current) {
            map.removeLayer(routeLineRef.current);
            routeLineRef.current = null;
        }

        // Use OSRM for routing
        const fetchRoute = async () => {
            try {
                const url = `https://router.project-osrm.org/route/v1/driving/${startLocation.lng},${startLocation.lat};${endLocation.lng},${endLocation.lat}?overview=full&geometries=geojson&steps=true`;
                const response = await fetch(url);
                const data = await response.json();

                if (data.routes && data.routes.length > 0) {
                    const route = data.routes[0];
                    const coordinates: LatLng[] = route.geometry.coordinates.map(
                        (coord: [number, number]) => ({
                            lat: coord[1],
                            lng: coord[0],
                        })
                    );

                    // Draw route with gradient effect
                    const latlngs = coordinates.map((c) => [c.lat, c.lng] as [number, number]);
                    const routeLine = L.polyline(latlngs, {
                        color: "#00d4ff",
                        weight: 5,
                        opacity: 0.8,
                        lineCap: "round",
                        lineJoin: "round",
                    }).addTo(map);

                    routeLineRef.current = routeLine;

                    // Fit bounds to show entire route
                    map.fitBounds(routeLine.getBounds(), { padding: [50, 50] });

                    // Parse instructions
                    const instructions = route.legs[0].steps.map((step: any) => ({
                        text: step.maneuver.instruction || step.name,
                        distance: step.distance,
                        time: step.duration,
                    }));

                    onRouteFound({
                        distance: route.distance,
                        duration: route.duration,
                        coordinates,
                        instructions,
                    });
                }
            } catch (error) {
                console.error("Error fetching route:", error);
                setIsLoading(false);
            }
        };

        fetchRoute();
    }, [isLoading, startLocation, endLocation, onRouteFound, setIsLoading]);

    // Clear route when locations are reset
    useEffect(() => {
        const map = mapRef.current;
        if (!map) return;

        if (!startLocation && !endLocation && routeLineRef.current) {
            map.removeLayer(routeLineRef.current);
            routeLineRef.current = null;
            map.setView([20, 0], 2);
        }
    }, [startLocation, endLocation]);

    return (
        <div
            ref={mapContainerRef}
            className="absolute inset-0 w-full h-full z-0"
        />
    );
}
