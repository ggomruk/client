'use client';

import { InputHTMLAttributes, ReactNode } from 'react';
import styles from './Input.module.css';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
}

export default function Input({
  label,
  error,
  helperText,
  icon,
  iconPosition = 'left',
  className = '',
  ...props
}: InputProps) {
  const hasIcon = !!icon;

  return (
    <div className={styles.container}>
      {label && (
        <label className={styles.label}>
          {label}
          {props.required && <span className={styles.required}>*</span>}
        </label>
      )}
      
      <div className={styles.inputWrapper}>
        {hasIcon && iconPosition === 'left' && (
          <div className={styles.iconLeft}>{icon}</div>
        )}
        
        <input
          className={`${styles.input} ${error ? styles.error : ''} ${hasIcon && iconPosition === 'left' ? styles.hasIconLeft : ''} ${hasIcon && iconPosition === 'right' ? styles.hasIconRight : ''} ${className}`}
          {...props}
        />
        
        {hasIcon && iconPosition === 'right' && (
          <div className={styles.iconRight}>{icon}</div>
        )}
      </div>
      
      {error && <p className={styles.errorText}>{error}</p>}
      {helperText && !error && <p className={styles.helperText}>{helperText}</p>}
    </div>
  );
}
