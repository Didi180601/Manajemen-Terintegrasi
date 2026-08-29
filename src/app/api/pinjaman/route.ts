import { NextRequest, NextResponse } from "next/server";
import { PinjamanService } from "@/lib/database";

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    if (!data.abkId || !data.jumlah || data.jumlah <= 0 || !data.tanggal) {
      return NextResponse.json(
        { success: false, error: "ABK, jumlah, dan tanggal wajib diisi" },
        { status: 400 }
      );
    }
    const pinjaman = await PinjamanService.createPinjaman(data);
    return NextResponse.json({ success: true, data: pinjaman }, { status: 201 });
  } catch (error) {
    console.error("Error creating pinjaman:", error);
    return NextResponse.json({ success: false, error: "Gagal mencatat pinjaman" }, { status: 500 });
  }
}