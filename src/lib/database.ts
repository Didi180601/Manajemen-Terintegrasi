// src/lib/database.ts
// Prisma client singleton + service layer untuk semua query database

import { PrismaClient } from "@prisma/client";
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const prisma = globalThis.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = prisma;
}

// ============================================================
// TYPES
// ============================================================

interface CreateKapalInput {
  nama: string;
  jenis: string;
  nomorRegistrasi: string;
  kapasitas: number;
  status: string;
  tahunBuat: string;
  pemilik: string;
  dimensiPanjang: number;
  dimensiLebar: number;
  dimensiTinggi: number;
  mesinUtama: string;
  dayaMesin: number;
  kecepatanMaksimal: number;
  bahanBakar: string;
  sertifikatKelaikan: string;
  tanggalSertifikat: string;
}

type UpdateKapalInput = Partial<CreateKapalInput>;

interface UpdateGajiInput {
  abkId: string;
  bonusHarian: number;
  potongan: number;
  totalBerat: number;
  totalNilaiIkan: number;
  totalGajiIkan: number;
  gajiBruto: number;
  gajiBersih: number;
  tanggal: string;
  jenisIkan: Array<{
    nama: string;
    berat: number;
    harga: number;
    gajiPerKg: number;
  }>;
}

interface CreateKeberangkatanInput {
  kapal_id: string;
  tanggalBerangkat: string;
  peserta: Array<{abkId: string; bekal: number}>
}

interface CreatePengisianSolarInput {
  tanggal: string;
  jumlahLiter: number;
  hargaPerLiter: number;
  keterangan?: string;
  alokasi: Array<{keberangkatanId: string; porsiBiaya: number}>;
}

interface CreatePinjamanInput{
  abkId: string;
  jumlah: number;
  tanggal: string;
  keterangan?: string;
}

//keberangkatan service
export const KeberangkatanService = {
  /** Buat keberangkatan baru sekaligus daftar peserta & bekal masing-masing */
  async createKeberangkatan(data: CreateKeberangkatanInput) {
    return prisma.keberangkatan.create({
      data: {
        kapal_id: data.kapal_id,
        tanggalBerangkat: new Date(data.tanggalBerangkat),
        status: 'berlangsung',
        peserta: {
          create: data.peserta.map((p) => ({
            abkId: p.abkId,
            bekal: p.bekal,
          })),
        },
      },
      include: {
        kapal: { select: { nama: true } },
        peserta: { include: { abk: { select: { nama: true, posisi: true } } } },
      },
    })
  },

  /** Daftar keberangkatan dengan pagination, opsional filter kapal/status */
  async getKeberangkatanList(page = 1, limit = 20, kapal_id?: string, status?: string) {
    const skip = (page - 1) * limit
    const where: Record<string, unknown> = {}
    if (kapal_id) where.kapal_id = kapal_id
    if (status) where.status = status

    const [data, total] = await Promise.all([
      prisma.keberangkatan.findMany({
        where,
        include: {
          kapal: { select: { nama: true } },
          peserta: { include: { abk: { select: { nama: true, posisi: true } } } },
          _count: { select: { gaji: true } },
        },
        orderBy: { tanggalBerangkat: 'desc' },
        skip,
        take: limit,
      }),
      prisma.keberangkatan.count({ where }),
    ])

    return { data, total, page, totalPages: Math.ceil(total / limit) }
  },

  /** Detail satu keberangkatan lengkap dengan ringkasan modal, tangkapan, keuntungan */
  async getKeberangkatanById(id: string) {
    const keberangkatan = await prisma.keberangkatan.findUnique({
      where: { id },
      include: {
        kapal: true,
        peserta: { include: { abk: { select: { nama: true, posisi: true } } } },
        gaji: { include: { detailIkan: true, abk: { select: { nama: true, posisi: true } } } },
        solarUsage: { include: { pengisianSolar: true } },
        biayaLain: true,
      },
    })

    if (!keberangkatan) return null

    // Hitung ringkasan
    const totalBekal = keberangkatan.peserta.reduce((sum, p) => sum + p.bekal, 0)
    const totalSolar = keberangkatan.solarUsage.reduce((sum, s) => sum + s.porsiBiaya, 0)
    const totalBiayaLain = keberangkatan.biayaLain.reduce((sum, b) => sum + b.jumlah, 0)
    const totalModal = totalBekal + totalSolar + totalBiayaLain

    const totalTangkapan = keberangkatan.gaji.reduce((sum, g) => sum + g.totalNilaiIkan, 0)
    const totalGajiDibayar = keberangkatan.gaji.reduce((sum, g) => sum + g.gajiBersih, 0)
    const keuntungan = totalTangkapan - totalModal - totalGajiDibayar

    return {
      ...keberangkatan,
      ringkasan: {
        totalBekal,
        totalSolar,
        totalBiayaLain,
        totalModal,
        totalTangkapan,
        totalGajiDibayar,
        keuntungan,
      },
    }
  },

  /** Update status keberangkatan (berlangsung, selesai, dibatalkan) */
  async updateStatusKeberangkatan(id: string, status: 'berlangsung' | 'selesai' | 'dibatalkan', tanggalKembali?: string) {
    return prisma.keberangkatan.update({
      where: { id },
      data: {
        status,
        ...(tanggalKembali && { tanggalKembali: new Date(tanggalKembali) }),
        updatedAt: new Date(),
      },
    })
  },

  /** Tambah biaya lain (baterai, lampu kelip, dll) ke satu keberangkatan */
  async addBiayaLain(keberangkatanId: string, deskripsi: string, jumlah: number) {
    return prisma.biayaLainKeberangkatan.create({
      data: { keberangkatanId, deskripsi, jumlah },
    })
  },

  /** Hapus satu biaya lain */
  async deleteBiayaLain(id: string) {
    return prisma.biayaLainKeberangkatan.delete({ where: { id } })
  },

  /** Keberangkatan yang masih berlangsung (untuk dropdown pilih trip di form gaji) */
  async getKeberangkatanBerlangsung() {
    return prisma.keberangkatan.findMany({
      where: { status: 'berlangsung' },
      include: {
        kapal: { select: { nama: true } },
        peserta: { include: { abk: { select: { id: true, nama: true, posisi: true } } } },
      },
      orderBy: { tanggalBerangkat: 'desc' },
    })
  },
}

