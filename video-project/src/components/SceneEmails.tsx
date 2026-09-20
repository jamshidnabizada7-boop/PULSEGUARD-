import React from 'react';
import { interpolate, useCurrentFrame, Audio, staticFile } from 'remotion';
import { SubtitleBar } from './SubtitleBar';
import { Badge } from './Badge';
import { Cursor } from './Cursor';

export const SceneEmails: React.FC = () => {
  const frame = useCurrentFrame();

  const isModalPhase = frame > 190;
  const imageSrc = isModalPhase ? 'frames/12_emails_modal.png' : 'frames/11_emails_table.png';

  const cursorX = interpolate(
    frame,
    [0, 100, 180, 220, 380],
    [400, 750, 750, 960, 960],
    { extrapolateRight: 'clamp' }
  );
  const cursorY = interpolate(
    frame,
    [0, 100, 180, 220, 380],
    [300, 360, 360, 480, 480],
    { extrapolateRight: 'clamp' }
  );
  const cursorClicked = frame > 180 && frame < 205;

  const subtitle = !isModalPhase
    ? 'In our Email Operations console, every outbound retention alert is tracked with full auditability.'
    : 'Opening the decoupled Email Reader reveals a live delivery stepper from sent to delivered, alongside the exact visual alert rendered for account owners.';

  const zoom = interpolate(frame, [0, 180, 210, 480], [1.0, 1.02, 1.05, 1.03], {
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
      <Audio src={staticFile('audio/scene3_emails.mp3')} />

      <Badge
        label="EMAIL OPERATIONS CONSOLE"
        detail="Decoupled Modal · Delivery Stepper"
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
          alt="Email Operations"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
          }}
        />
      </div>

      {/* Spotlight on the Delivery Stepper when modal is open */}
      {isModalPhase && (
        <div
          style={{
            position: 'absolute',
            left: 550,
            top: 240,
            width: 820,
            height: 90,
            borderRadius: 8,
            border: '2px solid rgba(16, 185, 129, 0.6)',
            boxShadow: '0 0 25px rgba(16, 185, 129, 0.2)',
            pointerEvents: 'none',
          }}
        />
      )}

      <Cursor x={cursorX} y={cursorY} clicked={cursorClicked} />

      <SubtitleBar title="EMAIL AUDIT & DELIVERY STEPPER" subtitle={subtitle} />
    </div>
  );
};
