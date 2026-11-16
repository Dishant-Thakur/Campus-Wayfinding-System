const types = ["all", "gate", "block", "landmark", "facility"];

export default function MapSidebar({ items, query, setQuery, type, setType, selectedId, onSelect }) {
  return (
    <aside className="map-side">
      <div className="map-side-top">
        <input className="form-control" placeholder="Search blocks, gates, facilities" value={query} onChange={(e) => setQuery(e.target.value)} />
        <div className="map-chips">
          {types.map((t) => (
            <button key={t} className={`map-chip ${type === t ? "on" : ""}`} onClick={() => setType(t)}>{t}</button>
          ))}
        </div>
      </div>
      <div className="map-list">
        {items.map((l) => (
          <div key={l._id} className={`map-item ${selectedId === l._id ? "on" : ""}`} onClick={() => onSelect(l)}>
            <strong>{l.name}</strong>
            <small>{l.type} · {l.code}</small>
          </div>
        ))}
        {!items.length && <div className="map-item">No locations found.</div>}
      </div>
    </aside>
  );
}
