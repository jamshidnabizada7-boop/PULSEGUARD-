import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

interface CursorProps {
  x: number;
  y: number;
  clicked?: boolean;
}

export const Cursor: React.FC<CursorProps> = ({ x, y, clicked = false }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const clickScale = clicked
    ? interpolate(frame % 30, [0, 5, 15], [1, 0.8, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      })
    : 1;

  const rippleScale = clicked
    ? interpolate(frame % 30, [0, 20], [0.5, 2.5], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      })
    : 0;

  const rippleOpacity = clicked
    ? interpolate(frame % 30, [0, 15, 25], [0.8, 0.4, 0], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      })
    : 0;

  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        pointerEvents: 'none',
        zIndex: 9999,
        transform: `scale(${clickScale})`,
        transition: 'transform 0.1s ease-out',
      }}
    >
      {/* Click ripple wave */}
      {clicked && (
        <div
          style={{
            position: 'absolute',
            left: -16,
            top: -16,
            width: 36,
            height: 36,
            borderRadius: '50%',
            border: '2px solid #10B981',
            opacity: rippleOpacity,
            transform: `scale(${rippleScale})`,
          }}
        />
      )}
      {/* SVG Cursor Pointer */}
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          filter: 'drop-shadow(0px 3px 6px rgba(0,0,0,0.7))',
        }}
      >
        <path
          d="M3 3L10.07 20.97L13.58 13.58L20.97 10.07L3 3Z"
          fill="#10B981"
          stroke="#FFFFFF"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};
