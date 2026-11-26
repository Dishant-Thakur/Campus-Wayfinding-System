export default function HowTo({ steps }) {
  return (
    <div className="howto">
      {steps.map(([t, d], i) => (
        <div className="howto-card" key={t}>
          <span className="howto-n">{i + 1}</span>
          <h3>{t}</h3>
          <p>{d}</p>
        </div>
      ))}
    </div>
  );
}
