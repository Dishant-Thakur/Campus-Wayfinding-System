import { handle } from "@/lib/api";
import { signToken } from "@/lib/auth";

export const POST = handle(async (req) => {
  const { username, password } = await req.json();
  if (username !== process.env.ADMIN_USER || password !== process.env.ADMIN_PASS) {
    return Response.json({ error: "Invalid credentials" }, { status: 401 });
  }
  return Response.json({ token: signToken() });
});