import { Env } from "@/lib/env_config";

type FaceName = "U" | "R" | "F" | "D" | "L" | "B";
type Move = { face: FaceName; clockwise: boolean };

function prettyPrintCube(cube: number[][][]) {
    // Print cube state in a human-readable way
    // Each face is a 3x3 matrix with face indices:
    //  [ [a,b,c], [d,e,f], [g,h,i] ]
    // The 6 faces are in [B, U, F, D, L, R] order (as per FACE_INDEX).
    // We'll print each face with its label and in a 3x3 format.
    const faceLabels = ["B", "U", "F", "D", "L", "R"];
    for (let f = 0; f < cube.length; f++) {
        console.log(`${faceLabels[f]}:`);
        for (let r = 0; r < cube[f].length; r++) {
            console.log("  " + cube[f][r].join(" "));
        }
        console.log("");
    }
}

async function rotate_cube(){
    // console.log("testing rotation..")
    // const {moves, state} = generateScrambledCube(20);

    // prettyPrintCube(state);
    // const move: Move = {
    //     face: "U",
    //     clockwise: true
    // };
    // const new_state = applyMove(state, move);
    // console.log("=============================================== New state ===============================================")
    // prettyPrintCube(new_state);

    const env_var = Env.WEBSOCKET_PORT
    console.log("WEBSOCKET_PORT from Env:", env_var);
}

(()=>{
    rotate_cube();
})();

// npx tsx src/testing/testing_rotation.ts