import Link from "next/link";

export default function LocationDetails({ location, children, onClose }) {
  if (!location) return null;
  return (
    <div className="map-details">
      <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
        <h2>{location.name}</h2>
        <button onClick={onClose} aria-label="Close" style={{ border: 0, background: "none", fontSize: 22 }}>×</button>
      </div>
      <p style={{ color: "#777", textTransform: "capitalize" }}>{location.type} · {location.code}</p>
      {location.description && <p>{location.description}</p>}
      <p>{location.accessible ? "Accessible" : "Not fully accessible"}</p>
      {children.length > 0 && (
        <>
          <strong>Rooms</strong>
          <ul style={{ paddingLeft: 18 }}>
            {children.map((c) => <li key={c._id}>{c.name}{c.floor != null ? ` (floor ${c.floor})` : ""}</li>)}
          </ul>
        </>
      )}
      <Link className="pg-btn" style={{ display: "inline-block", marginTop: 8, color: "#fff" }} href={`/find-location?to=${encodeURIComponent(location.code)}`}>
        Get Directions
      </Link>
    </div>
  );
}
