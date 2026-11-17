import { randomUUID } from "node:crypto";
import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { findLocation } from "@/lib/campus-data";

export async function POST(request) {
  let body;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Send a valid assistance request." }, { status: 400 }); }
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const email = typeof body?.email === "string" ? body.email.trim() : "";
  const destination = findLocation({ id: body?.destinationId });
  const details = typeof body?.details === "string" ? body.details.trim() : "";
  if (name.length < 2 || name.length > 80) return NextResponse.json({ error: "Enter a name between 2 and 80 characters." }, { status: 400 });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  if (!destination) return NextResponse.json({ error: "Choose a destination from the campus directory." }, { status: 400 });
  if (!details || details.length > 1000) return NextResponse.json({ error: "Describe the help you need (up to 1,000 characters)." }, { status: 400 });
  const item = { id: randomUUID(), createdAt: new Date().toISOString(), name, email, destinationId: destination.id, destinationName: destination.name, details, status: "received" };
  const storePath = path.join(process.cwd(), "data", "assistance-requests.jsonl");
  try {
    await mkdir(path.dirname(storePath), { recursive: true });
    await appendFile(storePath, `${JSON.stringify(item)}\n`, "utf8");
  } catch {
    return NextResponse.json({ error: "The request could not be saved. Please try again or contact campus support." }, { status: 500 });
  }
  return NextResponse.json({ request: { id: item.id, status: item.status, destinationName: item.destinationName }, message: "Your assistance request was saved." }, { status: 201 });
}
