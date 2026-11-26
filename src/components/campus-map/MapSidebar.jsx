const types = ["all", "gate", "block", "facility", "landmark"];

export default function MapSidebar({ items, query, setQuery, type, setType, selectedId, onSelect }) {
  return (
    <aside className="map-side">
      <div className="map-side-top">
        <input className="map-search" type="search" placeholder="Search a block or place" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search places" />
        <div className="chips">
          {types.map((t) => (
            <button key={t} className={`chip ${type === t ? "on" : ""}`} onClick={() => setType(t)} style={{ textTransform: "capitalize" }}>{t}</button>
          ))}
        </div>
      </div>
      <div className="map-list">
        {items.map((l) => (
          <div key={l._id} className={`map-item ${selectedId === l._id ? "on" : ""}`} onClick={() => onSelect(l)} role="button" tabIndex={0} onKeyDown={(e) => e.key === "Enter" && onSelect(l)}>
            <div><strong>{l.name}</strong><small>{l.type}</small></div>
          </div>
        ))}
        {!items.length && <div className="pg-empty">Nothing found.</div>}
      </div>
    </aside>
  );
}
