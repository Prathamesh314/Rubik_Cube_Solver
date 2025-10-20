import { NextRequest, NextResponse } from "next/server";
import { Player, CubeCategories } from "@/modals/player";
import { Game } from "@/services/game";
import { randomUUID } from "crypto";

export async function POST(req: NextRequest) {
  try {
    const data = await req.json() as {
      variant: CubeCategories;
      player: Record<string, any>; // Change type to a plain object structure
    };
    
    // Deserialize the plain object back into a Player instance
    const playerInstance = Player.fromPlain(data.player);
    const variant = data.variant;

    const game = await Game.getInstance();

    const room_id = randomUUID();
    const res = await game.startGame(playerInstance, room_id, variant); // Use the instance
    return NextResponse.json(res, { status: 200 });
  } catch (e: any) {
    console.log(`Error in start route /api/matchmake/start: ${e.toString()}`)
    return NextResponse.json({ error: e?.message ?? "matchmake failed" }, { status: 500 });
  }
}