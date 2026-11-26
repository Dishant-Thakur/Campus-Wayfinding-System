import Link from "next/link";
import { Navigation } from "lucide-react";

export default function LocationDetails({ location, children, onClose }) {
  if (!location) return null;
  return (
    <div className="map-details">
      <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
        <h2>{location.name}</h2>
        <button className="map-close" onClick={onClose} aria-label="Close">×</button>
      </div>
      <p className="meta">{location.type} · {location.code}</p>
      {location.description && <p>{location.description}</p>}
      {children.length > 0 && (
        <>
          <strong>Rooms</strong>
          <ul>{children.map((c) => <li key={c._id}>{c.name}{c.floor != null ? ` · floor ${c.floor}` : ""}</li>)}</ul>
        </>
      )}
      <Link className="pg-btn block" style={{ color: "#fff" }} href={`/find-location?to=${encodeURIComponent(location.code)}`}>
        <Navigation size={18} /> Directions
      </Link>
    </div>
  );
}
