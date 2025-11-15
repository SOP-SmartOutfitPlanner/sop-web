import React, { ReactNode, memo } from 'react';


interface GlassButtonProps {
  children: ReactNode;
  onClick?: (e?: React.MouseEvent<HTMLButtonElement>) => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'custom';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  fullWidth?: boolean;
  borderRadius?: string;
  blur?: string;
  brightness?: number;
  glowColor?: string;
  glowIntensity?: number;
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: string;
  textColor?: string;
  displacementScale?: number;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  title?: string;
}

const GlassButton: React.FC<GlassButtonProps> = memo(function GlassButton({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  fullWidth = false,
  borderRadius = '12px',
  blur = '8px',
  brightness = 1.1,
  glowColor = 'rgba(255, 255, 255, 0.3)',
  glowIntensity = 4,
  backgroundColor,
  borderColor,
  borderWidth = '1px',
  textColor,
  className = '',
  type = 'button',
  title
}) {
  const sizeStyles = {
    sm: { padding: '0.5rem 1rem', fontSize: '0.875rem' },
    md: { padding: '0.75rem 1.5rem', fontSize: '1rem' },
    lg: { padding: '1rem 2rem', fontSize: '1.125rem' }
  };

  const variantStyles = {
    primary: {
      background: 'rgba(255, 255, 255, 0.2)',
      color: 'white',
      border: '1px solid rgba(255, 255, 255, 0.3)',
      hoverBg: 'rgba(255, 255, 255, 0.3)'
    },
    secondary: {
      background: 'rgba(0, 0, 0, 0.2)',
      color: 'white',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      hoverBg: 'rgba(0, 0, 0, 0.3)'
    },
    outline: {
      background: 'transparent',
      color: 'white',
      border: '2px solid rgba(255, 255, 255, 0.5)',
      hoverBg: 'rgba(255, 255, 255, 0.1)'
    },
    ghost: {
      background: 'transparent',
      color: 'white',
      border: 'none',
      hoverBg: 'rgba(255, 255, 255, 0.1)'
    },
    custom: {
      background: backgroundColor || 'rgba(255, 255, 255, 0.2)',
      color: textColor || 'white',
      border: borderColor ? `${borderWidth} solid ${borderColor}` : '1px solid rgba(255, 255, 255, 0.3)',
      hoverBg: backgroundColor || 'rgba(255, 255, 255, 0.3)'
    }
  };

  const currentVariant = variantStyles[variant];
  const currentSize = sizeStyles[size];

  const buttonStyle: React.CSSProperties = {
    ...currentSize,
    width: fullWidth ? '100%' : 'auto',
    background: backgroundColor || currentVariant.background,
    color: textColor || currentVariant.color,
    border: borderColor ? `${borderWidth} solid ${borderColor}` : currentVariant.border,
    borderRadius,
    backdropFilter: `brightness(${brightness}) blur(${blur})`,
    WebkitBackdropFilter: `brightness(${brightness}) blur(${blur})`,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    transition: 'all 0.2s ease',
    fontWeight: 600,
    boxShadow: `0 2px 4px rgba(0, 0, 0, 0.1), inset 0 0 ${glowIntensity}px ${glowColor}`,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    outline: 'none',
    position: 'relative',
    overflow: 'hidden'
  };

  return (
    <button
      type={type}
      className={`glass-button glass-button-${variant} ${className}`}
      style={buttonStyle}
      onClick={onClick}
      disabled={disabled}
      data-hover-bg={currentVariant.hoverBg}
      title={title}
    >
      {children}
    </button>
  );
});

export default GlassButton;
