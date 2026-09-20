import React from 'react';

interface BadgeProps {
  label: string;
  detail?: string;
  tone?: 'emerald' | 'amber' | 'red' | 'purple';
}

export const Badge: React.FC<BadgeProps> = ({ label, detail, tone = 'emerald' }) => {
  const colors = {
    emerald: { bg: 'rgba(16, 185, 129, 0.15)', border: 'rgba(16, 185, 129, 0.4)', text: '#34D399', dot: '#10B981' },
    amber: { bg: 'rgba(245, 158, 11, 0.15)', border: 'rgba(245, 158, 11, 0.4)', text: '#FBBF24', dot: '#F59E0B' },
    red: { bg: 'rgba(239, 68, 68, 0.15)', border: 'rgba(239, 68, 68, 0.4)', text: '#F87171', dot: '#EF4444' },
    purple: { bg: 'rgba(139, 92, 246, 0.15)', border: 'rgba(139, 92, 246, 0.4)', text: '#A78BFA', dot: '#8B5CF6' },
  }[tone];

  return (
    <div
      style={{
        position: 'absolute',
        top: 24,
        right: 32,
        background: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(12px)',
        border: `1px solid ${colors.border}`,
        borderRadius: 10,
        padding: '8px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
        zIndex: 8000,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          backgroundColor: colors.dot,
          boxShadow: `0 0 10px ${colors.dot}`,
        }}
      />
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: colors.text, letterSpacing: '0.04em' }}>
          {label}
        </span>
        {detail && <span style={{ fontSize: 11, color: '#94A3B8' }}>{detail}</span>}
      </div>
    </div>
  );
};
