import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig, Audio, staticFile } from 'remotion';
import { SubtitleBar } from './SubtitleBar';
import { Badge } from './Badge';

export const SceneIntro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Animations
  const titleOpacity = interpolate(frame, [0, 25], [0, 1], { extrapolateRight: 'clamp' });
  const titleScale = spring({ frame, fps, config: { damping: 14 } });
  
  const radarRotation = (frame * 2.2) % 360;
  const pulseScale = 1 + Math.sin(frame * 0.1) * 0.08;

  // Subtitle timing
  const subText =
    frame < 190
      ? 'Customers rarely cancel out of nowhere — product usage fades weeks earlier.'
      : "This is PulseGuard: an autonomous customer retention engine built entirely on Fastn's governed runtime.";

  return (
    <div
      style={{
        width: 1920,
        height: 1080,
        backgroundColor: '#090B10',
        backgroundImage: `
          radial-gradient(circle at 50% 50%, rgba(16, 185, 129, 0.12) 0%, transparent 60%),
          linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)
        `,
        backgroundSize: '100% 100%, 64px 64px, 64px 64px',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      <Audio src={staticFile('audio/scene0_intro.mp3')} />

      <Badge label="FASTN HACKATHON BATCH 13" detail="150K PKR Target · NUST SEECS" tone="emerald" />

      {/* Radar Sweep Graphics */}
      <div
        style={{
          position: 'absolute',
          width: 650,
          height: 650,
          borderRadius: '50%',
          border: '1px solid rgba(16, 185, 129, 0.2)',
          boxShadow: '0 0 50px rgba(16, 185, 129, 0.05)',
          transform: `scale(${pulseScale})`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            position: 'absolute',
            width: 450,
            height: 450,
            borderRadius: '50%',
            border: '1px dashed rgba(16, 185, 129, 0.3)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            width: 250,
            height: 250,
            borderRadius: '50%',
            border: '1px solid rgba(16, 185, 129, 0.4)',
          }}
        />
        {/* Radar beam line */}
        <div
          style={{
            position: 'absolute',
            width: 325,
            height: 2,
            background: 'linear-gradient(90deg, transparent, #10B981)',
            transformOrigin: '0% 50%',
            left: '50%',
            transform: `rotate(${radarRotation}deg)`,
            boxShadow: '0 0 12px #10B981',
          }}
        />
      </div>

      {/* Center Branding Content */}
      <div
        style={{
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          opacity: titleOpacity,
          transform: `scale(${titleScale})`,
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.35)',
            borderRadius: 30,
            padding: '8px 20px',
            marginBottom: 24,
            boxShadow: '0 4px 20px rgba(16, 185, 129, 0.15)',
          }}
        >
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              backgroundColor: '#10B981',
              boxShadow: '0 0 12px #10B981',
            }}
          />
          <span style={{ color: '#34D399', fontSize: 14, fontWeight: 700, letterSpacing: '0.1em' }}>
            AUTONOMOUS CHURN RADAR & RETENTION
          </span>
        </div>

        <h1
          style={{
            fontSize: 92,
            fontWeight: 900,
            letterSpacing: '-0.04em',
            margin: 0,
            background: 'linear-gradient(135deg, #FFFFFF 30%, #A7F3D0 70%, #10B981 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: '0 10px 40px rgba(16, 185, 129, 0.3)',
          }}
        >
          PulseGuard
        </h1>

        <p
          style={{
            fontSize: 26,
            color: '#94A3B8',
            fontWeight: 400,
            maxWidth: 880,
            margin: '20px 0 36px 0',
            lineHeight: 1.4,
          }}
        >
          Closed-Loop Customer Retention Engine Governed by Fastn Runtime
        </p>

        {/* Feature Badges Grid */}
        <div style={{ display: 'flex', gap: 16 }}>
          {[
            { label: '8 MCP Connectors', value: 'Live Hub' },
            { label: 'Fastn Ack-Loop', value: 'wf_4afb70d49708' },
            { label: 'Multi-Tenant', value: 'Zero Leakage' },
            { label: 'AI Chatbot', value: 'Live Actuation' },
          ].map((pill, i) => (
            <div
              key={i}
              style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: 12,
                padding: '12px 22px',
                textAlign: 'left',
              }}
            >
              <div style={{ fontSize: 12, color: '#64748B', fontWeight: 600 }}>{pill.label}</div>
              <div style={{ fontSize: 16, color: '#F1F5F9', fontWeight: 700, marginTop: 2 }}>
                {pill.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      <SubtitleBar title="PULSEGUARD HOOK" subtitle={subText} />
    </div>
  );
};
