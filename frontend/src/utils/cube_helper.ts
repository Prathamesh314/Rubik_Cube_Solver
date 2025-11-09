type Face = number[][];
type Cube = number[][][];

interface Dirs {
  Back: number;
  Top: number;
  Face: number;
  Bottom: number;
  Left: number;
  Right: number;
}

class CubeHelper {
  private dirs: Dirs;
  private moves: string[];

  constructor(dirs: Dirs) {
    this.dirs = dirs;
    this.moves = [];
  }

  rotateY(scrambleCube: Cube, dir: number, row: number): Cube {
    console.log("Direction: ", dir, " row: ",row);
    if (dir === -1) {
      if (row === 0) {
        this.moves.push("U");
        const face = scrambleCube[this.dirs.Face];
        const right = scrambleCube[this.dirs.Right];
        const left = scrambleCube[this.dirs.Left];
        const back = scrambleCube[this.dirs.Back];
        const top = scrambleCube[this.dirs.Top];

        let temp = [...face[0]];
        let face0 = [...right[0]]
        let right0 = [...back[0]].reverse();
        let back2 = [...left[0]].reverse();
        let left0 = temp;

        face[0] = face0;
        right[0] = right0;
        back[2] = back2;
        left[0] = left0;

        // FIXED: Inverted the rotation direction for the Top face
        const newTop: Face = Array(3).fill(0).map(() => Array(3).fill(0));
        const n = face.length;
        const m = face[0].length;
        for (let i = 0; i < n; i++) {
          for (let j = 0; j < m; j++) {
            newTop[i][j] = top[j][n - 1 - i];  // Changed from top[n - 1 - j][i]
          }
        }

        scrambleCube[this.dirs.Top] = newTop;
      } else {
        this.moves.push("D");
        const face = scrambleCube[this.dirs.Face];
        const right = scrambleCube[this.dirs.Right];
        const left = scrambleCube[this.dirs.Left];
        const back = scrambleCube[this.dirs.Back];
        const bottom = scrambleCube[this.dirs.Bottom];
        const n = face.length;
        
        let temp = [...face[n - 1]];
        let facen_1 = [...right[n - 1]];
        let rightn_1 = [...back[0]].reverse();
        let back0 = [...left[n - 1]].reverse();
        let leftn_1 = temp;

        face[n - 1] = facen_1;
        right[n - 1] = rightn_1;
        back[0] = back0;
        left[n - 1] = leftn_1;

        // FIXED: Inverted the rotation direction for the Bottom face
        const newBottom: Face = Array(3).fill(0).map(() => Array(3).fill(0));
        const m = face[0].length;
        for (let i = 0; i < n; i++) {
          for (let j = 0; j < m; j++) {
            newBottom[i][j] = bottom[n - 1 - j][i];  // Changed from bottom[j][n - i - 1]
          }
        }
        scrambleCube[this.dirs.Bottom] = newBottom;
      }
    } else {
      if (row === 0) {
        this.moves.push("U'");
        const face = scrambleCube[this.dirs.Face];
        const right = scrambleCube[this.dirs.Right];
        const left = scrambleCube[this.dirs.Left];
        const back = scrambleCube[this.dirs.Back];
        const top = scrambleCube[this.dirs.Top];
        
        let temp = [...face[0]];
        let face0 = [...left[0]];
        let left0 = [...back[2]].reverse();
        let back2 = [...right[0]].reverse();
        let right0 = temp;

        face[0] = face0;
        left[0] = left0;
        back[2] = back2;
        right[0] = right0;

        // FIXED: Inverted the rotation direction for the Top face (counter-clockwise)
        const newTop: Face = Array(3).fill(0).map(() => Array(3).fill(0));
        const n = face.length;
        const m = face[0].length;
        for (let i = 0; i < n; i++) {
          for (let j = 0; j < m; j++) {
            newTop[i][j] = top[n - 1 - j][i];  // Changed from top[j][n - 1 - i]
          }
        }
        scrambleCube[this.dirs.Top] = newTop;
      } else {
        this.moves.push("D'");
        const face = scrambleCube[this.dirs.Face];
        const right = scrambleCube[this.dirs.Right];
        const left = scrambleCube[this.dirs.Left];
        const back = scrambleCube[this.dirs.Back];
        const bottom = scrambleCube[this.dirs.Bottom];
        const n = face.length;
        
        let temp = [...face[n - 1]];
        let facen_1 = [...left[n - 1]];
        let leftn_1 = [...back[0]].reverse();
        let back0 = [...right[n - 1]].reverse();
        let rightn_1 = temp;


        face[n - 1] = facen_1
        left[n - 1] = leftn_1
        back[0] = back0;
        right[n - 1] = rightn_1;

        // FIXED: Inverted the rotation direction for the Bottom face (counter-clockwise)
        const newBottom: Face = Array(3).fill(0).map(() => Array(3).fill(0));
        const m = face[0].length;
        for (let i = 0; i < n; i++) {
          for (let j = 0; j < m; j++) {
            newBottom[i][j] = bottom[j][n - 1 - i];  // Changed from bottom[n - j - 1][i]
          }
        }
        scrambleCube[this.dirs.Bottom] = newBottom;
      }
    }
    return scrambleCube
  }

