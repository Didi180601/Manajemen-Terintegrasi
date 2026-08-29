import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const abk = await prisma.aBK.findUnique({
      where: { id },
      include: { kapal: { select: { nama: true } } },
    });

    if (!abk) {
      return NextResponse.json({ success: false, error: "ABK tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: abk });
  } catch (error) {
    console.error("Error fetching ABK detail:", error);
    return NextResponse.json({ success: false, error: "Gagal mengambil detail ABK" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await request.json();

    if (!data.nama || !data.posisi || !data.kapal_id || !data.no_ktp) {
      return NextResponse.json({ success: false, error: "Data wajib belum lengkap" }, { status: 400 });
    }

    if (data.no_ktp.length !== 16) {
      return NextResponse.json({ success: false, error: "No. KTP harus 16 digit" }, { status: 400 });
    }

    // Cek KTP duplikat (kecuali milik ABK ini sendiri)
    const ktpExists = await prisma.aBK.findFirst({
      where: { no_ktp: data.no_ktp, NOT: { id } },
    });
    if (ktpExists) {
      return NextResponse.json({ success: false, error: "No. KTP sudah terdaftar untuk ABK lain" }, { status: 409 });
    }

    const updated = await prisma.aBK.update({
      where: { id },
      data: {
        nama: data.nama.trim(),
        posisi: data.posisi,
        kapal_id: data.kapal_id,
        status: data.status,
        no_ktp: data.no_ktp,
        alamat: data.alamat,
        no_telepon: data.no_telepon,
        ...(data.tanggal_bergabung && { tanggal_bergabung: new Date(data.tanggal_bergabung) }),
        updatedAt: new Date(),
      },
      include: { kapal: { select: { nama: true } } },
    });

    return NextResponse.json({ success: true, message: "ABK berhasil diupdate", data: updated });
  } catch (error) {
    console.error("Error updating ABK:", error);
    return NextResponse.json({ success: false, error: "Gagal mengupdate ABK" }, { status: 500 });
  }
}