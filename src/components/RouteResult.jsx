import { ArrowRight, Accessibility } from "lucide-react";

const fmt = (m) => (m >= 1000 ? `${(m / 1000).toFixed(1)} km` : `${Math.round(m)} m`);

export default function RouteResult({ route, innerRef }) {
  if (!route) return null;
  return (
    <section ref={innerRef} className="pg-card">
      <div className="route-title">
        <span>{route.from.name}</span>
        <ArrowRight size={22} />
        <span>{route.to.name}</span>
      </div>
      <div className="stat-row">
        <div className="stat"><b>{fmt(route.totalDistance)}</b><span>Distance</span></div>
        <div className="stat"><b>{route.estimatedMinutes} min</b><span>On foot</span></div>
        <div className="stat"><b>{route.steps.length}</b><span>Steps</span></div>
      </div>
      {route.accessibleOnly && <p className="pg-note"><Accessibility size={18} /> Accessible route</p>}
      <ol className="tl">
        {route.steps.map((s, i) => (
          <li key={i}>
            <span className="tl-dot">{i + 1}</span>
            <div className="tl-text">
              {s.instruction}
              {s.distance > 0 && <small>{fmt(s.distance)}</small>}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
