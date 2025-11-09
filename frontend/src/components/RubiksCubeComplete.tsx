import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

// ============ CUBE LOGIC (from your cube.ts) ============

type FaceName = "U" | "R" | "F" | "D" | "L" | "B";
type Cube = number[][][];
type Move = {face: FaceName, clockwise: boolean};

const COLOR_MAP = {
  1: "#C41E3A", // Red
  2: "#009B48", // Green
  3: "#0051BA", // Blue
  4: "#FFD500", // Yellow
  5: "#FF5800", // Orange
  6: "#FFFFFF", // White
};

// Simplified cube helper functions (replace with your actual CubeHelper if needed)
class SimpleCubeHelper {
  // Rotate a face 90 degrees clockwise
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
    
    // Rotate top face
    newCube[1] = clockwise 
      ? this.rotateFaceClockwise(cube[1])
      : this.rotateFaceCounterClockwise(cube[1]);
    
    // Rotate top row of side faces
    if (clockwise) {
      const temp = newCube[2][0]; // Front
      newCube[2][0] = newCube[5][0]; // Right -> Front
      newCube[5][0] = newCube[0][0]; // Back -> Right
      newCube[0][0] = newCube[4][0]; // Left -> Back
      newCube[4][0] = temp; // Front -> Left
    } else {
      const temp = newCube[2][0]; // Front
      newCube[2][0] = newCube[4][0]; // Left -> Front
      newCube[4][0] = newCube[0][0]; // Back -> Left
      newCube[0][0] = newCube[5][0]; // Right -> Back
      newCube[5][0] = temp; // Front -> Right
    }
    
