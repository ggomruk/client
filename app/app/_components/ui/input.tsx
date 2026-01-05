'use client';

import { ReactNode, useState } from "react";
import { Plus, Minus } from "lucide-react";
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
  step?: number;
  min?: number;
  max?: number;
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
  className,
  step = 1,
  min,
  max
}: InputProps) {
  const [focused, setFocused] = useState(false);
  const hasValue = value && value.length > 0;
  const isDateTimeType = type === "date" || type === "datetime-local" || type === "time" || type === "month" || type === "week";
  const isNumberType = type === "number";
  
  // For date inputs, always float the label to avoid overlap with browser's default placeholder
  const shouldFloat = focused || hasValue || isDateTimeType;

  const handleIncrement = () => {
    const currentValue = Number(value) || 0;
    const newValue = currentValue + step;
    if (max === undefined || newValue <= max) {
      onChange?.(String(newValue));
    }
  };

  const handleDecrement = () => {
    const currentValue = Number(value) || 0;
    const newValue = currentValue - step;
    if (min === undefined || newValue >= min) {
      onChange?.(String(newValue));
    }
  };
  
  return (
    <div className="w-full">
      <div className="relative">
        {label && (
          <label className={cn(
            "absolute left-4 transition-all duration-300 pointer-events-none z-10",
            shouldFloat
              ? "top-0 -translate-y-1/2 text-xs bg-[#27272a] px-2 text-[#7c3aed] rounded-md" 
              : "top-1/2 -translate-y-1/2 text-sm text-[#a1a1aa] rounded-md",
            leftIcon && !shouldFloat ? "left-10" : ""
          )}>
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
          min={min}
          max={max}
          step={step}
          className={cn(
            "w-full bg-[#27272a] border rounded-lg px-4 text-[#fafafa] transition-all duration-300 focus:outline-none",
            // Consistent height with proper vertical alignment
            label ? (shouldFloat ? "py-3 h-[52px]" : "pt-6 pb-2 h-[52px]") : "py-3 h-[48px]",
            // Only show placeholder color when placeholder exists
            placeholder ? "placeholder-[#71717a]" : "",
            leftIcon && "pl-10",
            rightIcon && !isNumberType && "pr-10",
            isNumberType && "pr-24", // Extra padding for stepper buttons
            error ? "border-[#ff6467]" : focused ? "border-[#7c3aed] shadow-[0_0_0_3px_rgba(124,58,237,0.1)]" : "border-[#3f3f46]",
            disabled && "opacity-50 cursor-not-allowed",
            // Style the date picker calendar icon
            isDateTimeType && "[color-scheme:dark]",
            // Hide default spin buttons
            "[&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-inner-spin-button]:m-0 [appearance:textfield]",
            className
          )}
        />
        
        {/* Stepper Buttons for Number Input */}
        {isNumberType && !disabled && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <button
              type="button"
              onClick={handleDecrement}
              disabled={min !== undefined && Number(value) <= min}
              className="w-8 h-8 flex items-center justify-center bg-[#18181b]/80 backdrop-blur-sm border border-[#3f3f46] rounded-lg text-[#a1a1aa] hover:text-[#fafafa] hover:border-[#7c3aed] transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-[#3f3f46] disabled:hover:text-[#a1a1aa]"
            >
              <Minus className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleIncrement}
              disabled={max !== undefined && Number(value) >= max}
              className="w-8 h-8 flex items-center justify-center bg-[#18181b]/80 backdrop-blur-sm border border-[#3f3f46] rounded-lg text-[#a1a1aa] hover:text-[#fafafa] hover:border-[#7c3aed] transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-[#3f3f46] disabled:hover:text-[#a1a1aa]"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        )}
        
        {rightIcon && !isNumberType && (
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
