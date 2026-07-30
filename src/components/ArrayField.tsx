interface ArrayFieldProps {
  label: string;
  values: string[];
  onChange: (values: string[]) => void;
  field?: string;
  multiline?: boolean;
}

export function ArrayField({
  label,
  values,
  onChange,
  field,
  multiline
}: ArrayFieldProps) {
  const update = (index: number, value: string) => {
    const next = [...values];
    next[index] = value;
    onChange(next);
  };
  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= values.length) return;
    const next = [...values];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  return (
    <div className="array-field field-shell--wide" data-field={field}>
      <div className="array-field__heading">
        <span className="field-shell__label">{label}</span>
        <button
          type="button"
          className="button button--quiet"
          onClick={() => onChange([...values, ""])}
        >
          ＋ 添加
        </button>
      </div>
      {values.length === 0 ? (
        <p className="empty-copy">暂无条目</p>
      ) : (
        <div className="array-field__items">
          {values.map((value, index) => (
            <div className="array-field__row" key={`${index}-${value.slice(0, 8)}`}>
              <span className="array-field__index">{index + 1}</span>
              {multiline ? (
                <textarea
                  rows={2}
                  value={value}
                  onChange={(event) => update(index, event.target.value)}
                />
              ) : (
                <input
                  value={value}
                  onChange={(event) => update(index, event.target.value)}
                />
              )}
              <div className="array-field__controls">
                <button
                  type="button"
                  aria-label="上移"
                  disabled={index === 0}
                  onClick={() => move(index, -1)}
                >
                  ↑
                </button>
                <button
                  type="button"
                  aria-label="下移"
                  disabled={index === values.length - 1}
                  onClick={() => move(index, 1)}
                >
                  ↓
                </button>
                <button
                  type="button"
                  aria-label="删除"
                  onClick={() =>
                    onChange(values.filter((_, itemIndex) => itemIndex !== index))
                  }
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
