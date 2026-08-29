// src/app/api/kapal/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { KapalService } from "../../../../lib/database";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "ID kapal tidak ditemukan" },
        { status: 400 }
      );
    }

    const kapal = await KapalService.getKapalById(id);

    if (!kapal) {
      return NextResponse.json(
        { error: "Data kapal tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: kapal,
    });
  } catch (error) {
    console.error("Error mengambil detail kapal:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
