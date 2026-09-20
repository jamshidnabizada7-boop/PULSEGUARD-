import React from 'react';
import { interpolate, useCurrentFrame, Audio, staticFile } from 'remotion';
import { SubtitleBar } from './SubtitleBar';
import { Badge } from './Badge';
import { Cursor } from './Cursor';

export const SceneActivity: React.FC = () => {
  const frame = useCurrentFrame();

  let imageSrc = 'frames/13_runs_table.png';
  let badgeLabel = 'ACTIVITY & AUDIT TELEMETRY';
  let badgeDetail = 'Ordered Execution Traces';
  let badgeTone: 'emerald' | 'amber' | 'red' | 'purple' = 'emerald';

  if (frame < 190) {
    imageSrc = 'frames/13_runs_table.png';
    badgeLabel = 'AUDIT LOGS';
    badgeDetail = 'Diagnostic probe · Inbound webhook';
    badgeTone = 'emerald';
  } else if (frame < 320) {
    imageSrc = 'frames/14_runs_expanded.png';
    badgeLabel = 'FASTN PLATFORM DETAILS';
    badgeDetail = 'Org ID: personal_dc05aac8b2c7b361ba84';
    badgeTone = 'purple';
  } else {
    imageSrc = 'evidence/06-fastn-executions-trace.png';
    badgeLabel = 'GOVERNED FASTN RUNTIME';
    badgeDetail = 'Zero Mocked State · 100% Real Traces';
    badgeTone = 'emerald';
  }

  const cursorX = interpolate(
    frame,
    [0, 80, 180, 210, 310],
    [500, 350, 350, 480, 480],
    { extrapolateRight: 'clamp' }
  );
  const cursorY = interpolate(
    frame,
    [0, 80, 180, 210, 310],
    [400, 320, 320, 240, 240],
    { extrapolateRight: 'clamp' }
  );
  const cursorClicked = frame > 185 && frame < 205;

  const subtitle =
    frame < 190
      ? 'On the Activity page, PulseGuard provides a granular audit trail.'
      : 'Every step — from diagnostic probes and inbound webhooks to Fastn runtime executions — is recorded with precise timestamps and tenant isolation.';

  const zoom = interpolate(frame, [0, 180, 320, 450], [1.0, 1.03, 1.0, 1.04], {
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        width: 1920,
        height: 1080,
        backgroundColor: '#090B10',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      <Audio src={staticFile('audio/scene4_activity.mp3')} />

      <Badge label={badgeLabel} detail={badgeDetail} tone={badgeTone} />

      <div
        style={{
          width: '100%',
          height: '100%',
          transform: `scale(${zoom})`,
          transformOrigin: '50% 50%',
          transition: 'transform 0.2s ease-out',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <img
          src={staticFile(imageSrc)}
          alt="Activity Audit"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
          }}
        />
      </div>

      {/* Spotlight on Platform details row */}
      {frame >= 190 && frame < 320 && (
        <div
          style={{
            position: 'absolute',
            left: 280,
            top: 220,
            width: 1360,
            height: 140,
            borderRadius: 8,
            border: '2px solid rgba(139, 92, 246, 0.7)',
            boxShadow: '0 0 25px rgba(139, 92, 246, 0.25)',
            pointerEvents: 'none',
          }}
        />
      )}

      <Cursor x={cursorX} y={cursorY} clicked={cursorClicked} />

      <SubtitleBar title="ACTIVITY & AUDIT TELEMETRY" subtitle={subtitle} />
    </div>
  );
};
