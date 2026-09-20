import React from 'react';
import { Composition } from 'remotion';
import { MainVideo } from './MainVideo';

export const Root: React.FC = () => {
  return (
    <>
      <Composition
        id="PulseGuardDemo"
        component={MainVideo}
        durationInFrames={3450}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
