import { NextResponse } from "next/server";
import { KeberangkatanService } from "@/lib/database";

export async function GET() {
  try {
    const data = await KeberangkatanService.getKeberangkatanBerlangsung();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error fetching keberangkatan berlangsung:", error);
    return NextResponse.json(
      { success: false, error: "Gagal mengambil keberangkatan berlangsung" },
      { status: 500 }
    );
  }
}