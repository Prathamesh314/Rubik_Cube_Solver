import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/utils/db';
import User from '@/modals/user';

export async function PATCH(req: NextRequest) {
  try {
    await dbConnect();

    const body = await req.json();
    const { playerId, ratingIncrement } = body;

    if (!playerId || !/^[0-9a-fA-F]{24}$/.test(playerId)) {
      return NextResponse.json(
        { success: false, message: 'Valid player id is required' },
        { status: 400 }
      );
    }
    if (typeof ratingIncrement !== 'number' || !isFinite(ratingIncrement)) {
      return NextResponse.json(
        { success: false, message: 'A valid numeric rating is required' },
        { status: 400 }
      );
    }

    const updatedUser = await User.findByIdAndUpdate(
      playerId,
      { $inc: { rating: ratingIncrement } },
      { new: true, runValidators: true, select: '-password -__v' }
    ).lean();

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, user: updatedUser },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update user error:', error);
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

