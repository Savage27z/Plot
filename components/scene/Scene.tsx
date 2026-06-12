"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { usePlot } from "@/lib/store";
import Table from "./Table";
import CardMesh from "./CardMesh";
import Orb from "./Orb";
import Beam from "./Beam";
import { Chair, Dust, Lamp } from "./Atmosphere";
import { ORB_POS } from "./live";

export default function Scene() {
  const cards = usePlot((s) => s.cards);
  const draggingId = usePlot((s) => s.draggingId);

  return (
    <div className="absolute inset-0">
      <Canvas
        dpr={[1, 1.5]}
        shadows
        camera={{ position: [0, 9.5, 9.5], fov: 42 }}
        gl={{ antialias: true, powerPreference: "high-performance" }}
      >
        <color attach="background" args={["#0c0b09"]} />
        <fog attach="fog" args={["#0c0b09", 16, 32]} />

        {/* the lamp is the key light — warm cone over the table center */}
        <spotLight
          position={[0, 3.85, 0]}
          angle={1.2}
          penumbra={0.6}
          intensity={150}
          color="#ffd9a8"
          castShadow
          shadow-mapSize={[768, 768]}
          shadow-bias={-0.0004}
        />
        {/* faint fill so the table edges don't go fully dead */}
        <spotLight position={[0, 12, 4]} angle={0.7} penumbra={1} intensity={70} color="#c9b89a" />
        {/* cool rim from behind the orb */}
        <directionalLight position={[-6, 4, -10]} intensity={0.3} color="#5d6b75" />
        <ambientLight intensity={0.1} color="#c9b89a" />

        <Table />
        <Lamp />
        <Dust />
        <Chair position={[ORB_POS[0], 0, ORB_POS[2] - 0.55]} />
        {cards.map((card, i) => (
          <CardMesh key={card.id} card={card} index={i} />
        ))}
        <Orb />
        <Beam />

        <OrbitControls
          enabled={!draggingId}
          enablePan={false}
          target={[0, 0, 0]}
          minDistance={9}
          maxDistance={16}
          minPolarAngle={0.55}
          maxPolarAngle={1.12}
          minAzimuthAngle={-0.45}
          maxAzimuthAngle={0.45}
          enableDamping
          dampingFactor={0.08}
        />
      </Canvas>
    </div>
  );
}
