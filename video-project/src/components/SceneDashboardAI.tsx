import React from 'react';
import { interpolate, useCurrentFrame, Audio, staticFile } from 'remotion';
import { SubtitleBar } from './SubtitleBar';
import { Badge } from './Badge';
import { Cursor } from './Cursor';

export const SceneDashboardAI: React.FC = () => {
  const frame = useCurrentFrame();

  // Phase selection based on frame timing (Total: 960 frames = 32s)
  // Phase 1 (0 - 200): Dashboard Acme Corp Risk Overview
  // Phase 2 (200 - 380): Sync Telemetry Execution
  // Phase 3 (380 - 520): Multi-Channel Cut (Slack Card + HubSpot Timeline Note)
  // Phase 4 (520 - 740): AI Assistant Dock & Telemetry Query
  // Phase 5 (740 - 960): Fastn Tool Card Actuation -> Handled State Flip!

  let imageSrc = 'frames/02_dashboard_clean.png';
  let cursorX = 1100;
  let cursorY = 270;
  let cursorClicked = false;
  let subtitle = 'Notice Acme Corp: weekly usage dropped sixteen percent, crossing our retention threshold with forty-eight thousand dollars ARR at risk.';
  let badgeLabel = 'LIVE DASHBOARD';
  let badgeDetail = 'Acme Corp $48K ARR at Risk';
  let badgeTone: 'emerald' | 'amber' | 'red' | 'purple' = 'red';

  if (frame < 200) {
    imageSrc = frame < 40 ? 'frames/01_dashboard_initial.png' : 'frames/02_dashboard_clean.png';
    cursorX = interpolate(frame, [0, 80, 150], [960, 420, 420], { extrapolateRight: 'clamp' });
    cursorY = interpolate(frame, [0, 80, 150], [600, 430, 430], { extrapolateRight: 'clamp' });
    cursorClicked = frame > 140 && frame < 160;
    subtitle = 'Notice Acme Corp: weekly usage dropped sixteen percent, crossing our retention threshold with forty-eight thousand dollars ARR at risk.';
    badgeLabel = 'RISK DETECTED';
    badgeDetail = 'Usage ▾ 16% · Health: 38/100';
    badgeTone = 'red';
  } else if (frame < 380) {
    imageSrc = frame < 280 ? 'frames/03_dashboard_syncing.png' : 'frames/04_dashboard_synced.png';
    cursorX = interpolate(frame, [200, 240], [420, 1150], { extrapolateRight: 'clamp' });
    cursorY = interpolate(frame, [200, 240], [430, 260], { extrapolateRight: 'clamp' });
    cursorClicked = frame > 235 && frame < 255;
    subtitle = 'When we trigger Sync Telemetry, Fastn ingests customer telemetry, evaluates the threshold, writes a diagnosis to HubSpot CRM, and alerts Slack and email.';
    badgeLabel = 'AUTONOMOUS SYNC';
    badgeDetail = 'Fastn Runtime Deduplication & Ingestion';
    badgeTone = 'emerald';
  } else if (frame < 520) {
    // Evidence cut-in: Slack Card or HubSpot note
    imageSrc = frame < 450 ? 'evidence/01-slack-card-alpha.png' : 'evidence/03-hubspot-timeline-note.png';
    cursorX = 960;
    cursorY = 540;
    cursorClicked = false;
    subtitle = frame < 450
      ? 'Fastn automatically dispatches an interactive Block Kit alert directly into the tenant-isolated Slack channel #pulseguard-alpha.'
      : 'Simultaneously, Fastn writes the diagnosis and usage drop history directly onto the HubSpot CRM customer timeline.';
    badgeLabel = frame < 450 ? 'SLACK CHANNEL #PULSEGUARD-ALPHA' : 'HUBSPOT CRM TIMELINE';
    badgeDetail = 'Multi-Channel Verified Actuation';
    badgeTone = 'purple';
  } else if (frame < 740) {
    imageSrc = frame < 620 ? 'frames/05_assistant_dock_open.png' : 'frames/06_assistant_risk_analysis.png';
    cursorX = interpolate(frame, [520, 560, 620, 680], [1820, 1850, 1500, 1500], { extrapolateRight: 'clamp' });
    cursorY = interpolate(frame, [520, 560, 620, 680], [980, 990, 780, 780], { extrapolateRight: 'clamp' });
    cursorClicked = (frame > 550 && frame < 570) || (frame > 670 && frame < 690);
    subtitle = 'Opening the AI assistant dock, we ask which account needs attention. The assistant evaluates live telemetry and explains risk in plain English.';
    badgeLabel = 'AI ASSISTANT DOCK';
    badgeDetail = 'Live Telemetry Context Injection';
    badgeTone = 'emerald';
  } else {
    // Tool card execution & handled state flip
    imageSrc = frame < 840 ? 'frames/07_assistant_tool_card.png' : 'frames/08_assistant_closed_loop_complete.png';
    cursorX = interpolate(frame, [740, 780], [1500, 1680], { extrapolateRight: 'clamp' });
    cursorY = interpolate(frame, [740, 780], [780, 620], { extrapolateRight: 'clamp' });
    cursorClicked = frame > 775 && frame < 795;
    subtitle = 'The tool card executes the closed loop on Fastn: the CRM updates, the dashboard flips to Handled, and risk drops to zero.';
    badgeLabel = 'FASTN ACTUATION';
    badgeDetail = 'Workflow wf_4afb70d49708 ✓ Completed';
    badgeTone = 'emerald';
  }

  // Camera zoom effect for dramatic visual focus
  const zoom = interpolate(
    frame,
    [0, 180, 200, 360, 380, 520, 540, 720, 740, 960],
    [1.0, 1.05, 1.0, 1.04, 1.0, 1.0, 1.0, 1.03, 1.0, 1.03],
    { extrapolateRight: 'clamp' }
  );

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
      <Audio src={staticFile('audio/scene1_dashboard_ai.mp3')} />

      <Badge label={badgeLabel} detail={badgeDetail} tone={badgeTone} />

      {/* Main Screen Content with Camera Zoom */}
      <div
        style={{
          width: '100%',
          height: '100%',
          transform: `scale(${zoom})`,
          transformOrigin: '55% 45%',
          transition: 'transform 0.2s ease-out',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <img
          src={staticFile(imageSrc)}
          alt="PulseGuard UI"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
          }}
        />
      </div>

      {/* Spotlight Callout Box on Acme Corp row during Phase 1 */}
      {frame > 30 && frame < 190 && (
        <div
          style={{
            position: 'absolute',
            left: 280,
            top: 385,
            width: 1100,
            height: 60,
            borderRadius: 8,
            border: '2px solid rgba(239, 68, 68, 0.8)',
            boxShadow: '0 0 24px rgba(239, 68, 68, 0.35)',
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Animated Cursor */}
      <Cursor x={cursorX} y={cursorY} clicked={cursorClicked} />

      <SubtitleBar title="LIVE DEMO: DASHBOARD & AI" subtitle={subtitle} />
    </div>
  );
};
