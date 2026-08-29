import { NextRequest, NextResponse } from "next/server";
import { KeberangkatanService } from "@/lib/database";

interface PesertaRequest {
  abkId: string;
  bekal: number;
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    if (!data.kapal_id || !data.tanggalBerangkat || !data.peserta || data.peserta.length === 0) {
      return NextResponse.json(
        { success: false, error: "Kapal, tanggal berangkat, dan minimal 1 peserta wajib diisi" },
        { status: 400 }
      );
    }

    const invalidPeserta = data.peserta.some(
      (p: PesertaRequest) => !p.abkId || !p.bekal || p.bekal <= 0
    );
    if (invalidPeserta) {
      return NextResponse.json(
        { success: false, error: "Setiap peserta wajib punya bekal lebih dari 0" },
        { status: 400 }
      );
    }

    const keberangkatan = await KeberangkatanService.createKeberangkatan({
      kapal_id: data.kapal_id,
      tanggalBerangkat: data.tanggalBerangkat,
      peserta: data.peserta,
    });

    return NextResponse.json(
      { success: true, message: "Keberangkatan berhasil dicatat", data: keberangkatan },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating keberangkatan:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Gagal mencatat keberangkatan" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const kapal_id = searchParams.get("kapal_id") || undefined;
    const status = searchParams.get("status") || undefined;

    const result = await KeberangkatanService.getKeberangkatanList(page, limit, kapal_id, status);

    return NextResponse.json({
      success: true,
      data: result.data,
      pagination: { total: result.total, page: result.page, totalPages: result.totalPages, limit },
    });
  } catch (error) {
    console.error("Error fetching keberangkatan:", error);
    return NextResponse.json(
      { success: false, error: "Gagal mengambil data keberangkatan" },
      { status: 500 }
    );
  }
}