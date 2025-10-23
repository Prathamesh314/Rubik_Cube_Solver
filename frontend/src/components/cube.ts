// lib/rubiks-cube.ts
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

type FaceName = "U" | "R" | "F" | "D" | "L" | "B";
type FaceIndex = 0 | 1 | 2 | 3 | 4 | 5;

interface ColorMap {
  [k: number]: string;
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

  constructor(
    public container: HTMLElement,
    public state: number[][][],
    public colorMap: ColorMap
  ) {
    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0b0b0b);

    const w = container.clientWidth || 800;
    const h = container.clientHeight || 600;

    // Camera
    this.camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 100);
    this.camera.position.set(5.5, 5.5, 7.5);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(w, h);
    this.renderer.shadowMap.enabled = true;
    container.appendChild(this.renderer.domElement);

    // Controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;

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

    // Keyboard moves
    window.addEventListener("keydown", this.onKeyDown);
  }

  onKeyDown = (e: KeyboardEvent) => {
    const k = e.key.toUpperCase();
    const ccw = e.shiftKey;
    if (["U", "R", "F", "D", "L", "B"].includes(k)) {
      this.turn(k as FaceName, !ccw);
    }
  };

  onResize = () => {
    const w = this.container.clientWidth || window.innerWidth;
    const h = this.container.clientHeight || window.innerHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  };

  render = () => {
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  };

  dispose() {
    this.renderer.setAnimationLoop(null);
    window.removeEventListener("resize", this.onResize);
    window.removeEventListener("keydown", this.onKeyDown);
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

    this.animating = false;
  }
}

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
  }
) {
  const cube = new RubiksCube(container, state, colorMap);
  return {
    turn: (face: FaceName, cw = true) => cube.turn(face, cw),
    dispose: () => cube.dispose(),
  };
}
