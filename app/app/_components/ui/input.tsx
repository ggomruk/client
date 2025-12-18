import { ReactNode, useState } from "react";
import { cn } from "./utils";

interface InputProps {
  label?: string;
  type?: string;
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  helperText?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function Input({
  label,
  type = "text",
  value,
  onChange,
  error,
  helperText,
  leftIcon,
  rightIcon,
  required = false,
  placeholder,
  disabled = false,
  className
}: InputProps) {
  const [focused, setFocused] = useState(false);
  const hasValue = value && value.length > 0;
  const isDateInput = type === "date" || type === "datetime-local" || type === "time";
  
  // For date inputs, always float the label to avoid overlap with browser's default placeholder
  const shouldFloat = focused || hasValue || isDateInput;
  
  return (
    <div className="w-full">
      <div className="relative">
        {label && (
          <label className={`absolute left-4 transition-all duration-300 pointer-events-none z-10
            ${shouldFloat
              ? "top-0 -translate-y-1/2 text-xs bg-[#27272a] px-2 text-[#7c3aed]" 
              : "top-1/2 -translate-y-1/2 text-sm text-[#a1a1aa]"}
            ${leftIcon && !shouldFloat ? "left-10" : ""}`}
          >
            {label} {required && <span className="text-[#ff6467]">*</span>}
          </label>
        )}
        
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a1a1aa] z-10">
            {leftIcon}
          </div>
        )}
        
        <input
          type={type}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            "w-full bg-[#27272a] border rounded-lg px-4 text-[#fafafa] transition-all duration-300 focus:outline-none",
            // Consistent height with proper vertical alignment
            label ? (shouldFloat ? "py-3 h-[52px]" : "pt-6 pb-2 h-[52px]") : "py-3 h-[48px]",
            // Only show placeholder color when placeholder exists
            placeholder ? "placeholder-[#71717a]" : "",
            leftIcon && "pl-10",
            rightIcon && "pr-10",
            error ? "border-[#ff6467]" : focused ? "border-[#7c3aed] shadow-[0_0_0_3px_rgba(124,58,237,0.1)]" : "border-[#3f3f46]",
            disabled && "opacity-50 cursor-not-allowed",
            // Style the date picker calendar icon
            isDateInput && "[color-scheme:dark]",
            className
          )}
        />
        
        
        {rightIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a1a1aa]">
            {rightIcon}
          </div>
        )}
      </div>
      
      {(error || helperText) && (
        <div className={`mt-1 text-xs ${error ? "text-red-500" : "text-[#a1a1aa]"}`}>
          {error || helperText}
        </div>
      )}
    </div>
  );
}
