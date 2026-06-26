"use client";

import { MapPin } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { Coordinates } from "@/lib/types";

type LeafletModule = typeof import("leaflet");
type LeafletMap = import("leaflet").Map;
type LeafletMarker = import("leaflet").Marker;
type LeafletLayerGroup = import("leaflet").LayerGroup;

type NearbyMarker = {
  id: string;
  position: Coordinates;
  label: string;
  rating?: number;
};

export function MapPicker({
  value,
  onChange,
  label = "Pick location",
  nearbyMarkers = []
}: {
  value: Coordinates;
  onChange: (coordinates: Coordinates) => void;
  label?: string;
  nearbyMarkers?: NearbyMarker[];
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markerRef = useRef<LeafletMarker | null>(null);
  const nearbyLayerRef = useRef<LeafletLayerGroup | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function boot() {
      const L: LeafletModule = await import("leaflet");
      if (cancelled || !containerRef.current || mapRef.current) return;

      const icon = L.icon({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        iconAnchor: [12, 41]
      });

      const map = L.map(containerRef.current).setView([value.lat, value.lng], 12);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors"
      }).addTo(map);

      const marker = L.marker([value.lat, value.lng], { draggable: true, icon }).addTo(map);
      const nearbyLayer = L.layerGroup().addTo(map);
      marker.on("dragend", () => {
        const point = marker.getLatLng();
        onChange({ lat: round(point.lat), lng: round(point.lng) });
      });
      map.on("click", (event) => {
        marker.setLatLng(event.latlng);
        onChange({ lat: round(event.latlng.lat), lng: round(event.latlng.lng) });
      });

      mapRef.current = map;
      markerRef.current = marker;
      nearbyLayerRef.current = nearbyLayer;
      setReady(true);
    }

    boot();
    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
      markerRef.current = null;
      nearbyLayerRef.current = null;
    };
  }, []);

  useEffect(() => {
    markerRef.current?.setLatLng([value.lat, value.lng]);
    mapRef.current?.setView([value.lat, value.lng], mapRef.current.getZoom());
  }, [value.lat, value.lng]);

  useEffect(() => {
    let cancelled = false;

    async function renderNearbyMarkers() {
      if (!mapRef.current || !nearbyLayerRef.current) return;
      const L: LeafletModule = await import("leaflet");
      if (cancelled || !nearbyLayerRef.current) return;

      nearbyLayerRef.current.clearLayers();
      nearbyMarkers.forEach((marker) => {
        const icon = L.divIcon({
          className: "",
          html: `<div style="display:grid;place-items:center;width:42px;height:42px;border-radius:999px;background:#0f766e;color:white;font-weight:800;border:3px solid white;box-shadow:0 8px 18px rgba(15,23,42,.2);">${marker.rating ? marker.rating.toFixed(1) : ""}</div>`,
          iconAnchor: [21, 21]
        });
        L.marker([marker.position.lat, marker.position.lng], { icon })
          .bindPopup(marker.label)
          .addTo(nearbyLayerRef.current!);
      });
    }

    renderNearbyMarkers();
    return () => {
      cancelled = true;
    };
  }, [nearbyMarkers]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <label className="flex items-center gap-2 text-sm font-semibold text-slate-800">
          <MapPin size={16} />
          {label}
        </label>
        <span className="text-xs text-slate-500">
          {value.lat.toFixed(4)}, {value.lng.toFixed(4)}
        </span>
      </div>
      <div className="h-72 overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
        <div ref={containerRef} className="h-full w-full" />
        {!ready && <div className="grid h-full place-items-center text-sm text-slate-500">Loading map...</div>}
      </div>
    </div>
  );
}

function round(value: number) {
  return Math.round(value * 1000000) / 1000000;
}