  rotateX(scrambledCube: Cube, dir: number, col: number): Cube {
    if (dir === 1) {
      if (col === 0) {
        this.moves.push("L");
        const top = scrambledCube[this.dirs.Top];
        const face = scrambledCube[this.dirs.Face];
        const bottom = scrambledCube[this.dirs.Bottom];
        const back = scrambledCube[this.dirs.Back];
        const left = scrambledCube[this.dirs.Left];
        
        const temp: number[] = [];
        const n = face.length;
        
        for (let i = 0; i < n; i++) {
          temp.push(top[i][col]);
        }
        
        for (let i = 0; i < n; i++) {
          top[i][col] = face[i][col];
        }
        for (let i = 0; i < n; i++) {
          face[i][col] = bottom[i][col];
        }
        for (let i = 0; i < n; i++) {
          bottom[i][col] = back[i][col];
        }
        for (let i = 0; i < n; i++) {
          back[i][col] = temp[i];
        }

        // FIXED: Inverted the rotation direction for the Left face
        const newLeft: Face = Array(3).fill(0).map(() => Array(3).fill(0));
        for (let i = 0; i < n; i++) {
          for (let j = 0; j < n; j++) {
            newLeft[i][j] = left[n - 1 - j][i];  // Changed from left[j][n - 1 - i]
          }
        }
        scrambledCube[this.dirs.Left] = newLeft;
      } else {
        this.moves.push("R");
        const top = scrambledCube[this.dirs.Top];
        const face = scrambledCube[this.dirs.Face];
        const bottom = scrambledCube[this.dirs.Bottom];
        const back = scrambledCube[this.dirs.Back];
        const right = scrambledCube[this.dirs.Right];
        
        const temp: number[] = [];
        const n = face.length;
        
        for (let i = 0; i < n; i++) {
          temp.push(top[i][col]);
        }
        
        for (let i = 0; i < n; i++) {
          top[i][col] = face[i][col];
        }
        for (let i = 0; i < n; i++) {
          face[i][col] = bottom[i][col];
        }
        for (let i = 0; i < n; i++) {
          bottom[i][col] = back[i][col];
        }
        for (let i = 0; i < n; i++) {
          back[i][col] = temp[i];
        }

        // FIXED: Inverted the rotation direction for the Right face
        const newRight: Face = Array(3).fill(0).map(() => Array(3).fill(0));
        for (let i = 0; i < n; i++) {
          for (let j = 0; j < n; j++) {
            newRight[i][j] = right[j][n - 1 - i];  // Changed from right[n - 1 - j][i]
          }
        }
        scrambledCube[this.dirs.Right] = newRight;
      }
    } else {
      if (col === 0) {
        this.moves.push("L'");
        const top = scrambledCube[this.dirs.Top];
        const face = scrambledCube[this.dirs.Face];
        const bottom = scrambledCube[this.dirs.Bottom];
        const back = scrambledCube[this.dirs.Back];
        const left = scrambledCube[this.dirs.Left];
        
        const temp: number[] = [];
        const n = face.length;
        
        for (let i = 0; i < n; i++) {
          temp.push(top[i][col]);
        }
        
        for (let i = 0; i < n; i++) {
          top[i][col] = back[i][col];
        }
        for (let i = 0; i < n; i++) {
          back[i][col] = bottom[i][col];
        }
        for (let i = 0; i < n; i++) {
          bottom[i][col] = face[i][col];
        }
        for (let i = 0; i < n; i++) {
          face[i][col] = temp[i];
        }

        // FIXED: Inverted the rotation direction for the Left face (counter-clockwise)
        const newLeft: Face = Array(3).fill(0).map(() => Array(3).fill(0));
        for (let i = 0; i < n; i++) {
          for (let j = 0; j < n; j++) {
            newLeft[i][j] = left[j][n - 1 - i];  // Changed from left[n - 1 - j][i]
          }
        }
        scrambledCube[this.dirs.Left] = newLeft;
      } else {
        this.moves.push("R'");
        const top = scrambledCube[this.dirs.Top];
        const face = scrambledCube[this.dirs.Face];
        const bottom = scrambledCube[this.dirs.Bottom];
        const back = scrambledCube[this.dirs.Back];
        const right = scrambledCube[this.dirs.Right];
        
        const temp: number[] = [];
        const n = face.length;
        
        for (let i = 0; i < n; i++) {
          temp.push(top[i][col]);
        }
        
        for (let i = 0; i < n; i++) {
          top[i][col] = back[i][col];
        }
        for (let i = 0; i < n; i++) {
          back[i][col] = bottom[i][col];
        }
        for (let i = 0; i < n; i++) {
          bottom[i][col] = face[i][col];
        }
        for (let i = 0; i < n; i++) {
          face[i][col] = temp[i];
        }

        // FIXED: Inverted the rotation direction for the Right face (counter-clockwise)
        const newRight: Face = Array(3).fill(0).map(() => Array(3).fill(0));
        for (let i = 0; i < n; i++) {
          for (let j = 0; j < n; j++) {
            newRight[i][j] = right[n - 1 - j][i];  // Changed from right[j][n - 1 - i]
          }
        }
        scrambledCube[this.dirs.Right] = newRight;
      }
    }

    return scrambledCube
  }

