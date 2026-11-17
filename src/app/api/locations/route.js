import { NextResponse } from "next/server";
import { findLocation, getCampusData } from "@/lib/campus-data";

export function GET(request) {
  const params = new URL(request.url).searchParams;
  const { locations, metadata } = getCampusData();
  const id = params.get("id");
  const code = params.get("code");
  if (id || code) {
    const location = findLocation({ id, code });
    if (!location) return NextResponse.json({ error: "Location code or destination was not found." }, { status: 404 });
    return NextResponse.json({ location, notice: metadata.notice });
  }
  const query = params.get("q")?.trim().toLocaleLowerCase();
  const category = params.get("category")?.trim().toLocaleLowerCase();
  const results = locations.filter((place) => {
    const textMatches = !query || `${place.name} ${place.code} ${place.category} ${place.area} ${place.description}`.toLocaleLowerCase().includes(query);
    return textMatches && (!category || place.category.toLocaleLowerCase() === category);
  });
  return NextResponse.json({ locations: results, total: results.length, gates: locations.filter((place) => place.type === "gate"), categories: [...new Set(locations.map((place) => place.category))], notice: metadata.notice });
}
