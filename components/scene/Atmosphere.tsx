"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const COUNT = 110;

// Dust motes drifting in the lamp light — cheap, huge atmosphere win.
export function Dust() {
  const points = useRef<THREE.Points>(null!);

  const { positions, seeds } = useMemo(() => {
    const positions = new Float32Array(COUNT * 3);
    const seeds = new Float32Array(COUNT);
    for (let i = 0; i < COUNT; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 11;
      positions[i * 3 + 1] = 0.2 + Math.random() * 4.6;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 7;
      seeds[i] = Math.random() * 100;
    }
    return { positions, seeds };
  }, []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const attr = points.current.geometry.getAttribute("position") as THREE.BufferAttribute;
    for (let i = 0; i < COUNT; i++) {
      const s = seeds[i];
      attr.array[i * 3] = positions[i * 3] + Math.sin(t * 0.07 + s) * 0.8;
      attr.array[i * 3 + 1] =
        positions[i * 3 + 1] + Math.sin(t * 0.05 + s * 2) * 0.5;
      attr.array[i * 3 + 2] = positions[i * 3 + 2] + Math.cos(t * 0.06 + s) * 0.6;
    }
    attr.needsUpdate = true;
  });

  return (
    <points ref={points} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions.slice(), 3]} />
      </bufferGeometry>
      <pointsMaterial
        color="#ffd9a8"
        size={0.022}
        transparent
        opacity={0.35}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// The strategist's chair — empty, pulled slightly back from the far side.
// The orb hovers above it; the chair implies the presence.
export function Chair({ position }: { position: [number, number, number] }) {
  const wood = "#3a2f26";
  return (
    <group position={position} rotation={[0, 0.18, 0]}>
      {/* seat */}
      <mesh position={[0, -0.5, 0]} castShadow>
        <boxGeometry args={[1.15, 0.09, 1.05]} />
        <meshStandardMaterial color={wood} roughness={0.85} />
      </mesh>
      {/* backrest uprights */}
      {[-0.48, 0.48].map((x) => (
        <mesh key={x} position={[x, 0.25, -0.48]}>
          <boxGeometry args={[0.09, 1.6, 0.09]} />
          <meshStandardMaterial color={wood} roughness={0.85} />
        </mesh>
      ))}
      {/* backrest slats */}
      {[0.45, 0.75].map((y) => (
        <mesh key={y} position={[0, y, -0.48]}>
          <boxGeometry args={[1.05, 0.16, 0.06]} />
          <meshStandardMaterial color={wood} roughness={0.85} />
        </mesh>
      ))}
      {/* legs down into the gloom */}
      {[[-0.48, -0.42], [0.48, -0.42], [-0.48, 0.42], [0.48, 0.42]].map(([x, z]) => (
        <mesh key={`${x}${z}`} position={[x, -1.85, z]}>
          <boxGeometry args={[0.09, 2.7, 0.09]} />
          <meshStandardMaterial color="#241d17" roughness={0.9} />
        </mesh>
      ))}
      {/* the seat catches a faint pool of shadow where a sitter would be */}
      <mesh position={[0, -0.45, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.42, 24]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.35} />
      </mesh>
    </group>
  );
}

// The hanging lamp over the table — cord, shade, glowing bulb.
export function Lamp() {
  return (
    <group position={[0, 3.9, 0]}>
      {/* cord up into darkness */}
      <mesh position={[0, 3.2, 0]}>
        <cylinderGeometry args={[0.015, 0.015, 6.4, 6]} />
        <meshStandardMaterial color="#1a1713" roughness={0.9} />
      </mesh>
      {/* shade */}
      <mesh position={[0, 0.18, 0]}>
        <coneGeometry args={[0.62, 0.5, 32, 1, true]} />
        <meshStandardMaterial
          color="#231d16"
          roughness={0.6}
          metalness={0.35}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* glowing bulb */}
      <mesh position={[0, 0.02, 0]}>
        <sphereGeometry args={[0.09, 16, 16]} />
        <meshStandardMaterial
          color="#fff3dd"
          emissive="#ffd9a8"
          emissiveIntensity={6}
        />
      </mesh>
      {/* warm halo around the bulb */}
      <pointLight color="#ffd9a8" intensity={3} distance={3} decay={2} />
    </group>
  );
}
