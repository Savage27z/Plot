"use client";

import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { usePlot } from "@/lib/store";

const START = new THREE.Vector3(0, 12.5, 13);
const END = new THREE.Vector3(0, 9.5, 9.5);

export default function CameraDolly() {
  const camera = useThree((s) => s.camera);
  const progress = useRef(0);
  const active = useRef(false);
  const done = useRef(false);
  const prevPhase = useRef(usePlot.getState().phase);

  useEffect(() => {
    return usePlot.subscribe((state) => {
      const phase = state.phase;
      if (phase === prevPhase.current) return;
      prevPhase.current = phase;

      if (phase === "decomposing" && !done.current) {
        camera.position.copy(START);
        active.current = true;
      }
      if (phase === "table" && active.current) {
        progress.current = 0;
      }
    });
  }, [camera]);

  useFrame((_, delta) => {
    if (!active.current || done.current) return;
    progress.current = Math.min(1, progress.current + delta * 0.55);
    const t = 1 - Math.pow(1 - progress.current, 3);
    camera.position.lerpVectors(START, END, t);
    if (progress.current >= 1) {
      done.current = true;
      active.current = false;
    }
  });

  return null;
}
