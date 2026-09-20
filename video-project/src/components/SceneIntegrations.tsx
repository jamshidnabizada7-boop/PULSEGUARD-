import React from 'react';
import { interpolate, useCurrentFrame, Audio, staticFile } from 'remotion';
import { SubtitleBar } from './SubtitleBar';
import { Badge } from './Badge';
import { Cursor } from './Cursor';

export const SceneIntegrations: React.FC = () => {
  const frame = useCurrentFrame();

  const isPingPhase = frame > 300;
  const imageSrc = isPingPhase ? 'frames/10_integrations_ping_toast.png' : 'frames/09_integrations_catalog.png';

  const cursorX = interpolate(
    frame,
    [0, 100, 260, 310, 450],
    [500, 960, 960, 1480, 1480],
    { extrapolateRight: 'clamp' }
  );
  const cursorY = interpolate(
    frame,
    [0, 100, 260, 310, 450],
    [300, 450, 450, 410, 410],
    { extrapolateRight: 'clamp' }
  );
  const cursorClicked = frame > 295 && frame < 320;

  const subtitle = !isPingPhase
    ? "Navigating to Integrations: Fastn's 8-connector MCP catalog manages live connections across Slack, HubSpot, Gmail, Calendar, Maps, Stripe, and Resend."
    : 'Real-time glowing status pills show operational health, while diagnostic pings verify tenant-isolated routing.';

  const zoom = interpolate(frame, [0, 280, 320, 600], [1.0, 1.03, 1.05, 1.02], {
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
      <Audio src={staticFile('audio/scene2_integrations.mp3')} />

      <Badge
        label="8-CONNECTOR MCP CATALOG"
        detail="Fastn Remote Gateway · Widget wgt_fa0d339f81d4"
        tone="emerald"
      />

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
          alt="Integrations Catalog"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
          }}
        />
      </div>

      {/* Spotlight on 8-Connector Grid */}
      {frame > 30 && frame < 280 && (
        <div
          style={{
            position: 'absolute',
            left: 280,
            top: 260,
            width: 1360,
            height: 520,
            borderRadius: 12,
            border: '2px solid rgba(16, 185, 129, 0.4)',
            boxShadow: '0 0 30px rgba(16, 185, 129, 0.15)',
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Slack Ping Toast highlight */}
      {isPingPhase && (
        <div
          style={{
            position: 'absolute',
            right: 40,
            bottom: 120,
            width: 420,
            height: 70,
            borderRadius: 10,
            border: '2px solid rgba(52, 211, 153, 0.9)',
            boxShadow: '0 0 25px rgba(52, 211, 153, 0.3)',
            pointerEvents: 'none',
          }}
        />
      )}

      <Cursor x={cursorX} y={cursorY} clicked={cursorClicked} />

      <SubtitleBar title="MCP INTEGRATIONS CATALOG" subtitle={subtitle} />
    </div>
  );
};
