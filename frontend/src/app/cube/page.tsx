"use client";

import RubiksCubeAdvanced from "@/components/RubikCube3d";

export default function Page() {
  const orders = ["Back", "Top", "Front", "Bottom", "Left", "Right"];
  const scrambledCube = [
    [
      [6, 2, 3],
      [2, 5, 6],
      [4, 3, 6],
    ],
    [[5, 2, 4], [2, 1, 3], [4, 5, 2]],
    [[1, 4, 5], [1, 6, 3], [2, 6, 3]],
    [[5, 1, 6], [1, 3, 5], [1, 1, 6]],
    [[3, 5, 5], [6, 2, 5], [2, 4, 1]],
    [[3, 4, 1], [6, 4, 4], [2, 3, 4]],
  ];

  return (
    <RubiksCubeAdvanced 
      scrambledCube={scrambledCube} 
      orders={orders}
      colorMapping={["#fff", "#ff0", "#f00", "#ffa500", "#00f", "#0f0"]}
    />
  );
}
