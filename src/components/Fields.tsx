import type { ReactNode } from "react";

interface FieldShellProps {
  label: string;
  hint?: string;
  field?: string;
  wide?: boolean;
  children: ReactNode;
}

export function FieldShell({
  label,
  hint,
  field,
  wide,
  children
}: FieldShellProps) {
  return (
    <label
      className={`field-shell${wide ? " field-shell--wide" : ""}`}
      data-field={field}
    >
      <span className="field-shell__label">{label}</span>
      {children}
      {hint ? <span className="field-shell__hint">{hint}</span> : null}
    </label>
  );
}

interface TextFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  field?: string;
  hint?: string;
  multiline?: boolean;
  rows?: number;
  wide?: boolean;
  disabled?: boolean;
}

export function TextField({
  label,
  value,
  onChange,
  field,
  hint,
  multiline,
  rows = 4,
  wide,
  disabled
}: TextFieldProps) {
  return (
    <FieldShell label={label} hint={hint} field={field} wide={wide}>
      {multiline ? (
        <textarea
          value={value}
          rows={rows}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
        />
      ) : (
        <input
          value={value}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
        />
      )}
    </FieldShell>
  );
}

interface NumberFieldProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  field?: string;
  min?: number;
  wide?: boolean;
}

export function NumberField({
  label,
  value,
  onChange,
  field,
  min,
  wide
}: NumberFieldProps) {
  return (
    <FieldShell label={label} field={field} wide={wide}>
      <input
        type="number"
        min={min}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </FieldShell>
  );
}

interface SelectFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  field?: string;
  wide?: boolean;
}

export function SelectField({
  label,
  value,
  onChange,
  options,
  field,
  wide
}: SelectFieldProps) {
  const hasValue = options.some((option) => option.value === value);
  return (
    <FieldShell label={label} field={field} wide={wide}>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {!hasValue && value ? <option value={value}>{value}（未解析）</option> : null}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </FieldShell>
  );
}

interface SectionProps {
  title: string;
  description?: string;
  children: ReactNode;
  actions?: ReactNode;
}

export function EditorSection({
  title,
  description,
  children,
  actions
}: SectionProps) {
  return (
    <section className="editor-section">
      <header className="editor-section__header">
        <div>
          <h2>{title}</h2>
          {description ? <p>{description}</p> : null}
        </div>
        {actions ? <div className="editor-section__actions">{actions}</div> : null}
      </header>
      <div className="editor-grid">{children}</div>
    </section>
  );
}
