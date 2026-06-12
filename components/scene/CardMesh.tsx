"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, ThreeEvent } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { usePlot } from "@/lib/store";
import { track } from "@/lib/analytics";
import { cardSlide } from "@/lib/audio";
import { PlotCard } from "@/lib/types";
import { livePositions } from "./live";

const TYPE_COLOR: Record<string, string> = {
  stakeholder: "#6b7d4f", // olive
  constraint: "#5d6b75", // slate
  dependency: "#8a6a5c", // clay
  evidence: "#b3a06e", // sand
  option: "#c8bfa8", // pale bone
  risk: "#a85b3c", // rust
};

const CARD_W = 1.9;
const CARD_D = 1.25;
const REST_Y = 0.035;
const BOUNDS = { x: 7.3, zMin: -3.6, zMax: 4.6 };

const tablePlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
const hit = new THREE.Vector3();

export default function CardMesh({ card, index }: { card: PlotCard; index: number }) {
  const group = useRef<THREE.Group>(null!);
  const setPosition = usePlot((s) => s.setPosition);
  const setDragging = usePlot((s) => s.setDragging);
  const setHovered = usePlot((s) => s.setHovered);
  const activeCardId = usePlot((s) => s.activeCardId);
  const isActive = activeCardId === card.id;

  const initial = usePlot.getState().positions[card.id] ?? { x: 0, z: 0 };

  // stable per-card imperfection: cards never sit machine-straight
  const restYaw = useMemo(() => {
    let h = 0;
    for (const ch of card.id) h = (h * 31 + ch.charCodeAt(0)) | 0;
    return ((h % 100) / 100 - 0.5) * 0.14;
  }, [card.id]);

  // mutable animation state, no re-renders during drag
  const st = useRef({
    target: new THREE.Vector3(initial.x, REST_Y, initial.z),
    vel: new THREE.Vector3(),
    y: 7 + index * 0.001,
    vy: 0,
    born: -1,
    delay: index * 0.13,
    dragging: false,
    hovered: false,
    grabOffset: new THREE.Vector2(),
    downAt: 0,
    downX: 0,
    downY: 0,
  });

  useEffect(() => {
    return () => {
      livePositions.delete(card.id);
    };
  }, [card.id]);

  const onDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    try {
      (e.target as Element).setPointerCapture(e.pointerId);
    } catch {
      // synthetic or already-released pointers can't be captured; drag still works
    }
    if (e.ray.intersectPlane(tablePlane, hit)) {
      st.current.grabOffset.set(
        group.current.position.x - hit.x,
        group.current.position.z - hit.z
      );
    }
    st.current.dragging = true;
    st.current.downAt = performance.now();
    st.current.downX = e.clientX;
    st.current.downY = e.clientY;
    setDragging(card.id);
    document.body.style.cursor = "grabbing";
  };

  const onMove = (e: ThreeEvent<PointerEvent>) => {
    if (!st.current.dragging) return;
    e.stopPropagation();
    if (e.ray.intersectPlane(tablePlane, hit)) {
      const s = st.current;
      s.target.x = THREE.MathUtils.clamp(hit.x + s.grabOffset.x, -BOUNDS.x, BOUNDS.x);
      s.target.z = THREE.MathUtils.clamp(hit.z + s.grabOffset.y, BOUNDS.zMin, BOUNDS.zMax);
    }
  };

  const onUp = (e: ThreeEvent<PointerEvent>) => {
    if (!st.current.dragging) return;
    e.stopPropagation();
    st.current.dragging = false;
    setDragging(null);
    document.body.style.cursor = st.current.hovered ? "grab" : "auto";

    // a press that barely moved is a click — pick the card up to read it
    const moved = Math.hypot(
      e.clientX - st.current.downX,
      e.clientY - st.current.downY
    );
    if (moved < 6 && performance.now() - st.current.downAt < 400) {
      usePlot.getState().setInspected(card.id);
      return;
    }

    setPosition(card.id, { x: st.current.target.x, z: st.current.target.z });
    track("card_dragged", { cardId: card.id, type: card.type });
    cardSlide();
  };

  useFrame((state, delta) => {
    const s = st.current;
    const g = group.current;
    if (!g) return;
    const dt = Math.min(delta, 1 / 30);

    // spawn drop with a damped spring bounce
    if (s.born < 0) s.born = state.clock.elapsedTime;
    const alive = state.clock.elapsedTime - s.born - s.delay;
    if (alive < 0) {
      g.visible = false;
      return;
    }
    g.visible = true;

    const lift = s.dragging ? 0.42 : s.hovered || isActive ? 0.22 : 0;
    const restY = REST_Y + lift;

    // vertical spring (handles both the spawn fall and hover lift)
    const ky = 90;
    const cy = s.y > 1 && !s.dragging && !s.hovered ? 9 : 16; // bouncier on spawn
    s.vy += (restY - s.y) * ky * dt - s.vy * cy * dt;
    s.y += s.vy * dt;

    // horizontal pursuit with inertia
    const prevX = g.position.x;
    const prevZ = g.position.z;
    const k = s.dragging ? 18 : 10;
    g.position.x += (s.target.x - g.position.x) * Math.min(1, k * dt);
    g.position.z += (s.target.z - g.position.z) * Math.min(1, k * dt);
    g.position.y = s.y;

    // subtle tilt toward drag direction
    const vx = (g.position.x - prevX) / dt;
    const vz = (g.position.z - prevZ) / dt;
    const tiltTarget = s.dragging || Math.abs(vx) + Math.abs(vz) > 0.05 ? 1 : 0;
    g.rotation.z = THREE.MathUtils.lerp(g.rotation.z, -vx * 0.025 * tiltTarget, 0.15);
    g.rotation.x = THREE.MathUtils.lerp(g.rotation.x, vz * 0.025 * tiltTarget, 0.15);
    // cards straighten while held, settle back to their natural skew
    g.rotation.y = THREE.MathUtils.lerp(g.rotation.y, s.dragging ? 0 : restYaw, 0.08);

    // gentle grow on hover / active
    const scaleTarget = s.dragging ? 1.06 : s.hovered || isActive ? 1.04 : 1;
    const sc = THREE.MathUtils.lerp(g.scale.x, scaleTarget, 0.12);
    g.scale.setScalar(sc);

    livePositions.set(card.id, [g.position.x, g.position.y, g.position.z]);
  });

  const color = TYPE_COLOR[card.type] ?? "#8a8273";

  const html = useMemo(
    () => (
      <Html
        transform
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.041, 0]}
        distanceFactor={3.1}
        pointerEvents="none"
        zIndexRange={[10, 0]}
      >
        <div
          style={{
            width: 232,
            height: 148,
            padding: "12px 14px",
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column",
            gap: 4,
            pointerEvents: "none",
            userSelect: "none",
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-plex-mono)",
              fontSize: 9.5,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "rgba(12,11,9,0.62)",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span>{card.type}</span>
            <span>{card.id}</span>
          </div>
          <div
            style={{
              fontFamily: "var(--font-instrument)",
              fontSize: 21,
              lineHeight: 1.05,
              color: "#15130f",
            }}
          >
            {card.title}
          </div>
          <div
            style={{
              fontFamily: "var(--font-plex-mono)",
              fontSize: 10.5,
              lineHeight: 1.45,
              color: "rgba(12,11,9,0.78)",
              overflow: "hidden",
            }}
          >
            {card.body}
          </div>
        </div>
      </Html>
    ),
    [card]
  );

  return (
    <group ref={group} position={[initial.x, 7, initial.z]}>
      <mesh
        castShadow
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerOver={(e) => {
          e.stopPropagation();
          st.current.hovered = true;
          setHovered(card.id);
          if (!st.current.dragging) document.body.style.cursor = "grab";
        }}
        onPointerOut={() => {
          st.current.hovered = false;
          setHovered(null);
          if (!st.current.dragging) document.body.style.cursor = "auto";
        }}
      >
        <boxGeometry args={[CARD_W, 0.07, CARD_D]} />
        <meshStandardMaterial
          color={color}
          roughness={0.88}
          metalness={0}
          emissive={isActive ? "#ff6b35" : "#000000"}
          emissiveIntensity={isActive ? 0.16 : 0}
        />
      </mesh>
      {/* paper face slightly lighter than the edge */}
      <mesh position={[0, 0.036, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[CARD_W - 0.06, CARD_D - 0.06]} />
        <meshStandardMaterial color="#ded5c2" roughness={0.92} />
      </mesh>
      {/* type color strip along the top edge of the face */}
      <mesh position={[0, 0.037, -CARD_D / 2 + 0.07]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[CARD_W - 0.06, 0.08]} />
        <meshStandardMaterial color={color} roughness={0.9} />
      </mesh>
      {html}
    </group>
  );
}
