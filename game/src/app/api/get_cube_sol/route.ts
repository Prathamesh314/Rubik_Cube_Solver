import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { scrambled_cube } = body;

    const resp = await fetch("http://localhost:8000/solve_cube", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ scrambled_cube }),
    });

    let data = null;
    try {
      const text = await resp.text();
      if (text) {
        data = JSON.parse(text);
      } else {
        data = null;
      }
    } catch (jsonErr) {
      data = null;
    }

    return NextResponse.json(
      {
        status: resp.status,
        data,
      },
      { status: resp.status }
    );

  } catch (error) {
    return NextResponse.json({
      error: "Failed to reach cube solver backend",
      details: (error as Error).message,
    }, { status: 500 });
  }
}
