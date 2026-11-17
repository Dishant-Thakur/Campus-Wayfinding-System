import campusData from "@/data/campus.json";

export function getCampusData() { return campusData; }

export function findLocation({ id, code }) {
  if (id) return campusData.locations.find((location) => location.id === id);
  if (code) return campusData.locations.find((location) => location.code.toLowerCase() === code.trim().toLowerCase());
  return undefined;
}
