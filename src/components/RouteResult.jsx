export default function RouteResult({ route }) {
  if (!route) return null;
  return (
    <div className="pg-card">
      <h2 style={{ fontSize: 22, fontWeight: 800 }}>{route.from.name} → {route.to.name}</h2>
      <div className="pg-meta">
        <span>{Math.round(route.totalDistance)} m</span>
        <span>About {route.estimatedMinutes} min walk</span>
        {route.accessibleOnly && <span>Accessible route</span>}
      </div>
      <ol className="pg-steps">
        {route.steps.map((s, i) => (
          <li key={i}>
            {s.instruction}
            {s.distance > 0 && <small>{Math.round(s.distance)} m</small>}
          </li>
        ))}
      </ol>
    </div>
  );
}
