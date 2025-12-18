import { ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "./utils";

// For shadcn compatibility
export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline:
          "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg" | "icon";
  loading?: boolean;
  disabled?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
  children?: ReactNode;
  onClick?: (event?: React.MouseEvent<HTMLButtonElement>) => void;
  type?: "button" | "submit" | "reset";
  className?: string;
}

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  children,
  onClick,
  type = "button",
  className
}: ButtonProps) {
  const baseClasses = "rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2";
  
  const variantClasses = {
    primary: "bg-gradient-to-r from-[#7c3aed] to-[#06b6d4] text-white hover:opacity-90 shadow-lg",
    secondary: "bg-[#27272a] text-[#fafafa] hover:bg-[#3f3f46] border border-[#3f3f46]",
    outline: "bg-transparent text-[#fafafa] border-2 border-[#7c3aed] hover:bg-[#7c3aed]/10",
    ghost: "bg-transparent text-[#a1a1aa] hover:bg-[#27272a] hover:text-[#fafafa]",
    danger: "bg-gradient-to-r from-red-600 to-red-500 text-white hover:opacity-90"
  };
  
  const sizeClasses = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
    icon: "h-9 w-9 p-0"
  };
  
  const widthClass = fullWidth ? "w-full" : "";
  const disabledClass = (disabled || loading) ? "opacity-50 cursor-not-allowed" : "hover:scale-105";
  
  return (
    <button
      type={type}
      className={cn(baseClasses, variantClasses[variant], sizeClasses[size], widthClass, disabledClass, className)}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {loading ? (
        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
      ) : (
        <>
          {leftIcon}
          {children}
          {rightIcon}
        </>
      )}
    </button>
  );
}
