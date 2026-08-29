// src/app/api/gaji/summary/route.ts
import { NextResponse } from "next/server";
import { GajiService } from "@/lib/database";

export async function GET() {
  try {
    const summary = await GajiService.getTotalGajiPerAbk();
    return NextResponse.json({ success: true, data: summary });
  } catch (error) {
    console.error("Error fetching gaji summary:", error);
    return NextResponse.json(
      { success: false, error: "Gagal mengambil ringkasan gaji" },
      { status: 500 }
    );
  }
}