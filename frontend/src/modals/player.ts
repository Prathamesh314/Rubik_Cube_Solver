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

export class SpeedCollection {
    cube_category: CubeCategories;
    top_speed: number;

    constructor(cube_category: CubeCategories) {
        this.cube_category = cube_category;
        this.top_speed = 0;
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

    constructor(username: string, player_state: PlayerState = PlayerState.Waiting, rating: number = 0, total_wins: number = 0, win_percentage: number, top_speed_to_solve_cube: { [key in CubeCategories]?: SpeedCollection }) {
        this.player_id = randomUUID();
        this.username = username;
        this.player_state = player_state;
        this.rating = rating;
        this.total_wins = total_wins;
        this.win_percentage = win_percentage;
        this.top_speed_to_solve_cube = top_speed_to_solve_cube;
    }
}