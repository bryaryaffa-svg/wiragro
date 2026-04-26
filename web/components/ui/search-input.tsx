type HiddenInputs = Record<string, string | undefined>;

function SearchGlyph() {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
      <circle cx="11" cy="11" r="6.3" stroke="currentColor" strokeWidth="1.8" />
      <path d="m16 16 4 4" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
    </svg>
  );
}

export function SearchInput({
  action,
  buttonLabel = "Cari",
  defaultValue,
  hiddenInputs,
  iconOnly = false,
  inputLabel,
  name = "q",
  placeholder,
  size = "default",
}: {
  action: string;
  buttonLabel?: string;
  defaultValue?: string;
  hiddenInputs?: HiddenInputs;
  iconOnly?: boolean;
  inputLabel: string;
  name?: string;
  placeholder: string;
  size?: "default" | "large";
}) {
  const fieldId = `${name}-${size}`;

  return (
    <form action={action} className={`search-input search-input--${size}`}>
      <label className="sr-only" htmlFor={fieldId}>
        {inputLabel}
      </label>
      <div className="search-input__control">
        {Object.entries(hiddenInputs ?? {}).map(([key, value]) =>
          value ? <input key={key} name={key} type="hidden" value={value} /> : null,
        )}
        <input
          aria-label={inputLabel}
          defaultValue={defaultValue}
          id={fieldId}
          name={name}
          placeholder={placeholder}
          type="search"
        />
        <button aria-label={buttonLabel} type="submit">
          <SearchGlyph />
          {iconOnly ? null : <span>{buttonLabel}</span>}
        </button>
      </div>
    </form>
  );
}
