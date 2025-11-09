import { Cube } from "@/components/cube";

export class SimpleCubeHelper {
  rotateFaceClockwise(face: number[][]) {
    return [
      [face[2][0], face[1][0], face[0][0]],
      [face[2][1], face[1][1], face[0][1]],
      [face[2][2], face[1][2], face[0][2]]
    ];
  }

  rotateFaceCounterClockwise(face: number[][]) {
    return [
      [face[0][2], face[1][2], face[2][2]],
      [face[0][1], face[1][1], face[2][1]],
      [face[0][0], face[1][0], face[2][0]]
    ];
  }

  rotateU(cube: Cube, clockwise: boolean): Cube {
    const newCube = JSON.parse(JSON.stringify(cube));
    
    newCube[1] = clockwise 
      ? this.rotateFaceClockwise(cube[1])
      : this.rotateFaceCounterClockwise(cube[1]);
    
    if (clockwise) {
      const temp = newCube[2][0];
      newCube[2][0] = newCube[5][0]; 
      newCube[5][0] = newCube[0][0]; 
      newCube[0][0] = newCube[4][0]; 
      newCube[4][0] = temp; 
    } else {
      const temp = newCube[2][0]; 
      newCube[2][0] = newCube[4][0]; 
      newCube[4][0] = newCube[0][0]; 
      newCube[0][0] = newCube[5][0]; 
      newCube[5][0] = temp; 
    }
    
    return newCube;
  }

  rotateD(cube: Cube, clockwise: boolean): Cube {
    const newCube = JSON.parse(JSON.stringify(cube));
    
    
    newCube[3] = clockwise 
      ? this.rotateFaceClockwise(cube[3])
      : this.rotateFaceCounterClockwise(cube[3]);
    
    
    if (clockwise) {
      const temp = newCube[2][2]; 
      newCube[2][2] = newCube[4][2]; 
      newCube[4][2] = newCube[0][2]; 
      newCube[0][2] = newCube[5][2]; 
      newCube[5][2] = temp; 
    } else {
      const temp = newCube[2][2]; 
      newCube[2][2] = newCube[5][2]; 
      newCube[5][2] = newCube[0][2]; 
      newCube[0][2] = newCube[4][2]; 
      newCube[4][2] = temp; 
    }
    
    return newCube;
  }

  rotateF(cube: Cube, clockwise: boolean): Cube {
    const newCube = JSON.parse(JSON.stringify(cube));
    
    newCube[2] = clockwise 
      ? this.rotateFaceClockwise(cube[2])
      : this.rotateFaceCounterClockwise(cube[2]);
    
    if (clockwise) {
      const temp = [newCube[1][2][0], newCube[1][2][1], newCube[1][2][2]]; //
      newCube[1][2] = [newCube[4][2][2], newCube[4][1][2], newCube[4][0][2]]; 
      [newCube[4][0][2], newCube[4][1][2], newCube[4][2][2]] = [newCube[3][0][0], newCube[3][0][1], newCube[3][0][2]]; 
      newCube[3][0] = [newCube[5][2][0], newCube[5][1][0], newCube[5][0][0]]; 
      [newCube[5][0][0], newCube[5][1][0], newCube[5][2][0]] = temp; 
    } else {
      const temp = [newCube[1][2][0], newCube[1][2][1], newCube[1][2][2]]; 
      newCube[1][2] = [newCube[5][0][0], newCube[5][1][0], newCube[5][2][0]]; 
      [newCube[5][0][0], newCube[5][1][0], newCube[5][2][0]] = [newCube[3][0][2], newCube[3][0][1], newCube[3][0][0]]; 
      newCube[3][0] = [newCube[4][0][2], newCube[4][1][2], newCube[4][2][2]]; 
      [newCube[4][0][2], newCube[4][1][2], newCube[4][2][2]] = [temp[2], temp[1], temp[0]]; 
    }
    
    return newCube;
  }

