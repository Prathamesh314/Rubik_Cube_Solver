import { NextRequest, NextResponse } from "next/server";
import { Game } from "@/services/game";

/**
 * Deletes a game room from Redis.
 * Expects JSON body: { roomId: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { roomId } = body;

    if (!roomId) {
      return NextResponse.json(
        { error: "Missing roomId" },
        { status: 400 }
      );
    }

    const game = await Game.getInstance();

    // Try to delete the room
    await game.deleteRoom(roomId);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (e: any) {
    console.error("Error in delete_game_room:", e.message || e);
    return NextResponse.json(
      { error: "Failed to delete game room" },
      { status: 500 }
    );
  }
}
