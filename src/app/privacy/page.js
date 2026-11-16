import SiteShell from "@/components/layout/SiteShell";

export const metadata = { title: "Privacy Policy | Campus Wayfinding" };

export default function Page() {
  return (
    <SiteShell>
      <div className="pg-wrap">
        <h1>Privacy Policy</h1>
        <div className="pg-card">
          <p>The Campus Wayfinding System stores only the information you submit through the Help form (name, contact details and message) and uses it solely to respond to your request.</p>
          <p>No location tracking is performed. Map tiles are loaded from OpenStreetMap. Contact support if you want your request removed.</p>
        </div>
      </div>
    </SiteShell>
  );
}
