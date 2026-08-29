-- CreateTable
CREATE TABLE "kapal" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "jenis" TEXT NOT NULL,
    "nomor_registrasi" TEXT NOT NULL,
    "kapasitas" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'aktif',
    "tahun_buat" TIMESTAMP(3) NOT NULL,
    "pemilik" TEXT NOT NULL,
    "dimensi_panjang" DOUBLE PRECISION NOT NULL,
    "dimensi_lebar" DOUBLE PRECISION NOT NULL,
    "dimensi_tinggi" DOUBLE PRECISION NOT NULL,
    "mesin_utama" TEXT NOT NULL,
    "daya_mesin" DOUBLE PRECISION NOT NULL,
    "kecepatan_maksimal" DOUBLE PRECISION NOT NULL,
    "bahan_bakar" TEXT NOT NULL,
    "sertifikat_kelaikan" TEXT NOT NULL,
    "tanggal_sertifikat" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kapal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "modal" (
    "id" TEXT NOT NULL,
    "kapal_id" TEXT NOT NULL,
    "jumlahNahkoda" INTEGER NOT NULL,
    "jumlahAbk" INTEGER NOT NULL,
    "hargaSolar" DOUBLE PRECISION NOT NULL,
    "bekalNahkoda" DOUBLE PRECISION NOT NULL,
    "bekalAbk" DOUBLE PRECISION NOT NULL,
    "jumlahHari" INTEGER NOT NULL,
    "jumlahJeregen" INTEGER NOT NULL,
    "totalBiayaSolar" DOUBLE PRECISION NOT NULL,
    "totalBekalNahkoda" DOUBLE PRECISION NOT NULL,
    "totalBekalAbk" DOUBLE PRECISION NOT NULL,
    "totalModal" DOUBLE PRECISION NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "modal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "biaya_operasional" (
    "id" TEXT NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL,
    "kategori" TEXT NOT NULL,
    "deskripsi" TEXT NOT NULL,
    "jumlah" DOUBLE PRECISION NOT NULL,
    "bukti_pembayaran" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "biaya_operasional_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "target_bisnis" (
    "id" TEXT NOT NULL,
    "periode" TEXT NOT NULL,
    "target_pendapatan" DOUBLE PRECISION NOT NULL,
    "target_keuntungan" DOUBLE PRECISION NOT NULL,
    "target_tangkapan" DOUBLE PRECISION NOT NULL,
    "realisasi_pendapatan" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "realisasi_keuntungan" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "realisasi_tangkapan" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "target_bisnis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "abk" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "posisi" TEXT NOT NULL,
    "kapal_id" TEXT NOT NULL,
    "gaji" DOUBLE PRECISION NOT NULL,
    "tanggal_bergabung" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL,
    "no_ktp" TEXT NOT NULL,
    "alamat" TEXT NOT NULL,
    "no_telepon" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "abk_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "kapal_nomor_registrasi_key" ON "kapal"("nomor_registrasi");

-- CreateIndex
CREATE UNIQUE INDEX "target_bisnis_periode_key" ON "target_bisnis"("periode");

-- CreateIndex
CREATE UNIQUE INDEX "abk_no_ktp_key" ON "abk"("no_ktp");

-- AddForeignKey
ALTER TABLE "modal" ADD CONSTRAINT "modal_kapal_id_fkey" FOREIGN KEY ("kapal_id") REFERENCES "kapal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "abk" ADD CONSTRAINT "abk_kapal_id_fkey" FOREIGN KEY ("kapal_id") REFERENCES "kapal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
