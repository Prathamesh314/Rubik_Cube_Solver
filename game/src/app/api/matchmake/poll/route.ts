import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@/redis/index";

export async function GET(req: NextRequest) {
  try {
    const playerId = req.nextUrl.searchParams.get("playerId");
    if (!playerId) {
      return NextResponse.json({ error: "playerId required" }, { status: 400 });
    }
    const r = Redis.getInstance();
    await r.connect();

    const roomId = await r.getPlayerRoom(playerId);
    if (!roomId) {
      return NextResponse.json({ status: "queued" }, { status: 200 });
    }

    const room = await r.getPlayerRoom(roomId);
    if (!room) {
      // very rare: mapping exists but room vanished; treat as queued
      return NextResponse.json({ status: "queued" }, { status: 200 });
    }

    return NextResponse.json({ status: "matched", room }, { status: 200 });
  } catch (e: any) {
    console.error("error in matchmake pooll api: ", e)
    return NextResponse.json({ error: e?.message ?? "poll failed" }, { status: 500 });
  }
}
