import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@/utils/redis";

export async function GET(req: NextRequest) {
  try {
    console.log("Polling started for matchmaking")
    const playerId = req.nextUrl.searchParams.get("playerId");
    if (!playerId) {
      return NextResponse.json({ error: "playerId required" }, { status: 400 });
    }
    const r = Redis.getInstance();
    await r.connect();

    const roomId = await r.get_player_room(playerId);
    console.log("<Polling route> Room id: ", roomId)
    if (!roomId) {
      return NextResponse.json({ status: "queued" }, { status: 200 });
    }

    const room = await r.get_player_room(roomId);
    console.log("<Polling route> Room: ", room)
    if (!room) {
      // very rare: mapping exists but room vanished; treat as queued
      return NextResponse.json({ status: "queued" }, { status: 200 });
    }

    return NextResponse.json({ status: "matched", room }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "poll failed" }, { status: 500 });
  }
}