//solar service
export const SolarService = {
  /** Catat satu kali pengisian solar, sekaligus alokasikan porsi biayanya ke 1 atau lebih keberangkatan */
  async createPengisianSolar(data: CreatePengisianSolarInput) {
    const totalHarga = data.jumlahLiter * data.hargaPerLiter

    const totalAlokasi = data.alokasi.reduce((sum, a) => sum + a.porsiBiaya, 0)
    if (Math.abs(totalAlokasi - totalHarga) > 1) {
      throw new Error(
        `Total alokasi (${totalAlokasi}) tidak sama dengan total harga solar (${totalHarga})`
      )
    }

    return prisma.pengisianSolar.create({
      data: {
        tanggal: new Date(data.tanggal),
        jumlahLiter: data.jumlahLiter,
        hargaPerLiter: data.hargaPerLiter,
        totalHarga,
        keterangan: data.keterangan,
        keberangkatan: {
          create: data.alokasi.map((a) => ({
            keberangkatanId: a.keberangkatanId,
            porsiBiaya: a.porsiBiaya,
          })),
        },
      },
      include: {
        keberangkatan: { include: { keberangkatan: { include: { kapal: { select: { nama: true } } } } } },
      },
    })
  },

  /** Daftar pengisian solar */
  async getPengisianSolarList(limit = 20) {
    return prisma.pengisianSolar.findMany({
      include: {
        keberangkatan: { include: { keberangkatan: { include: { kapal: { select: { nama: true } } } } } },
      },
      orderBy: { tanggal: 'desc' },
      take: limit,
    })
  },
}

