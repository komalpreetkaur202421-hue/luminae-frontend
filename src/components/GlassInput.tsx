import { useState, type InputHTMLAttributes } from "react";
import { Eye, EyeOff } from "lucide-react";

interface GlassInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

/** Glass input with a floating label + optional password toggle. */
export function GlassInput({ label, error, type, id, ...props }: GlassInputProps) {
  const [show, setShow] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword ? (show ? "text" : "password") : type;
  const inputId = id || label.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="space-y-1">
      <div className="relative">
        <input
          id={inputId}
          type={inputType}
          placeholder=" "
          className={`peer w-full rounded-2xl border bg-input px-4 pb-2.5 pt-6 text-sm text-foreground outline-none backdrop-blur-xl transition-all placeholder:text-transparent focus:border-primary/60 focus:shadow-[0_0_0_3px] focus:shadow-primary/10 ${
            error ? "border-destructive/60" : "border-glass-border"
          }`}
          {...props}
        />
        <label
          htmlFor={inputId}
          className="pointer-events-none absolute left-4 top-2 text-xs font-medium text-muted-foreground transition-all peer-placeholder-shown:top-4.5 peer-placeholder-shown:text-sm peer-focus:top-2 peer-focus:text-xs peer-focus:text-primary"
        >
          {label}
        </label>
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow(!show)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
            aria-label={show ? "Hide password" : "Show password"}
          >
            {show ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
      {error && <p className="pl-1 text-xs text-destructive animate-fade-in">{error}</p>}
    </div>
  );
}