import { NextRequest, NextResponse } from "next/server";
import { PinjamanService } from "@/lib/database";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ abkId: string }> }
) {
  try {
    const { abkId } = await params;
    const data = await PinjamanService.getPinjamanByAbk(abkId);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error fetching pinjaman by abk:", error);
    return NextResponse.json(
      { success: false, error: "Gagal mengambil riwayat pinjaman" },
      { status: 500 }
    );
  }
}