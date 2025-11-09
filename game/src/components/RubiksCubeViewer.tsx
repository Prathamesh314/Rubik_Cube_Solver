
"use client"
import React, { useEffect, useRef, useState, MutableRefObject } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import { RubikCube } from './cube';

type FaceName = "U" | "R" | "F" | "D" | "L" | "B";

const COLOR_MAP: Record<number, string> = {
  1: "#C41E3A", 
  2: "#009B48", 
  3: "#0051BA", 
  4: "#FFD500", 
  5: "#FF5800", 
  6: "#FFFFFF", 
};

type CubeletColors = {
  right: string;
  left: string;
  top: string;
  bottom: string;
  front: string;
  back: string;
};

type Cube = number[][][];

type MoveHistory = string[];

interface InitialState {
    cube?: Cube
}

const RubiksCubeViewer: React.FC = ({cube}: InitialState) => {
  
  const mountRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cubeGroupRef = useRef<THREE.Group | null>(null);
  const rubikCubeRef = useRef<RubikCube>(new RubikCube(cube));
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [cubeState, setCubeState] = useState<Cube>(rubikCubeRef.current.getCubeState());
  const [moveHistory, setMoveHistory] = useState<MoveHistory>([]);

  const createCubelet = (
    x: number,
    y: number,
    z: number,
    colors: CubeletColors
  ): THREE.Mesh<THREE.BoxGeometry, THREE.Material[]> => {
    const size = 0.95;
    const geometry = new THREE.BoxGeometry(size, size, size);

    const materials = [
      new THREE.MeshPhongMaterial({ color: colors.right }),
      new THREE.MeshPhongMaterial({ color: colors.left }),
      new THREE.MeshPhongMaterial({ color: colors.top }),
      new THREE.MeshPhongMaterial({ color: colors.bottom }),
      new THREE.MeshPhongMaterial({ color: colors.front }),
      new THREE.MeshPhongMaterial({ color: colors.back }),
    ];

    const cube = new THREE.Mesh(geometry, materials);
    cube.position.set(x, y, z);

    const edges = new THREE.EdgesGeometry(geometry);
    const line = new THREE.LineSegments(
      edges,
      new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 2 })
    );
    cube.add(line);

    return cube;
  };
  
  const getCubeletColors = (
    cubeState: Cube,
    x: number,
    y: number,
    z: number
  ): CubeletColors => {
    const colors: CubeletColors = {
      right: '#1a1a1a',
      left: '#1a1a1a',
      top: '#1a1a1a',
      bottom: '#1a1a1a',
      front: '#1a1a1a',
      back: '#1a1a1a',
    };

    const col = x + 1;
    const row = 1 - y;

    if (x === 1)
      colors.right = COLOR_MAP[cubeState[5][row][2 - (z + 1)] as keyof typeof COLOR_MAP];
    if (x === -1)
      colors.left = COLOR_MAP[cubeState[4][row][z + 1] as keyof typeof COLOR_MAP];
    if (y === 1)
      colors.top = COLOR_MAP[cubeState[1][z + 1][col] as keyof typeof COLOR_MAP];
    if (y === -1)
      colors.bottom = COLOR_MAP[cubeState[3][2 - (z + 1)][col] as keyof typeof COLOR_MAP];
    if (z === 1)
      colors.front = COLOR_MAP[cubeState[2][row][col] as keyof typeof COLOR_MAP];
    if (z === -1)
      colors.back = COLOR_MAP[cubeState[0][row][2 - col] as keyof typeof COLOR_MAP];

    return colors;
  };
  
  const renderCube = (
    scene: THREE.Scene,
    cubeState: Cube
  ): THREE.Group => {
    if (cubeGroupRef.current) {
      scene.remove(cubeGroupRef.current);
    }
    const cubeGroup = new THREE.Group();

    for (let x = -1; x <= 1; x++) {
      for (let y = -1; y <= 1; y++) {
        for (let z = -1; z <= 1; z++) {
          const colors = getCubeletColors(cubeState, x, y, z);
          const cubelet = createCubelet(x, y, z, colors);
          cubeGroup.add(cubelet);
        }
      }
    }

    scene.add(cubeGroup);
    cubeGroupRef.current = cubeGroup;

    return cubeGroup;
  };
  
  const applyMove = (face: FaceName, clockwise: boolean): void => {
    if (isAnimating) return;

    setIsAnimating(true);
    const newState = rubikCubeRef.current.applyMove({ face, clockwise });
    setCubeState(newState);
    setMoveHistory((prev: MoveHistory) => [...prev, `${face}${clockwise ? '' : "'"}`]);

    setTimeout(() => setIsAnimating(false), 300);
  };
  
  const handleScramble = (): void => {
    if (isAnimating) return;
    setIsAnimating(true);
    const newState = rubikCubeRef.current.scramble(20);
    setCubeState(newState);
    setMoveHistory([]);
    setTimeout(() => setIsAnimating(false), 500);
  };
  
  const handleReset = (): void => {
    if (isAnimating) return;
    setIsAnimating(true);
    const newState = rubikCubeRef.current.reset();
    setCubeState(newState);
    setMoveHistory([]);
    setTimeout(() => setIsAnimating(false), 300);
  };
  
  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a1a);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      75,
      (mountRef.current.clientWidth as number) / (mountRef.current.clientHeight as number),
      0.1,
      1000
    );
    camera.position.set(4, 4, 4);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(
      mountRef.current.clientWidth as number,
      mountRef.current.clientHeight as number
    );
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; 
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.minDistance = 3; 
    controls.maxDistance = 10; 
    controls.target.set(0, 0, 0); 

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    renderCube(scene, cubeState);

    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!mountRef.current) return;
      camera.aspect =
        (mountRef.current.clientWidth as number) /
        (mountRef.current.clientHeight as number);
      camera.updateProjectionMatrix();
      renderer.setSize(
        mountRef.current.clientWidth as number,
        mountRef.current.clientHeight as number
      );
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
      controls.dispose();
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);
  
  useEffect(() => {
    if (sceneRef.current) {
      renderCube(sceneRef.current, cubeState);
    }
  }, [cubeState]);
  
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent): void => {
      if (isAnimating) return;

      const key = e.key.toLowerCase();
      const shift = e.shiftKey;

      const moveMap: {
        [key: string]: { face: FaceName; clockwise: boolean }
      } = {
        u: { face: 'U', clockwise: !shift },
        d: { face: 'D', clockwise: !shift },
        f: { face: 'F', clockwise: !shift },
        b: { face: 'B', clockwise: !shift },
        l: { face: 'L', clockwise: !shift },
        r: { face: 'R', clockwise: !shift }
      };

      if (moveMap[key]) {
        applyMove(moveMap[key].face, moveMap[key].clockwise);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isAnimating]);

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex flex-col items-center justify-center p-4">
      <div className="text-white mb-6 text-center max-w-2xl">
        <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          Interactive Rubik&apos;s Cube
        </h1>
        <div className="text-sm space-y-2 bg-gray-800/50 p-4 rounded-lg backdrop-blur">
          <p className="font-semibold text-blue-300">Keyboard Controls:</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <kbd className="px-2 py-1 bg-gray-700 rounded">U/D/F/B/L/R</kbd>{" "}
              Rotate clockwise
            </div>
            <div>
              <kbd className="px-2 py-1 bg-gray-700 rounded">Shift+Key</kbd> Rotate counter-clockwise
            </div>
          </div>
        </div>
      </div>

      <div
        ref={mountRef}
        className="w-full max-w-3xl h-[500px] border-4 border-gray-700 rounded-xl shadow-2xl bg-gray-900"
      />

      <div className="mt-6 flex gap-4">
        <button
          onClick={handleScramble}
          disabled={isAnimating}
          className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg shadow-lg transition-all transform hover:scale-105"
        >
          Scramble
        </button>
        <button
          onClick={handleReset}
          disabled={isAnimating}
          className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg shadow-lg transition-all transform hover:scale-105"
        >
          Reset
        </button>
      </div>

      {moveHistory.length > 0 && (
        <div className="mt-4 text-white text-center bg-gray-800/50 p-3 rounded-lg backdrop-blur max-w-3xl">
          <p className="text-sm font-semibold text-blue-300 mb-1">Move History:</p>
          <p className="text-xs font-mono">{moveHistory.join(' ')}</p>
        </div>
      )}

      <div className="text-white mt-4 text-xs opacity-75">
        <p>Auto-rotating for better view • Press keys to interact</p>
      </div>
    </div>
  );
};

export default RubiksCubeViewer;