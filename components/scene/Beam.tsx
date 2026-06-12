"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { usePlot } from "@/lib/store";
import { livePositions, ORB_POS } from "./live";

const SEGMENTS = 40;

// Ember beam that draws on from the orb to the card under discussion,
// plus an iris spotlight on that card.
export default function Beam() {
  const activeCardId = usePlot((s) => s.activeCardId);
  const phase = usePlot((s) => s.phase);
  const lineRef = useRef<THREE.Line>(null!);
  const spotRef = useRef<THREE.SpotLight>(null!);
  const targetRef = useRef<THREE.Object3D>(null!);
  const progress = useRef(0);
  const lastCard = useRef<string | null>(null);

  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute(
      "position",
      new THREE.BufferAttribute(new Float32Array((SEGMENTS + 1) * 3), 3)
    );
    return g;
  }, []);

  const visible = !!activeCardId && (phase === "speaking" || phase === "verdict");

  useFrame((state, delta) => {
    const line = lineRef.current;
    const spot = spotRef.current;
    if (!line || !spot) return;

    if (activeCardId !== lastCard.current) {
      progress.current = 0; // re-draw the beam for each new card
      lastCard.current = activeCardId;
    }

    if (!visible || !activeCardId) {
      line.visible = false;
      spot.intensity = THREE.MathUtils.lerp(spot.intensity, 0, 0.12);
      return;
    }
    const end = livePositions.get(activeCardId);
    if (!end) {
      line.visible = false;
      return;
    }

    progress.current = Math.min(1, progress.current + delta * 1.8);
    const p = 1 - Math.pow(1 - progress.current, 3); // ease-out draw-on

    const start = new THREE.Vector3(ORB_POS[0], ORB_POS[1] - 0.1, ORB_POS[2]);
    const target = new THREE.Vector3(end[0], end[1] + 0.12, end[2]);
    const mid = start.clone().lerp(target, 0.5);
    mid.y += 1.3;
    const curve = new THREE.QuadraticBezierCurve3(start, mid, target);

    const attr = line.geometry.getAttribute("position") as THREE.BufferAttribute;
    for (let i = 0; i <= SEGMENTS; i++) {
      const t = (i / SEGMENTS) * p;
      const v = curve.getPoint(t);
      // faint shimmer along the beam
      v.y += Math.sin(state.clock.elapsedTime * 7 + i * 0.7) * 0.012 * t;
      attr.setXYZ(i, v.x, v.y, v.z);
    }
    attr.needsUpdate = true;
    line.visible = true;
    (line.material as THREE.LineBasicMaterial).opacity = 0.25 + p * 0.5;

    // iris the spotlight open once the beam lands
    spot.position.set(end[0], 5.4, end[2] + 0.4);
    targetRef.current.position.set(end[0], 0, end[2]);
    spot.target = targetRef.current;
    const open = p > 0.92 ? 1 : 0;
    spot.intensity = THREE.MathUtils.lerp(spot.intensity, open * 130, 0.09);
    spot.angle = THREE.MathUtils.lerp(spot.angle, open ? 0.3 : 0.05, 0.09);
  });

  return (
    <group>
      {/* @ts-expect-error three line vs svg line element */}
      <line ref={lineRef} geometry={geometry} frustumCulled={false}>
        <lineBasicMaterial
          color="#ff6b35"
          transparent
          opacity={0}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </line>
      <spotLight
        ref={spotRef}
        color="#ffb38a"
        intensity={0}
        angle={0.05}
        penumbra={0.6}
        distance={12}
        decay={1.4}
      />
      <object3D ref={targetRef} />
    </group>
  );
}
