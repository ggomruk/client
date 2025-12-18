import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

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
}

export function Select({
  label,
  options,
  value,
  onChange,
  error,
  helperText,
  placeholder
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const selectedOption = options.find(opt => opt.value === value);
  
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
    <div className="w-full" ref={containerRef}>
      <div className="relative">
        {label && (
          <label className={`absolute left-4 transition-all duration-300 pointer-events-none z-10
            ${focused || selectedOption 
              ? "top-0 -translate-y-1/2 text-xs bg-[#27272a] px-2 text-[#7c3aed]" 
              : "top-1/2 -translate-y-1/2 text-sm text-[#a1a1aa]"}`}
          >
            {label}
          </label>
        )}
        
        <button
          type="button"
          onClick={() => {
            setIsOpen(!isOpen);
            setFocused(true);
          }}
          className={`w-full bg-[#27272a] border rounded-lg px-4 text-left flex items-center justify-between transition-all duration-300
            ${label ? "pt-6 pb-2 h-[52px]" : "py-3 h-[48px]"}
            ${error ? "border-[#ff6467]" : focused ? "border-[#7c3aed] shadow-[0_0_0_3px_rgba(124,58,237,0.1)]" : "border-[#3f3f46]"}
            focus:outline-none`}
        >
          <div className="flex items-center gap-2">
            {selectedOption?.icon}
            <span className={selectedOption ? "text-[#fafafa]" : placeholder ? "text-[#71717a]" : "text-[#a1a1aa]"}>
              {selectedOption?.label || placeholder || ""}
            </span>
          </div>
          <ChevronDown className={`w-4 h-4 text-[#a1a1aa] transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
        </button>
        
        {isOpen && (
          <div className="absolute z-50 w-full mt-2 bg-[#18181b] border border-[#3f3f46] rounded-lg shadow-2xl overflow-hidden animate-slideIn">
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
                  <div className="flex items-center gap-2">
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
