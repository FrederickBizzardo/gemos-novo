/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface Point3D {
  x: number;
  y: number;
  z: number;
}

const generateGemPoints = () => {
  const points: Point3D[] = [];
  // Top peak
  points.push({ x: 0, y: -3, z: 0 });
  
  // High Facets
  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2;
    points.push({ x: Math.cos(angle) * 1.5, y: -1.5, z: Math.sin(angle) * 1.5 });
  }

  // Middle Girdle (Widest part)
  for (let i = 0; i < 24; i++) {
    const angle = (i / 24) * Math.PI * 2;
    points.push({ x: Math.cos(angle) * 3, y: 0, z: Math.sin(angle) * 3 });
  }

  // Low Facets
  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2;
    points.push({ x: Math.cos(angle) * 1.5, y: 1.5, z: Math.sin(angle) * 1.5 });
  }

  // Bottom peak
  points.push({ x: 0, y: 3, z: 0 });

  // Connective structures (Internal "sparkle" points)
  for (let i = 0; i < 50; i++) {
    const r = Math.random() * 2.5;
    const a = Math.random() * Math.PI * 2;
    const y = (Math.random() - 0.5) * 4;
    points.push({ x: Math.cos(a) * r, y: y, z: Math.sin(a) * r });
  }

  return points;
};

const gemPoints = generateGemPoints();

export const RotatingGem: React.FC = () => {
  const [rotation, setRotation] = useState(0);
  const size = 15;
  const chars = [' ', '.', '·', '°', ':', '!', '*', '#', '$', '@'];

  useEffect(() => {
    const interval = setInterval(() => {
      setRotation(prev => (prev + 0.03) % (Math.PI * 2));
    }, 40);
    return () => clearInterval(interval);
  }, []);

  const render = () => {
    const width = 50;
    const height = 25;
    const buffer = Array(width * height).fill(' ');
    const zBuffer = Array(width * height).fill(-Infinity);

    const cosR = Math.cos(rotation);
    const sinR = Math.sin(rotation);
    const cosX = Math.cos(0.4); // Constant tilt
    const sinX = Math.sin(0.4);

    gemPoints.forEach((p) => {
      // Rotation around Y
      let ytx = p.x * cosR - p.z * sinR;
      let ytz = p.x * sinR + p.z * cosR;
      
      // Tilt around X
      let ty = p.y * cosX - ytz * sinX;
      let tz = p.y * sinX + ytz * cosX;

      // Project
      const scale = 6;
      const x = Math.floor(width / 2 + ytx * scale);
      const y = Math.floor(height / 2 + ty * (scale * 0.5));

      if (x >= 0 && x < width && y >= 0 && y < height) {
        const idx = y * width + x;
        if (tz > zBuffer[idx]) {
          zBuffer[idx] = tz;
          const brightness = (tz + 4) / 8;
          const charIdx = Math.floor(brightness * (chars.length - 1));
          buffer[idx] = chars[Math.max(0, Math.min(chars.length - 1, charIdx))];
        }
      }
    });

    let res = "";
    for (let i = 0; i < height; i++) {
      res += buffer.slice(i * width, i * width + width).join('') + "\n";
    }
    return res;
  };

  return (
    <pre className="font-mono text-cyan-400 select-none leading-none text-[10px] md:text-sm">
      {render()}
    </pre>
  );
};
