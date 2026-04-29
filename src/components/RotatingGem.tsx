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
  const chars = [' ', '.', ':', '-', '=', '+', '*', '#', '%', '@'];

  useEffect(() => {
    const interval = setInterval(() => {
      setRotation(prev => (prev + 0.05) % (Math.PI * 2));
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const render = () => {
    const width = 40;
    const height = 20;
    const buffer = Array(width * height).fill(' ');
    const zBuffer = Array(width * height).fill(-Infinity);

    const cosR = Math.cos(rotation);
    const sinR = Math.sin(rotation);

    gemPoints.forEach((p) => {
      // Rotate around Y axis
      let tx = p.x * cosR - p.z * sinR;
      let tz = p.x * sinR + p.z * cosR;
      
      // Project
      const scale = 5;
      const x = Math.floor(width / 2 + tx * scale);
      const y = Math.floor(height / 2 + p.y * (scale * 0.8));

      if (x >= 0 && x < width && y >= 0 && y < height) {
        const idx = y * width + x;
        if (tz > zBuffer[idx]) {
          zBuffer[idx] = tz;
          const charIdx = Math.floor(((tz + 3) / 6) * (chars.length - 1));
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
