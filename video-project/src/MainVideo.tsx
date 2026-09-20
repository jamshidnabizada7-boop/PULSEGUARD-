import React from 'react';
import { Sequence, Audio, staticFile } from 'remotion';
import { SceneIntro } from './components/SceneIntro';
import { SceneDashboardAI } from './components/SceneDashboardAI';
import { SceneIntegrations } from './components/SceneIntegrations';
import { SceneEmails } from './components/SceneEmails';
import { SceneActivity } from './components/SceneActivity';
import { SceneClosing } from './components/SceneClosing';

export const MainVideo: React.FC = () => {
  return (
    <div
      style={{
        flex: 1,
        backgroundColor: '#090B10',
        width: 1920,
        height: 1080,
      }}
    >
      {/* Ambient background tech audio pad */}
      <Audio src={staticFile('audio/ambient_tech.mp3')} volume={0.08} />

      {/* 1. Hook & Intro (0:00 - 0:14, 420 frames) */}
      <Sequence from={0} durationInFrames={420} name="Intro & Hook">
        <SceneIntro />
      </Sequence>

      {/* 2. Live Dashboard & AI Chatbot Centerpiece (0:14 - 0:46, 960 frames) */}
      <Sequence from={420} durationInFrames={960} name="Dashboard & AI Centerpiece">
        <SceneDashboardAI />
      </Sequence>

      {/* 3. Integrations & 8-Connector MCP Catalog (0:46 - 1:06, 600 frames) */}
      <Sequence from={1380} durationInFrames={600} name="MCP Integrations">
        <SceneIntegrations />
      </Sequence>

      {/* 4. Email Operations & Delivery Stepper (1:06 - 1:22, 480 frames) */}
      <Sequence from={1980} durationInFrames={480} name="Email Operations">
        <SceneEmails />
      </Sequence>

      {/* 5. Activity & Audit Telemetry (1:22 - 1:37, 450 frames) */}
      <Sequence from={2460} durationInFrames={450} name="Activity Audit">
        <SceneActivity />
      </Sequence>

      {/* 6. Closing & Enterprise Architecture (1:37 - 1:55, 540 frames) */}
      <Sequence from={2910} durationInFrames={540} name="Architecture & Closing">
        <SceneClosing />
      </Sequence>
    </div>
  );
};
