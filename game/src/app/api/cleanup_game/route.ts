import { NextRequest, NextResponse } from 'next/server';
import { Game } from '@/services/game';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { playerIds, roomId } = body;

    if (!Array.isArray(playerIds) || !roomId) {
      return NextResponse.json(
        { success: false, message: 'Invalid request data' },
        { status: 400 }
      );
    }

    const game = await Game.getInstance();
    
    // Clean up all players at once
    await Promise.all(
      playerIds.map(async (playerId: string) => {
        try {
          await game.deletePlayer(playerId);
          await game.deletePlayerRoom(playerId, roomId);
        } catch (err) {
          // Continue with other players even if one fails
        }
      })
    );

    return NextResponse.json({
      success: true,
      message: "Game cleanup successful"
    }, { status: 200 });
    
  } catch (error) {
    console.error('Cleanup game error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error?.toString() : undefined
      },
      { status: 500 }
    );
  }
}