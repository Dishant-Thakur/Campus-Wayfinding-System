"use client";

import { useEffect, useRef, useState } from "react";
import "maplibre-gl/dist/maplibre-gl.css";

const STYLE = {
  version: 8,
  sources: {
    osm: { type: "raster", tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"], tileSize: 256, attribution: "© OpenStreetMap contributors" },
    sat: {
      type: "raster",
      tiles: ["https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"],
      tileSize: 256,
      attribution: "Imagery © Esri",
    },
  },
  layers: [
    { id: "osm", type: "raster", source: "osm" },
    { id: "sat", type: "raster", source: "sat", layout: { visibility: "none" } },
  ],
};

export default function MapPicker({ locations, point, onPick }) {
  const el = useRef(null);
  const mapRef = useRef(null);
  const mlRef = useRef(null);
  const pins = useRef([]);
  const picked = useRef(null);
  const pickRef = useRef(onPick);
  const [ready, setReady] = useState(false);
  const [sat, setSat] = useState(true);
  pickRef.current = onPick;

  useEffect(() => {
    let map;
    let cancelled = false;
    import("maplibre-gl").then((m) => {
      if (cancelled || !el.current) return;
      const ml = m.default || m;
      ml.setWorkerUrl("/maplibre/maplibre-gl-worker.mjs");
      mlRef.current = ml;
      map = new ml.Map({ container: el.current, style: STYLE, center: [75.705, 31.255], zoom: 16 });
      map.addControl(new ml.NavigationControl(), "bottom-right");
      map.on("click", (e) => pickRef.current(e.lngLat.lat, e.lngLat.lng));
      map.on("load", () => setReady(true));
      mapRef.current = map;
    });
    return () => {
      cancelled = true;
      map?.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    mapRef.current.setLayoutProperty("sat", "visibility", sat ? "visible" : "none");
    mapRef.current.setLayoutProperty("osm", "visibility", sat ? "none" : "visible");
  }, [sat, ready]);

  useEffect(() => {
    if (!ready) return;
    pins.current.forEach((m) => m.remove());
    pins.current = locations
      .filter((l) => !l.parent && l.lat != null && l.lng != null)
      .map((l) => {
        const d = document.createElement("div");
        d.className = "map-pin";
        d.title = l.name;
        return new mlRef.current.Marker({ element: d }).setLngLat([l.lng, l.lat]).addTo(mapRef.current);
      });
  }, [locations, ready]);

  useEffect(() => {
    if (!ready) return;
    picked.current?.remove();
    picked.current = null;
    if (point && !Number.isNaN(point.lat) && !Number.isNaN(point.lng)) {
      const d = document.createElement("div");
      d.className = "map-pin";
      d.style.background = "#1b8f3a";
      picked.current = new mlRef.current.Marker({ element: d }).setLngLat([point.lng, point.lat]).addTo(mapRef.current);
    }
  }, [point, ready]);

  return (
    <div className="pg-card" style={{ padding: 0, overflow: "hidden" }}>
      <div style={{ padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
        <span><strong>Click the map</strong> to set the position of the new location. Orange pins already exist, the green pin is your selection.</span>
        <button type="button" className="pg-btn alt sm" onClick={() => setSat(!sat)}>{sat ? "Show street map" : "Show satellite"}</button>
      </div>
      <div ref={el} style={{ height: 420 }} />
    </div>
  );
}
