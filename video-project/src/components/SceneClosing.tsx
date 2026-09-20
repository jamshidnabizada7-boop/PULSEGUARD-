import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig, Audio, staticFile } from 'remotion';
import { SubtitleBar } from './SubtitleBar';
import { Badge } from './Badge';

export const SceneClosing: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const isArchPhase = frame < 220;

  const cardOpacity = interpolate(frame, [200, 240], [0, 1], { extrapolateRight: 'clamp' });
  const cardScale = spring({
    frame: Math.max(0, frame - 220),
    fps,
    config: { damping: 14 },
  });

  const subtitle = isArchPhase
    ? "Behind PulseGuard is an enterprise architecture orchestrated through Fastn's MCP gateway with strict multi-tenant security."
    : 'Explore our live deployment on Vercel and our open-source GitHub repository. PulseGuard: from telemetry to retained customers, powered by Fastn.';

  return (
    <div
      style={{
        width: 1920,
        height: 1080,
        backgroundColor: '#090B10',
        backgroundImage: `
          radial-gradient(circle at 50% 50%, rgba(16, 185, 129, 0.1) 0%, transparent 65%),
          linear-gradient(rgba(255, 255, 255, 0.025) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255, 255, 255, 0.025) 1px, transparent 1px)
        `,
        backgroundSize: '100% 100%, 64px 64px, 64px 64px',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      <Audio src={staticFile('audio/scene5_closing.mp3')} />

      <Badge label="ENTERPRISE ARCHITECTURE" detail="100% Agent Built via Fastn MCP" tone="emerald" />

      {/* Architecture / Tenant Beta Phase */}
      {isArchPhase ? (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          <img
            src={staticFile('frames/15_tenant_beta_isolated.png')}
            alt="Tenant Beta Isolation"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              filter: 'brightness(0.95)',
            }}
          />
          {/* Overlay Architecture Flow Banner */}
          <div
            style={{
              position: 'absolute',
              top: 140,
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              background: 'rgba(15, 23, 42, 0.92)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              borderRadius: 12,
              padding: '12px 24px',
              boxShadow: '0 12px 32px rgba(0,0,0,0.7)',
            }}
          >
            {[
              'Telemetry Event (drop -16%)',
              'Fastn Runtime (x-end-org-id)',
              'fastn.state Deduplication',
              'Unified CRM API',
              'HubSpot & Slack Card',
              'Fastn Ack Loop',
            ].map((step, idx) => (
              <React.Fragment key={idx}>
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: idx === 1 || idx === 5 ? '#34D399' : '#F1F5F9',
                  }}
                >
                  {step}
                </span>
                {idx < 5 && (
                  <span style={{ color: '#64748B', fontWeight: 900, fontSize: 14 }}>&rarr;</span>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      ) : (
        /* Grand Finale Card */
        <div
          style={{
            zIndex: 10,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            opacity: cardOpacity,
            transform: `scale(${cardScale})`,
            maxWidth: 1100,
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              background: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              borderRadius: 30,
              padding: '8px 24px',
              marginBottom: 20,
              boxShadow: '0 0 24px rgba(16, 185, 129, 0.2)',
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
            <span style={{ color: '#34D399', fontSize: 15, fontWeight: 700, letterSpacing: '0.08em' }}>
              FASTN HACKATHON BATCH 13 SUBMISSION
            </span>
          </div>

          <h1
            style={{
              fontSize: 84,
              fontWeight: 900,
              letterSpacing: '-0.04em',
              margin: '0 0 12px 0',
              background: 'linear-gradient(135deg, #FFFFFF 20%, #6EE7B7 60%, #10B981 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 10px 40px rgba(16, 185, 129, 0.3)',
            }}
          >
            PulseGuard
          </h1>

          <p
            style={{
              fontSize: 24,
              color: '#CBD5E1',
              fontWeight: 500,
              margin: '0 0 32px 0',
            }}
          >
            From Telemetry to Retained Customers — Governed by Fastn
          </p>

          {/* Submission Info Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 16,
              width: '100%',
              marginBottom: 32,
            }}
          >
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: 14,
                padding: '18px 24px',
                textAlign: 'left',
              }}
            >
              <div style={{ fontSize: 12, color: '#64748B', fontWeight: 600 }}>LIVE DEPLOYMENT</div>
              <div
                style={{
                  fontSize: 17,
                  color: '#34D399',
                  fontWeight: 700,
                  marginTop: 4,
                  fontFamily: 'monospace',
                }}
              >
                https://pulseguard-app-nu.vercel.app
              </div>
            </div>

            <div
              style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: 14,
                padding: '18px 24px',
                textAlign: 'left',
              }}
            >
              <div style={{ fontSize: 12, color: '#64748B', fontWeight: 600 }}>GITHUB REPOSITORY</div>
              <div
                style={{
                  fontSize: 17,
                  color: '#60A5FA',
                  fontWeight: 700,
                  marginTop: 4,
                  fontFamily: 'monospace',
                }}
              >
                github.com/jamshidnabizada7-boop/PULSEGUARD-
              </div>
            </div>

            <div
              style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: 14,
                padding: '18px 24px',
                textAlign: 'left',
              }}
            >
              <div style={{ fontSize: 12, color: '#64748B', fontWeight: 600 }}>FASTN ORG ID</div>
              <div
                style={{
                  fontSize: 17,
                  color: '#F1F5F9',
                  fontWeight: 700,
                  marginTop: 4,
                  fontFamily: 'monospace',
                }}
              >
                personal_dc05aac8b2c7b361ba84
              </div>
            </div>

            <div
              style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: 14,
                padding: '18px 24px',
                textAlign: 'left',
              }}
            >
              <div style={{ fontSize: 12, color: '#64748B', fontWeight: 600 }}>TEAM & TARGET</div>
              <div style={{ fontSize: 17, color: '#F59E0B', fontWeight: 700, marginTop: 4 }}>
                hackathon-aryan · 150K PKR Target (NUST SEECS)
              </div>
            </div>
          </div>
        </div>
      )}

      <SubtitleBar title="PULSEGUARD CLOSING" subtitle={subtitle} />
    </div>
  );
};
