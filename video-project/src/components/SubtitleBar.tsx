import React from 'react';

interface SubtitleBarProps {
  title?: string;
  subtitle: string;
}

export const SubtitleBar: React.FC<SubtitleBarProps> = ({ title, subtitle }) => {
  return (
    <div
      style={{
        position: 'absolute',
        bottom: 40,
        left: '50%',
        transform: 'translateX(-50%)',
        maxWidth: 1200,
        width: '85%',
        background: 'rgba(11, 15, 25, 0.88)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(16, 185, 129, 0.3)',
        borderRadius: 14,
        padding: '16px 28px',
        display: 'flex',
        alignItems: 'center',
        gap: 18,
        boxShadow: '0 16px 36px rgba(0, 0, 0, 0.6), 0 0 20px rgba(16, 185, 129, 0.15)',
        zIndex: 9000,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          background: 'rgba(16, 185, 129, 0.15)',
          border: '1px solid rgba(16, 185, 129, 0.4)',
          borderRadius: 8,
          padding: '6px 12px',
          color: '#34D399',
          fontWeight: 700,
          fontSize: 13,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          whiteSpace: 'nowrap',
        }}
      >
        <span
          style={{
            width: 7,
            height: 7,
            borderRadius: '50%',
            backgroundColor: '#10B981',
            boxShadow: '0 0 8px #10B981',
          }}
        />
        {title || 'PULSEGUARD AI'}
      </div>

      <div
        style={{
          color: '#F9FAFB',
          fontSize: 19,
          fontWeight: 500,
          lineHeight: 1.45,
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          textShadow: '0 2px 4px rgba(0,0,0,0.5)',
        }}
      >
        {subtitle}
      </div>
    </div>
  );
};
