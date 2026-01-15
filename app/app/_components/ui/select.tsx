'use client';

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "./utils";

interface SelectOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

interface SelectProps {
  label?: string;
  options: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  helperText?: string;
  placeholder?: string;
  className?: string;
}

export function Select({
  label,
  options,
  value,
  onChange,
  error,
  helperText,
  placeholder,
  className
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const selectedOption = options.find(opt => opt.value === value);
  const shouldFloat = focused || !!selectedOption;
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setFocused(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  
  return (
    <div className={cn("w-full", className)} ref={containerRef}>
      <div className={cn("relative", isOpen ? "z-50" : "")}>
        {/* Text Label */}
        {label && (
          <label className={cn(
            "absolute left-4 transition-all duration-300 pointer-events-none z-10",
            shouldFloat
              ? "top-0 -translate-y-1/2 text-xs bg-[#141414] px-2 text-[#7c3aed] rounded-2xl" 
              : "top-1/2 -translate-y-1/2 text-sm text-[#a1a1aa] rounded-2xl"
          )}>
            {label}
          </label>
        )}
        
        {/* Select Button */}
        <button
          type="button"
          onClick={() => {
            setIsOpen(!isOpen);
            setFocused(true);
          }}
          className={cn(
            "w-full bg-[#27272a] border rounded-2xl pl-4 pr-10 text-left flex items-center transition-all duration-300 focus:outline-none",
            label ? (shouldFloat ? "py-3 h-[52px]" : "pt-6 pb-2 h-[52px]") : "py-3 h-[48px]",
            error ? "border-[#ff6467]" : focused ? "border-[#7c3aed] shadow-[0_0_0_3px_rgba(124,58,237,0.1)]" : "border-[#3f3f46]"
          )}
        >
          <div className="flex items-center gap-2 truncate w-full">
            {selectedOption?.icon}
            <span className={cn("truncate", selectedOption ? "text-[#fafafa]" : placeholder ? "text-[#71717a]" : "text-[#a1a1aa]")}>
              {selectedOption?.label || placeholder || ""}
            </span>
          </div>
        </button>
        
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
          <ChevronDown className={`w-4 h-4 text-[#a1a1aa] transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
        </div>
        

        {/* Options List */}
        {isOpen && (
          <div className="absolute z-50 w-full mt-2 bg-[#18181b] border border-[#3f3f46] rounded-2xl shadow-2xl overflow-hidden animate-slideIn">
            <div className="max-h-60 overflow-y-auto">
              {options.map((option, index) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange?.(option.value);
                    setIsOpen(false);
                  }}
                  className={`w-full px-4 py-3 text-left flex items-center justify-between hover:bg-[#27272a] transition-colors
                    ${value === option.value ? "bg-[#7c3aed]/10 text-[#7c3aed]" : "text-[#fafafa]"}
                    ${index === 0 ? "" : "border-t border-[#3f3f46]"}`}
                  style={{ animationDelay: `${index * 30}ms` }}
                >
                  <div className="flex items-center">
                    {option.icon}
                    <span>{option.label}</span>
                  </div>
                  {value === option.value && <Check className="w-4 h-4" />}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {(error || helperText) && (
        <div className={`mt-1 text-xs ${error ? "text-[#ff6467]" : "text-[#a1a1aa]"}`}>
          {error || helperText}
        </div>
      )}
    </div>
  );
}
