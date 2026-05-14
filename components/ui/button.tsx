import React from 'react';
import { cn } from '@/lib/utils';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';

type ButtonSize = 'default' | 'sm' | 'lg';

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-white text-ink hover:bg-slate-100',
  secondary: 'border border-white/20 bg-white/5 text-white hover:bg-white/10',
  ghost: 'bg-transparent text-white hover:bg-white/10'
};

const sizeStyles: Record<ButtonSize, string> = {
  default: 'h-12 px-6',
  sm: 'h-10 px-4',
  lg: 'h-14 px-8'
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'default', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-full text-sm font-semibold transition shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button };
