import SiteShell from "@/components/layout/SiteShell";
import PageHeader from "@/components/layout/PageHeader";

export const metadata = { title: "Terms of use | Campus Wayfinding" };

export default function Page() {
  return (
    <SiteShell>
      <div className="pg-wrap pg-narrow" style={{ maxWidth: 760 }}>
        <PageHeader eyebrow="Terms" title="Terms of use" />
        <div className="pg-card">
          <p>This system helps students and visitors find their way around campus. Routes and times are estimates, so treat them as guidance.</p>
          <p style={{ marginBottom: 0 }}>Please don't misuse the help service or the admin area.</p>
        </div>
      </div>
    </SiteShell>
  );
}
