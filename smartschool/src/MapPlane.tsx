import React from 'react';
import {AbsoluteFill, Img, staticFile, useVideoConfig} from 'remotion';

export type Cam = {cx: number; cy: number; zoom: number; tilt: number; rz: number};

/**
 * A map plate lying on the ground in 3D. The camera is expressed as:
 * look at plate point (cx,cy), from altitude `zoom`, pitched by `tilt`, yawed by `rz`.
 */
export const MapPlane: React.FC<{
  src: string;
  w: number;
  h: number;
  cam: Cam;
  anchorY?: number;
  perspective?: number;
  children?: React.ReactNode;
  style?: React.CSSProperties;
  sx?: number;
  sy?: number;
  ground?: string;
}> = ({src, w, h, cam, anchorY = 600, perspective = 1500, children, style, sx = 0, sy = 0, ground = '#0a0f1a'}) => {
  const {width, height} = useVideoConfig();
  // portrait frames keep the same horizon height relative to the subject, just lower on screen
  const portrait = height > width;
  anchorY += portrait ? (height - 1080) * 0.42 : 0;
  perspective = portrait ? perspective * 1.9 : perspective;
  const tr = `translate3d(${width / 2 + sx}px, ${anchorY + sy}px, 0) rotateX(${cam.tilt}deg) rotateZ(${cam.rz}deg) scale(${cam.zoom}) translate3d(${-cam.cx}px, ${-cam.cy}px, 0)`;
  return (
    <AbsoluteFill style={{perspective, perspectiveOrigin: `50% ${anchorY - 140}px`, overflow: 'hidden', ...style}}>
      <div style={{position: 'absolute', left: 0, top: 0, width: w, height: h, transformOrigin: '0 0', transformStyle: 'preserve-3d', transform: tr}}>
        {/* the plate continues past its edges so the camera never sees the end of the world */}
        <div style={{position: 'absolute', left: -w * 2, top: -h * 2, width: w * 5, height: h * 5, background: ground, transform: 'translateZ(-1px)'}} />
        <Img
          src={staticFile(src)}
          style={{
            position: 'absolute', left: 0, top: 0, width: w, height: h,
            maskImage: 'linear-gradient(to right, transparent, #000 9%, #000 91%, transparent), linear-gradient(to bottom, transparent, #000 9%, #000 91%, transparent)',
            WebkitMaskImage: 'linear-gradient(to right, transparent, #000 9%, #000 91%, transparent), linear-gradient(to bottom, transparent, #000 9%, #000 91%, transparent)',
            maskComposite: 'intersect',
            WebkitMaskComposite: 'source-in',
          }}
        />
        {children}
      </div>
    </AbsoluteFill>
  );
};

/** stands its content up from a ground point and keeps it facing the camera at constant screen size */
export const Billboard: React.FC<{x: number; y: number; cam: Cam; z?: number; children: React.ReactNode; scale?: number}> = ({x, y, cam, z = 0, children, scale = 1}) => (
  <div
    style={{
      position: 'absolute',
      left: x,
      top: y,
      width: 0,
      height: 0,
      transformStyle: 'preserve-3d',
      transform: `translateZ(${z}px) rotateZ(${-cam.rz}deg) rotateX(${-cam.tilt}deg) scale(${scale / cam.zoom})`,
    }}
  >
    {children}
  </div>
);

/** something lying flat on the ground, centred on a plate point (rings, discs) */
export const Ground: React.FC<{x: number; y: number; children: React.ReactNode; z?: number}> = ({x, y, children, z = 1}) => (
  <div style={{position: 'absolute', left: x, top: y, width: 0, height: 0, transform: `translateZ(${z}px)`}}>{children}</div>
);
