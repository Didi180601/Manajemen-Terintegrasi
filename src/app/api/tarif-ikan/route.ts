import { NextRequest, NextResponse } from "next/server";
import { TarifIkanService } from "@/lib/database";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const posisi = searchParams.get("posisi");

    if (!posisi) {
      const data = await TarifIkanService.getAllTarif();
      return NextResponse.json({ success: true, data });
    }

    const data = await TarifIkanService.getTarifByPosisi(posisi);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error fetching tarif ikan:", error);
    return NextResponse.json({ success: false, error: "Gagal mengambil tarif" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    if (!data.posisi || !data.namaIkan || !data.gajiPerKg) {
      return NextResponse.json(
        { success: false, error: "Posisi, nama ikan, dan gaji per kg wajib diisi" },
        { status: 400 }
      );
    }
    const tarif = await TarifIkanService.upsertTarif(data.posisi, data.namaIkan, data.gajiPerKg);
    return NextResponse.json({ success: true, data: tarif }, { status: 201 });
  } catch (error) {
    console.error("Error saving tarif ikan:", error);
    return NextResponse.json({ success: false, error: "Gagal menyimpan tarif" }, { status: 500 });
  }
}