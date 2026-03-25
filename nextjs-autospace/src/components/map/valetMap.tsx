"use client";

import Map, {
  Marker,
  Source,
  Layer,
  MapLayerMouseEvent,
  MapRef,
} from "react-map-gl/maplibre";
import { useEffect, useMemo, useRef, useState } from "react";
import { calculateDistanceKm } from "@/utils/geo.utils";
import { toast } from "sonner";
import {
  searchPhoton,
  PhotonFeature,
  reversePhoton,
} from "@/services/photon.service";
import type { Feature, Polygon } from "geojson";

interface Props {
  garageLocation: {
    latitude: number;
    longitude: number;
    name: string;
    valetRadius: number; // km
  };
  onLocationSelect: (data: {
    latitude: number;
    longitude: number;
    address: string;
  }) => void;
}

export default function ValetMap({ garageLocation, onLocationSelect }: Props) {
  const mapRef = useRef<MapRef>(null);

  const [selected, setSelected] = useState<{
    latitude: number;
    longitude: number;
    address: string;
  } | null>(null);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PhotonFeature[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(async () => {
      if (query.length < 3) {
        setResults([]);
        return;
      }

      try {
        setLoading(true);
        const data = await searchPhoton(query);
        setResults(data);
      } catch (err) {
        console.error("Photon search failed", err);
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(timeout);
  }, [query]);

  /**
   * Create radius circle polygon
   */
  const circleGeoJSON: Feature<Polygon> = useMemo(() => {
    const points = 64;

    const coords: number[][] = [];

    const lat = garageLocation.latitude;
    const lng = garageLocation.longitude;
    const radiusKm = garageLocation.valetRadius;

    const earthRadius = 6371;

    for (let i = 0; i <= points; i++) {
      const angle = (i * 2 * Math.PI) / points;

      const dx = radiusKm * Math.cos(angle);
      const dy = radiusKm * Math.sin(angle);

      const newLat = lat + (dy / earthRadius) * (180 / Math.PI);
      const newLng =
        lng +
        ((dx / earthRadius) * (180 / Math.PI)) /
          Math.cos((lat * Math.PI) / 180);

      coords.push([newLng, newLat]);
    }

    return {
      type: "Feature",
      properties: {},
      geometry: {
        type: "Polygon",
        coordinates: [coords],
      },
    };
  }, [garageLocation]);

  /**
   * Click handler
   */
  const handleMapClick = async (e: MapLayerMouseEvent) => {
    const lat = e.lngLat.lat;
    const lng = e.lngLat.lng;

    const distance = calculateDistanceKm(
      garageLocation.latitude,
      garageLocation.longitude,
      lat,
      lng,
    );

    if (distance > garageLocation.valetRadius) {
      toast.error("Outside valet service radius of this gaarage provide");
      return;
    }

    let address = "Custom pickup Location";

    try {
      const reverse = await reversePhoton(lat, lng);
      if (reverse) address = reverse;
    } catch {
      console.error("Reverse geocoding failed");
    }

    const point = { latitude: lat, longitude: lng, address };

    setSelected(point);
    onLocationSelect(point);
  };

  const handleSelectPlace = (feature: PhotonFeature) => {
    const lon = feature.geometry.coordinates[0];
    const lat = feature.geometry.coordinates[1];

    const distance = calculateDistanceKm(
      garageLocation.latitude,
      garageLocation.longitude,
      lat,
      lon,
    );

    if (distance > garageLocation.valetRadius) {
      toast.error(
        `Location outside valet radius (${garageLocation.valetRadius} km)`,
      );
      return;
    }

    const label = [
      feature.properties.name,
      feature.properties.city,
      feature.properties.state,
      feature.properties.country,
    ]
      .filter(Boolean)
      .join(", ");

    mapRef.current?.flyTo({
      center: [lon, lat],
      zoom: 15,
      duration: 1000,
    });

    const point = { latitude: lat, longitude: lon, address: label };

    setSelected(point);
    onLocationSelect(point);

    setQuery(label);
    setResults([]);
  };

  return (
    <div className=" relative w-full h-full rounded-sm overflow-hidden ">
      <div className="absolute top-3 left-3 right-3 z-10">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search pickup location..."
          className="w-full bg-white p-2 rounded shadow text-sm"
        />

        {loading && (
          <div className="bg-white shadow p-2 text-xs">Searching...</div>
        )}

        {results.length > 0 && (
          <div className="bg-white shadow rounded mt-1 max-h-48 overflow-auto">
            {results.map((r, i) => {
              const label = [
                r.properties.name,
                r.properties.city,
                r.properties.state,
                r.properties.country,
              ]
                .filter(Boolean)
                .join(", ");

              return (
                <button
                  key={i}
                  onClick={() => handleSelectPlace(r)}
                  className="block w-full text-left px-3 py-2 hover:bg-gray-100 text-sm"
                >
                  {label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <Map
        ref={mapRef}
        initialViewState={{
          latitude: garageLocation.latitude,
          longitude: garageLocation.longitude,
          zoom: Math.max(11, 14 - Math.log2(garageLocation.valetRadius)),
        }}
        mapStyle="https://tiles.openfreemap.org/styles/bright"
        style={{ width: "100%", height: "100%" }}
        onClick={handleMapClick}
        reuseMaps
        attributionControl={false}
      >
        {/* Garage Marker */}
        <Marker
          latitude={garageLocation.latitude}
          longitude={garageLocation.longitude}
          anchor="bottom"
        >
          <div className="flex flex-col items-center">
            {/* Red location icon */}
            <svg width="34" height="34" viewBox="0 0 24 24" fill="#ef4444">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
              <circle cx="12" cy="9" r="3" fill="white" />
            </svg>

            <span className="text-[10px] font-bold text-red-600">Garage</span>
          </div>
        </Marker>

        {/* Selected Pickup */}
        {selected && (
          <Marker
            latitude={selected.latitude}
            longitude={selected.longitude}
            anchor="bottom"
          >
            <div className="flex flex-col items-center">
              <svg width="34" height="34" viewBox="0 0 24 24" fill="#22c55e">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                <circle cx="12" cy="9" r="3" fill="white" />
              </svg>

              <span className="text-[10px] font-bold text-green-600">
                Pickup
              </span>
            </div>
          </Marker>
        )}
        {/* Radius Circle */}
        <Source id="radius" type="geojson" data={circleGeoJSON}>
          <Layer
            id="radius-fill"
            type="fill"
            paint={{
              "fill-color": "#6366f1",
              "fill-opacity": 0.15,
            }}
          />
          <Layer
            id="radius-outline"
            type="line"
            paint={{
              "line-color": "#4f46e5",
              "line-width": 2,
            }}
          />
        </Source>
      </Map>
    </div>
  );
}
