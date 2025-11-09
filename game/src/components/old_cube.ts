// src/components/cube.ts

import { Player } from "@/modals/player";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Room } from "@/modals/room";
import { GameEventTypes } from "@/types/game-events";

type FaceName = "U" | "R" | "F" | "D" | "L" | "B";
type FaceIndex = 0 | 1 | 2 | 3 | 4 | 5;

interface ColorMap {
  [k: number]: string;
}

interface CubeOptions {
  controlsEnabled?: boolean;
}

/** face index order: 0:U,1:R,2:F,3:D,4:L,5:B */
const FACE_ORDER: Record<FaceName, FaceIndex> = { U: 0, R: 1, F: 2, D: 3, L: 4, B: 5 };

const LAYER = [-1, 0, 1];
const CUBELET_SIZE = 0.98;
const STICKER_SIZE = 0.92;
const STICKER_OFFSET = 0.51;

type StickerSide = "px" | "nx" | "py" | "ny" | "pz" | "nz";

const NORMALS: Record<StickerSide, THREE.Vector3> = {
  px: new THREE.Vector3(1, 0, 0),
  nx: new THREE.Vector3(-1, 0, 0),
  py: new THREE.Vector3(0, 1, 0),
  ny: new THREE.Vector3(0, -1, 0),
  pz: new THREE.Vector3(0, 0, 1),
  nz: new THREE.Vector3(0, 0, -1),
};

// Types
type Move = { face: FaceName; clockwise: boolean };
type CubeState = number[][][]; // 6 x 3 x 3

// Face index map (must match your renderer expectations)
const FACE_INDEX: Record<FaceName, number> = { U: 0, R: 1, F: 2, D: 3, L: 4, B: 5 };

// Checking the cube is solved or not after every move.
function IsRubikCubeSolved(cube: number[][][]): boolean {
    if (!Array.isArray(cube) || cube.length !== 6) return false;
  
    const isUniformFace = (face: number[][]): boolean => {
      if (!Array.isArray(face) || face.length === 0) return false;
      const cols = face[0].length;
      if (cols === 0) return false;
  
      const target = face[0][0];
      for (let r = 0; r < face.length; r++) {
        if (!Array.isArray(face[r]) || face[r].length !== cols) return false;
        for (let c = 0; c < cols; c++) {
          if (face[r][c] !== target) return false;
        }
      }
      return true;
    };
  
    for (let f = 0; f < 6; f++) {
      if (!isUniformFace(cube[f]!)) return false;
    }
    return true;
  }

// Build a solved cube with color IDs 1..6 (you can remap as you like)
function makeSolved(): CubeState {
  const faces = 6;
  const state: CubeState = [];
  for (let f = 0; f < faces; f++) {
    const colorId = f + 1; // 1..6
    state.push([
      [colorId, colorId, colorId],
      [colorId, colorId, colorId],
      [colorId, colorId, colorId],
    ]);
  }
  return state;
}

// Matrix helpers
function rotateFaceCW(m: number[][]): number[][] {
  return [
    [m[2][0], m[1][0], m[0][0]],
    [m[2][1], m[1][1], m[0][1]],
    [m[2][2], m[1][2], m[0][2]],
  ];
}
function rotateFaceCCW(m: number[][]): number[][] {
  return [
    [m[0][2], m[1][2], m[2][2]],
    [m[0][1], m[1][1], m[2][1]],
    [m[0][0], m[1][0], m[2][0]],
  ];
}

// Deep copy 6x3x3
function cloneState(s: CubeState): CubeState {
  return s.map(face => face.map(row => row.slice()));
}

// --- Move application ---
// Conventions: applying a move rotates the face as seen from outside that face.
// The edge cycles below are consistent with common cube simulators.

