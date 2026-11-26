export function popular(locations, n = 6) {
  const num = (s) => parseInt(String(s).replace(/\D/g, ""), 10) || 0;
  const blocks = locations.filter((l) => l.type === "block").sort((a, b) => num(a.name) - num(b.name));
  const other = locations.filter((l) => l.type === "facility" || l.type === "landmark");
  return [...other.slice(0, 3), ...blocks].slice(0, n);
}

export function friendly(message) {
  if (/not found/i.test(message)) return "We couldn't find that place. Pick one from the suggestions.";
  if (/no route/i.test(message)) return "No walking route between these places yet.";
  return message;
}
