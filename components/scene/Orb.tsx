"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { usePlot } from "@/lib/store";
import { ORB_POS } from "./live";

// The strategist: a glowing ember orb at the far side of the table.
// Ember orange is reserved for it alone.
export default function Orb() {
  const group = useRef<THREE.Group>(null!);
  const core = useRef<THREE.Mesh>(null!);
  const halo = useRef<THREE.Mesh>(null!);
  const light = useRef<THREE.PointLight>(null!);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const phase = usePlot.getState().phase;
    const speaking = phase === "speaking" || phase === "verdict";
    const thinking = phase === "reading" || phase === "decomposing";

    if (group.current) {
      group.current.position.y = ORB_POS[1] + Math.sin(t * 0.9) * 0.12;
    }
    // breathing glow; quickens while thinking, swells while speaking
    const pulse = thinking
      ? 0.5 + Math.sin(t * 6) * 0.3
      : speaking
        ? 0.85 + Math.sin(t * 2.2) * 0.18
        : 0.55 + Math.sin(t * 1.3) * 0.12;

    if (light.current) light.current.intensity = 14 + pulse * 26;
    if (core.current) {
      const m = core.current.material as THREE.MeshStandardMaterial;
      m.emissiveIntensity = 1.6 + pulse * 1.6;
      const s = 1 + pulse * 0.06;
      core.current.scale.setScalar(s);
    }
    if (halo.current) {
      const m = halo.current.material as THREE.MeshBasicMaterial;
      m.opacity = 0.1 + pulse * 0.12;
      halo.current.scale.setScalar(1 + pulse * 0.18);
      halo.current.lookAt(state.camera.position);
    }
  });

  return (
    <group ref={group} position={ORB_POS}>
      <mesh ref={core}>
        <sphereGeometry args={[0.42, 32, 32]} />
        <meshStandardMaterial
          color="#2a130a"
          emissive="#ff6b35"
          emissiveIntensity={2}
          roughness={0.4}
          fog={false}
        />
      </mesh>
      <mesh ref={halo}>
        <circleGeometry args={[0.95, 48]} />
        <meshBasicMaterial
          color="#ff6b35"
          transparent
          opacity={0.14}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          fog={false}
        />
      </mesh>
      <pointLight ref={light} color="#ff6b35" intensity=
        {20} distance={14} decay={1.8} />
    </group>
  );
}
