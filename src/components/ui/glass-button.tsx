import React, { ReactNode, useId } from 'react';


interface GlassButtonProps {
  children: ReactNode;
  onClick?: () => void;
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
}

const GlassButton: React.FC<GlassButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  fullWidth = false,
  borderRadius = '12px',
  blur = '10px',
  brightness = 1.1,
  glowColor = 'rgba(255, 255, 255, 0.3)',
  glowIntensity = 6,
  backgroundColor,
  borderColor,
  borderWidth = '1px',
  textColor,
  displacementScale = 50,
  className = '',
  type = 'button'
}) => {
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

  // Generate unique filter ID for each button instance using React's useId hook
  const uniqueId = useId();
  const filterId = `buttonDisplacementFilter-${uniqueId}`;

  const buttonStyle: React.CSSProperties = {
    ...currentSize,
    width: fullWidth ? '100%' : 'auto',
    background: backgroundColor || currentVariant.background,
    color: textColor || currentVariant.color,
    border: borderColor ? `${borderWidth} solid ${borderColor}` : currentVariant.border,
    borderRadius,
    backdropFilter: `brightness(${brightness}) blur(${blur}) url(#${filterId})`,
    WebkitBackdropFilter: `brightness(${brightness}) blur(${blur})`,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    transition: 'all 0.3s ease',
    fontWeight: 600,
    boxShadow: `0 4px 6px rgba(0, 0, 0, 0.1), inset ${glowIntensity}px ${glowIntensity}px 0px -${glowIntensity}px ${glowColor}, inset 0 0 8px 1px ${glowColor}`,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    outline: 'none',
    position: 'relative',
    overflow: 'hidden'
  };

  return (
    <>
      <svg style={{ display: 'none' }}>
        <filter id={filterId}>
          <feTurbulence
            type="turbulence"
            baseFrequency="0.01"
            numOctaves={2}
            result="turbulence"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="turbulence"
            scale={displacementScale}
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </svg>

      <button
        type={type}
        className={`glass-button glass-button-${variant} ${className}`}
        style={buttonStyle}
        onClick={onClick}
        disabled={disabled}
        data-hover-bg={currentVariant.hoverBg}
      >
        {children}
      </button>

      <style>{`
        .glass-button {
          position: relative;
          overflow: hidden;
        }

        .glass-button:hover:not(:disabled) {
          transform: translateY(-2px) scale(1.05);
          box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15), inset ${glowIntensity}px ${glowIntensity}px 0px -${glowIntensity}px ${glowColor}, inset 0 0 8px 1px ${glowColor};
        }

        .glass-button:active:not(:disabled) {
          transform: translateY(0) scale(1);
        }

        .glass-button-primary:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.3);
        }

        .glass-button-secondary:hover:not(:disabled) {
          background: rgba(0, 0, 0, 0.3);
        }

        .glass-button-outline:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.1);
        }

        .glass-button-ghost:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.1);
        }

        .glass-button::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
          transition: left 0.5s;
          z-index: 1;
        }

        .glass-button:hover::before {
          left: 100%;
        }

        .glass-button > * {
          position: relative;
          z-index: 2;
        }
      `}</style>
    </>
  );
};

export default GlassButton;
