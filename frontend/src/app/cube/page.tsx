// filepath: src/app/cube/page.tsx
"use client";

import { useEffect, useRef } from "react";
import { initRubiksCube } from "@/components/cube";

export default function Page() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Example solved state [U, R, F, D, L, B] with values 1..6
    const solved: number[][][] = [
      [ [6,6,6],[6,6,6],[6,6,6] ], // U (white)
      [ [1,1,1],[1,1,1],[1,1,1] ], // R (red)
      [ [2,2,2],[2,2,2],[2,2,2] ], // F (green)
      [ [4,4,4],[4,4,4],[4,4,4] ], // D (yellow)
      [ [5,5,5],[5,5,5],[5,5,5] ], // L (orange)
      [ [3,3,3],[3,3,3],[3,3,3] ], // B (blue)
    ];

    const colorMap = {
      1: "#C41E3A", // Red
      2: "#009B48", // Green
      3: "#0051BA", // Blue
      4: "#FFD500", // Yellow
      5: "#FF5800", // Orange
      6: "#FFFFFF", // White
    };

    const api = initRubiksCube(containerRef.current, solved, colorMap);

    // Example: programmatic turns after mount
    // (async () => { await api.turn("U", true); await api.turn("R", false); })();

    return () => api.dispose();
  }, []);

  return (
    <div className="min-h-[100dvh] flex flex-col">
      <div className="p-4 text-lg font-semibold">Rubik Cube</div>
      <div
        ref={containerRef}
        style={{ width: "100%", height: "calc(100dvh - 56px)" }}
      />
      <div className="p-3 text-sm opacity-75">
        Controls: Drag to orbit, wheel to zoom. Press U R F D L B for CW. Hold
        Shift for CCW.
      </div>
    </div>
  );
}
