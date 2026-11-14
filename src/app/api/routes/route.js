import { handle } from "@/lib/api";
import { planRoute } from "@/lib/route";

export const GET = handle(async (req) => {
  const p = new URL(req.url).searchParams;
  const from = p.get("from");
  const to = p.get("to");
  if (!from || !to) return Response.json({ error: "from and to are required" }, { status: 400 });
  const r = await planRoute(from, to, p.get("accessible") === "true");
  if (r.error) return Response.json({ error: r.error }, { status: r.status });
  return Response.json({ data: r });
});