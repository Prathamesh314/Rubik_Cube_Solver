import { NextRequest, NextResponse } from "next/server";
import { Game } from "@/services/game";

/**
 * Remove a player from a room in Redis.
 * Expects JSON body: { playerId: string, roomId: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { playerId, roomId } = body;

    if (!playerId || !roomId) {
      return NextResponse.json(
        { error: "Missing playerId or roomId" },
        { status: 400 }
      );
    }

    const game = await Game.getInstance();

    const room = await game.getRoom(roomId);
    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    // Remove the player from the room in Redis
    const removed = await game.removePlayerFromRoom(roomId, playerId);

    if (!removed) {
      return NextResponse.json(
        { error: "Player could not be removed (already not present?)" },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (e: any) {
    console.error("Error in remove_player:", e.message || e);
    return NextResponse.json(
      { error: "Failed to remove player from room" },
      { status: 500 }
    );
  }
}