export function applyMove(state: CubeState, move: Move): CubeState {
  const s = cloneState(state);
  const { face, clockwise } = move;

  const U = FACE_INDEX.U, R = FACE_INDEX.R, F = FACE_INDEX.F,
        D = FACE_INDEX.D, L = FACE_INDEX.L, B = FACE_INDEX.B;

  const rotCW = (idx: number) => { s[idx] = rotateFaceCW(s[idx]); };
  const rotCCW = (idx: number) => { s[idx] = rotateFaceCCW(s[idx]); };

  // Utility to get/set rows/cols
  const row = (f: number, r: number) => s[f][r].slice();
  const setRow = (f: number, r: number, vals: number[]) => { s[f][r] = vals.slice(); };
  const col = (f: number, c: number) => [s[f][0][c], s[f][1][c], s[f][2][c]];
  const setCol = (f: number, c: number, vals: number[]) => {
    s[f][0][c] = vals[0]; s[f][1][c] = vals[1]; s[f][2][c] = vals[2];
  };

  switch (face) {
    case "U": {
      clockwise ? rotCW(U) : rotCCW(U);
      // Cycle top rows of F, R, B, L
      if (clockwise) {
        const F0 = row(F, 0), R0 = row(R, 0), B0 = row(B, 0), L0 = row(L, 0);
        setRow(R, 0, F0);
        setRow(B, 0, R0);
        setRow(L, 0, B0);
        setRow(F, 0, L0);
      } else {
        const F0 = row(F, 0), R0 = row(R, 0), B0 = row(B, 0), L0 = row(L, 0);
        setRow(L, 0, F0);
        setRow(B, 0, L0);
        setRow(R, 0, B0);
        setRow(F, 0, R0);
      }
      break;
    }
    case "D": {
      clockwise ? rotCW(D) : rotCCW(D);
      // Cycle bottom rows of F, L, B, R (note orientation)
      if (clockwise) {
        const F2 = row(F, 2), R2 = row(R, 2), B2 = row(B, 2), L2 = row(L, 2);
        setRow(L, 2, F2);
        setRow(B, 2, L2);
        setRow(R, 2, B2);
        setRow(F, 2, R2);
      } else {
        const F2 = row(F, 2), R2 = row(R, 2), B2 = row(B, 2), L2 = row(L, 2);
        setRow(R, 2, F2);
        setRow(B, 2, R2);
        setRow(L, 2, B2);
        setRow(F, 2, L2);
      }
      break;
    }
    case "F": {
      clockwise ? rotCW(F) : rotCCW(F);
      // Affect U row 2, R col 0, D row 0, L col 2
      if (clockwise) {
        const U2 = row(U, 2);
        const R0 = col(R, 0);
        const D0 = row(D, 0);
        const L2 = col(L, 2);

        // U2 -> R0, R0 -> D0 (reversed), D0 -> L2, L2 -> U2 (reversed)
        setCol(R, 0, [U2[2], U2[1], U2[0]]);
        setRow(D, 0, [R0[0], R0[1], R0[2]].reverse());
        setCol(L, 2, [D0[0], D0[1], D0[2]]);
        setRow(U, 2, [L2[2], L2[1], L2[0]]);
      } else {
        const U2 = row(U, 2);
        const R0 = col(R, 0);
        const D0 = row(D, 0);
        const L2 = col(L, 2);

        setCol(L, 2, [U2[0], U2[1], U2[2]].reverse());
        setRow(D, 0, [L2[0], L2[1], L2[2]]);
        setCol(R, 0, [D0[2], D0[1], D0[0]]);
        setRow(U, 2, [R0[0], R0[1], R0[2]]);
      }
      break;
    }
    case "B": {
      clockwise ? rotCW(B) : rotCCW(B);
      // Affect U row 0, L col 0, D row 2, R col 2
      if (clockwise) {
        const U0 = row(U, 0);
        const L0 = col(L, 0);
        const D2 = row(D, 2);
        const R2 = col(R, 2);

        setCol(L, 0, [U0[0], U0[1], U0[2]].reverse());
        setRow(D, 2, [L0[0], L0[1], L0[2]]);
        setCol(R, 2, [D2[2], D2[1], D2[0]]);
        setRow(U, 0, [R2[0], R2[1], R2[2]]);
      } else {
        const U0 = row(U, 0);
        const L0 = col(L, 0);
        const D2 = row(D, 2);
        const R2 = col(R, 2);

        setCol(R, 2, [U0[0], U0[1], U0[2]]);
        setRow(D, 2, [R2[2], R2[1], R2[0]]);
        setCol(L, 0, [D2[0], D2[1], D2[2]]);
        setRow(U, 0, [L0[2], L0[1], L0[0]]);
      }
      break;
    }
    case "R": {
      clockwise ? rotCW(R) : rotCCW(R);
      // Affect U col 2, F col 2, D col 2, B col 0
      if (clockwise) {
        const U2 = col(U, 2);
        const F2 = col(F, 2);
        const D2 = col(D, 2);
        const B0 = col(B, 0);

        setCol(F, 2, U2);
        setCol(D, 2, F2);
        setCol(B, 0, [D2[2], D2[1], D2[0]]); // reversed
        setCol(U, 2, [B0[2], B0[1], B0[0]]); // reversed
      } else {
        const U2 = col(U, 2);
        const F2 = col(F, 2);
        const D2 = col(D, 2);
        const B0 = col(B, 0);

        setCol(B, 0, [U2[2], U2[1], U2[0]]); // reversed
        setCol(D, 2, [B0[2], B0[1], B0[0]]); // reversed
        setCol(F, 2, D2);
        setCol(U, 2, F2);
      }
      break;
    }
    case "L": {
      clockwise ? rotCW(L) : rotCCW(L);
      // Affect U col 0, B col 2, D col 0, F col 0
      if (clockwise) {
        const U0 = col(U, 0);
        const B2 = col(B, 2);
        const D0 = col(D, 0);
        const F0 = col(F, 0);

        setCol(B, 2, [D0[2], D0[1], D0[0]]); // reversed
        setCol(D, 0, F0);
        setCol(F, 0, U0);
        setCol(U, 0, [B2[2], B2[1], B2[0]]); // reversed
      } else {
        const U0 = col(U, 0);
        const B2 = col(B, 2);
        const D0 = col(D, 0);
        const F0 = col(F, 0);

        setCol(F, 0, D0);
        setCol(D, 0, [B2[2], B2[1], B2[0]]); // reversed
        setCol(B, 2, [U0[2], U0[1], U0[0]]); // reversed
        setCol(U, 0, F0);
      }
      break;
    }
  }

  return s;
}