    return newCube;
  }

  rotateD(cube: Cube, clockwise: boolean): Cube {
    const newCube = JSON.parse(JSON.stringify(cube));
    
    // Rotate bottom face
    newCube[3] = clockwise 
      ? this.rotateFaceClockwise(cube[3])
      : this.rotateFaceCounterClockwise(cube[3]);
    
    // Rotate bottom row of side faces
    if (clockwise) {
      const temp = newCube[2][2]; // Front
      newCube[2][2] = newCube[4][2]; // Left -> Front
      newCube[4][2] = newCube[0][2]; // Back -> Left
      newCube[0][2] = newCube[5][2]; // Right -> Back
      newCube[5][2] = temp; // Front -> Right
    } else {
      const temp = newCube[2][2]; // Front
      newCube[2][2] = newCube[5][2]; // Right -> Front
      newCube[5][2] = newCube[0][2]; // Back -> Right
      newCube[0][2] = newCube[4][2]; // Left -> Back
      newCube[4][2] = temp; // Front -> Left
    }
    
    return newCube;
  }

  rotateF(cube: Cube, clockwise: boolean): Cube {
    const newCube = JSON.parse(JSON.stringify(cube));
    
    // Rotate front face
    newCube[2] = clockwise 
      ? this.rotateFaceClockwise(cube[2])
      : this.rotateFaceCounterClockwise(cube[2]);
    
    if (clockwise) {
      const temp = [newCube[1][2][0], newCube[1][2][1], newCube[1][2][2]]; // Top bottom row
      newCube[1][2] = [newCube[4][2][2], newCube[4][1][2], newCube[4][0][2]]; // Left right column -> Top
      [newCube[4][0][2], newCube[4][1][2], newCube[4][2][2]] = [newCube[3][0][0], newCube[3][0][1], newCube[3][0][2]]; // Bottom top row -> Left
      newCube[3][0] = [newCube[5][2][0], newCube[5][1][0], newCube[5][0][0]]; // Right left column -> Bottom
      [newCube[5][0][0], newCube[5][1][0], newCube[5][2][0]] = temp; // Top -> Right
    } else {
      const temp = [newCube[1][2][0], newCube[1][2][1], newCube[1][2][2]]; // Top bottom row
      newCube[1][2] = [newCube[5][0][0], newCube[5][1][0], newCube[5][2][0]]; // Right left column -> Top
      [newCube[5][0][0], newCube[5][1][0], newCube[5][2][0]] = [newCube[3][0][2], newCube[3][0][1], newCube[3][0][0]]; // Bottom -> Right
      newCube[3][0] = [newCube[4][0][2], newCube[4][1][2], newCube[4][2][2]]; // Left -> Bottom
      [newCube[4][0][2], newCube[4][1][2], newCube[4][2][2]] = [temp[2], temp[1], temp[0]]; // Top -> Left
    }
    
    return newCube;
  }

  rotateB(cube: Cube, clockwise: boolean): Cube {
    const newCube = JSON.parse(JSON.stringify(cube));
    
    // Rotate back face
    newCube[0] = clockwise 
      ? this.rotateFaceClockwise(cube[0])
      : this.rotateFaceCounterClockwise(cube[0]);
    
    if (clockwise) {
      const temp = [newCube[1][0][0], newCube[1][0][1], newCube[1][0][2]]; // Top top row
      newCube[1][0] = [newCube[5][0][2], newCube[5][1][2], newCube[5][2][2]]; // Right right column -> Top
      [newCube[5][0][2], newCube[5][1][2], newCube[5][2][2]] = [newCube[3][2][2], newCube[3][2][1], newCube[3][2][0]]; // Bottom -> Right
      newCube[3][2] = [newCube[4][0][0], newCube[4][1][0], newCube[4][2][0]]; // Left -> Bottom
      [newCube[4][0][0], newCube[4][1][0], newCube[4][2][0]] = [temp[2], temp[1], temp[0]]; // Top -> Left
    } else {
      const temp = [newCube[1][0][0], newCube[1][0][1], newCube[1][0][2]]; // Top top row
      newCube[1][0] = [newCube[4][2][0], newCube[4][1][0], newCube[4][0][0]]; // Left left column -> Top
      [newCube[4][0][0], newCube[4][1][0], newCube[4][2][0]] = [newCube[3][2][0], newCube[3][2][1], newCube[3][2][2]]; // Bottom -> Left
      newCube[3][2] = [newCube[5][2][2], newCube[5][1][2], newCube[5][0][2]]; // Right -> Bottom
      [newCube[5][0][2], newCube[5][1][2], newCube[5][2][2]] = temp; // Top -> Right
    }
    
    return newCube;
  }

  rotateL(cube: Cube, clockwise: boolean): Cube {
    const newCube = JSON.parse(JSON.stringify(cube));
    
    // Rotate left face
    newCube[4] = clockwise 
      ? this.rotateFaceClockwise(cube[4])
      : this.rotateFaceCounterClockwise(cube[4]);
    
    if (clockwise) {
      const temp = [newCube[1][0][0], newCube[1][1][0], newCube[1][2][0]]; // Top left column
      [newCube[1][0][0], newCube[1][1][0], newCube[1][2][0]] = [newCube[0][2][2], newCube[0][1][2], newCube[0][0][2]]; // Back -> Top
      [newCube[0][0][2], newCube[0][1][2], newCube[0][2][2]] = [newCube[3][2][0], newCube[3][1][0], newCube[3][0][0]]; // Bottom -> Back
      [newCube[3][0][0], newCube[3][1][0], newCube[3][2][0]] = [newCube[2][0][0], newCube[2][1][0], newCube[2][2][0]]; // Front -> Bottom
      [newCube[2][0][0], newCube[2][1][0], newCube[2][2][0]] = temp; // Top -> Front
    } else {
      const temp = [newCube[1][0][0], newCube[1][1][0], newCube[1][2][0]]; // Top left column
      [newCube[1][0][0], newCube[1][1][0], newCube[1][2][0]] = [newCube[2][0][0], newCube[2][1][0], newCube[2][2][0]]; // Front -> Top
      [newCube[2][0][0], newCube[2][1][0], newCube[2][2][0]] = [newCube[3][0][0], newCube[3][1][0], newCube[3][2][0]]; // Bottom -> Front
      [newCube[3][0][0], newCube[3][1][0], newCube[3][2][0]] = [newCube[0][2][2], newCube[0][1][2], newCube[0][0][2]]; // Back -> Bottom
      [newCube[0][0][2], newCube[0][1][2], newCube[0][2][2]] = [temp[2], temp[1], temp[0]]; // Top -> Back
    }
    
    return newCube;
  }

  rotateR(cube: Cube, clockwise: boolean): Cube {
    const newCube = JSON.parse(JSON.stringify(cube));
    
    // Rotate right face
    newCube[5] = clockwise 
      ? this.rotateFaceClockwise(cube[5])
      : this.rotateFaceCounterClockwise(cube[5]);
    
    if (clockwise) {
      const temp = [newCube[1][0][2], newCube[1][1][2], newCube[1][2][2]]; // Top right column
      [newCube[1][0][2], newCube[1][1][2], newCube[1][2][2]] = [newCube[2][0][2], newCube[2][1][2], newCube[2][2][2]]; // Front -> Top
      [newCube[2][0][2], newCube[2][1][2], newCube[2][2][2]] = [newCube[3][0][2], newCube[3][1][2], newCube[3][2][2]]; // Bottom -> Front
      [newCube[3][0][2], newCube[3][1][2], newCube[3][2][2]] = [newCube[0][2][0], newCube[0][1][0], newCube[0][0][0]]; // Back -> Bottom
      [newCube[0][0][0], newCube[0][1][0], newCube[0][2][0]] = [temp[2], temp[1], temp[0]]; // Top -> Back
    } else {
      const temp = [newCube[1][0][2], newCube[1][1][2], newCube[1][2][2]]; // Top right column
      [newCube[1][0][2], newCube[1][1][2], newCube[1][2][2]] = [newCube[0][2][0], newCube[0][1][0], newCube[0][0][0]]; // Back -> Top
      [newCube[0][0][0], newCube[0][1][0], newCube[0][2][0]] = [newCube[3][2][2], newCube[3][1][2], newCube[3][0][2]]; // Bottom -> Back
      [newCube[3][0][2], newCube[3][1][2], newCube[3][2][2]] = [newCube[2][0][2], newCube[2][1][2], newCube[2][2][2]]; // Front -> Bottom
      [newCube[2][0][2], newCube[2][1][2], newCube[2][2][2]] = temp; // Top -> Front
    }
    
    return newCube;
  }
}

class RubikCube {
  private cube: Cube;
  private helper = new SimpleCubeHelper();

  constructor(cube?: Cube) {
    this.cube = cube || this.createSolvedCube();
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
        this.cube = this.helper.rotateU(this.cube, move.clockwise);
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
    return this.getCubeState();
  }

  scramble(numMoves: number = 20): Cube {
    const faces: FaceName[] = ["U", "D", "F", "B", "L", "R"];
    for (let i = 0; i < numMoves; i++) {
      const face = faces[Math.floor(Math.random() * faces.length)];
      const clockwise = Math.random() > 0.5;
      this.applyMove({ face, clockwise });
    }
    return this.getCubeState();
  }

  reset(): Cube {
    this.cube = this.createSolvedCube();
    return this.getCubeState();
  }
}

// ============ 3D VISUALIZATION ============
