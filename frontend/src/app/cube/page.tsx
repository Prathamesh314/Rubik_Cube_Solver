"use client"
import Cube3D, { CubeAPI, Move, KeyMove } from '@/components/Cube3D'
import React, { useRef } from 'react'

const page = () => {
  const apiRef = useRef<CubeAPI | null>(null)
  // Use valid Move/KeyMove types. Valid moves: "LEFT" | "RIGHT" | "TOP" | "BOTTOM" | "FACE" | "BACK" | and their primes or keys a/s/...
  // Equivalent scramble to ["R","U","R'","U'"] is ["RIGHT", "TOP", "RIGHT'", "TOP'"]
  const scramble: (Move | KeyMove)[] = ["RIGHT", "TOP", "RIGHT'", "TOP'"]

  return (
    <div>
      <Cube3D
        width={720}
        height={520}
        animationMs={500}
        scrambleMoves={scramble} // or server-provided sequence
        onReady={(api) => { apiRef.current = api; }}
      />
    </div>
  )
}

export default page