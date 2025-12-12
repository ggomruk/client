'use client';

import React, { useState } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';

interface LogoutButtonProps {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  showIcon?: boolean;
  className?: string;
}

const LogoutButton: React.FC<LogoutButtonProps> = ({
  variant = 'danger',
  size = 'md',
  fullWidth = false,
  showIcon = true,
  className = '',
}) => {
  const { logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Variant styles
  const variantStyles = {
    primary: 'bg-primary-400 hover:bg-primary-500 text-white',
    secondary: 'bg-secondary-400 hover:bg-secondary-500 text-white',
    danger: 'bg-error hover:brightness-110 text-white hover:shadow-lg hover:shadow-error/30',
  };

  // Size styles
  const sizeStyles = {
    sm: 'text-xs py-1.5 px-3',
    md: 'text-sm py-2 px-4',
    lg: 'text-base py-2.5 px-6',
  };

  return (
    <button
      onClick={handleLogout}
      disabled={isLoggingOut}
      className={`
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${fullWidth ? 'w-full' : ''}
        flex items-center justify-center gap-2
        rounded-md font-medium
        transition-all duration-200
        hover:-translate-y-0.5
        disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
        ${className}
      `}
    >
      {showIcon && (
        <svg 
          className={`${size === 'sm' ? 'w-4 h-4' : size === 'md' ? 'w-5 h-5' : 'w-6 h-6'} ${isLoggingOut ? 'animate-spin' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          {isLoggingOut ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          )}
        </svg>
      )}
      <span>{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
    </button>
  );
};

export default LogoutButton;
