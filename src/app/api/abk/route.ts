import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/* ============================
   POST : Tambah ABK
============================ */
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    /* ============================
       VALIDASI WAJIB
    ============================ */
    if (
      !data.nama ||
      !data.posisi ||
      !data.kapal_id ||
      !data.no_ktp ||
      !data.tanggal_bergabung
    ) {
      return NextResponse.json(
        { error: "Data wajib belum lengkap" },
        { status: 400 }
      );
    }

    // Validasi kapal_id (cuid)
    if (typeof data.kapal_id !== "string" || data.kapal_id.length < 10) {
      return NextResponse.json(
        { error: "Format kapal tidak valid" },
        { status: 400 }
      );
    }

    // Validasi KTP
    if (data.no_ktp.length !== 16) {
      return NextResponse.json(
        { error: "No. KTP harus 16 digit" },
        { status: 400 }
      );
    }

    /* ============================
       CEK KAPAL EXIST
    ============================ */
    const kapal = await prisma.kapal.findUnique({
      where: { id: data.kapal_id },
    });

    if (!kapal) {
      return NextResponse.json(
        { error: "Kapal tidak ditemukan" },
        { status: 400 }
      );
    }

    /* ============================
       CEK DUPLIKAT KTP
    ============================ */
    const ktpExists = await prisma.aBK.findUnique({
      where: { no_ktp: data.no_ktp },
    });

    if (ktpExists) {
      return NextResponse.json(
        { error: "No. KTP sudah terdaftar" },
        { status: 409 }
      );
    }

    /* ============================
       CREATE ABK
    ============================ */
    const abk = await prisma.aBK.create({
      data: {
        nama: data.nama.trim(),
        posisi: data.posisi,
        kapal_id: data.kapal_id,
        tanggal_bergabung: new Date(data.tanggal_bergabung),
        status: data.status,
        no_ktp: data.no_ktp,
        alamat: data.alamat,
        no_telepon: data.no_telepon,
      },
      include: {
        kapal: {
          select: {
            id: true,
            nama: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "ABK berhasil ditambahkan",
        data: abk,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("ERROR ABK:", error);

    return NextResponse.json(
      {
        error: "Gagal menyimpan data ABK",
        detail: error instanceof Error ? error.message : "Kesalahan tidak dikenal",
      },
      { status: 500 }
    );
  }
}

/* ============================
   GET : List ABK
============================ */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const status = searchParams.get("status");
    const kapal_id = searchParams.get("kapal_id");

    const where: { status?: string; kapal_id?: string } = {};
    if (status) where.status = status;
    if (kapal_id) where.kapal_id = kapal_id;

    const data = await prisma.aBK.findMany({
      where,
      include: {
        kapal: {
          select: {
            id: true,
            nama: true,
            jenis: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Gagal mengambil data ABK" },
      { status: 500 }
    );
  }
}
