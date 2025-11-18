import { NextRequest, NextResponse } from "next/server";
import { Player, CubeCategories } from "@/modals/player";
import { Game } from "@/services/game";

export async function POST(req: NextRequest) {
  try {
    const data = await req.json() as {
      variant: CubeCategories;
      new_player: Record<string, any>; // Change type to a plain object structure
    };
    
    // Deserialize the plain object back into a Player instance
    const playerInstance = Player.fromPlain(data.new_player);
    const variant = data.variant;

    console.log("Player: ", playerInstance, " variant: ", variant)

    const game = await Game.getInstance();
    
    const res = await game.findPlayer(playerInstance, variant); // Use the instance
    return NextResponse.json(res, { status: 200 });
  } catch (e: any) {
    console.log(`Error in start route /api/matchmake/start: ${e.toString()}`)
    return NextResponse.json({ error: e?.message ?? "matchmake failed" }, { status: 500 });
  }
}