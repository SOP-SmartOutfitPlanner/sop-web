import React, { ReactNode } from 'react';



interface GlassBadgeProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md' | 'lg';
  borderRadius?: string;
  blur?: string;
  dot?: boolean;
  pulse?: boolean;
  className?: string;
  icon?: ReactNode;
}

const GlassBadge: React.FC<GlassBadgeProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  borderRadius = '20px',
  blur = '10px',
  dot = false,
  pulse = false,
  className = '',
  icon
}) => {
  const sizeStyles = {
    sm: { padding: '0.25rem 0.625rem', fontSize: '0.75rem', gap: '0.25rem' },
    md: { padding: '0.375rem 0.875rem', fontSize: '0.875rem', gap: '0.375rem' },
    lg: { padding: '0.5rem 1rem', fontSize: '1rem', gap: '0.5rem' }
  };

  const variantStyles = {
    primary: {
      background: 'rgba(99, 102, 241, 0.4)',
      color: 'white',
      border: '1px solid rgba(99, 102, 241, 0.6)',
      dotColor: 'rgba(99, 102, 241, 1)'
    },
    secondary: {
      background: 'rgba(148, 163, 184, 0.4)',
      color: 'white',
      border: '1px solid rgba(148, 163, 184, 0.6)',
      dotColor: 'rgba(148, 163, 184, 1)'
    },
    success: {
      background: 'rgba(34, 197, 94, 0.4)',
      color: 'white',
      border: '1px solid rgba(34, 197, 94, 0.6)',
      dotColor: 'rgba(34, 197, 94, 1)'
    },
    warning: {
      background: 'rgba(251, 191, 36, 0.4)',
      color: 'white',
      border: '1px solid rgba(251, 191, 36, 0.6)',
      dotColor: 'rgba(251, 191, 36, 1)'
    },
    danger: {
      background: 'rgba(239, 68, 68, 0.4)',
      color: 'white',
      border: '1px solid rgba(239, 68, 68, 0.6)',
      dotColor: 'rgba(239, 68, 68, 1)'
    },
    info: {
      background: 'rgba(59, 130, 246, 0.4)',
      color: 'white',
      border: '1px solid rgba(59, 130, 246, 0.6)',
      dotColor: 'rgba(59, 130, 246, 1)'
    }
  };

  const currentVariant = variantStyles[variant];
  const currentSize = sizeStyles[size];

  const badgeStyle: React.CSSProperties = {
    ...currentSize,
    background: currentVariant.background,
    color: currentVariant.color,
    border: currentVariant.border,
    borderRadius,
    backdropFilter: `blur(${blur})`,
    WebkitBackdropFilter: `blur(${blur})`,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 600,
    whiteSpace: 'nowrap',
    transition: 'all 0.3s ease',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
  };

  const dotSize = size === 'sm' ? '6px' : size === 'md' ? '8px' : '10px';

  return (
    <>
      <span
        className={`glass-badge glass-badge-${variant} ${pulse ? 'glass-badge-pulse' : ''} ${className}`}
        style={badgeStyle}
      >
        {dot && (
          <span 
            className={`glass-badge-dot ${pulse ? 'glass-badge-dot-pulse' : ''}`}
            style={{ 
              width: dotSize, 
              height: dotSize, 
              backgroundColor: currentVariant.dotColor 
            }}
          />
        )}
        {icon && <span className="glass-badge-icon">{icon}</span>}
        {children}
      </span>

      <style>{`
        .glass-badge {
          position: relative;
        }

        .glass-badge-dot {
          border-radius: 50%;
          flex-shrink: 0;
        }

        .glass-badge-dot-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        .glass-badge-pulse {
          animation: badge-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        @keyframes badge-pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }

        .glass-badge-icon {
          display: flex;
          align-items: center;
          justify-content: center;
        }
      `}</style>
    </>
  );
};

export default GlassBadge;