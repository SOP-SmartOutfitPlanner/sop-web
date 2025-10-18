import React, { useEffect, useRef, ReactNode } from 'react';
import interact from 'interactjs';

interface Position {
  x: number;
  y: number;
}

interface GlassCardProps {
  children: ReactNode;
  draggable?: boolean;
  borderRadius?: string;
  padding?: string;
  blur?: string;
  brightness?: number;
  shadowColor?: string;
  shadowIntensity?: number;
  glowColor?: string;
  glowIntensity?: number;
  borderColor?: string;
  borderWidth?: string;
  className?: string;
  displacementScale?: number;
  width?: string;
  height?: string;
}

const GlassCard: React.FC<GlassCardProps> = ({
  children,
  draggable = false,
  borderRadius = '28px',
  padding = '2rem',
  blur = '2px',
  brightness = 1.1,
  shadowColor = 'rgba(0, 0, 0, 0.37)',
  shadowIntensity = 46,
  glowColor = 'rgba(255, 255, 255, 0.7)',
  glowIntensity = 6,
  borderColor,
  borderWidth = '1px',
  className = '',
  displacementScale = 200,
  width = 'auto',
  height = 'auto'
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const positionRef = useRef<Position>({ x: 0, y: 0 });

  useEffect(() => {
    if (draggable && cardRef.current) {
      interact(cardRef.current).draggable({
        listeners: {
          move(event: Interact.DragEvent) {
            positionRef.current.x += event.dx;
            positionRef.current.y += event.dy;

            const target = event.target as HTMLElement;
            target.style.transform =
              `translate(${positionRef.current.x}px, ${positionRef.current.y}px)`;
          },
        }
      });
    }

    return () => {
      if (cardRef.current) {
        interact(cardRef.current).unset();
      }
    };
  }, [draggable]);

  const cardStyle: React.CSSProperties = {
    width,
    height,
    padding,
    borderRadius,
    filter: `drop-shadow(-8px -10px ${shadowIntensity}px ${shadowColor})`,
    backdropFilter: `brightness(${brightness}) blur(${blur}) url(#displacementFilter)`,
    cursor: draggable ? 'move' : 'default',
    touchAction: draggable ? 'none' : 'auto',
  };

  const beforeStyle: React.CSSProperties = {
    borderRadius,
    boxShadow: `inset ${glowIntensity}px ${glowIntensity}px 0px -${glowIntensity}px ${glowColor}, inset 0 0 8px 1px ${glowColor}`,
    ...(borderColor && {
      border: `${borderWidth} solid ${borderColor}`,
    }),
  };

  return (
    <>
      <div
        ref={cardRef}
        className={`glass-card ${className}`}
        style={cardStyle}
      >
        <div className="glass-card-before" style={beforeStyle} />
        <div className="glass-card-content">
          {children}
        </div>
      </div>

      <svg style={{ display: 'none' }}>
        <filter id="displacementFilter">
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

      <style>{`
        .glass-card {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
          transition: opacity 0.26s ease-out;
          user-select: none;
        }

        .glass-card-before {
          content: '';
          position: absolute;
          inset: 0;
          z-index: 0;
          overflow: hidden;
          pointer-events: none;
        }

        .glass-card-content {
          position: relative;
          z-index: 1;
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: center;
          gap: 1.5rem;
          width: 100%;
        }

        .dock-icon {
          width: 80px;
          height: 80px;
          transition: transform 0.3s ease;
        }

        .dock-icon:hover {
          transform: scale(1.2) translateY(-10px);
        }

        @media (max-width: 640px) {
          .dock-icon {
            width: 60px;
            height: 60px;
          }
        }
      `}</style>
    </>
  );
};

export default GlassCard;
