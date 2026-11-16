export default function LocationInput({ id, label, value, onChange, options, placeholder }) {
  return (
    <div className="pg-field">
      <label htmlFor={id}>{label}</label>
      <input id={id} list={`${id}-list`} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} required />
      <datalist id={`${id}-list`}>
        {options.map((o) => <option key={o._id} value={o.name}>{o.code}</option>)}
      </datalist>
    </div>
  );
}