// Random scramble generation with axis constraint
const FACES: FaceName[] = ["U", "R", "F", "D", "L", "B"];
const AXIS: Record<FaceName, number> = { U: 0, D: 0, R: 1, L: 1, F: 2, B: 2 };

function randomMove(prev?: Move): Move {
  while (true) {
    const face = FACES[Math.floor(Math.random() * FACES.length)];
    const clockwise = Math.random() < 0.5;
    const mv: Move = { face, clockwise };
    if (!prev) return mv;
    // Avoid selecting the same axis consecutively (e.g., R after L)
    if (AXIS[mv.face] !== AXIS[prev.face]) return mv;
  }
}

/**
 * Generate a scramble and the resulting cube state.
 * @param total_moves number of random moves (default 20)
 * @returns { moves, state } where `moves` is the Move[] and `state` is number[6][3][3]
 */
export function generateScrambledCube(total_moves: number = 20): { moves: Move[]; state: CubeState } {
  const moves: Move[] = [];
  for (let i = 0; i < total_moves; i++) {
    moves.push(randomMove(moves[moves.length - 1]));
  }

  // Apply to solved state
  let state = makeSolved();
  for (const m of moves) {
    state = applyMove(state, m);
  }

  return { moves, state };
}


function gi(i: number) { return LAYER[i]; }

function coordToIdx(v: number) {
  const eps = 0.12;
  if (v > 0.5 - eps) return 2;
  if (v < -0.5 + eps) return 0;
  return 1;
}

