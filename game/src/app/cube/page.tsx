// "use client";

// import { useEffect, useRef } from "react";
// import { initRubiksCube } from "@/components/cube";
// import { Player } from "@/modals/player";

// // Two different cubes: left is solved (interactive), right is scrambled (view-only)
// export default function Page() {
//   const leftRef = useRef<HTMLDivElement | null>(null);
//   const rightRef = useRef<HTMLDivElement | null>(null);

//   useEffect(() => {
//     // Solved state [U, R, F, D, L, B], values: 1..6
//     const solved: number[][][] = [
//       [ [6,6,6],[6,6,6],[6,6,6] ], // U (white)
//       [ [1,1,1],[1,1,1],[1,1,1] ], // R (red)
//       [ [2,2,2],[2,2,2],[2,2,2] ], // F (green)
//       [ [4,4,4],[4,4,4],[4,4,4] ], // D (yellow)
//       [ [5,5,5],[5,5,5],[5,5,5] ], // L (orange)
//       [ [3,3,3],[3,3,3],[3,3,3] ], // B (blue)
//     ];

//     // A simple "scrambled" state for demonstration
//     // (real scramble would call to a scramble generator)
//     const scrambled: number[][][] = [
//       [ [6,1,3],[2,6,1],[5,3,6] ], // U
//       [ [4,1,2],[1,1,6],[3,4,2] ], // R
//       [ [2,2,5],[6,2,3],[4,5,2] ], // F
//       [ [4,3,4],[1,4,3],[6,6,4] ], // D
//       [ [5,5,1],[3,5,4],[1,2,5] ], // L
//       [ [3,4,6],[5,3,5],[2,1,3] ], // B
//     ];

//     const colorMap = {
//       1: "#C41E3A", // Red
//       2: "#009B48", // Green
//       3: "#0051BA", // Blue
//       4: "#FFD500", // Yellow
//       5: "#FF5800", // Orange
//       6: "#FFFFFF", // White
//     };

//     let leftApi: any = null;
//     let rightApi: any = null;

//     // Example player and participant data (could be dynamic in a real app)
//     const player1 = {
//       player_id: "ea87af09-c5c8-4650-863b-5cf3e736e056",
//       username: "guest-ea87af",
//       player_state: "waiting",
//       rating: 1200,
//       total_wins: 0,
//       win_percentage: 0,
//       top_speed_to_solve_cube: {},
//     };
//     const player2 = {
//       player_id: "dec3c00a-d8b9-4875-ac9d-3f76728cfb2f",
//       username: "guest-dec3c0",
//       player_state: "waiting",
//       rating: 1200,
//       total_wins: 0,
//       win_percentage: 0,
//       top_speed_to_solve_cube: {},
//     };

//     // Participants array (could be multiple, but for demo just 2)
//     const participants = [player1 as Player, player2 as Player];

//     // Left cube: interactive/rotatable
//     if (leftRef.current) {
//       // Pass wsRef as null since not used here
//       leftApi = initRubiksCube(
//         leftRef.current,
//         solved,
//         colorMap,
//         null,           // wsRef
//         player1 as Player,        // player
//         null,           // room
//         participants,   // participants
//         { controlsEnabled: true }  // options
//       );
//     }
//     // Right cube: not rotatable (view only)
//     if (rightRef.current) {
//       rightApi = initRubiksCube(
//         rightRef.current,
//         scrambled,
//         colorMap,
//         null,           // wsRef
//         player2 as Player,        // player
//         null,           // room
//         participants,   // participants
//         { controlsEnabled: false }  // disables orbit/keyboard controls
//       );
//     }

//     return () => {
//       if (leftApi) leftApi.dispose();
//       if (rightApi) rightApi.dispose();
//     };
//   }, []);

//   return (
//     <div className="min-h-[100dvh] flex flex-col">
//       <div className="p-4 text-lg font-semibold">
//         Rubik Cubes
//         <div className="text-sm font-normal opacity-60">
//           Only the <b>left</b> cube can be rotated and controlled. The <b>right</b> cube is view-only.
//         </div>
//       </div>
//       <div style={{ flex: 1, display: "flex", alignItems: "stretch" }}>
//         {/* Left cube (solved, interactive) */}
//         <div
//           ref={leftRef}
//           style={{
//             width: "50%",
//             height: "calc(100dvh - 96px)",
//             minWidth: 250,
//             background: "#2222",
//             display: "flex",
//             alignItems: "flex-start",
//             justifyContent: "flex-start",
//           }}
//         />
//         {/* Right cube (scrambled, not rotatable) */}
//         <div
//           ref={rightRef}
//           style={{
//             width: "50%",
//             height: "calc(100dvh - 96px)",
//             minWidth: 250,
//             background: "#2222",
//             display: "flex",
//             alignItems: "flex-end",
//             justifyContent: "flex-end",
//           }}
//         />
//       </div>
//       <div className="p-3 text-sm opacity-75">
//         Controls: Drag to orbit, wheel to zoom. Press U R F D L B for CW. Hold
//         Shift for CCW. <br />
//         <span className="opacity-60">(Only the left cube responds to controls.)</span>
//       </div>
//     </div>
//   );
// }

import RubiksCubeViewer from '@/components/RubiksCubeViewer'
import React from 'react'

const page = () => {
  const scrambled: number[][][] = [
    [[6, 1, 3], [2, 6, 1], [5, 3, 6]], // Back
    [[4, 1, 2], [1, 1, 6], [3, 4, 2]], // Up
    [[2, 2, 5], [6, 2, 3], [4, 5, 2]], // Front
    [[4, 3, 4], [1, 4, 3], [6, 6, 4]], // Down
    [[5, 5, 1], [3, 5, 4], [1, 2, 5]], // Left
    [[3, 4, 6], [5, 3, 5], [2, 1, 3]], // Right
  ];
  return (
    <div>
      <RubiksCubeViewer cube={scrambled} />
    </div>
  );
}

export default page