"use client";

import { useEffect, useRef } from "react";
import { initRubiksCube } from "@/components/cube";

// Two different cubes: left is solved (interactive), right is scrambled (view-only)
export default function Page() {
  const leftRef = useRef<HTMLDivElement | null>(null);
  const rightRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Solved state [U, R, F, D, L, B], values: 1..6
    const solved: number[][][] = [
      [ [6,6,6],[6,6,6],[6,6,6] ], // U (white)
      [ [1,1,1],[1,1,1],[1,1,1] ], // R (red)
      [ [2,2,2],[2,2,2],[2,2,2] ], // F (green)
      [ [4,4,4],[4,4,4],[4,4,4] ], // D (yellow)
      [ [5,5,5],[5,5,5],[5,5,5] ], // L (orange)
      [ [3,3,3],[3,3,3],[3,3,3] ], // B (blue)
    ];

    // A simple "scrambled" state for demonstration
    // (real scramble would call to a scramble generator)
    const scrambled: number[][][] = [
      [ [6,1,3],[2,6,1],[5,3,6] ], // U
      [ [4,1,2],[1,1,6],[3,4,2] ], // R
      [ [2,2,5],[6,2,3],[4,5,2] ], // F
      [ [4,3,4],[1,4,3],[6,6,4] ], // D
      [ [5,5,1],[3,5,4],[1,2,5] ], // L
      [ [3,4,6],[5,3,5],[2,1,3] ], // B
    ];

    const colorMap = {
      1: "#C41E3A", // Red
      2: "#009B48", // Green
      3: "#0051BA", // Blue
      4: "#FFD500", // Yellow
      5: "#FF5800", // Orange
      6: "#FFFFFF", // White
    };

    let leftApi: any = null;
    let rightApi: any = null;

    // Left cube: interactive/rotatable
    if (leftRef.current) {
      leftApi = initRubiksCube(leftRef.current, solved, colorMap, { controlsEnabled: true });
    }
    // Right cube: not rotatable (view only)
    if (rightRef.current) {
      rightApi = initRubiksCube(
        rightRef.current,
        scrambled,
        colorMap,
        { controlsEnabled: false }  // disables orbit/keyboard controls
      );
    }

    return () => {
      if (leftApi) leftApi.dispose();
      if (rightApi) rightApi.dispose();
    };
  }, []);

  return (
    <div className="min-h-[100dvh] flex flex-col">
      <div className="p-4 text-lg font-semibold">
        Rubik Cubes
        <div className="text-sm font-normal opacity-60">
          Only the <b>left</b> cube can be rotated and controlled. The <b>right</b> cube is view-only.
        </div>
      </div>
      <div style={{ flex: 1, display: "flex", alignItems: "stretch" }}>
        {/* Left cube (solved, interactive) */}
        <div
          ref={leftRef}
          style={{
            width: "50%",
            height: "calc(100dvh - 96px)",
            minWidth: 250,
            background: "#2222",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "flex-start",
          }}
        />
        {/* Right cube (scrambled, not rotatable) */}
        <div
          ref={rightRef}
          style={{
            width: "50%",
            height: "calc(100dvh - 96px)",
            minWidth: 250,
            background: "#2222",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "flex-end",
          }}
        />
      </div>
      <div className="p-3 text-sm opacity-75">
        Controls: Drag to orbit, wheel to zoom. Press U R F D L B for CW. Hold
        Shift for CCW. <br />
        <span className="opacity-60">(Only the left cube responds to controls.)</span>
      </div>
    </div>
  );
}
