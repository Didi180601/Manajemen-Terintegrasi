-- CreateTable
CREATE TABLE "public"."gaji" (
    "id" TEXT NOT NULL,
    "namaAbk" TEXT NOT NULL,
    "bonusHarian" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "potongan" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalBerat" DOUBLE PRECISION NOT NULL,
    "totalNilaiIkan" DOUBLE PRECISION NOT NULL,
    "totalGajiIkan" DOUBLE PRECISION NOT NULL,
    "gajiBruto" DOUBLE PRECISION NOT NULL,
    "gajiBersih" DOUBLE PRECISION NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gaji_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."detail_ikan" (
    "id" TEXT NOT NULL,
    "gajiId" TEXT NOT NULL,
    "namaIkan" TEXT NOT NULL,
    "berat" DOUBLE PRECISION NOT NULL,
    "hargaPerKg" DOUBLE PRECISION NOT NULL,
    "gajiPerKg" DOUBLE PRECISION NOT NULL,
    "totalNilai" DOUBLE PRECISION NOT NULL,
    "totalGaji" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "detail_ikan_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."detail_ikan" ADD CONSTRAINT "detail_ikan_gajiId_fkey" FOREIGN KEY ("gajiId") REFERENCES "public"."gaji"("id") ON DELETE CASCADE ON UPDATE CASCADE;