//pinjaman service
export const PinjamanService = {
  /** Catat pinjaman baru untuk seorang ABK */
  async createPinjaman(data: CreatePinjamanInput) {
    return prisma.pinjaman.create({
      data: {
        abkId: data.abkId,
        jumlah: data.jumlah,
        sisaPinjaman: data.jumlah,
        tanggal: new Date(data.tanggal),
        keterangan: data.keterangan,
        status: 'belum_lunas',
      },
    })
  },

  /** Daftar pinjaman yang belum lunas untuk satu ABK (dipakai saat hitung gaji, untuk cek potongan) */
  async getPinjamanBelumLunas(abkId: string) {
    return prisma.pinjaman.findMany({
      where: { abkId, status: 'belum_lunas' },
      orderBy: { tanggal: 'asc' },
    })
  },

  /** Semua riwayat pinjaman satu ABK */
  async getPinjamanByAbk(abkId: string) {
    return prisma.pinjaman.findMany({
      where: { abkId },
      include: { potongan: { include: { gaji: { select: { tanggal: true, gajiBersih: true } } } } },
      orderBy: { tanggal: 'desc' },
    })
  },

  /**
   * Potong pinjaman dari satu transaksi gaji.
   * Update sisaPinjaman, tandai lunas kalau sudah habis, dan catat riwayat di PotonganPinjaman.
   */
  async potongPinjaman(pinjamanId: string, gajiId: string, jumlah: number) {
    return prisma.$transaction(async (tx) => {
      const pinjaman = await tx.pinjaman.findUnique({ where: { id: pinjamanId } })
      if (!pinjaman) throw new Error('Pinjaman tidak ditemukan')
      if (jumlah > pinjaman.sisaPinjaman) {
        throw new Error('Jumlah potongan melebihi sisa pinjaman')
      }

      const sisaBaru = pinjaman.sisaPinjaman - jumlah

      await tx.pinjaman.update({
        where: { id: pinjamanId },
        data: {
          sisaPinjaman: sisaBaru,
          status: sisaBaru <= 0 ? 'lunas' : 'belum_lunas',
          updatedAt: new Date(),
        },
      })

      return tx.potonganPinjaman.create({
        data: { pinjamanId, gajiId, jumlah },
      })
    })
  },
}

//tarif ikan service
export const TarifIkanService = {
  /** Ambil tarif untuk posisi tertentu (untuk auto-isi form gaji) */
  async getTarifByPosisi(posisi: string) {
    return prisma.tarifIkan.findMany({
      where: { posisi },
      orderBy: { namaIkan: 'asc' },
    })
  },

  /** Tambah atau update tarif (posisi + jenis ikan unik) */
  async upsertTarif(posisi: string, namaIkan: string, gajiPerKg: number) {
    return prisma.tarifIkan.upsert({
      where: { posisi_namaIkan: { posisi, namaIkan } },
      update: { gajiPerKg },
      create: { posisi, namaIkan, gajiPerKg },
    })
  },

  /** Semua tarif yang tersimpan */
  async getAllTarif() {
    return prisma.tarifIkan.findMany({ orderBy: [{ posisi: 'asc' }, { namaIkan: 'asc' }] })
  },
}

// GAJI SERVICE — query terkait gaji ABK & detail ikan

