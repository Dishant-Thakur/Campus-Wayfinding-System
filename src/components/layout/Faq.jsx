const items = [
  ["I can't find my block. What now?", "Search its number on the Campus Map, or scan a QR code nearby to set your position."],
  ["Does it work without GPS?", "Yes. You choose your start point or scan a code, so no location access is needed."],
  ["Are step-free routes available?", "Yes. Switch on Accessible routes only on the Find Location page."],
  ["How accurate are the times?", "They assume a relaxed walking pace of about 80 metres a minute."],
  ["Something is wrong on the map.", "Send a request above and pick Report a problem. We'll fix it."],
];

export default function Faq() {
  return (
    <div className="faq">
      {items.map(([q, a]) => (
        <details key={q}>
          <summary>{q}</summary>
          <p>{a}</p>
        </details>
      ))}
    </div>
  );
}
