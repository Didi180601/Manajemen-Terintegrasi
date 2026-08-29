import { NextRequest, NextResponse } from "next/server";
import { KeberangkatanService } from "@/lib/database";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const keberangkatan = await KeberangkatanService.getKeberangkatanById(id);

    if (!keberangkatan) {
      return NextResponse.json(
        { success: false, error: "Keberangkatan tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: keberangkatan });
  } catch (error) {
    console.error("Error fetching keberangkatan detail:", error);
    return NextResponse.json(
      { success: false, error: "Gagal mengambil detail keberangkatan" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (!body.status || !["berlangsung", "selesai", "dibatalkan"].includes(body.status)) {
      return NextResponse.json(
        { success: false, error: "Status tidak valid" },
        { status: 400 }
      );
    }

    const updated = await KeberangkatanService.updateStatusKeberangkatan(
      id,
      body.status,
      body.tanggalKembali
    );

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Error updating keberangkatan status:", error);
    return NextResponse.json(
      { success: false, error: "Gagal mengupdate status keberangkatan" },
      { status: 500 }
    );
  }
}