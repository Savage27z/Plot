import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Plot — see your decision";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          background: "#0c0b09",
          position: "relative",
        }}
      >
        {/* ember glow */}
        <div
          style={{
            position: "absolute",
            width: 320,
            height: 320,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(255,107,53,0.5) 0%, rgba(255,107,53,0.12) 45%, transparent 70%)",
            top: 80,
            right: 200,
          }}
        />
        {/* scattered card hints */}
        {[
          { x: 140, y: 180, rot: -5, color: "#6b7d4f", label: "stakeholder" },
          { x: 900, y: 400, rot: 4, color: "#a85b3c", label: "risk" },
          { x: 180, y: 420, rot: 3, color: "#b3a06e", label: "evidence" },
          { x: 820, y: 140, rot: -3, color: "#5d6b75", label: "constraint" },
        ].map((c) => (
          <div
            key={c.label}
            style={{
              position: "absolute",
              left: c.x,
              top: c.y,
              width: 110,
              height: 72,
              background: "#ded5c2",
              border: "1px solid rgba(12,11,9,0.1)",
              display: "flex",
              flexDirection: "column",
              padding: "8px 10px",
              transform: `rotate(${c.rot}deg)`,
              opacity: 0.55,
            }}
          >
            <div style={{ width: "100%", height: 3, background: c.color, marginBottom: 6 }} />
            <span style={{ fontSize: 8, color: "rgba(12,11,9,0.5)", letterSpacing: "0.2em", textTransform: "uppercase" as const }}>
              {c.label}
            </span>
          </div>
        ))}
        {/* center text */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", zIndex: 10 }}>
          <span style={{ fontSize: 22, color: "#ff6b35", letterSpacing: "0.35em", textTransform: "uppercase" as const }}>
            a war room for product decisions
          </span>
          <span style={{ fontSize: 96, color: "#e8e2d4", marginTop: 12, lineHeight: 1 }}>
            See your decision.
          </span>
          <span style={{ fontSize: 18, color: "rgba(232,226,212,0.45)", marginTop: 24, letterSpacing: "0.25em", textTransform: "uppercase" as const }}>
            plot — built for world product day 2026
          </span>
        </div>
      </div>
    ),
    { ...size }
  );
}
