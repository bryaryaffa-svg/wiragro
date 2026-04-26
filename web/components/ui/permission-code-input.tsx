export function PermissionCodeInput({
  disabled = false,
  helperText = "Masukkan kode izin checkout dari admin jika pembelian membutuhkan otorisasi khusus.",
  isValidated = false,
  isValidating = false,
  label = "Masukkan kode izin checkout",
  onChange,
  onValidate,
  placeholder = "Contoh: WGRO-B2B-2026",
  statusMessage,
  validateLabel = "Validasi kode",
  value,
}: {
  disabled?: boolean;
  helperText?: string;
  isValidated?: boolean;
  isValidating?: boolean;
  label?: string;
  onChange: (value: string) => void;
  onValidate?: () => void;
  placeholder?: string;
  statusMessage?: string;
  validateLabel?: string;
  value: string;
}) {
  return (
    <div className={`permission-code-input${isValidated ? " is-validated" : ""}`}>
      <label>
        <span>{label}</span>
        <div className="permission-code-input__control">
          <input
            disabled={disabled}
            inputMode="text"
            onChange={(event) => onChange(event.target.value.toUpperCase())}
            placeholder={placeholder}
            value={value}
          />
          {onValidate ? (
            <button
              className="btn btn-secondary"
              disabled={disabled || isValidating || !value.trim()}
              onClick={onValidate}
              type="button"
            >
              {isValidating ? "Memvalidasi..." : validateLabel}
            </button>
          ) : null}
        </div>
      </label>
      <small>{statusMessage || helperText}</small>
    </div>
  );
}
