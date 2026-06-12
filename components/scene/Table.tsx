"use client";

import { useMemo } from "react";
import * as THREE from "three";

// Dark wood table with a felt playing field and a barely-visible grid.
export default function Table() {
  const feltTexture = useMemo(() => {
    const size = 1024;
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#15130e";
    ctx.fillRect(0, 0, size, size);
    // felt mottling
    for (let i = 0; i < 9000; i++) {
      const v = Math.random();
      ctx.fillStyle = `rgba(${18 + v * 16}, ${15 + v * 13}, ${10 + v * 9}, 0.45)`;
      ctx.fillRect(Math.random() * size, Math.random() * size, 1.5, 1.5);
    }
    // soft radial warmth at the center where the lamp falls
    const g = ctx.createRadialGradient(size / 2, size / 2, 60, size / 2, size / 2, size * 0.7);
    g.addColorStop(0, "rgba(64, 50, 32, 0.20)");
    g.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
    // barely-visible grid
    ctx.strokeStyle = "rgba(232, 226, 212, 0.035)";
    ctx.lineWidth = 1;
    const step = size / 12;
    for (let i = 0; i <= 12; i++) {
      ctx.beginPath(); ctx.moveTo(i * step, 0); ctx.lineTo(i * step, size); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, i * step); ctx.lineTo(size, i * step); ctx.stroke();
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.anisotropy = 8;
    return tex;
  }, []);

  const woodTexture = useMemo(() => {
    const w = 1024, h = 256;
    const canvas = document.createElement("canvas");
    canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#1c1410";
    ctx.fillRect(0, 0, w, h);
    // long horizontal grain strokes
    for (let i = 0; i < 900; i++) {
      const y = Math.random() * h;
      const v = Math.random();
      ctx.strokeStyle = `rgba(${30 + v * 28}, ${20 + v * 18}, ${12 + v * 10}, ${0.12 + v * 0.18})`;
      ctx.lineWidth = 0.6 + Math.random() * 1.6;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.bezierCurveTo(w * 0.3, y + (Math.random() - 0.5) * 14, w * 0.7, y + (Math.random() - 0.5) * 14, w, y);
      ctx.stroke();
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.anisotropy = 8;
    return tex;
  }, []);

  return (
    <group>
      {/* felt playing field */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]} receiveShadow>
        <planeGeometry args={[15.6, 9.2]} />
        <meshStandardMaterial map={feltTexture} roughness={0.97} metalness={0} />
      </mesh>
      {/* wood rim around the felt */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.004, 0]} receiveShadow>
        <planeGeometry args={[17.4, 10.9]} />
        <meshStandardMaterial map={woodTexture} roughness={0.62} metalness={0.05} />
      </mesh>
      {/* thin warm trim line between felt and wood */}
      <lineSegments position={[0, 0.004, 0]}>
        <edgesGeometry args={[new THREE.PlaneGeometry(15.7, 9.3).rotateX(-Math.PI / 2)]} />
        <lineBasicMaterial color="#6b5132" transparent opacity={0.5} />
      </lineSegments>
      {/* table apron */}
      <mesh position={[0, -0.38, 0]}>
        <boxGeometry args={[17.6, 0.72, 11.1]} />
        <meshStandardMaterial map={woodTexture} color="#7a6a55" roughness={0.7} />
      </mesh>
      {/* legs hinted in the gloom */}
      {[[-8, -5], [8, -5], [-8, 5], [8, 5]].map(([x, z]) => (
        <mesh key={`${x}${z}`} position={[x * 0.95, -1.9, z * 0.95]}>
          <boxGeometry args={[0.5, 2.4, 0.5]} />
          <meshStandardMaterial color="#100d0a" roughness={0.9} />
        </mesh>
      ))}
      {/* floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -3.2, 0]}>
        <planeGeometry args={[80, 80]} />
        <meshStandardMaterial color="#080706" roughness={1} />
      </mesh>
    </group>
  );
}
