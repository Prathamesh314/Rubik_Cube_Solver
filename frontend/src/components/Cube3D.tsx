// components/Cube3D.tsx
"use client";

import React, { useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import * as THREE from "three";

/* =============================================================================
   Shared Cube Model + Scramble Helpers (merged from src/game/cube.ts)
============================================================================= */

export type ColorName = "White" | "Red" | "Yellow" | "Orange" | "Green" | "Blue";

// Match your Python color codes
export const COLORS: Record<ColorName, number> = {
  White: 4,
  Red: 6,
  Yellow: 2,
  Orange: 5,
  Green: 3,
  Blue: 1,
};

// Face indices in the same order as Python: ["Back","Top","Face","Bottom","Left","Right"]
export const DIRS = { Back: 0, Top: 1, Face: 2, Bottom: 3, Left: 4, Right: 5 } as const;
export type DirName = keyof typeof DIRS;

export const OPPOSITE_COLOR: Record<ColorName, ColorName> = {
  White: "Yellow",
  Yellow: "White",
  Red: "Orange",
  Orange: "Red",
  Green: "Blue",
  Blue: "Green",
};

export const ORDERS: DirName[] = ["Back", "Top", "Face", "Bottom", "Left", "Right"];

export type Face = number[][];           // 3x3
export type CubeState = [Face, Face, Face, Face, Face, Face]; // Back,Top,Face,Bottom,Left,Right

export function newSolvedCube(): CubeState {
  const FACE_COLOR: Record<DirName, number> = {
    Back: COLORS.Blue,
    Top: COLORS.White,
    Face: COLORS.Green,
    Bottom: COLORS.Yellow,
    Left: COLORS.Orange,
    Right: COLORS.Red,
  };

  const mkFace = (c: number): Face => [[c, c, c],[c, c, c],[c, c, c]];
  return [
    mkFace(FACE_COLOR.Back),
    mkFace(FACE_COLOR.Top),
    mkFace(FACE_COLOR.Face),
    mkFace(FACE_COLOR.Bottom),
    mkFace(FACE_COLOR.Left),
    mkFace(FACE_COLOR.Right),
  ];
}

// --- Moves & scramble (shared with client) -----------------------------------

export type MoveBase = "LEFT" | "RIGHT" | "TOP" | "BOTTOM" | "FACE" | "BACK";
export type Move = MoveBase | `${MoveBase}'`;
export type KeyMove = "a"|"s"|"d"|"w"|"q"|"e"|"p"|"o"|"i"|"l"|"k"|"j";

export const ALL_BASE_MOVES: MoveBase[] = ["LEFT","RIGHT","TOP","BOTTOM","FACE","BACK"];

const OPP_FACE: Record<MoveBase, MoveBase> = {
  LEFT: "RIGHT",
  RIGHT: "LEFT",
  TOP: "BOTTOM",
  BOTTOM: "TOP",
  FACE: "BACK",
  BACK: "FACE",
};

export function inverse(m: Move): Move {
  return m.endsWith("'") ? (m.slice(0, -1) as MoveBase) : (`${m}'` as Move);
}
export function baseOf(m: Move): MoveBase {
  return (m.endsWith("'") ? m.slice(0, -1) : m) as MoveBase;
}

/** Generate a legal scramble move list. */
export function generateScrambledMoves(length = 20): Move[] {
  const moves: Move[] = [];
  const variants: Move[] = ALL_BASE_MOVES.flatMap(m => [m, `${m}'` as Move]);

  while (moves.length < length) {
    const cand = variants[Math.floor(Math.random() * variants.length)];
    const last = moves[moves.length - 1];
    const prev = moves[moves.length - 2];

    // no same-face twice or immediate inverse
    if (last && (baseOf(cand) === baseOf(last) || cand === inverse(last))) continue;
    // optional: prevent A -> opposite(A) -> A pattern
    if (prev && baseOf(prev) === baseOf(cand) && baseOf(last) === OPP_FACE[baseOf(cand)]) continue;

    moves.push(cand);
  }
  return moves;
}

/** Returns a simple payload you can attach to a room and broadcast to both players. */
export function generateScrambledCube(length = 20): { moves: Move[] } {
  return { moves: generateScrambledMoves(length) };
}

/* =============================================================================
   3D Renderer (React + Three.js)
============================================================================= */

// keybindings (like your Python demo)
const keyToMove: Record<KeyMove, Move> = {
  a: "LEFT", s: "BOTTOM", d: "RIGHT", w: "TOP", q: "FACE", e: "BACK",
  p: "LEFT'", o: "BOTTOM'", i: "RIGHT'", l: "TOP'", k: "FACE'", j: "BACK'",
};

const FACE_AXIS: Record<MoveBase, THREE.Vector3> = {
  LEFT:   new THREE.Vector3(1,0,0),
  RIGHT:  new THREE.Vector3(1,0,0),
  TOP:    new THREE.Vector3(0,1,0),
  BOTTOM: new THREE.Vector3(0,1,0),
  FACE:   new THREE.Vector3(0,0,1),
  BACK:   new THREE.Vector3(0,0,1),
};

// select cubelets belonging to a face
const FACE_SELECTOR: Record<MoveBase, (pos: THREE.Vector3) => boolean> = {
  LEFT:   (p) => p.x < -0.5,
  RIGHT:  (p) => p.x >  0.5,
  TOP:    (p) => p.y >  0.5,
  BOTTOM: (p) => p.y < -0.5,
  FACE:   (p) => p.z < -0.5,
  BACK:   (p) => p.z >  0.5,
};

function dirSign(move: Move): 1 | -1 {
  return move.endsWith("'") ? -1 : 1;
}

// ---------- Imperative API ----------
export type CubeAPI = {
  reset: () => void;
  applyMove: (move: Move | KeyMove, animate?: boolean) => Promise<void>;
  applyMoves: (moves: (Move|KeyMove)[], animate?: boolean) => Promise<void>;
  scramble: (moves: (Move|KeyMove)[]) => Promise<void>;
  /** Generate & (optionally) apply a scramble locally */
  generateScrambledCube: (length?: number, apply?: boolean) => Promise<Move[]>;
};

export type Cube3DProps = {
  width?: number;
  height?: number;
  animationMs?: number;            // default 500
  scrambleMoves?: (Move|KeyMove)[]; // moves from server (keeps players in sync)
  onReady?: (api: CubeAPI) => void;
  showNextMoveButton?: boolean;
  demoMoves?: (Move|KeyMove)[];
};

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

  const [demoIndex, setDemoIndex] = useState(0);

  // materials per face (classic)
  const materials = useMemo(() => {
    const white  = new THREE.MeshBasicMaterial({ color: 0xffffff }); // Top
    const yellow = new THREE.MeshBasicMaterial({ color: 0xffd500 }); // Bottom
    const red    = new THREE.MeshBasicMaterial({ color: 0xff0000 }); // Right
    const orange = new THREE.MeshBasicMaterial({ color: 0xff8c00 }); // Left
    const blue   = new THREE.MeshBasicMaterial({ color: 0x0051ba }); // Back
    const green  = new THREE.MeshBasicMaterial({ color: 0x009e60 }); // Front
    // THREE.BoxGeometry index order: [px, nx, py, ny, pz, nz]
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
    scene.background = new THREE.Color(0x0f172a);
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
          cubelets.push(mesh);
          scene.add(mesh);
        }
      }
    }

    cubeletsRef.current = cubelets;

    // Pivot used for rotating a face group
    pivotRef.current = new THREE.Object3D();
    scene.add(pivotRef.current);

    // Simple drag to spin scene
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
    if (animatingRef.current) return; // drop if busy; (you can queue)
    animatingRef.current = true;

    const m = baseOf(move);
    const axis = FACE_AXIS[m].clone();
    const sign = dirSign(move);

    // Select the face cubelets
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
      const wp = c.getWorldPosition(new THREE.Vector3());
      const wr = c.getWorldQuaternion(new THREE.Quaternion());
      pivot.add(c);
      c.position.copy(pivot.worldToLocal(wp));
      c.quaternion.copy(wr);
    });

    // Animate 90°
    const start = performance.now();
    const endRot = (Math.PI / 2) * sign;

    await new Promise<void>((resolve) => {
      const step = (now: number) => {
        const t = Math.min(1, (now - start) / duration);
        const eased = 0.5 - 0.5 * Math.cos(Math.PI * t);
        pivot.setRotationFromAxisAngle(axis, endRot * eased);
        rendererRef.current!.render(sceneRef.current!, cameraRef.current!);
        if (t < 1) requestAnimationFrame(step); else resolve();
      };
      requestAnimationFrame(step);
    });

    // Detach back to scene & snap to grid to avoid drift
    selected.forEach((c) => {
      const wp = c.getWorldPosition(new THREE.Vector3());
      const wr = c.getWorldQuaternion(new THREE.Quaternion());
      sceneRef.current!.add(c);
      c.position.copy(wp.round());
      c.quaternion.copy(wr);
      const e = new THREE.Euler().setFromQuaternion(c.quaternion);
      const s = Math.PI / 2;
      e.x = Math.round(e.x / s) * s;
      e.y = Math.round(e.y / s) * s;
      e.z = Math.round(e.z / s) * s;
      c.setRotationFromEuler(e);
    });

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
      await rotateFace(norm as Move, animate ? animationMs : 0);
    },
    async applyMoves(moves: (Move|KeyMove)[], animate = true) {
      for (const m of moves) {
        const norm = (keyToMove as any)[m] ?? m;
        await rotateFace(norm as Move, animate ? animationMs : 0);
      }
    },
    async scramble(moves: (Move|KeyMove)[]) {
      await (this as CubeAPI).applyMoves(moves, true);
    },
    async generateScrambledCube(length = 20, apply = true) {
      const moves = generateScrambledMoves(length);
      if (apply) await (this as CubeAPI).applyMoves(moves, true);
      return moves;
    },
  }), [animationMs]);

  // Keybindings
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

  // Apply scramble from props (once per change)
  useEffect(() => {
    if (!scrambleMoves?.length) return;
    let cancelled = false;
    (async () => {
      for (const m of scrambleMoves) {
        if (cancelled) return;
        const norm = (keyToMove as any)[m] ?? m;
        await rotateFace(norm as Move);
      }
    })();
    return () => { cancelled = true; };
  }, [scrambleMoves]);

  // Demo button sequence (optional)
  const demoSeq = demoMoves ?? ["e","p","w","i","w","d","d","w"];
  const playNext = async () => {
    const m = demoSeq[demoIndex % demoSeq.length] as Move | KeyMove;
    setDemoIndex((i) => i + 1);
    const norm = (keyToMove as any)[m] ?? m;
    await rotateFace(norm as Move);
  };

  return (
    <div className="w-full flex flex-col items-center gap-4">
      <div
        ref={mountRef}
        style={{ width, height, borderRadius: 16, overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.35)" }}
      />
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

/* =============================================================================
   Example usage:

   // import Cube3D, { CubeAPI, generateScrambledCube } from "@/components/Cube3D";
   //
   // const apiRef = useRef<CubeAPI | null>(null);
   // <Cube3D onReady={(api) => {
   //   apiRef.current = api;
   //   const { moves } = generateScrambledCube(20);
   //   api.applyMoves(moves);    // same moves you also send to the other player via WS
   // }} />
============================================================================= */
