import { Player } from "@/modals/player";
import { Room } from "@/modals/room";
import { GameEventTypes } from "@/types/game-events";
import { SimpleCubeHelper } from "@/utils/cube_helper";

export type FaceName = "U" | "R" | "F" | "D" | "L" | "B";
export type Cube = number[][][];
export type Move = {face: FaceName, clockwise: boolean};

export interface ColorMap {
  [k: number]: string;
}

export interface CubeOptions {
  controlsEnabled?: boolean;
}

export class RubikCube {
  private cube: Cube;
  private helper = new SimpleCubeHelper();
  container: HTMLElement;
  cube_options: CubeOptions;
  wsRef: WebSocket | null;
  player: Player|undefined;
  room: Room | null;
  participants: Array<Player | undefined>;

  constructor(container: HTMLElement, cube_options: CubeOptions, wsRef: WebSocket | null, player: Player | undefined, room: Room | null, participants: Array<Player | undefined>, cube: Cube) {
    this.cube = cube;
    this.cube_options = cube_options;
    this.container = container;
    this.wsRef = wsRef;
    this.player = player;
    this.room = room;
    this.participants = participants;
  }

  get_cube() {
    return this.cube;
  }

  get_cube_helper() {
    return this.helper
  }

  set_cube(new_cube_state: Cube) {
    this.cube = new_cube_state
  }

  private createSolvedCube(): Cube {
    return [
      [[1,1,1],[1,1,1],[1,1,1]], // Back - Red
      [[4,4,4],[4,4,4],[4,4,4]], // Up - Yellow
      [[5,5,5],[5,5,5],[5,5,5]], // Front - Orange
      [[6,6,6],[6,6,6],[6,6,6]], // Down - White
      [[2,2,2],[2,2,2],[2,2,2]], // Left - Green
      [[3,3,3],[3,3,3],[3,3,3]], // Right - Blue
    ];
  }

  getCubeState(): Cube {
    return JSON.parse(JSON.stringify(this.cube));
  }

  applyMove(move: Move): Cube {
    switch(move.face) {
      case "U":
        this.cube = this.helper.rotateU(this.cube, move.clockwise)
        break;
      case "D":
        this.cube = this.helper.rotateD(this.cube, move.clockwise);
        break;
      case "F":
        this.cube = this.helper.rotateF(this.cube, move.clockwise);
        break;
      case "B":
        this.cube = this.helper.rotateB(this.cube, move.clockwise);
        break;
      case "L":
        this.cube = this.helper.rotateL(this.cube, move.clockwise);
        break;
      case "R":
        this.cube = this.helper.rotateR(this.cube, move.clockwise);
        break;
    }
    return JSON.parse(JSON.stringify(this.cube));
  }

  generateScrambledCube(number_of_moves: number) {
    const faces: Array<"U" | "D" | "F" | "B" | "L" | "R"> = ["U", "D", "F", "B", "L", "R"];
    let prevFace: string | null = null;

    for (let i = 0; i < number_of_moves; i++) {
      let face: string;
      do {
        face = faces[Math.floor(Math.random() * faces.length)];
      } while (face === prevFace);

      prevFace = face;
      const clockwise = Math.random() < 0.5;
      this.applyMove({ face: face as FaceName, clockwise });
    }
    return this.getCubeState();
  }

  isRubikCubeSolved() {
    // Check if each face (3x3 array) is filled with the same value
    for (let face = 0; face < 6; face++) {
      const value = this.cube[face][0][0];
      for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {
          if (this.cube[face][row][col] !== value) {
            return false;
          }
        }
      }
    }
    this.wsRef?.send(JSON.stringify({
      type: GameEventTypes.GameFinished,
      value: {
        base_values:{
          room: this.room,
          participants: this.participants,
        },
        player_id_who_won: this.player?.player_id,
        end_time: new Date()
      }
    }))
    return true;
  }

  reset(): Cube {
    this.cube = this.createSolvedCube();
    return this.getCubeState();
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
  wsRef: WebSocket | null,
  player: Player|undefined,
  room: Room | null,
  participants: Array<Player | undefined>,
  options: CubeOptions = {}
) {
    if (player === undefined) {
        throw Error("Cannot start the game the player is undefined....")
    }
  const cube = new RubikCube(container, options, wsRef, player, room, participants, state);
  // return {
  //   turn: (face: FaceName, cw = true) => cube.turn(face, cw),
  //   dispose: () => cube.dispose(),
  //   // You may wish to expose controlsEnabled externally if needed:
  //   controlsEnabled: cube.controlsEnabled,
  // };
  return cube;
}