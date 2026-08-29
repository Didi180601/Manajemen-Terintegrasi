import { NextRequest, NextResponse } from "next/server";
import { SolarService, KeberangkatanService } from "@/lib/database";

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    if (!data.tanggal || !data.jumlahLiter || !data.hargaPerLiter || !data.alokasi || data.alokasi.length === 0) {
      return NextResponse.json(
        { success: false, error: "Tanggal, jumlah liter, harga per liter, dan alokasi wajib diisi" },
        { status: 400 }
      );
    }

    const pengisian = await SolarService.createPengisianSolar({
      tanggal: data.tanggal,
      jumlahLiter: data.jumlahLiter,
      hargaPerLiter: data.hargaPerLiter,
      keterangan: data.keterangan,
      alokasi: data.alokasi,
    });

    return NextResponse.json(
      { success: true, message: "Pengisian solar berhasil dicatat", data: pengisian },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating pengisian solar:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Gagal mencatat pengisian solar" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const data = await SolarService.getPengisianSolarList(30);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error fetching pengisian solar:", error);
    return NextResponse.json(
      { success: false, error: "Gagal mengambil data solar" },
      { status: 500 }
    );
  }
}