  rotateB(cube: Cube, clockwise: boolean): Cube {
    const newCube = JSON.parse(JSON.stringify(cube));
    
    
    newCube[0] = clockwise 
      ? this.rotateFaceClockwise(cube[0])
      : this.rotateFaceCounterClockwise(cube[0]);
    
    if (clockwise) {
      const temp = [newCube[1][0][0], newCube[1][0][1], newCube[1][0][2]]; 
      newCube[1][0] = [newCube[5][0][2], newCube[5][1][2], newCube[5][2][2]]; 
      [newCube[5][0][2], newCube[5][1][2], newCube[5][2][2]] = [newCube[3][2][2], newCube[3][2][1], newCube[3][2][0]]; 
      newCube[3][2] = [newCube[4][0][0], newCube[4][1][0], newCube[4][2][0]]; 
      [newCube[4][0][0], newCube[4][1][0], newCube[4][2][0]] = [temp[2], temp[1], temp[0]]; 
    } else {
      const temp = [newCube[1][0][0], newCube[1][0][1], newCube[1][0][2]]; 
      newCube[1][0] = [newCube[4][2][0], newCube[4][1][0], newCube[4][0][0]]; 
      [newCube[4][0][0], newCube[4][1][0], newCube[4][2][0]] = [newCube[3][2][0], newCube[3][2][1], newCube[3][2][2]]; 
      newCube[3][2] = [newCube[5][2][2], newCube[5][1][2], newCube[5][0][2]]; 
      [newCube[5][0][2], newCube[5][1][2], newCube[5][2][2]] = temp; 
    }
    
    return newCube;
  }

  rotateL(cube: Cube, clockwise: boolean): Cube {
    const newCube = JSON.parse(JSON.stringify(cube));
    
    
    newCube[4] = clockwise 
      ? this.rotateFaceClockwise(cube[4])
      : this.rotateFaceCounterClockwise(cube[4]);
    
    if (clockwise) {
      const temp = [newCube[1][0][0], newCube[1][1][0], newCube[1][2][0]]; 
      [newCube[1][0][0], newCube[1][1][0], newCube[1][2][0]] = [newCube[0][2][2], newCube[0][1][2], newCube[0][0][2]]; 
      [newCube[0][0][2], newCube[0][1][2], newCube[0][2][2]] = [newCube[3][2][0], newCube[3][1][0], newCube[3][0][0]]; 
      [newCube[3][0][0], newCube[3][1][0], newCube[3][2][0]] = [newCube[2][0][0], newCube[2][1][0], newCube[2][2][0]]; 
      [newCube[2][0][0], newCube[2][1][0], newCube[2][2][0]] = temp; 
    } else {
      const temp = [newCube[1][0][0], newCube[1][1][0], newCube[1][2][0]]; 
      [newCube[1][0][0], newCube[1][1][0], newCube[1][2][0]] = [newCube[2][0][0], newCube[2][1][0], newCube[2][2][0]]; 
      [newCube[2][0][0], newCube[2][1][0], newCube[2][2][0]] = [newCube[3][0][0], newCube[3][1][0], newCube[3][2][0]]; 
      [newCube[3][0][0], newCube[3][1][0], newCube[3][2][0]] = [newCube[0][2][2], newCube[0][1][2], newCube[0][0][2]]; 
      [newCube[0][0][2], newCube[0][1][2], newCube[0][2][2]] = [temp[2], temp[1], temp[0]]; 
    }
    
    return newCube;
  }

  rotateR(cube: Cube, clockwise: boolean): Cube {
    const newCube = JSON.parse(JSON.stringify(cube));
    
    
    newCube[5] = clockwise 
      ? this.rotateFaceClockwise(cube[5])
      : this.rotateFaceCounterClockwise(cube[5]);
    
    if (clockwise) {
      const temp = [newCube[1][0][2], newCube[1][1][2], newCube[1][2][2]]; 
      [newCube[1][0][2], newCube[1][1][2], newCube[1][2][2]] = [newCube[2][0][2], newCube[2][1][2], newCube[2][2][2]]; 
      [newCube[2][0][2], newCube[2][1][2], newCube[2][2][2]] = [newCube[3][0][2], newCube[3][1][2], newCube[3][2][2]]; 
      [newCube[3][0][2], newCube[3][1][2], newCube[3][2][2]] = [newCube[0][2][0], newCube[0][1][0], newCube[0][0][0]]; 
      [newCube[0][0][0], newCube[0][1][0], newCube[0][2][0]] = [temp[2], temp[1], temp[0]]; 
    } else {
      const temp = [newCube[1][0][2], newCube[1][1][2], newCube[1][2][2]]; 
      [newCube[1][0][2], newCube[1][1][2], newCube[1][2][2]] = [newCube[0][2][0], newCube[0][1][0], newCube[0][0][0]]; 
      [newCube[0][0][0], newCube[0][1][0], newCube[0][2][0]] = [newCube[3][2][2], newCube[3][1][2], newCube[3][0][2]]; 
      [newCube[3][0][2], newCube[3][1][2], newCube[3][2][2]] = [newCube[2][0][2], newCube[2][1][2], newCube[2][2][2]]; 
      [newCube[2][0][2], newCube[2][1][2], newCube[2][2][2]] = temp; 
    }
    
    return newCube;
  }
}