// src/app/api/kapal/route.ts
import { NextRequest, NextResponse } from "next/server";
import { KapalService } from "../../../lib/database";

// GET - Mendapatkan semua kapal atau kapal berdasarkan ID
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const status = searchParams.get("status") || undefined;
    const search = searchParams.get("search") || undefined;

    // Jika ada ID, ambil data kapal spesifik
    if (id) {
      const kapal = await KapalService.getKapalById(id);

      if (!kapal) {
        return NextResponse.json(
          { success: false, error: "Kapal tidak ditemukan" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: kapal,
      });
    }

    // Jika tidak ada ID, ambil semua data kapal dengan pagination
    const result = await KapalService.getKapalList(page, limit, status, search);

    return NextResponse.json({
      success: true,
      data: result.data,
      pagination: {
        total: result.total,
        page: result.page,
        totalPages: result.totalPages,
        limit
      }
    });
  } catch (error) {
    console.error("Error fetching kapal:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : "Gagal mengambil data kapal" 
      },
      { status: 500 }
    );
  }
}

// POST - Membuat kapal baru
export async function POST(request: NextRequest) {
  try {
    let body: Record<string, unknown>;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Format data tidak valid" },
        { status: 400 },
      );
    }

    // Validasi required fields
    const requiredFields = [
      'nama', 'jenis', 'nomorRegistrasi', 'kapasitas', 'status', 
      'tahunBuat', 'pemilik', 'dimensiPanjang',
      'dimensiLebar', 'dimensiTinggi', 'mesinUtama', 'dayaMesin',
      'kecepatanMaksimal', 'bahanBakar', 'sertifikatKelaikan', 
      'tanggalSertifikat'
    ];

    const missingFields = requiredFields.filter(
      (field) => body[field] === undefined || body[field] === null || body[field] === "",
    );
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Field yang wajib diisi: ${missingFields.join(', ')}` 
        },
        { status: 400 }
      );
    }

    const numericFields = [
      "kapasitas",
      "dimensiPanjang",
      "dimensiLebar",
      "dimensiTinggi",
      "dayaMesin",
      "kecepatanMaksimal",
    ];
    const invalidNumericField = numericFields.find(
      (field) => !Number.isFinite(Number(body[field])) || Number(body[field]) <= 0,
    );

    if (invalidNumericField) {
      return NextResponse.json(
        { success: false, error: `${invalidNumericField} harus berupa angka lebih dari 0` },
        { status: 400 },
      );
    }

    const dateFields = ["tahunBuat", "tanggalSertifikat"];
    const invalidDateField = dateFields.find(
      (field) => Number.isNaN(new Date(String(body[field])).getTime()),
    );

    if (invalidDateField) {
      return NextResponse.json(
        { success: false, error: `${invalidDateField} tidak valid` },
        { status: 400 },
      );
    }

    const kapal = await KapalService.createKapal({
      nama: String(body.nama).trim(),
      jenis: String(body.jenis).trim(),
      nomorRegistrasi: String(body.nomorRegistrasi).trim(),
      kapasitas: Number(body.kapasitas),
      status: String(body.status),
      tahunBuat: String(body.tahunBuat),
      pemilik: String(body.pemilik).trim(),
      dimensiPanjang: Number(body.dimensiPanjang),
      dimensiLebar: Number(body.dimensiLebar),
      dimensiTinggi: Number(body.dimensiTinggi),
      mesinUtama: String(body.mesinUtama).trim(),
      dayaMesin: Number(body.dayaMesin),
      kecepatanMaksimal: Number(body.kecepatanMaksimal),
      bahanBakar: String(body.bahanBakar).trim(),
      sertifikatKelaikan: String(body.sertifikatKelaikan).trim(),
      tanggalSertifikat: String(body.tanggalSertifikat),
    });

    return NextResponse.json({
      success: true,
      data: kapal,
      message: "Kapal berhasil ditambahkan",
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating kapal:", error);
    
    // Handle duplicate nomor registrasi
    if (error instanceof Error && error.message.includes('sudah terdaftar')) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 409 } // Conflict
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : "Gagal menambahkan kapal" 
      },
      { status: 500 }
    );
  }
}

// PUT - Mengupdate kapal berdasarkan ID
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "ID kapal diperlukan" },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Cek apakah kapal ada
    const existingKapal = await KapalService.getKapalById(id);

    if (!existingKapal) {
      return NextResponse.json(
        { success: false, error: "Kapal tidak ditemukan" },
        { status: 404 }
      );
    }

    // Update kapal menggunakan service
    const updatedKapal = await KapalService.updateKapal(id, {
      nama: body.nama,
      jenis: body.jenis,
      nomorRegistrasi: body.nomorRegistrasi,
      kapasitas: body.kapasitas ? parseFloat(body.kapasitas) : undefined,
      status: body.status,
      tahunBuat: body.tahunBuat || undefined,
      pemilik: body.pemilik,
      dimensiPanjang: body.dimensiPanjang ? parseFloat(body.dimensiPanjang) : undefined,
      dimensiLebar: body.dimensiLebar ? parseFloat(body.dimensiLebar) : undefined,
      dimensiTinggi: body.dimensiTinggi ? parseFloat(body.dimensiTinggi) : undefined,
      mesinUtama: body.mesinUtama,
      dayaMesin: body.dayaMesin ? parseFloat(body.dayaMesin) : undefined,
      kecepatanMaksimal: body.kecepatanMaksimal ? parseFloat(body.kecepatanMaksimal) : undefined,
      bahanBakar: body.bahanBakar,
      sertifikatKelaikan: body.sertifikatKelaikan,
      tanggalSertifikat: body.tanggalSertifikat,
    });

    return NextResponse.json({
      success: true,
      data: updatedKapal,
      message: "Kapal berhasil diupdate",
    });
  } catch (error) {
    console.error("Error updating kapal:", error);
    
    // Handle duplicate nomor registrasi
    if (error instanceof Error && error.message.includes('sudah terdaftar')) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 409 } // Conflict
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : "Gagal mengupdate kapal" 
      },
      { status: 500 }
    );
  }
}

// DELETE - Menghapus kapal berdasarkan ID
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "ID kapal diperlukan" },
        { status: 400 }
      );
    }

    // Cek apakah kapal ada
    const existingKapal = await KapalService.getKapalById(id);

    if (!existingKapal) {
      return NextResponse.json(
        { success: false, error: "Kapal tidak ditemukan" },
        { status: 404 }
      );
    }

    // Hapus kapal menggunakan service
    await KapalService.deleteKapal(id);

    return NextResponse.json({
      success: true,
      message: "Kapal berhasil dihapus",
    });
  } catch (error) {
    console.error("Error deleting kapal:", error);
    const message =
      error instanceof Error ? error.message : "Gagal menghapus kapal";
    const isDependencyError = message.includes("tidak dapat dihapus");

    return NextResponse.json(
      { success: false, error: message },
      { status: isDependencyError ? 409 : 500 },
    );
  }
}