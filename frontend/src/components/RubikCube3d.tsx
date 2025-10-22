"use client";

import { useEffect, useRef } from "react";
import p5 from "p5";

interface RubiksCubeProps {
  scrambledCube: number[][][];
  orders: string[];
  colorMapping?: string[]; // Optional custom color mapping
}

export default function RubiksCubeAdvanced({
  scrambledCube,
  orders,
  colorMapping = ["#ffffff", "#ffff00", "#ff0000", "#ffa500", "#0000ff", "#00ff00"],
}: RubiksCubeProps) {
  const sketchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sketchRef.current) return;

    const sketch = (p: p5) => {
      // Convert hex color to p5.Color
      const hexToP5Color = (hex: string): p5.Color => {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return p.color(r, g, b);
      };

      const getColorFromNumber = (num: number): p5.Color => {
        if (num < 1 || num > 6) return p.color(50); // Black for invalid
        return hexToP5Color(colorMapping[num - 1]);
      };

      class Face {
        color: p5.Color;

        constructor(c: p5.Color) {
          this.color = c;
        }

        show() {
          p.fill(this.color);
          p.stroke(0);
          p.strokeWeight(0.08);
          p.rectMode(p.CENTER);
          p.rect(0, 0, 0.95, 0.95);
        }
      }

      class Cubie {
        x: number;
        y: number;
        z: number;
        faces: Face[];

        constructor(x: number, y: number, z: number, faceColors: number[]) {
          this.x = x;
          this.y = y;
          this.z = z;

          this.faces = faceColors.map((color) => new Face(getColorFromNumber(color)));
        }

        show() {
          p.push();
          p.translate(this.x * 1.05, this.y * 1.05, this.z * 1.05);

          // Front face
          if (this.z === 1) {
            p.push();
            p.translate(0, 0, 0.5);
            this.faces[0].show();
            p.pop();
          }

          // Back face
          if (this.z === -1) {
            p.push();
            p.translate(0, 0, -0.5);
            p.rotateY(p.PI);
            this.faces[1].show();
            p.pop();
          }

          // Right face
          if (this.x === 1) {
            p.push();
            p.translate(0.5, 0, 0);
            p.rotateY(p.HALF_PI);
            this.faces[2].show();
            p.pop();
          }

          // Left face
          if (this.x === -1) {
            p.push();
            p.translate(-0.5, 0, 0);
            p.rotateY(-p.HALF_PI);
            this.faces[3].show();
            p.pop();
          }

          // Top face
          if (this.y === -1) {
            p.push();
            p.translate(0, -0.5, 0);
            p.rotateX(p.HALF_PI);
            this.faces[4].show();
            p.pop();
          }

          // Bottom face
          if (this.y === 1) {
            p.push();
            p.translate(0, 0.5, 0);
            p.rotateX(-p.HALF_PI);
            this.faces[5].show();
            p.pop();
          }

          p.pop();
        }
      }

      const matrixToCube = (matrix: number[][][], faceOrders: string[]) => {
        const cube: Cubie[] = [];

        const getFaceMatrix = (faceName: string) => {
          const idx = faceOrders.indexOf(faceName);
          return matrix[idx];
        };

        const faces = {
          Front: getFaceMatrix("Front"),
          Back: getFaceMatrix("Back"),
          Top: getFaceMatrix("Top"),
          Bottom: getFaceMatrix("Bottom"),
          Left: getFaceMatrix("Left"),
          Right: getFaceMatrix("Right"),
        };

        for (let x = -1; x <= 1; x++) {
          for (let y = -1; y <= 1; y++) {
            for (let z = -1; z <= 1; z++) {
              const xi = x + 1; // 0, 1, 2
              const yi = y + 1;
              const zi = z + 1;

              const faceColors = [0, 0, 0, 0, 0, 0];

              if (z === 1) faceColors[0] = faces.Front[yi][xi];
              if (z === -1) faceColors[1] = faces.Back[yi][2 - xi];
              if (x === 1) faceColors[2] = faces.Right[yi][2 - zi];
              if (x === -1) faceColors[3] = faces.Left[yi][zi];
              if (y === -1) faceColors[4] = faces.Top[2 - zi][xi];
              if (y === 1) faceColors[5] = faces.Bottom[zi][xi];

              cube.push(new Cubie(x, y, z, faceColors));
            }
          }
        }

        return cube;
      };

      let cube: Cubie[] = [];
      let angleX = -0.4;
      let angleY = 0.6;
      let isDragging = false;
      let lastMouseX = 0;
      let lastMouseY = 0;

      p.setup = () => {
        p.createCanvas(600, 600, p.WEBGL);
        cube = matrixToCube(scrambledCube, orders);
        p.smooth();
      };

      p.draw = () => {
        p.background(20);
        
        // Add ambient light for better 3D effect
        p.ambientLight(100);
        p.pointLight(255, 255, 255, 0, 0, 200);
        
        p.scale(50);
        p.rotateX(angleX);
        p.rotateY(angleY);

        for (let cubie of cube) {
          cubie.show();
        }
      };

      p.mousePressed = () => {
        if (p.mouseX >= 0 && p.mouseX <= p.width && p.mouseY >= 0 && p.mouseY <= p.height) {
          isDragging = true;
          lastMouseX = p.mouseX;
          lastMouseY = p.mouseY;
        }
      };

      p.mouseReleased = () => {
        isDragging = false;
      };

      p.mouseDragged = () => {
        if (isDragging) {
          angleY += (p.mouseX - lastMouseX) * 0.01;
          angleX += (p.mouseY - lastMouseY) * 0.01;
          lastMouseX = p.mouseX;
          lastMouseY = p.mouseY;
        }
      };
    };

    const p5Instance = new p5(sketch, sketchRef.current);
    return () => p5Instance.remove();
  }, [scrambledCube, orders, colorMapping]);

  return (
    <div className="flex flex-col lg:flex-row items-start justify-center gap-8">
      <div className="flex flex-col items-center gap-4">
        <div
          ref={sketchRef}
          className="border-4 border-slate-700 rounded-xl shadow-2xl overflow-hidden bg-slate-950"
        />
        <div className="bg-slate-800 px-6 py-3 rounded-lg shadow-lg border border-slate-700">
          <p className="text-slate-300 text-sm">🖱️ Click and drag to rotate</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {orders.map((face, idx) => (
          <div key={face} className="bg-slate-800 p-4 rounded-lg border border-slate-700 shadow-lg">
            <h4 className="font-bold text-white mb-2 text-center">{face}</h4>
            <div className="grid grid-cols-3 gap-1">
              {scrambledCube[idx].map((row, ri) =>
                row.map((color, ci) => (
                  <div
                    key={`${ri}-${ci}`}
                    className="w-8 h-8 border-2 border-slate-900 rounded shadow-md"
                    style={{
                      backgroundColor: colorMapping[color - 1] || "#333",
                    }}
                  />
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}