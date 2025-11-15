"use client"
import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import { CubeOptions, RubikCube } from './cube';
import { Player } from '@/modals/player';
import { Room } from '@/modals/room';
import { GameEventTypes } from '@/types/game-events';
import { generateScrambledCube } from '@/app/room/[roomId]/page';


type FaceName = "U" | "R" | "F" | "D" | "L" | "B";

export const COLOR_MAP: Record<number, string> = {
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

// Define the methods you want to expose
export interface RubiksCubeViewerHandle {
  applyMove: (face: FaceName, clockwise: boolean) => void;
  handleScramble: () => void;
  handleReset: () => void;
  getCubeState: () => Cube;
  getMoveHistory: () => string[];
}

interface RubiksCubeViewerProps {
  container: HTMLElement | null;
  cube_options: CubeOptions;
  wsRef: WebSocket | null;
  player: Player | undefined;
  room: Room | null;
  participants: Array<Player | undefined>;
  // cube: Cube;
}

const RubiksCubeViewer = forwardRef<RubiksCubeViewerHandle, RubiksCubeViewerProps>(
  (props, ref) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cubeGroupRef = useRef<THREE.Group | null>(null);
  const rubikCubeRef = useRef<RubikCube | null>(null);
  const faceLabelsRef = useRef<THREE.Group | null>(null);
  
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [cubeState, setCubeState] = useState<Cube>(props.room?.initialState ?? generateScrambledCube(20).state);
  const [moveHistory, setMoveHistory] = useState<MoveHistory>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [showLabels, setShowLabels] = useState<boolean>(true);

  // Initialize RubikCube instance
  useEffect(() => {
    if (!mountRef.current || !props.player) return;
    
    rubikCubeRef.current = new RubikCube(
      mountRef.current,
      props.cube_options,
      props.wsRef,
      props.player,
      props.room,
      props.participants,
      // props.cube
    );
    
    setIsInitialized(true);
  }, []);

  // Update cube state when props.cube changes (for opponent's cube)
  // useEffect(() => {
  //   setCubeState(props.room?.initialState);
  // }, [props.cube]);

  // Create text sprite for face labels
  const createTextSprite = (
    text: string,
    color: string = '#ffffff'
  ): THREE.Sprite => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d')!;
    canvas.width = 256;
    canvas.height = 256;

    // Draw background circle
    context.fillStyle = 'rgba(0, 0, 0, 0.7)';
    context.beginPath();
    context.arc(128, 128, 100, 0, 2 * Math.PI);
    context.fill();

    // Draw border
    context.strokeStyle = color;
    context.lineWidth = 8;
    context.beginPath();
    context.arc(128, 128, 100, 0, 2 * Math.PI);
    context.stroke();

    // Draw text
    context.fillStyle = color;
    context.font = 'bold 120px Arial';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(text, 128, 128);

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMaterial = new THREE.SpriteMaterial({ 
      map: texture,
      transparent: true,
      depthTest: false,
      depthWrite: false
    });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(1.5, 1.5, 1);

    return sprite;
  };

  // Create face labels
  const createFaceLabels = (scene: THREE.Scene): THREE.Group => {
    if (faceLabelsRef.current) {
      scene.remove(faceLabelsRef.current);
    }

    const labelsGroup = new THREE.Group();

    const faceConfigs = [
      { name: 'U', position: new THREE.Vector3(0, 3.5, 0), color: '#FFD500' },      // Up - Yellow
      { name: 'D', position: new THREE.Vector3(0, -3.5, 0), color: '#FFFFFF' },     // Down - White
      { name: 'F', position: new THREE.Vector3(0, 0, 3.5), color: '#0051BA' },      // Front - Blue
      { name: 'B', position: new THREE.Vector3(0, 0, -3.5), color: '#009B48' },     // Back - Green
      { name: 'L', position: new THREE.Vector3(-3.5, 0, 0), color: '#FF5800' },     // Left - Orange
      { name: 'R', position: new THREE.Vector3(3.5, 0, 0), color: '#C41E3A' },      // Right - Red
    ];

    faceConfigs.forEach(config => {
      const sprite = createTextSprite(config.name, config.color);
      sprite.position.copy(config.position);
      labelsGroup.add(sprite);
    });

    scene.add(labelsGroup);
    faceLabelsRef.current = labelsGroup;

    return labelsGroup;
  };

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
    if (isAnimating || !rubikCubeRef.current) return;

    setIsAnimating(true);
    const newState = rubikCubeRef.current.applyMove({ face, clockwise });
    setCubeState(newState);
    if (rubikCubeRef.current.isRubikCubeSolved()) {
      console.log("Cube solved....");
    }
    setMoveHistory((prev: MoveHistory) => [...prev, `${face}${clockwise ? '' : "'"}`]);

    // Send move to WebSocket if available
    if (props.wsRef && props.wsRef.readyState === WebSocket.OPEN) {
      props.wsRef.send(JSON.stringify({
        type: 'cube_update',
        playerId: props.player?.player_id,
        cubeState: newState,
        move: { face, clockwise }
      }));
    }

    setTimeout(() => setIsAnimating(false), 300);
  };
  
  const handleScramble = (): void => {
    if (isAnimating || !rubikCubeRef.current) return;
    setIsAnimating(true);
    const newState = rubikCubeRef.current.generateScrambledCube(20);
    setCubeState(newState.state);
    setMoveHistory([]);
    setTimeout(() => setIsAnimating(false), 500);
  };
  
  const handleReset = (): void => {
    if (isAnimating || !rubikCubeRef.current) return;
    setIsAnimating(true);
    const newState = rubikCubeRef.current.reset();
    setCubeState(newState);
    setMoveHistory([]);
    setTimeout(() => setIsAnimating(false), 300);
  };

  const toggleLabels = (): void => {
    setShowLabels(prev => !prev);
  };
  
  // Initialize Three.js scene
  useEffect(() => {
    if (!mountRef.current || !isInitialized) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a1a);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(4, 4, 4);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(
      mountRef.current.clientWidth,
      mountRef.current.clientHeight
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
    createFaceLabels(scene);

    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      controls.update();
      
      
      if (faceLabelsRef.current) {
        faceLabelsRef.current.visible = showLabels;
      }
      
      if (faceLabelsRef.current && cameraRef.current && showLabels) {
        const camera = cameraRef.current;
        const labelsGroup = faceLabelsRef.current;

        const minFadeDistance = 6.0;
        const maxFadeDistance = 10.0;
        const minOpacity = 0.0;

        labelsGroup.children.forEach(sprite => {
          if (sprite instanceof THREE.Sprite) {
            const spriteMaterial = sprite.material as THREE.SpriteMaterial;
            
            const distance = camera.position.distanceTo(sprite.position);

            const opacity = THREE.MathUtils.mapLinear(
              distance,
              minFadeDistance,
              maxFadeDistance,
              1.0,        // Full opacity
              minOpacity  // Faded opacity
            );
            
            spriteMaterial.opacity = THREE.MathUtils.clamp(opacity, minOpacity, 1.0);
          }
        });
      }
      
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!mountRef.current) return;
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(
        mountRef.current.clientWidth,
        mountRef.current.clientHeight
      );
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
      controls.dispose();
      if (mountRef.current && renderer.domElement.parentNode === mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [isInitialized]);
  
  // Update label visibility when showLabels changes
  useEffect(() => {
    if (faceLabelsRef.current) {
      faceLabelsRef.current.visible = showLabels;
    }
  }, [showLabels]);
  
  // Update scene when cube state changes
  useEffect(() => {
    if (sceneRef.current) {
      renderCube(sceneRef.current, cubeState);
    }
  }, [cubeState]);
  
  // Keyboard controls (only if controls are enabled)
  useEffect(() => {
    if (!props.cube_options.controlsEnabled) return;

    const handleKeyPress = (e: KeyboardEvent): void => {
      if (isAnimating) return;

      const key = e.key.toLowerCase();
      const shift = e.shiftKey;

      // Toggle labels with 'T' key
      if (key === 't') {
        toggleLabels();
        return;
      }

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
  }, [isAnimating, props.cube_options.controlsEnabled]);

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    applyMove,
    handleScramble,
    handleReset,
    getCubeState: () => cubeState,
    getMoveHistory: () => moveHistory
  }));

  if (!props.player) {
    return (
      <div className="w-full h-[500px] flex items-center justify-center bg-gray-800/50 rounded-xl">
        <p className="text-white">Loading...</p>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center">
      {/* 3D Cube Viewer */}
      <div
        ref={mountRef}
        className="w-full max-w-2xl h-[400px] border-4 border-gray-700 rounded-xl shadow-2xl bg-gray-900"
      />

      {/* Control Buttons (only show for controllable cube) */}
      {props.cube_options.controlsEnabled && (
        <div className="mt-4 flex gap-4 flex-wrap justify-center">
          <button
            onClick={handleScramble}
            disabled={isAnimating}
            className="px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg shadow-lg transition-all transform hover:scale-105"
          >
            Scramble
          </button>
          <button
            onClick={handleReset}
            disabled={isAnimating}
            className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg shadow-lg transition-all transform hover:scale-105"
          >
            Reset
          </button>
          <button
            onClick={toggleLabels}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-lg transition-all transform hover:scale-105"
          >
            {showLabels ? 'Hide Labels' : 'Show Labels'}
          </button>
        </div>
      )}

      {/* Keyboard Hints */}
      {props.cube_options.controlsEnabled && (
        <div className="mt-3 bg-gray-800/50 p-3 rounded-lg backdrop-blur max-w-2xl">
          <p className="text-xs text-gray-300 text-center">
            Press <span className="font-bold text-blue-300">T</span> to toggle labels | 
            Use <span className="font-bold text-blue-300">U, D, F, B, L, R</span> keys to rotate faces | 
            Hold <span className="font-bold text-blue-300">Shift</span> for counter-clockwise
          </p>
        </div>
      )}

      {/* Move History (only show for controllable cube) */}
      {props.cube_options.controlsEnabled && moveHistory.length > 0 && (
        <div className="mt-4 bg-gray-800/50 p-3 rounded-lg backdrop-blur max-w-2xl">
          <p className="text-sm font-semibold text-blue-300 mb-1">Move History:</p>
          <p className="text-xs font-mono text-white">{moveHistory.join(' ')}</p>
        </div>
      )}
    </div>
  );
});

RubiksCubeViewer.displayName = 'RubiksCubeViewer';

export default RubiksCubeViewer;