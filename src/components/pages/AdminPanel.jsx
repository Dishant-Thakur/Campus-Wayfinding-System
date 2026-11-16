"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SiteShell from "@/components/layout/SiteShell";
import { api, authHeader, clearToken, getToken } from "@/lib/client";

const blankLoc = { name: "", code: "", type: "block", parent: "", floor: "", lat: "", lng: "", description: "" };
const blankEdge = { from: "", to: "", distance: "", accessible: true, instruction: "" };

export default function AdminPanel() {
  const router = useRouter();
  const [tab, setTab] = useState("requests");
  const [requests, setRequests] = useState([]);
  const [locations, setLocations] = useState([]);
  const [edges, setEdges] = useState([]);
  const [loc, setLoc] = useState(blankLoc);
  const [edge, setEdge] = useState(blankEdge);
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);

  const call = useCallback(async (path, opts = {}) => {
    try {
      return await api(path, { ...opts, headers: authHeader() });
    } catch (e) {
      if (e.status === 401) {
        clearToken();
        router.replace("/admin/login");
      }
      throw e;
    }
  }, [router]);

  const load = useCallback(async () => {
    try {
      const [r, l, e] = await Promise.all([call("/api/requests"), call("/api/locations?limit=200"), call("/api/edges")]);
      setRequests(r.data);
      setLocations(l.data);
      setEdges(e.data);
    } catch (e) {
      setError(e.message);
    }
  }, [call]);

  useEffect(() => {
    if (!getToken()) {
      router.replace("/admin/login");
      return;
    }
    setReady(true);
    load();
  }, [router, load]);

  async function run(fn) {
    setError("");
    try {
      await fn();
      await load();
    } catch (e) {
      setError(e.message);
    }
  }

  const addLocation = (e) => {
    e.preventDefault();
    const body = { ...loc };
    ["parent", "floor", "lat", "lng", "description"].forEach((k) => body[k] === "" && delete body[k]);
    ["floor", "lat", "lng"].forEach((k) => body[k] !== undefined && (body[k] = Number(body[k])));
    run(async () => {
      await call("/api/locations", { method: "POST", body: JSON.stringify(body) });
      setLoc(blankLoc);
    });
  };

  const addEdge = (e) => {
    e.preventDefault();
    run(async () => {
      await call("/api/edges", { method: "POST", body: JSON.stringify({ ...edge, distance: Number(edge.distance) }) });
      setEdge(blankEdge);
    });
  };

  const nodes = locations.filter((l) => !l.parent);
  const blocks = locations.filter((l) => l.type === "block");

  if (!ready) return null;

  return (
    <SiteShell>
      <div className="pg-wrap">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
          <h1>Admin Panel</h1>
          <button className="pg-btn alt" onClick={() => { clearToken(); router.push("/admin/login"); }}>Log out</button>
        </div>
        <div className="pg-tabs">
          {[["requests", `Requests (${requests.length})`], ["locations", `Locations (${locations.length})`], ["edges", `Connections (${edges.length})`]].map(([k, v]) => (
            <button key={k} className={`pg-btn ${tab === k ? "" : "alt"}`} onClick={() => setTab(k)}>{v}</button>
          ))}
        </div>
        {error && <div className="pg-err">{error}</div>}

        {tab === "requests" && (
          <div className="pg-card pg-table-wrap">
            <table className="pg-table">
              <thead><tr><th>Visitor</th><th>Type</th><th>Message</th><th>Location</th><th>Status</th></tr></thead>
              <tbody>
                {requests.map((r) => (
                  <tr key={r._id}>
                    <td>{r.name}<br /><small>{r.email} {r.phone}</small></td>
                    <td>{r.type}</td>
                    <td>{r.message}</td>
                    <td>{r.location?.name || "-"}</td>
                    <td>
                      <select value={r.status} onChange={(e) => run(() => call(`/api/requests/${r._id}`, { method: "PATCH", body: JSON.stringify({ status: e.target.value }) }))}>
                        <option value="open">Open</option>
                        <option value="in_progress">In progress</option>
                        <option value="resolved">Resolved</option>
                      </select>
                    </td>
                  </tr>
                ))}
                {!requests.length && <tr><td colSpan={5}>No requests yet.</td></tr>}
              </tbody>
            </table>
          </div>
        )}

        {tab === "locations" && (
          <>
            <form className="pg-card" onSubmit={addLocation}>
              <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 14 }}>Add Location</h2>
              <div className="pg-grid">
                <div className="pg-field"><label>Name</label><input value={loc.name} onChange={(e) => setLoc({ ...loc, name: e.target.value })} required /></div>
                <div className="pg-field"><label>Code (unique)</label><input value={loc.code} onChange={(e) => setLoc({ ...loc, code: e.target.value })} required /></div>
                <div className="pg-field"><label>Type</label>
                  <select value={loc.type} onChange={(e) => setLoc({ ...loc, type: e.target.value })}>
                    {["gate", "block", "room", "landmark", "facility"].map((t) => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div className="pg-field"><label>Parent block (for rooms)</label>
                  <select value={loc.parent} onChange={(e) => setLoc({ ...loc, parent: e.target.value })}>
                    <option value="">None</option>
                    {blocks.map((b) => <option key={b._id} value={b._id}>{b.name}</option>)}
                  </select>
                </div>
                <div className="pg-field"><label>Floor</label><input type="number" value={loc.floor} onChange={(e) => setLoc({ ...loc, floor: e.target.value })} /></div>
                <div className="pg-field"><label>Description</label><input value={loc.description} onChange={(e) => setLoc({ ...loc, description: e.target.value })} /></div>
                <div className="pg-field"><label>Latitude</label><input type="number" step="any" value={loc.lat} onChange={(e) => setLoc({ ...loc, lat: e.target.value })} /></div>
                <div className="pg-field"><label>Longitude</label><input type="number" step="any" value={loc.lng} onChange={(e) => setLoc({ ...loc, lng: e.target.value })} /></div>
              </div>
              <button className="pg-btn">Add Location</button>
            </form>
            <div className="pg-card pg-table-wrap">
              <table className="pg-table">
                <thead><tr><th>Name</th><th>Code</th><th>Type</th><th>Floor</th><th></th></tr></thead>
                <tbody>
                  {locations.map((l) => (
                    <tr key={l._id}>
                      <td>{l.name}</td><td>{l.code}</td><td>{l.type}</td><td>{l.floor ?? "-"}</td>
                      <td><button className="pg-btn sm danger" onClick={() => confirm(`Delete ${l.name}?`) && run(() => call(`/api/locations/${l._id}`, { method: "DELETE" }))}>Delete</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {tab === "edges" && (
          <>
            <form className="pg-card" onSubmit={addEdge}>
              <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 14 }}>Add Connection</h2>
              <div className="pg-grid">
                <div className="pg-field"><label>From</label>
                  <select value={edge.from} onChange={(e) => setEdge({ ...edge, from: e.target.value })} required>
                    <option value="">Select</option>
                    {nodes.map((n) => <option key={n._id} value={n._id}>{n.name}</option>)}
                  </select>
                </div>
                <div className="pg-field"><label>To</label>
                  <select value={edge.to} onChange={(e) => setEdge({ ...edge, to: e.target.value })} required>
                    <option value="">Select</option>
                    {nodes.map((n) => <option key={n._id} value={n._id}>{n.name}</option>)}
                  </select>
                </div>
                <div className="pg-field"><label>Distance (m)</label><input type="number" min="1" value={edge.distance} onChange={(e) => setEdge({ ...edge, distance: e.target.value })} required /></div>
                <div className="pg-field"><label>Instruction (optional)</label><input value={edge.instruction} onChange={(e) => setEdge({ ...edge, instruction: e.target.value })} /></div>
              </div>
              <label className="pg-check"><input type="checkbox" checked={edge.accessible} onChange={(e) => setEdge({ ...edge, accessible: e.target.checked })} /> Accessible path</label>
              <button className="pg-btn">Add Connection</button>
            </form>
            <div className="pg-card pg-table-wrap">
              <table className="pg-table">
                <thead><tr><th>From</th><th>To</th><th>Distance</th><th>Accessible</th><th></th></tr></thead>
                <tbody>
                  {edges.map((x) => (
                    <tr key={x._id}>
                      <td>{x.from?.name}</td><td>{x.to?.name}</td><td>{x.distance} m</td><td>{x.accessible ? "Yes" : "No"}</td>
                      <td><button className="pg-btn sm danger" onClick={() => run(() => call(`/api/edges/${x._id}`, { method: "DELETE" }))}>Delete</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </SiteShell>
  );
}
