import { NextRequest, NextResponse } from "next/server";
import { PinjamanService } from "@/lib/database";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const abkId = searchParams.get("abkId");

    if (!abkId) {
      return NextResponse.json({ success: false, error: "abkId wajib diisi" }, { status: 400 });
    }

    const data = await PinjamanService.getPinjamanBelumLunas(abkId);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error fetching pinjaman belum lunas:", error);
    return NextResponse.json({ success: false, error: "Gagal mengambil pinjaman" }, { status: 500 });
  }
}