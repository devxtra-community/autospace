"use client";

import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";

interface Garage {
  id: string;
  latitude: number;
  longitude: number;
  standard_slot_price?: number;
}

export default function SearchMap({
  garages,
  userLat,
  userLng,
}: {
  garages: Garage[];
  userLat: number;
  userLng: number;
}) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<maplibregl.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // Create map
    mapInstance.current = new maplibregl.Map({
      container: mapRef.current,
      style: "https://tiles.openfreemap.org/styles/liberty",
      center: [userLng, userLat],
      zoom: 13,
    });

    const map = mapInstance.current;

    // USER LOCATION (Blue)
    new maplibregl.Marker({ color: "blue" })
      .setLngLat([userLng, userLat])
      .addTo(map);

    // GARAGE MARKERS (Red)
    garages.forEach((g) => {
      if (!g.latitude || !g.longitude) return;

      const popup = new maplibregl.Popup({ offset: 25 }).setHTML(`
        <div style="font-weight:bold">Garage</div>
        <div>$${g.standard_slot_price ?? 0} / hour</div>
      `);

      new maplibregl.Marker({ color: "red" })
        .setLngLat([g.longitude, g.latitude])
        .setPopup(popup)
        .addTo(map);
    });

    return () => map.remove();
  }, [garages, userLat, userLng]);

  return <div ref={mapRef} className="w-full h-full" />;
}
