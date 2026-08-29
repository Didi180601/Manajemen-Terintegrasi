/*
  Warnings:

  - You are about to drop the `modal` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "modal" DROP CONSTRAINT "modal_kapal_id_fkey";

-- AlterTable
ALTER TABLE "gaji" ADD COLUMN     "keberangkatan_id" TEXT;

-- DropTable
DROP TABLE "modal";

-- CreateTable
CREATE TABLE "keberangkatan" (
    "id" TEXT NOT NULL,
    "kapal_id" TEXT NOT NULL,
    "tanggal_berangkat" TIMESTAMP(3) NOT NULL,
    "tanggal_kembali" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'berlangsung',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "keberangkatan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "peserta_keberangkatan" (
    "id" TEXT NOT NULL,
    "keberangkatan_id" TEXT NOT NULL,
    "abk_id" TEXT NOT NULL,
    "bekal" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "peserta_keberangkatan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pengisian_solar" (
    "id" TEXT NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL,
    "jumlah_liter" DOUBLE PRECISION NOT NULL,
    "harga_per_liter" DOUBLE PRECISION NOT NULL,
    "total_harga" DOUBLE PRECISION NOT NULL,
    "keterangan" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pengisian_solar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "solar_keberangkatan" (
    "id" TEXT NOT NULL,
    "keberangkatan_id" TEXT NOT NULL,
    "pengisian_solar_id" TEXT NOT NULL,
    "porsi_biaya" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "solar_keberangkatan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tarif_ikan" (
    "id" TEXT NOT NULL,
    "posisi" TEXT NOT NULL,
    "nama_ikan" TEXT NOT NULL,
    "gaji_per_kg" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "tarif_ikan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pinjaman" (
    "id" TEXT NOT NULL,
    "abk_id" TEXT NOT NULL,
    "jumlah" DOUBLE PRECISION NOT NULL,
    "sisa_pinjaman" DOUBLE PRECISION NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL,
    "keterangan" TEXT,
    "status" TEXT NOT NULL DEFAULT 'belum_lunas',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pinjaman_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "potongan_pinjaman" (
    "id" TEXT NOT NULL,
    "pinjaman_id" TEXT NOT NULL,
    "gaji_id" TEXT NOT NULL,
    "jumlah" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "potongan_pinjaman_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "biaya_lain_keberangkatan" (
    "id" TEXT NOT NULL,
    "keberangkatan_id" TEXT NOT NULL,
    "deskripsi" TEXT NOT NULL,
    "jumlah" DOUBLE PRECISION NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "biaya_lain_keberangkatan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "peserta_keberangkatan_keberangkatan_id_abk_id_key" ON "peserta_keberangkatan"("keberangkatan_id", "abk_id");

-- CreateIndex
CREATE UNIQUE INDEX "tarif_ikan_posisi_nama_ikan_key" ON "tarif_ikan"("posisi", "nama_ikan");

-- AddForeignKey
ALTER TABLE "gaji" ADD CONSTRAINT "gaji_keberangkatan_id_fkey" FOREIGN KEY ("keberangkatan_id") REFERENCES "keberangkatan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "keberangkatan" ADD CONSTRAINT "keberangkatan_kapal_id_fkey" FOREIGN KEY ("kapal_id") REFERENCES "kapal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "peserta_keberangkatan" ADD CONSTRAINT "peserta_keberangkatan_keberangkatan_id_fkey" FOREIGN KEY ("keberangkatan_id") REFERENCES "keberangkatan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "peserta_keberangkatan" ADD CONSTRAINT "peserta_keberangkatan_abk_id_fkey" FOREIGN KEY ("abk_id") REFERENCES "abk"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solar_keberangkatan" ADD CONSTRAINT "solar_keberangkatan_keberangkatan_id_fkey" FOREIGN KEY ("keberangkatan_id") REFERENCES "keberangkatan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solar_keberangkatan" ADD CONSTRAINT "solar_keberangkatan_pengisian_solar_id_fkey" FOREIGN KEY ("pengisian_solar_id") REFERENCES "pengisian_solar"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pinjaman" ADD CONSTRAINT "pinjaman_abk_id_fkey" FOREIGN KEY ("abk_id") REFERENCES "abk"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "potongan_pinjaman" ADD CONSTRAINT "potongan_pinjaman_pinjaman_id_fkey" FOREIGN KEY ("pinjaman_id") REFERENCES "pinjaman"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "potongan_pinjaman" ADD CONSTRAINT "potongan_pinjaman_gaji_id_fkey" FOREIGN KEY ("gaji_id") REFERENCES "gaji"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "biaya_lain_keberangkatan" ADD CONSTRAINT "biaya_lain_keberangkatan_keberangkatan_id_fkey" FOREIGN KEY ("keberangkatan_id") REFERENCES "keberangkatan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
