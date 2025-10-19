import { NextRequest, NextResponse } from "next/server";
// import { Game } from "@/services/game"; // or wherever your Game class lives
import { Player, CubeCategories } from "@/modals/player";

export async function POST(req: NextRequest) {
  console.log("Started the game....")
  try {
    const { variant, player } = await req.json() as {
      variant: CubeCategories;
      player: Player;
    };

    console.log(`Variant: ${variant} || Player: ${player}`)

    // If you want to re-hydrate a Player class instance, ensure fromPlain is called.
    // Assuming `player` is already the shape you use:
    // const game = new Game(player, variant);
    // await game.initialize();
    // console.log("Game initialized....")

    // const res = await game.start_game();
    // console.log("Start game result: ", res)
    // return NextResponse.json(res, { status: 200 });
    return NextResponse.json({ status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "matchmake failed" }, { status: 500 });
  }
}