function makeCubelet(): THREE.Mesh {
  const geo = new THREE.BoxGeometry(CUBELET_SIZE, CUBELET_SIZE, CUBELET_SIZE);
  const mat = new THREE.MeshPhysicalMaterial({
    color: 0x111111,
    roughness: 0.6,
    metalness: 0.2,
    clearcoat: 0.25,
  });
  const m = new THREE.Mesh(geo, mat);
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

function makeSticker(color: THREE.ColorRepresentation) {
  const geo = new THREE.PlaneGeometry(STICKER_SIZE, STICKER_SIZE);
  const mat = new THREE.MeshBasicMaterial({ color, side: THREE.FrontSide });
  return new THREE.Mesh(geo, mat);
}

function placeSticker(cubie: THREE.Object3D, side: StickerSide, color: THREE.ColorRepresentation) {
  const s = makeSticker(color);
  const n = NORMALS[side];
  const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), n);
  s.quaternion.copy(quat);
  s.position.copy(n.clone().multiplyScalar(STICKER_OFFSET));
  cubie.add(s);
}

function faceCellToWorld(face: FaceName, row: number, col: number) {
  // row: 0..2 top->bottom; col: 0..2 left->right (facing the face)
  switch (face) {
    case "U": return { x: gi(col), y: gi(2), z: gi(2 - row), side: "py" as StickerSide };
    case "D": return { x: gi(col), y: gi(0), z: gi(row), side: "ny" as StickerSide };
    case "R": return { x: gi(2), y: gi(row), z: gi(2 - col), side: "px" as StickerSide };
    case "L": return { x: gi(0), y: gi(row), z: gi(col), side: "nx" as StickerSide };
    case "F": return { x: gi(col), y: gi(row), z: gi(2), side: "pz" as StickerSide };
    case "B": return { x: gi(2 - col), y: gi(row), z: gi(0), side: "nz" as StickerSide };
  }
}

function colorHex(val: number, cmap: ColorMap) {
  return cmap[val] ?? "#888888";
}

// attach/detach helpers (replacement for deprecated SceneUtils)
function attach(object: THREE.Object3D, from: THREE.Object3D, to: THREE.Object3D) {
  from.updateMatrixWorld();
  object.applyMatrix4(from.matrixWorld);
  from.remove(object);
  to.add(object);
  object.updateMatrixWorld();
}
function detach(object: THREE.Object3D, from: THREE.Object3D, to: THREE.Object3D) {
  from.updateMatrixWorld();
  object.applyMatrix4(new THREE.Matrix4().copy(from.matrixWorld).invert());
  from.remove(object);
  to.add(object);
  object.updateMatrixWorld();
}

class RubiksCube {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  controls: OrbitControls;
  root: THREE.Group;
  cubelets: THREE.Mesh[] = [];
  pivot = new THREE.Group();
  animating = false;
  controlsEnabled: boolean;
  websocket_conn: WebSocket | null;
  player: Player | undefined;

  room: Room | null;
  participants: Array<Player | undefined>;

  constructor(
    public container: HTMLElement,
    public state: number[][][],
    public colorMap: ColorMap,
    public wsRef: WebSocket | null,
    player: Player|undefined,
    room: Room | null,
    participants: Array<Player | undefined>,
    options: CubeOptions = {}
  ) {
    this.player = player;
    this.websocket_conn = wsRef
    this.room = room
    this.participants = participants
    this.controlsEnabled = options.controlsEnabled ?? true; // default true

    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0b0b0b);

    const rect = container.getBoundingClientRect();
    const w = Math.max(1, rect.width);
    const h = Math.max(1, rect.height);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(w, h, false);             // internal buffer only
    this.renderer.shadowMap.enabled = true;         // ✅ enable shadows
    this.renderer.outputColorSpace = THREE.SRGBColorSpace; // ✅ recommended

