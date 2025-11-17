import { randomUUID } from "crypto";

export enum PlayerState {
    Playing = "playing",
    NotPlaying = "not playing",
    Waiting = "waiting"
}

export enum CubeCategories {
    ThreeCube = "3x3 cube",
    FourCube = "4x4 cube"
}

export const THREE_SIDE_CUBE_MOVES = [
  // Single face turns (clockwise)
  "U", "D", "L", "R", "F", "B",
  // Single face turns (counter-clockwise)
  "U'", "D'", "L'", "R'", "F'", "B'",
  // Single face turns (180 degrees)
  "U2", "D2", "L2", "R2", "F2", "B2"
];

export class SpeedCollection {
    cube_category: CubeCategories;
    top_speed: number;

    constructor(cube_category: CubeCategories, top_speed: number = 0) {
        this.cube_category = cube_category;
        this.top_speed = top_speed;
    }

    update_speed(top_speed: number): void {
        this.top_speed = top_speed;
    }
}

export class Player {
    player_id: string;
    username: string;
    player_state: PlayerState;
    rating: number;
    total_wins: number;
    win_percentage: number;
    top_speed_to_solve_cube: { [key in CubeCategories]?: SpeedCollection };
    scrambledCube: number[][][] = [[[]]];

    constructor(player_id: string, username: string, player_state: PlayerState = PlayerState.Waiting, rating: number = 0, total_wins: number = 0, win_percentage: number, top_speed_to_solve_cube: { [key in CubeCategories]?: SpeedCollection }, scrambled_cube: number[][][] = [[[]]]) {
        this.player_id = player_id;
        this.username = username;
        this.player_state = player_state;
        this.rating = rating;
        this.total_wins = total_wins;
        this.win_percentage = win_percentage;
        this.top_speed_to_solve_cube = top_speed_to_solve_cube;
        this.scrambledCube = scrambled_cube
    }

    to_string() {
        return `Player Id: ${this.player_id} | Username: ${this.username} | State: ${this.player_state} | Rating: ${this.rating} | Total Wins: ${this.total_wins} | Win Percentage: ${this.win_percentage} | Top Speed To Solve Cube: ${JSON.stringify(this.top_speed_to_solve_cube)}`;
    }

    // ---- Serialization helpers ----
    static toPlain(p: Player): Record<string, any> {
        return {
        player_id: p.player_id,
        username: p.username,
        player_state: p.player_state,
        rating: p.rating,
        total_wins: p.total_wins,
        win_percentage: p.win_percentage,
        top_speed_to_solve_cube: Object.fromEntries(
            Object.entries(p.top_speed_to_solve_cube || {}).map(([k, v]) => [
            k,
            v ? { cube_category: v.cube_category, top_speed: v.top_speed } : v,
            ])
        ),
        scrambledCube: p.scrambledCube
        };
    }

    static fromPlain(obj: any): Player {
        const p = new Player(
            obj.player_id,
            obj.username,
            obj.player_state,
            obj.rating,
            obj.total_wins,
            obj.win_percentage,
            {},
            obj.scrambledCube
        );
        p.player_id = obj.player_id;
        // revive SpeedCollection instances
        if (obj.top_speed_to_solve_cube) {
        for (const [k, v] of Object.entries(obj.top_speed_to_solve_cube)) {
            if (v && typeof v === "object") {
            (p.top_speed_to_solve_cube as any)[k] = new SpeedCollection(
                (v as any).cube_category,
                (v as any).top_speed
            );
            }
        }
        }
        return p;
    }

    updateCube(cube: number[][][]) {
        this.scrambledCube = cube;
    }

    getCube() {
        return this.scrambledCube
    }
}