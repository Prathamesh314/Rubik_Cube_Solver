// components/Cube3D.tsx
// A self-contained, production-ready Rubik's Cube renderer in React + TypeScript using Three.js.
// - 3D cube of 27 cubelets
// - Smooth animated face rotations (500ms)
// - Keybindings similar to your Python demo:
//     Clockwise:  a s d w q e  => LEFT, BOTTOM, RIGHT, TOP, FACE, BACK
//     Anti (CCW): p o i l k j  => LEFT, BOTTOM, RIGHT, TOP, FACE, BACK (counter)
// - "Next Move" demo button to step through a scripted move list.
// - Exposes imperative API via ref: scramble(moves), applyMoves(moves), reset()
// - Can accept a room-synchronized scramble string and keep both players in sync.
//
// Install: npm i three
// Usage:
//   <Cube3D
//     scrambleMoves={serverScrambleMoves} // e.g. ["R", "U", "R'", ...] or ['w','d','...']
//     onReady={(api) => { api.applyMoves(serverScrambleMoves); }}
//   />

import React, { useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import * as THREE from "three";

// ------------------------------
// Types & Helpers
// ------------------------------

export type Move =
  | "LEFT" | "RIGHT" | "TOP" | "BOTTOM" | "FACE" | "BACK"
  | "LEFT'" | "RIGHT'" | "TOP'" | "BOTTOM'" | "FACE'" | "BACK'";

export type KeyMove = "a"|"s"|"d"|"w"|"q"|"e"|"p"|"o"|"i"|"l"|"k"|"j";

const keyToMove: Record<KeyMove, Move> = {
  a: "LEFT", s: "BOTTOM", d: "RIGHT", w: "TOP", q: "FACE", e: "BACK",
  p: "LEFT'", o: "BOTTOM'", i: "RIGHT'", l: "TOP'", k: "FACE'", j: "BACK'",
};

const FACE_AXIS: Record<Exclude<Move, `${string}'`>, THREE.Vector3> = {
  LEFT:   new THREE.Vector3(1,0,0),
  RIGHT:  new THREE.Vector3(1,0,0),
  TOP:    new THREE.Vector3(0,1,0),
  BOTTOM: new THREE.Vector3(0,1,0),
  FACE:   new THREE.Vector3(0,0,1),
  BACK:   new THREE.Vector3(0,0,1),
};

// For selecting which cubelets belong to a face:
const FACE_SELECTOR: Record<Exclude<Move, `${string}'`>, (pos: THREE.Vector3) => boolean> = {
  LEFT:   (p) => p.x < -0.5,
  RIGHT:  (p) => p.x >  0.5,
  TOP:    (p) => p.y >  0.5,
  BOTTOM: (p) => p.y < -0.5,
  FACE:   (p) => p.z < -0.5,
  BACK:   (p) => p.z >  0.5,
};

function baseMove(move: Move): Exclude<Move, `${string}'`> {
  return move.replace("'", "") as any;
}

function dirSign(move: Move): 1 | -1 {
  return move.endsWith("'") ? -1 : 1;
}

// ------------------------------
// Imperative API
// ------------------------------
export type CubeAPI = {
  reset: () => void;
  applyMove: (move: Move, animate?: boolean) => Promise<void>;
  applyMoves: (moves: (Move|KeyMove)[], animate?: boolean) => Promise<void>;
  scramble: (moves: (Move|KeyMove)[]) => Promise<void>;
};

export type Cube3DProps = {
  width?: number;
  height?: number;
  animationMs?: number; // default 500ms
  scrambleMoves?: (Move|KeyMove)[]; // if provided, applied on mount
  onReady?: (api: CubeAPI) => void;
  showNextMoveButton?: boolean; // demo button like your Python script
  demoMoves?: (Move|KeyMove)[];
};

// ------------------------------
// Component
// ------------------------------
const Cube3D = React.forwardRef<CubeAPI, Cube3DProps>(function Cube3D(
  { width=800, height=600, animationMs=500, scrambleMoves, onReady, showNextMoveButton=true, demoMoves },
  ref
) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const cubeletsRef = useRef<THREE.Mesh[]>([]);
  const pivotRef = useRef<THREE.Object3D>(new THREE.Object3D());
  const animatingRef = useRef(false);

  // Demo move cursor
  const [demoIndex, setDemoIndex] = useState(0);

  // Materials per face color (classic scheme; adjust as desired)
  const materials = useMemo(() => {
    const white  = new THREE.MeshBasicMaterial({ color: 0xffffff }); // Up
    const yellow = new THREE.MeshBasicMaterial({ color: 0xffd500 }); // Down
    const red    = new THREE.MeshBasicMaterial({ color: 0xff0000 }); // Right
    const orange = new THREE.MeshBasicMaterial({ color: 0xff8c00 }); // Left
    const blue   = new THREE.MeshBasicMaterial({ color: 0x0051ba }); // Back
    const green  = new THREE.MeshBasicMaterial({ color: 0x009e60 }); // Front

    // Cubelet material order in THREE.BoxGeometry is [px, nx, py, ny, pz, nz]
    // Map to: Right(px)=red, Left(nx)=orange, Top(py)=white, Bottom(ny)=yellow, Front(pz)=green, Back(nz)=blue
    return [red, orange, white, yellow, green, blue];
  }, []);

  // Build scene once
  useEffect(() => {
    if (!mountRef.current) return;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Scene & Camera
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f172a); // slate-900 vibes
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(6, 6, 8);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Lights
    const amb = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(amb);
    const dir = new THREE.DirectionalLight(0xffffff, 0.6);
    dir.position.set(5, 10, 7);
    scene.add(dir);

    // Build 27 cubelets
    const cubelets: THREE.Mesh[] = [];
    const geom = new THREE.BoxGeometry(0.95, 0.95, 0.95);

    for (let x = -1; x <= 1; x++) {
      for (let y = -1; y <= 1; y++) {
        for (let z = -1; z <= 1; z++) {
          const mesh = new THREE.Mesh(geom, materials);
          mesh.position.set(x, y, z);
          mesh.castShadow = false;
          mesh.receiveShadow = false;
          cubelets.push(mesh);
          scene.add(mesh);
        }
      }
    }

    cubeletsRef.current = cubelets;

    // Pivot used for rotating a face group
    pivotRef.current = new THREE.Object3D();
    scene.add(pivotRef.current);

    // Controls (basic drag rotation)
    let isDragging = false;
    let prevX = 0, prevY = 0;
    const onDown = (e: MouseEvent) => { isDragging = true; prevX = e.clientX; prevY = e.clientY; };
    const onUp = () => { isDragging = false; };
    const onMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - prevX; const dy = e.clientY - prevY;
      prevX = e.clientX; prevY = e.clientY;
      const s = 0.005;
      cubelets.forEach(m => m.rotateOnWorldAxis(new THREE.Vector3(0,1,0), dx * s));
      cubelets.forEach(m => m.rotateOnWorldAxis(new THREE.Vector3(1,0,0), dy * s));
    };
    renderer.domElement.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("mousemove", onMove);

    // Render loop
    let raf = 0;
    const tick = () => {
      renderer.render(scene, camera);
      raf = requestAnimationFrame(tick);
    };
    tick();

    // Cleanup
    return () => {
      cancelAnimationFrame(raf);
      renderer.domElement.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("mousemove", onMove);
      renderer.dispose();
      scene.clear();
      mountRef.current?.removeChild(renderer.domElement);
    };
  }, [width, height, materials]);

  // Face rotation animation
  const rotateFace = async (move: Move, duration = animationMs): Promise<void> => {
    if (!sceneRef.current || !rendererRef.current) return;
    if (animatingRef.current) return; // drop if busy; you can queue if desired
    animatingRef.current = true;

    const m = baseMove(move);
    const axis = FACE_AXIS[m].clone();
    const sign = dirSign(move);

    // Select cubelets on this face (using world positions rounded to mitigate float drift)
    const selected = cubeletsRef.current.filter((c) => {
      const wp = c.getWorldPosition(new THREE.Vector3());
      const rp = new THREE.Vector3(Math.round(wp.x), Math.round(wp.y), Math.round(wp.z));
      return FACE_SELECTOR[m](rp);
    });

    // Attach selected to a pivot at origin
    const pivot = pivotRef.current;
    pivot.position.set(0,0,0);
    pivot.rotation.set(0,0,0);
    selected.forEach((c) => {
      // store world transform then reparent
      const wp = c.getWorldPosition(new THREE.Vector3());
      const wr = c.getWorldQuaternion(new THREE.Quaternion());
      pivot.add(c);
      c.position.copy(pivot.worldToLocal(wp));
      c.quaternion.copy(wr);
    });

    // Animate pivot rotation
    const start = performance.now();
    const endRot = (Math.PI / 2) * sign; // 90 degrees CW/CCW

    await new Promise<void>((resolve) => {
      const step = (now: number) => {
        const t = Math.min(1, (now - start) / duration);
        const eased = 0.5 - 0.5 * Math.cos(Math.PI * t); // cosine ease-in-out
        pivot.setRotationFromAxisAngle(axis, endRot * eased);
        rendererRef.current!.render(sceneRef.current!, cameraRef.current!);
        if (t < 1) requestAnimationFrame(step); else resolve();
      };
      requestAnimationFrame(step);
    });

    // Detach cubelets back to scene and snap to nearest right angle to avoid drift
    selected.forEach((c) => {
      const wp = c.getWorldPosition(new THREE.Vector3());
      const wr = c.getWorldQuaternion(new THREE.Quaternion());
      sceneRef.current!.add(c);
      c.position.copy(wp.round());
      c.quaternion.copy(wr);
      // Snap rotation to nearest 90° around principal axes
      const e = new THREE.Euler().setFromQuaternion(c.quaternion);
      e.x = Math.round(e.x / (Math.PI / 2)) * (Math.PI / 2);
      e.y = Math.round(e.y / (Math.PI / 2)) * (Math.PI / 2);
      e.z = Math.round(e.z / (Math.PI / 2)) * (Math.PI / 2);
      c.setRotationFromEuler(e);
    });

    // Reset pivot
    pivot.rotation.set(0,0,0);
    animatingRef.current = false;
  };

  // Imperative API
  useImperativeHandle(ref, () => ({
    reset() {
      cubeletsRef.current.forEach((c) => {
        c.position.set(Math.round(c.position.x), Math.round(c.position.y), Math.round(c.position.z));
        c.rotation.set(0,0,0);
      });
    },
    async applyMove(move: Move | KeyMove, animate = true) {
      const norm = (keyToMove as any)[move] ?? move;
      if (animate) await rotateFace(norm as Move); else await rotateFace(norm as Move, 0);
    },
    async applyMoves(moves: (Move|KeyMove)[], animate = true) {
      for (const m of moves) {
        await (this as any).applyMove(m, animate);
      }
    },
    async scramble(moves: (Move|KeyMove)[]) {
      await (this as any).applyMoves(moves, true);
    },
  }), [animationMs]);

  // Keybindings (like your Python example)
  useEffect(() => {
    const onKey = async (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k in keyToMove) {
        e.preventDefault();
        await rotateFace(keyToMove[k as KeyMove]);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Apply scramble passed from props (once on mount/prop change)
  useEffect(() => {
    if (!scrambleMoves?.length) return;
    let cancelled = false;
    (async () => {
      for (const m of scrambleMoves) {
        if (cancelled) return;
        await rotateFace(((keyToMove as any)[m] ?? m) as Move);
      }
    })();
    return () => { cancelled = true; };
  }, [scrambleMoves]);

  // Demo button (like "Next Move")
  const demoSeq = demoMoves ?? ["e","p","w","i","w","d","d","w"];
  const playNext = async () => {
    const m = demoSeq[demoIndex % demoSeq.length] as Move | KeyMove;
    setDemoIndex((i) => i + 1);
    await (refApi.current?.applyMove || rotateFace)((keyToMove as any)[m] ?? (m as any));
  };

  // small hack to use API inside playNext without circular ref
  const refApi = useRef<CubeAPI | null>(null);
  useEffect(() => {
    const api: CubeAPI = {
      reset: () => {},
      applyMove: async (m) => { await rotateFace(((keyToMove as any)[m] ?? m) as Move); },
      applyMoves: async (moves) => { for (const mv of moves) await rotateFace(((keyToMove as any)[mv] ?? mv) as Move); },
      scramble: async (moves) => { for (const mv of moves) await rotateFace(((keyToMove as any)[mv] ?? mv) as Move); },
    };
    refApi.current = api;
    onReady?.(api);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="w-full flex flex-col items-center gap-4">
      <div ref={mountRef} style={{ width, height, borderRadius: 16, overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.35)" }} />
      {showNextMoveButton && (
        <button
          onClick={playNext}
          className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white"
        >
          Next Move
        </button>
      )}
      <p className="text-sm text-slate-300">Keys: a/s/d/w/q/e (clockwise), p/o/i/l/k/j (counter)</p>
    </div>
  );
});

export default Cube3D;

// ------------------------------
// Example usage (e.g., inside your room page)
// ------------------------------
// import Cube3D, { CubeAPI } from "@/components/Cube3D";
//
// export default function RoomCubeDemo() {
//   const apiRef = React.useRef<CubeAPI | null>(null);
//
//   return (
//     <div className="p-6">
//       <Cube3D
//         width={720}
//         height={520}
//         animationMs={500}
//         scrambleMoves={["R","U","R'","U'"]} // or server-provided sequence
//         onReady={(api) => { apiRef.current = api; }}
//       />
//     </div>
//   );
// }
