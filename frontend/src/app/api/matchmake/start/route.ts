import { NextRequest, NextResponse } from "next/server";
import { Game } from "@/services/game"; // or wherever your Game class lives
import { Player, CubeCategories } from "@/modals/player";

export async function POST(req: NextRequest) {
  try {
    const { variant, player } = await req.json() as {
      variant: CubeCategories;
      player: Player;
    };

    // If you want to re-hydrate a Player class instance, ensure fromPlain is called.
    // Assuming `player` is already the shape you use:
    const game = new Game(player, variant);
    await game.initialize();

    const res = await game.start_game();
    return NextResponse.json(res, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "matchmake failed" }, { status: 500 });
  }
}
