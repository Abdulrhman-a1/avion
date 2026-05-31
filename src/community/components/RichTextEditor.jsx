export default function RichTextEditor({ value, onChange, placeholder, rows = 12, label, id }) {
  return (
    <label className="community-field" htmlFor={id}>
      <span className="community-field-label">{label}</span>
      <textarea
        id={id}
        className="community-textarea"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
      />
      <span className="community-field-hint">
        Use blank lines between paragraphs. Start lines with ## for section headings.
      </span>
    </label>
  );
}