    // Stretch to container
    this.renderer.domElement.style.width = "100%";
    this.renderer.domElement.style.height = "100%";
    this.renderer.domElement.style.display = "block";
    container.appendChild(this.renderer.domElement);

    // Camera
    this.camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 100);
    this.camera.position.set(5.5, 5.5, 7.5);
    this.camera.lookAt(0, 0, 0);                    // ✅ optional but nice

    // Controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.target.set(0, 0, 0);
    this.controls.update();
    // Enable or disable controls according to option
    this.controls.enabled = !!this.controlsEnabled;

    // Lights & floor
    const hemi = new THREE.HemisphereLight(0xffffff, 0x12121a, 0.6);
    this.scene.add(hemi);
    const key = new THREE.SpotLight(0xffffff, 1.2, 0, Math.PI / 6, 0.25, 1.2);
    key.position.set(8, 12, 6);
    key.castShadow = true;
    this.scene.add(key);

    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(20, 20),
      new THREE.MeshStandardMaterial({ color: 0x151515, roughness: 0.9 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -2.2;
    floor.receiveShadow = true;
    this.scene.add(floor);

    // Root & pivot
    this.root = new THREE.Group();
    this.scene.add(this.root);
    this.root.add(this.pivot);

    // Build 27 cubelets
    for (let yi = 0; yi < 3; yi++) {
      for (let zi = 0; zi < 3; zi++) {
        for (let xi = 0; xi < 3; xi++) {
          const m = makeCubelet();
          m.position.set(gi(xi), gi(yi), gi(zi));
          this.root.add(m);
          this.cubelets.push(m);
        }
      }
    }

    // Paint stickers
    this.paint(this.state);

    // Resize + loop
    window.addEventListener("resize", this.onResize);
    this.renderer.setAnimationLoop(this.render);

    // Keyboard moves (only enable when controls are enabled)
    if (this.controlsEnabled) {
      window.addEventListener("keydown", this.onKeyDown);
    }
  }

  onKeyDown = (e: KeyboardEvent) => {
    const k = e.key.toUpperCase();
    const ccw = e.shiftKey;
    if (["U", "R", "F", "D", "L", "B"].includes(k)) {
      this.turn(k as FaceName, !ccw);
    }
  };

  onResize = () => {
    const rect = this.container.getBoundingClientRect();
    const w = Math.max(1, rect.width);
    const h = Math.max(1, rect.height);

    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h, false); // keep CSS at 100%
  };

  render = () => {
    if (this.controlsEnabled) {
      this.controls.update();
    }
    this.renderer.render(this.scene, this.camera);
  };

  dispose() {
    this.renderer.setAnimationLoop(null);
    window.removeEventListener("resize", this.onResize);
    if (this.controlsEnabled) {
      window.removeEventListener("keydown", this.onKeyDown);
    }
    this.renderer.dispose();
  }

  paint(state: number[][][]) {
    // clear stickers
    for (const c of this.cubelets) {
      for (let i = c.children.length - 1; i >= 0; i--) {
        const ch = c.children[i];
        c.remove(ch);
        (ch as any).geometry?.dispose?.();
        (ch as any).material?.dispose?.();
      }
    }
    const faces: FaceName[] = ["U", "R", "F", "D", "L", "B"];
    for (const face of faces) {
      const f = state[FACE_ORDER[face]];
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
          const val = f[r][c];
          const color = colorHex(val, this.colorMap);
          const { x, y, z, side } = faceCellToWorld(face, r, c) as any;
          const cubie = this.findCubie(x, y, z);
          if (cubie) placeSticker(cubie, side, color);
        }
      }
    }
  }

  findCubie(x: number, y: number, z: number) {
    const eps = 0.1;
    return this.cubelets.find(
      (m) =>
        Math.abs(m.position.x - x) < eps &&
        Math.abs(m.position.y - y) < eps &&
        Math.abs(m.position.z - z) < eps
    );
  }

  async turn(face: FaceName, clockwise = true) {
    if (this.animating) return;
    this.animating = true;

    // axis + layer selector
    let axis = new THREE.Vector3();
    let isLayer: (m: THREE.Object3D) => boolean;
    const eps = 0.15;

    switch (face) {
      case "U": axis.set(0, 1, 0); isLayer = (m) => m.position.y > 1 - eps; break;
      case "D": axis.set(0, -1, 0); isLayer = (m) => m.position.y < -1 + eps; break;
      case "R": axis.set(1, 0, 0); isLayer = (m) => m.position.x > 1 - eps; break;
      case "L": axis.set(-1, 0, 0); isLayer = (m) => m.position.x < -1 + eps; break;
      case "F": axis.set(0, 0, 1); isLayer = (m) => m.position.z > 1 - eps; break;
      case "B": axis.set(0, 0, -1); isLayer = (m) => m.position.z < -1 + eps; break;
    }

    const layer = this.cubelets.filter(isLayer!);
    this.pivot.position.set(0, 0, 0);
    this.pivot.rotation.set(0, 0, 0);
    this.pivot.updateMatrixWorld();

    for (const c of layer) attach(c, this.root, this.pivot);

    const dir = clockwise ? 1 : -1;
    const duration = 180; // ms
    const start = performance.now();
    const target = (Math.PI / 2) * dir;

    await new Promise<void>((res) => {
      const step = (now: number) => {
        const t = Math.min(1, (now - start) / duration);
        const angle = target * t;
        this.pivot.setRotationFromAxisAngle(axis, angle);
        if (t < 1) requestAnimationFrame(step);
        else res();
      };
      requestAnimationFrame(step);
    });

    for (const c of layer) {
      detach(c, this.pivot, this.root);
      // snap to grid
      c.position.set(LAYER[coordToIdx(c.position.x)], LAYER[coordToIdx(c.position.y)], LAYER[coordToIdx(c.position.z)]);
      const e = new THREE.Euler().setFromQuaternion(c.quaternion, "XYZ");
      const snap = (r: number) => Math.round(r / (Math.PI / 2)) * (Math.PI / 2);
      c.rotation.set(snap(e.x), snap(e.y), snap(e.z));
    }

    // ⬇️ NEW: advance logical state & check solved
    this.state = applyMove(this.state, { face, clockwise });
    if (IsRubikCubeSolved(this.state)) {
      const ws = this.websocket_conn;
      if (ws && ws.readyState === WebSocket.OPEN) {
        const message = {
          type: GameEventTypes.GameFinished,
          value: {
            base_values: {
              room: this.room,
              participants: this.participants,
            },
            end_time: new Date().toISOString(),
          },
        };
        try {
          ws.send(JSON.stringify(message));
          console.log("Game finished event send..");
        } catch (err) {
          console.error("Failed to send GameFinished message:", err);
        }
      }
    }

    this.animating = false;
  }
}

/**
 * Extended cube initializer, now accepts an extra options param.
 * 
 * @param container - The DOM element container for the cube
 * @param state - The cube state (6x3x3 array)
 * @param colorMap - The color map (number: colorHex)
 * @param options - { controlsEnabled?: boolean }
 */
export function initRubiksCube(
  container: HTMLElement,
  state: number[][][],
  colorMap: ColorMap = {
    1: "#C41E3A",
    2: "#009B48",
    3: "#0051BA",
    4: "#FFD500",
    5: "#FF5800",
    6: "#FFFFFF",
  },
  wsRef: WebSocket | null,
  player: Player|undefined,
  room: Room | null,
  participants: Array<Player | undefined>,
  options: CubeOptions = {}
) {
    if (player === undefined) {
        throw Error("Cannot start the game the player is undefined....")
    }
  const cube = new RubiksCube(container, state, colorMap, wsRef, player, room, participants, options);
  return {
    turn: (face: FaceName, cw = true) => cube.turn(face, cw),
    dispose: () => cube.dispose(),
    // You may wish to expose controlsEnabled externally if needed:
    controlsEnabled: cube.controlsEnabled,
  };
}