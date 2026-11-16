import SiteShell from "@/components/layout/SiteShell";

export const metadata = { title: "Terms of Use | Campus Wayfinding" };

export default function Page() {
  return (
    <SiteShell>
      <div className="pg-wrap">
        <h1>Terms of Use</h1>
        <div className="pg-card">
          <p>This system is provided to help students and visitors find their way around the LPU campus. Routes and distances are estimates and should be used as guidance only.</p>
          <p>Misuse of the visitor assistance service or the administrator interface is not permitted.</p>
        </div>
      </div>
    </SiteShell>
  );
}
