export default function PageHeader({ eyebrow, title, sub, icon: Icon }) {
  return (
    <div className="pg-head">
      {Icon && <span className="pg-head-icon" aria-hidden="true"><Icon size={92} strokeWidth={1.2} /></span>}
      <div className="pg-eyebrow">{eyebrow}</div>
      <h1>{title}</h1>
      {sub && <p>{sub}</p>}
    </div>
  );
}
