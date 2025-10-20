// src/app/api/room/[roomId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { Game } from "@/services/game";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> } // ← Mark params as Promise
) {
  // ✅ Await the entire params object, then destructure
  const { roomId } = await params;
  console.log("Room id from api: ", roomId);

  try {
    const game = await Game.getInstance();
    const room = await game.getRoom(roomId);
    console.log("Room from api: ", room)

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }
    
    return NextResponse.json(room, { status: 200 });
  } catch (e: any) {
    console.error(`Error fetching room ${roomId}: ${e.message}`);
    return NextResponse.json(
      { error: "Failed to fetch room data" },
      { status: 500 }
    );
  }
}