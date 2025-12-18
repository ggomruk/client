import { ReactNode, CSSProperties, MouseEvent } from "react";

interface CardProps {
  variant?: "default" | "glass" | "gradient" | "bordered";
  className?: string;
  children: ReactNode;
  glow?: boolean;
  onClick?: (e?: MouseEvent<HTMLDivElement>) => void;
  style?: CSSProperties;
}

export function Card({ variant = "default", className = "", children, glow = false, onClick, style }: CardProps) {
  const baseClasses = "rounded-xl transition-all duration-300";
  
  const variantClasses = {
    default: "bg-[#18181b] border border-[#3f3f46]",
    glass: "glass",
    gradient: "gradient-border",
    bordered: "bg-[#18181b] border-2 border-[#3f3f46]"
  };
  
  const glowClass = glow ? "hover-glow" : "";
  const clickableClass = onClick ? "cursor-pointer hover:scale-[1.02]" : "";
  
  return (
    <div 
      className={`${baseClasses} ${variantClasses[variant]} ${glowClass} ${clickableClass} ${className}`}
      onClick={onClick}
      style={style}
    >
      {children}
    </div>
  );
}
