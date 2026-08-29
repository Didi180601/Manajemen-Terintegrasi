import { NextRequest, NextResponse } from "next/server";
import { KeberangkatanService } from "@/lib/database";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (!body.deskripsi || !body.jumlah || body.jumlah <= 0) {
      return NextResponse.json(
        { success: false, error: "Deskripsi dan jumlah wajib diisi (jumlah > 0)" },
        { status: 400 }
      );
    }

    const biaya = await KeberangkatanService.addBiayaLain(id, body.deskripsi, body.jumlah);

    return NextResponse.json({ success: true, data: biaya }, { status: 201 });
  } catch (error) {
    console.error("Error adding biaya lain:", error);
    return NextResponse.json(
      { success: false, error: "Gagal menambah biaya lain" },
      { status: 500 }
    );
  }
}