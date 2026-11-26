"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import "maplibre-gl/dist/maplibre-gl.css";
import "./CampusMap.css";
import SiteShell from "@/components/layout/SiteShell";
import MapSidebar from "./MapSidebar";
import LocationDetails from "./LocationDetails";
import { api } from "@/lib/client";

const CENTER = [75.705, 31.255];
const STYLE = {
  version: 8,
  sources: {
    osm: {
      type: "raster",
      tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
      tileSize: 256,
      attribution: "© OpenStreetMap contributors",
    },
  },
  layers: [{ id: "osm", type: "raster", source: "osm" }],
};

export default function CampusMap() {
  const [locations, setLocations] = useState([]);
  const [query, setQuery] = useState("");
  const [type, setType] = useState("all");
  const [selected, setSelected] = useState(null);
  const [children, setChildren] = useState([]);
  const [error, setError] = useState("");
  const el = useRef(null);
  const mapRef = useRef(null);
  const markers = useRef([]);
  const maplibre = useRef(null);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    api("/api/locations?limit=200")
      .then((r) => setLocations(r.data.filter((l) => !l.parent)))
      .catch((e) => setError(e.message));
  }, []);

  useEffect(() => {
    let map;
    let cancelled = false;
    import("maplibre-gl").then((m) => {
      if (cancelled || !el.current) return;
      maplibre.current = m.default || m;
      maplibre.current.setWorkerUrl("/maplibre/maplibre-gl-worker.mjs");
      map = new maplibre.current.Map({ container: el.current, style: STYLE, center: CENTER, zoom: 15 });
      map.addControl(new maplibre.current.NavigationControl(), "bottom-right");
      map.on("load", () => setMapReady(true));
      mapRef.current = map;
    });
    return () => {
      cancelled = true;
      map?.remove();
      mapRef.current = null;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return locations.filter(
      (l) =>
        (type === "all" || l.type === type) &&
        (!q || l.name.toLowerCase().includes(q) || l.code.includes(q) || (l.keywords || []).some((k) => k.toLowerCase().includes(q)))
    );
  }, [locations, query, type]);

  async function select(l) {
    setSelected(l);
    setChildren([]);
    if (l.lat != null && l.lng != null) mapRef.current?.flyTo({ center: [l.lng, l.lat], zoom: 17 });
    try {
      const r = await api(`/api/locations/${l._id}`);
      setChildren(r.children || []);
    } catch {}
  }

  useEffect(() => {
    if (!mapReady || !maplibre.current) return;
    markers.current.forEach((m) => m.remove());
    markers.current = filtered
      .filter((l) => l.lat != null && l.lng != null)
      .map((l) => {
        const pin = document.createElement("div");
        pin.className = "map-pin";
        pin.title = l.name;
        pin.addEventListener("click", () => select(l));
        return new maplibre.current.Marker({ element: pin }).setLngLat([l.lng, l.lat]).addTo(mapRef.current);
      });
  }, [filtered, mapReady]);

  return (
    <SiteShell>
      <div className="map-layout">
        <MapSidebar items={filtered} query={query} setQuery={setQuery} type={type} setType={setType} selectedId={selected?._id} onSelect={select} />
        <div className="map-area">
          <div ref={el} className="map-canvas" />
          {error && <div className="pg-err" style={{ position: "absolute", top: 12, left: 12, zIndex: 5 }}>{error}</div>}
          <LocationDetails location={selected} children={children} onClose={() => setSelected(null)} />
        </div>
      </div>
    </SiteShell>
  );
}
