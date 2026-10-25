// 3D motion-graphic scene registry (skill: 3d-motion-graphics). One entry per scene file.
// A scene component takes {kind, start}: `kind` picks the shot inside the file, `start` is the absolute
// cut-timeline second the shot starts at (scenes animate on absolute word times from words.json).
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {SchoolGfx} from '../SchoolGfx';
import {WinterGfx} from './WinterGfx';
import {PremiumGfx} from './PremiumGfx';

// `end` and `cues` (absolute word times, resolved by pipeline.py long) are optional extras for long-video scenes.
export type GfxProps = {kind: string; start: number; end?: number; cues?: number[]};

export const GFX_SCENES: Record<string, React.FC<GfxProps>> = {
  school: SchoolGfx as unknown as React.FC<GfxProps>, // jobs/school-video-editor
  winter: WinterGfx as unknown as React.FC<GfxProps>, // jobs/winter-glow-up (long) v1, superseded
  premium: PremiumGfx as unknown as React.FC<GfxProps>, // product-style 3D: hourglass, bullion
};

export const Gfx: React.FC<GfxProps & {scene?: string}> = ({scene = 'school', ...p}) => {
  const C = GFX_SCENES[scene];
  return C ? <C {...p} /> : <AbsoluteFill style={{background: 'black'}} />;
};

// Standalone clip: render one shot to a silent mp4 to use as plain B-roll in any edit (longs, voice-edit).
// props: {scene, kind, start, end}; duration comes from end-start (see Root.tsx calculateMetadata).
export type GfxClipProps = {scene: string; kind: string; start: number; end: number};
export const GfxClip: React.FC<GfxClipProps> = ({scene, kind, start}) => <Gfx scene={scene} kind={kind} start={start} />;
