'use client';

interface ToggleSwitchProps {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
}

export default function ToggleSwitch({
  id,
  checked,
  onChange,
  label,
  disabled = false,
}: ToggleSwitchProps) {
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        id={id}
        onClick={() => onChange(!checked)}
        disabled={disabled}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          checked
            ? 'bg-green-600 hover:bg-green-700'
            : 'bg-gray-300 hover:bg-gray-400'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
      {label && (
        <label
          htmlFor={id}
          className={`text-sm font-medium ${
            disabled ? 'text-gray-400 cursor-not-allowed' : 'text-gray-900 cursor-pointer'
          }`}
        >
          {label}
        </label>
      )}
    </div>
  );
}
