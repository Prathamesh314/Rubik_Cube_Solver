import { NextRequest, NextResponse } from "next/server";
import { Player, CubeCategories } from '@/modals/player';
import { Game } from "@/services/game";

export async function POST(request: NextRequest) {
    console.log("Matching reqeust for friends..")
    try {
        const body: {
            player: Player,
            opponentPlayerId?: string,
            variant: CubeCategories,
            isOpponentReady: boolean
        } = await request.json();

        const { player, opponentPlayerId, variant, isOpponentReady } = body;
        console.log("Player: ", player, " opponentPlayerId: ", opponentPlayerId, " variant: ", variant, " isOpponentReady: ", isOpponentReady)

        if (!player || !variant) {
            return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
        }

        const playerInstance = Player.fromPlain(player);

        const game = await Game.getInstance()
        const res = await game.startFriendsMatch(playerInstance, variant, isOpponentReady, opponentPlayerId)

        console.log("Api response: ", res)
        return NextResponse.json(res, { status: 200 });

    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message ?? 'Unknown error' }, { status: 500 });
    }
}