  rotateZ(scrambleCube: Cube, dir: number, row: number): Cube {
    if (dir === 1) {
      if (row === 2) {
        this.moves.push("F");
        const face = scrambleCube[this.dirs.Face];
        const top = scrambleCube[this.dirs.Top];
        const right = scrambleCube[this.dirs.Right];
        const left = scrambleCube[this.dirs.Left];
        const bottom = scrambleCube[this.dirs.Bottom];
        const n = face.length;
        
        let temp = [...top[row]];
        
        for (let i = 0; i < n; i++) {
          top[row][i] = left[2 - i][row];
        }
        for (let i = 0; i < n; i++) {
          left[i][row] = bottom[n - 1 - row][i];
        }
        for (let i = 0; i < n; i++) {
          bottom[n - 1 - row][i] = right[i][n - 1 - row];
        }
        for (let i = 0; i < n; i++) {
          right[i][n - 1 - row] = temp[i];
        }

        scrambleCube[this.dirs.Bottom][n - 1 - row] = bottom[n - 1 - row].reverse();
        
        // FIXED: Inverted the rotation direction for the Front face
        const newFace: Face = Array(3).fill(0).map(() => Array(3).fill(0));
        for (let i = 0; i < n; i++) {
          for (let j = 0; j < n; j++) {
            newFace[i][j] = face[j][n - 1 - i];  // Changed from face[n - 1 - j][i]
          }
        }
        scrambleCube[this.dirs.Face] = newFace;
      } else {
        this.moves.push("B");
        const back = scrambleCube[this.dirs.Back];
        const top = scrambleCube[this.dirs.Top];
        const left = scrambleCube[this.dirs.Left];
        const right = scrambleCube[this.dirs.Right];
        const bottom = scrambleCube[this.dirs.Bottom];
        const n = top.length;
        
        let temp = [...top[row]];
        
        for (let i = 0; i < n; i++) {
          top[row][i] = left[2 - i][row];
        }
        for (let i = 0; i < n; i++) {
          left[i][row] = bottom[2 - row][i];
        }
        for (let i = 0; i < n; i++) {
          bottom[n - 1 - row][i] = right[2 - i][2 - row];
        }
        for (let i = 0; i < n; i++) {
          right[i][2 - row] = temp[i];
        }
        
        scrambleCube[this.dirs.Top][row] = top[row];
        scrambleCube[this.dirs.Bottom][n - 1 - row] = bottom[n - 1 - row];
        
        for (let i = 0; i < 3; i++) {
          scrambleCube[this.dirs.Left][i][row] = left[i][row];
          scrambleCube[this.dirs.Right][i][n - 1 - row] = right[i][n - 1 - row];
        }
        
        // FIXED: Inverted the rotation direction for the Back face
        const newBack: Face = Array(3).fill(0).map(() => Array(n).fill(0));
        for (let i = 0; i < n; i++) {
          for (let j = 0; j < n; j++) {
            newBack[i][j] = back[n - 1 - j][i];  // Changed from back[j][2 - i]
          }
        }
        scrambleCube[this.dirs.Back] = newBack;
      }
    } else {
      if (row === 2) {
        this.moves.push("F'");
        const face = scrambleCube[this.dirs.Face];
        const top = scrambleCube[this.dirs.Top];
        const left = scrambleCube[this.dirs.Left];
        const right = scrambleCube[this.dirs.Right];
        const bottom = scrambleCube[this.dirs.Bottom];
        const n = face.length;
        
        let temp = [...top[row]];
        
        for (let i = 0; i < n; i++) {
          top[row][i] = right[i][n - 1 - row];
        }
        for (let i = 0; i < n; i++) {
          right[2 - i][n - 1 - row] = bottom[n - 1 - row][i];
        }
        for (let i = 0; i < n; i++) {
          bottom[n - 1 - row][i] = left[i][row];
        }
        for (let i = 0; i < n; i++) {
          left[2 - i][row] = temp[i];
        }
        
        // FIXED: Inverted the rotation direction for the Front face (counter-clockwise)
        const newFace: Face = Array(3).fill(0).map(() => Array(n).fill(0));
        for (let i = 0; i < n; i++) {
          for (let j = 0; j < n; j++) {
            newFace[i][j] = face[n - 1 - j][i];  // Changed from face[j][n - 1 - i]
          }
        }
        scrambleCube[this.dirs.Face] = newFace;
      } else {
        this.moves.push("B'");
        const back = scrambleCube[this.dirs.Back];
        const top = scrambleCube[this.dirs.Top];
        const left = scrambleCube[this.dirs.Left];
        const right = scrambleCube[this.dirs.Right];
        const bottom = scrambleCube[this.dirs.Bottom];
        
        let temp = [...top[row]];
        const n = back.length;
        
        for (let i = 0; i < n; i++) {
          top[row][i] = right[i][n - 1 - row];
        }
        for (let i = 0; i < n; i++) {
          right[i][n - 1 - row] = bottom[n - 1 - row][i];
        }
        for (let i = 0; i < n; i++) {
          bottom[n - 1 - row][i] = left[i][row];
        }
        for (let i = 0; i < n; i++) {
          left[i][row] = temp[i];
        }

        scrambleCube[this.dirs.Top][row] = top[row];
        scrambleCube[this.dirs.Bottom][n - 1 - row] = bottom[n - 1 - row];
        
        let tempVal = scrambleCube[this.dirs.Left][0][row];
        scrambleCube[this.dirs.Left][0][row] = scrambleCube[this.dirs.Left][2][row];
        scrambleCube[this.dirs.Left][2][row] = tempVal;
        
        tempVal = scrambleCube[this.dirs.Right][0][n - 1 - row];
        scrambleCube[this.dirs.Right][0][n - 1 - row] = scrambleCube[this.dirs.Right][2][n - 1 - row];
        scrambleCube[this.dirs.Right][2][n - 1 - row] = tempVal;

        // FIXED: Inverted the rotation direction for the Back face (counter-clockwise)
        const newBack: Face = Array(3).fill(0).map(() => Array(n).fill(0));
        for (let i = 0; i < n; i++) {
          for (let j = 0; j < n; j++) {
            newBack[i][j] = back[j][n - 1 - i];  // Changed from back[n - 1 - j][i]
          }
        }
        scrambleCube[this.dirs.Back] = newBack;
      }
    }

    return scrambleCube
  }

  getMoves(): string[] {
    const moves = ["F", "F'", "B", "B'", "L", "L'", "R", "R'", "U", "U'", "D", "D'"];
    const names = [
      "Move front face clockwise",
      "Move front face anti-clockwise",
      "Move back face clockwise",
      "Move back face anti-clockwise",
      "Move left face clockwise",
      "Move left face anti-clockwise",
      "Move right face clockwise",
      "Move right face anti-clockwise",
      "Move up face clockwise",
      "Move up face anti-clockwise",
      "Move down face clockwise",
      "Move down face anti-clockwise"
    ];
    
    console.log("Moves Names | Moves Def.");
    console.log("------------|------------");
    for (let i = 0; i < moves.length; i++) {
      console.log(`${moves[i].padEnd(11)} | ${names[i]}`);
    }
    console.log();
    
    return this.moves;
  }
}

export default CubeHelper;