export const GajiService = {
  async getGajiList(page = 1, limit = 10, abkId?: string) {
    const skip = (page - 1) * limit;
    const where = abkId ? { abkId } : {};

    const [data, total] = await Promise.all([
      prisma.gaji.findMany({
        where,
        include: { detailIkan: true, abk: true },
        orderBy: { tanggal: "desc" },
        skip,
        take: limit,
      }),
      prisma.gaji.count({ where }),
    ]);

    return { data, total, page, totalPages: Math.ceil(total / limit) };
  },

  async getGajiById(id: string) {
    return prisma.gaji.findUnique({
      where: { id },
      include: { detailIkan: true, abk: true },
    });
  },

  async createGaji(data: {
    abkId: string;
    keberangkatanId: string;
    bonusHarian: number;
    potongan: number;
    totalBerat: number;
    totalNilaiIkan: number;
    totalGajiIkan: number;
    gajiBruto: number;
    gajiBersih: number;
    tanggal: string;
    jenisIkan: Array<{
      nama: string;
      berat: number;
      harga: number;
      gajiPerKg: number;
    }>;
  }) {
    return prisma.gaji.create({
      data: {
        abkId: data.abkId,
        keberangkatanId:data.keberangkatanId,
        bonusHarian: data.bonusHarian,
        potongan: data.potongan,
        totalBerat: data.totalBerat,
        totalNilaiIkan: data.totalNilaiIkan,
        totalGajiIkan: data.totalGajiIkan,
        gajiBruto: data.gajiBruto,
        gajiBersih: data.gajiBersih,
        tanggal: new Date(data.tanggal),
        detailIkan: {
          create: data.jenisIkan.map((ikan) => ({
            namaIkan: ikan.nama,
            berat: ikan.berat,
            hargaPerKg: ikan.harga,
            gajiPerKg: ikan.gajiPerKg,
            totalNilai: ikan.berat * ikan.harga,
            totalGaji: ikan.berat * ikan.gajiPerKg,
          })),
        },
      },
      include: { detailIkan: true, abk: true },
    });
  },

  async deleteGaji(id: string) {
    return prisma.gaji.delete({
      where: { id },
      include: { detailIkan: true },
    });
  },

  async updateGaji(id: string, data: UpdateGajiInput & { abkId: string }) {
    return prisma.$transaction(async (tx) => {
      await tx.detailIkan.deleteMany({ where: { gajiId: id } });

      const updatedGaji = await tx.gaji.update({
        where: { id },
        data: {
          abkId: data.abkId,
          bonusHarian: data.bonusHarian,
          potongan: data.potongan,
          totalBerat: data.totalBerat,
          totalNilaiIkan: data.totalNilaiIkan,
          totalGajiIkan: data.totalGajiIkan,
          gajiBruto: data.gajiBruto,
          gajiBersih: data.gajiBersih,
          tanggal: new Date(data.tanggal),
          updatedAt: new Date(),
        },
      });

      const detailIkanRecords = await Promise.all(
        data.jenisIkan.map((ikan) =>
          tx.detailIkan.create({
            data: {
              gajiId: id,
              namaIkan: ikan.nama,
              berat: ikan.berat,
              hargaPerKg: ikan.harga,
              gajiPerKg: ikan.gajiPerKg,
              totalNilai: ikan.berat * ikan.harga,
              totalGaji: ikan.berat * ikan.gajiPerKg,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          }),
        ),
      );

      return { gaji: updatedGaji, detailIkan: detailIkanRecords };
    });
  },

  async getGajiStats(startDate?: Date, endDate?: Date) {
    const where =
      startDate && endDate ? { tanggal: { gte: startDate, lte: endDate } } : {};

    const stats = await prisma.gaji.aggregate({
      where,
      _sum: { totalBerat: true, totalNilaiIkan: true, gajiBersih: true },
      _avg: { gajiBersih: true },
      _count: { id: true },
    });

    const topAbk = await prisma.gaji.groupBy({
      by: ["abkId"],
      where,
      _sum: { gajiBersih: true, totalBerat: true },
      _count: { id: true },
      orderBy: { _sum: { gajiBersih: "desc" } },
      take: 5,
    });

    //keberangkatan service

    // Ambil nama ABK untuk hasil groupBy di atas (groupBy tidak bisa langsung include relasi)
    const topAbkWithNama = await Promise.all(
      topAbk.map(async (item) => {
        const abk = await prisma.aBK.findUnique({
          where: { id: item.abkId },
          select: { nama: true },
        });
        return { ...item, namaAbk: abk?.nama || "Tidak diketahui" };
      }),
    );

    const topIkan = await prisma.detailIkan.groupBy({
      by: ["namaIkan"],
      where: { gaji: where },
      _sum: { berat: true, totalGaji: true },
      orderBy: { _sum: { berat: "desc" } },
      take: 5,
    });

    return {
      summary: {
        totalEntries: stats._count.id || 0,
        totalBerat: stats._sum.totalBerat || 0,
        totalNilaiIkan: stats._sum.totalNilaiIkan || 0,
        totalGajiBersih: stats._sum.gajiBersih || 0,
        avgGajiBersih: stats._avg.gajiBersih || 0,
      },
      topAbk: topAbkWithNama,
      topIkan,
    };
  },

  async getUniqueJenisIkan() {
    const result = await prisma.detailIkan.groupBy({
      by: ["namaIkan"],
      _avg: { hargaPerKg: true, gajiPerKg: true },
      orderBy: { namaIkan: "asc" },
    });
    return result.map((item) => ({
      nama: item.namaIkan,
      avgHarga: item._avg.hargaPerKg || 0,
      avgGaji: item._avg.gajiPerKg || 0,
    }));
  },

  /** Total akumulasi gaji bersih per ABK (dari seluruh transaksi Gaji) */
  async getTotalGajiPerAbk() {
    const result = await prisma.gaji.groupBy({
      by: ["abkId"],
      _sum: { gajiBersih: true },
    });

    // Ubah jadi map { abkId: totalGaji } supaya gampang dicari di frontend
    return result.reduce(
      (acc, item) => {
        acc[item.abkId] = item._sum.gajiBersih || 0;
        return acc;
      },
      {} as Record<string, number>,
    );
  },
};

//

// KAPAL SERVICE — query terkait data kapal

export const KapalService = {
  /** Ambil daftar kapal dengan pagination, filter status & pencarian */
  async getKapalList(page = 1, limit = 50, status?: string, search?: string) {
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (status && status !== "all") {
      where.status = status;
    }
    if (search) {
      where.OR = [
        { nama: { contains: search, mode: "insensitive" as const } },
        { nomorRegistrasi: { contains: search, mode: "insensitive" as const } },
        { pemilik: { contains: search, mode: "insensitive" as const } },
        { jenis: { contains: search, mode: "insensitive" as const } },
      ];
    }

    const [data, total] = await Promise.all([
      prisma.kapal.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.kapal.count({ where }),
    ]);

    return { data, total, page, totalPages: Math.ceil(total / limit) };
  },

  /** Ambil detail satu kapal berdasarkan ID */
  async getKapalById(id: string) {
    return prisma.kapal.findUnique({ where: { id } });
  },

  /** Tambah kapal baru, tolak jika nomor registrasi sudah terdaftar */
  async createKapal(data: CreateKapalInput) {
    const existingKapal = await prisma.kapal.findUnique({
      where: { nomorRegistrasi: data.nomorRegistrasi },
    });

    if (existingKapal) {
      throw new Error("Nomor registrasi kapal sudah terdaftar");
    }

    return prisma.kapal.create({
      data: {
        ...data,
        tahunBuat: new Date(data.tahunBuat),
        tanggalSertifikat: new Date(data.tanggalSertifikat),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  },

  /** Update data kapal, tolak jika nomor registrasi baru sudah dipakai kapal lain */
  async updateKapal(id: string, data: UpdateKapalInput) {
    if (data.nomorRegistrasi) {
      const existingKapal = await prisma.kapal.findFirst({
        where: { nomorRegistrasi: data.nomorRegistrasi, NOT: { id } },
      });

      if (existingKapal) {
        throw new Error("Nomor registrasi kapal sudah terdaftar");
      }
    }

    return prisma.kapal.update({
      where: { id },
      data: {
        ...data,
        ...(data.tahunBuat && { tahunBuat: new Date(data.tahunBuat) }),
        ...(data.tanggalSertifikat && {
          tanggalSertifikat: new Date(data.tanggalSertifikat),
        }),
        updatedAt: new Date(),
      },
    });
  },

  /** Hapus data kapal */
  async deleteKapal(id: string) {
    const [totalAbk, totalKeberangkatan] = await Promise.all([
      prisma.aBK.count({ where: { kapal_id: id } }),
      prisma.keberangkatan.count({ where: { kapal_id: id } }),
    ]);

    if (totalAbk > 0 || totalKeberangkatan > 0) {
      const dependencies = [];
      if (totalAbk > 0) dependencies.push(`${totalAbk} data ABK`);
      if (totalKeberangkatan > 0) {
        dependencies.push(`${totalKeberangkatan} data keberangkatan`);
      }

      throw new Error(
        `Kapal tidak dapat dihapus karena masih digunakan oleh ${dependencies.join(" dan ")}.`,
      );
    }

    return prisma.kapal.delete({ where: { id } });
  },

  /** Statistik kapal: total, breakdown status/jenis, sertifikat akan habis */
  async getKapalStats() {
    const totalKapal = await prisma.kapal.count();

    const statusStats = await prisma.kapal.groupBy({
      by: ["status"],
      _count: { id: true },
    });

    const jenisStats = await prisma.kapal.groupBy({
      by: ["jenis"],
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 5,
    });

    const kapasitasStats = await prisma.kapal.aggregate({
      _sum: { kapasitas: true },
      _avg: { kapasitas: true },
      _max: { kapasitas: true },
      _min: { kapasitas: true },
    });

    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const sertifikatExpiring = await prisma.kapal.count({
      where: { tanggalSertifikat: { lte: thirtyDaysFromNow } },
    });

    return {
      summary: {
        totalKapal,
        totalKapasitas: kapasitasStats._sum.kapasitas || 0,
        avgKapasitas: kapasitasStats._avg.kapasitas || 0,
        sertifikatExpiring,
      },
      statusBreakdown: statusStats.reduce(
        (acc, item) => {
          acc[item.status] = item._count.id;
          return acc;
        },
        {} as Record<string, number>,
      ),
      topJenisKapal: jenisStats.map((item) => ({
        jenis: item.jenis,
        count: item._count.id,
      })),
    };
  },

  /** Cari kapal berdasarkan nomor registrasi */
  async findByNomorRegistrasi(nomorRegistrasi: string) {
    return prisma.kapal.findUnique({ where: { nomorRegistrasi } });
  },

  /** Ambil semua kapal dengan status tertentu */
  async getKapalByStatus(status: string) {
    return prisma.kapal.findMany({
      where: { status },
      orderBy: { nama: "asc" },
    });
  },

  /** Update status kapal saja */
  async updateStatusKapal(id: string, status: string) {
    return prisma.kapal.update({
      where: { id },
      data: { status, updatedAt: new Date() },
    });
  },
};

// ============================================================
// DASHBOARD SERVICE — agregat ringkas untuk halaman dashboard
// ============================================================

export const DashboardService = {
  /** Total jumlah kapal terdaftar */
  async getKapalCount() {
    return prisma.kapal.count();
  },

  /** Jumlah ABK dengan status aktif */
  async getAbkCount() {
    return prisma.aBK.count({ where: { status: "aktif" } });
  },

  async getKeuanganSummary() {
    const [
      pendapatanResult,
      gajiResult,
      bekalResult,
      solarResult,
      biayaLainResult,
      biayaOperasionalResult,
    ] = await Promise.all([
      prisma.detailIkan.aggregate({ _sum: { totalNilai: true } }),
      prisma.gaji.aggregate({ _sum: { gajiBersih: true } }),
      prisma.pesertaKeberangkatan.aggregate({ _sum: { bekal: true } }),
      prisma.solarKeberangkatan.aggregate({ _sum: { porsiBiaya: true } }),
      prisma.biayaLainKeberangkatan.aggregate({ _sum: { jumlah: true } }),
      prisma.biayaOperasional.aggregate({
        where: { kategori: { not: "Gaji ABK" } },
        _sum: { jumlah: true },
      }),
    ]);

    const pendapatan = pendapatanResult._sum.totalNilai || 0;
    const gajiAbk = gajiResult._sum.gajiBersih || 0;
    const bekal = bekalResult._sum.bekal || 0;
    const solar = solarResult._sum.porsiBiaya || 0;
    const biayaLain = biayaLainResult._sum.jumlah || 0;
    const biayaOperasional = biayaOperasionalResult._sum.jumlah || 0;

    const modal = bekal + solar + biayaLain;
    const totalPengeluaran = gajiAbk + modal + biayaOperasional;

    return {
      pemasukan: pendapatan,
      pengeluaran: totalPengeluaran,
      keuntungan: pendapatan - totalPengeluaran,
      detail: { gajiAbk, modal, biayaOperasional, bekal, solar, biayaLain },
    };
  },

  /** Jumlah maintenance terjadwal — belum ada model Maintenance, sementara 0 */
  async getMaintenanceCount() {
    return 0;
  },
  /** Ambil aktivitas terbaru, gabungan dari Kapal, ABK, dan Gaji (diurutkan berdasarkan waktu) */
  async getRecentActivities(limit = 5) {
    const [kapalTerbaru, abkTerbaru, gajiTerbaru] = await Promise.all([
      prisma.kapal.findMany({
        orderBy: { createdAt: "desc" },
        take: limit,
        select: { id: true, nama: true, createdAt: true },
      }),
      prisma.aBK.findMany({
        orderBy: { createdAt: "desc" },
        take: limit,
        select: { id: true, nama: true, createdAt: true },
      }),
      prisma.gaji.findMany({
        orderBy: { createdAt: "desc" },
        take: limit,
        select: {
          id: true,
          gajiBersih: true,
          createdAt: true,
          abk: { select: { nama: true } }, // ← ganti namaAbk jadi relasi abk.nama
        },
      }),
    ]);

    const activities = [
      ...kapalTerbaru.map((k) => ({
        id: `kapal-${k.id}`,
        type: "kapal" as const,
        message: `Kapal baru ditambahkan: ${k.nama}`,
        timestamp: k.createdAt,
      })),
      ...abkTerbaru.map((a) => ({
        id: `abk-${a.id}`,
        type: "abk" as const,
        message: `ABK baru bergabung: ${a.nama}`,
        timestamp: a.createdAt,
      })),
      ...gajiTerbaru.map((g) => ({
        id: `gaji-${g.id}`,
        type: "gaji" as const,
        message: `Transaksi gaji: ${g.abk.nama} - ${new Intl.NumberFormat(
          "id-ID",
          {
            // ← ganti g.namaAbk jadi g.abk.nama
            style: "currency",
            currency: "IDR",
            maximumFractionDigits: 0,
          },
        ).format(g.gajiBersih)}`,
        timestamp: g.createdAt,
      })),
    ];

    return activities
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  },
};
