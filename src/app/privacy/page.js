import SiteShell from "@/components/layout/SiteShell";
import PageHeader from "@/components/layout/PageHeader";

export const metadata = { title: "Privacy policy | Campus Wayfinding" };

export default function Page() {
  return (
    <SiteShell>
      <div className="pg-wrap pg-narrow" style={{ maxWidth: 760 }}>
        <PageHeader eyebrow="Privacy" title="Privacy policy" />
        <div className="pg-card">
          <p>We store only what you send through the Help form: your name, contact details and message. We use it only to reply to you.</p>
          <p style={{ marginBottom: 0 }}>We don't track your location. Map tiles load from OpenStreetMap. Ask us to delete your request any time.</p>
        </div>
      </div>
    </SiteShell>
  );
}
