"use client";

import React, { useEffect, useRef, useState } from 'react';

interface CursorPosition {
  x: number;
  y: number;
}

const GlassCursor: React.FC = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<CursorPosition>({ x: -100, y: -100 });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      setIsVisible(true);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <>
      <div
        ref={cursorRef}
        className="glass-cursor"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          opacity: isVisible ? 1 : 0,
        }}
      >
        <div className="glass-cursor-inner" />
      </div>

      <svg style={{ display: 'none' }}>
        <filter id="cursorDisplacementFilter">
          <feTurbulence
            type="turbulence"
            baseFrequency="0.02"
            numOctaves={3}
            result="turbulence"
            seed={2}
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="turbulence"
            scale={30}
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </svg>

      <style>{`
        * {
          cursor: none !important;
        }

        .glass-cursor {
          position: fixed;
          width: 32px;
          height: 32px;
          pointer-events: none;
          z-index: 9999;
          transform: translate(-50%, -50%);
          transition: opacity 0.2s ease;
        }

        .glass-cursor-inner {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: brightness(1.2) blur(0px) url(#cursorDisplacementFilter);
          border: 2px solid rgba(255, 255, 255, 0.4);
          box-shadow:
            inset 4px 4px 0px -4px rgba(255, 255, 255, 0.8),
            inset 0 0 8px 1px rgba(255, 255, 255, 0.6),
            0 0 20px rgba(255, 255, 255, 0.3),
            -8px -10px 25px rgba(0, 0, 0, 0.2);
          transition: transform 0.15s ease-out;
        }

        .glass-cursor:hover .glass-cursor-inner {
          transform: scale(1.2);
        }
      `}</style>
    </>
  );
};

export default GlassCursor;
