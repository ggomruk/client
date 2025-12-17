'use client';

import { ReactNode, HTMLAttributes } from 'react';
import styles from './Card.module.css';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: 'default' | 'glass' | 'gradient' | 'bordered';
  hover?: boolean;
  glow?: boolean;
}

export default function Card({ 
  children, 
  variant = 'default',
  hover = true,
  glow = false,
  className = '',
  ...props 
}: CardProps) {
  const variantClass = {
    default: styles.card,
    glass: styles.cardGlass,
    gradient: styles.cardGradient,
    bordered: styles.cardBordered
  }[variant];

  const classes = [
    variantClass,
    hover && styles.hover,
    glow && styles.glow,
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
}
