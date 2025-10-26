// src/utils/cube_utils.ts
export interface ColorMapping {
    [colorName: string]: number;
  }
  
  export class CubeUtils {
    static createSolvedCube(colors: ColorMapping): number[][][] {
      return [
        // Back - White
        Array(3).fill(null).map(() => Array(3).fill(colors["White"])),
        // Top - Red
        Array(3).fill(null).map(() => Array(3).fill(colors["Red"])),
        // Front - Yellow
        Array(3).fill(null).map(() => Array(3).fill(colors["Yellow"])),
        // Bottom - Orange
        Array(3).fill(null).map(() => Array(3).fill(colors["Orange"])),
        // Left - Green
        Array(3).fill(null).map(() => Array(3).fill(colors["Green"])),
        // Right - Blue
        Array(3).fill(null).map(() => Array(3).fill(colors["Blue"]))
      ];
    }
  
    static parseCubeState(scrambledCube: number[][][], orders: string[]): number[][][] {
      const faceOrder = ["Back", "Top", "Front", "Bottom", "Left", "Right"];
      const reordered: number[][][] = [];
      
      faceOrder.forEach(faceName => {
        const index = orders.indexOf(faceName);
        if (index !== -1) {
          reordered.push(scrambledCube[index]);
        }
      });
      
      return reordered;
    }
  
    static getDefaultColors(): ColorMapping {
      return {
        "White": 4,
        "Red": 6,
        "Yellow": 2,
        "Orange": 5,
        "Green": 3,
        "Blue": 1,
      };
    }
  
    static getDefaultOrders(): string[] {
      return ["Back", "Top", "Front", "Bottom", "Left", "Right"];
    }
  }