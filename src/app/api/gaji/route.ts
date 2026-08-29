import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { PinjamanService } from '@/lib/database'
import { request } from 'https'

const prisma = new PrismaClient()

interface JenisIkan {
  id: number
  nama: string
  berat: number
  harga: number
  gajiPerKg: number
}

interface PotonganPinjamanInput {
  pinjamanId: string
  jumlah: number
}

interface GajiRequest {
  abkId: string
  keberangkatanId: string
  jenisIkan: JenisIkan[]
  bonusHarian: number
  potongan: number
  totalBerat: number
  totalNilaiIkan: number
  totalGajiIkan: number
  gajiBruto: number
  gajiBersih: number
  tanggal: string
  potonganPinjaman?: PotonganPinjamanInput[]
}

export async function POST(request: NextRequest) {
  try {
    const data: GajiRequest = await request.json()

    if (!data.abkId || !data.keberangkatanId || !data.jenisIkan || data.jenisIkan.length === 0) {
      return NextResponse.json(
        { error: 'Data tidak lengkap: ABK, keberangkatan, dan data ikan harus diisi' },
        { status: 400 }
      )
    }

    const abk = await prisma.aBK.findUnique({ where: { id: data.abkId } })
    if (!abk) {
      return NextResponse.json({ error: 'ABK tidak ditemukan' }, { status: 400 })
    }

    const keberangkatan = await prisma.keberangkatan.findUnique({ where: { id: data.keberangkatanId } })
    if (!keberangkatan) {
      return NextResponse.json({ error: 'Keberangkatan tidak ditemukan' }, { status: 400 })
    }

    const validIkan = data.jenisIkan.filter(ikan => ikan.nama && ikan.berat > 0)
    if (validIkan.length === 0) {
      return NextResponse.json(
        { error: 'Minimal harus ada satu jenis ikan dengan data valid' },
        { status: 400 }
      )
    }

    // Validasi total potongan pinjaman tidak melebihi total potongan
    if (data.potonganPinjaman && data.potonganPinjaman.length > 0) {
      const totalPotonganPinjaman = data.potonganPinjaman.reduce((sum, p) => sum + p.jumlah, 0)
      if (totalPotonganPinjaman > data.potongan) {
        return NextResponse.json(
          { error: 'Total potongan pinjaman melebihi total potongan yang diinput' },
          { status: 400 }
        )
      }
    }

    const result = await prisma.$transaction(async (tx) => {
      const gajiRecord = await tx.gaji.create({
        data: {
          abkId: data.abkId,
          keberangkatanId: data.keberangkatanId,
          bonusHarian: data.bonusHarian,
          potongan: data.potongan,
          totalBerat: data.totalBerat,
          totalNilaiIkan: data.totalNilaiIkan,
          totalGajiIkan: data.totalGajiIkan,
          gajiBruto: data.gajiBruto,
          gajiBersih: data.gajiBersih,
          tanggal: new Date(data.tanggal),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        include: { abk: { select: { nama: true } } },
      })

      const detailIkanRecords = await Promise.all(
        validIkan.map(ikan =>
          tx.detailIkan.create({
            data: {
              gajiId: gajiRecord.id,
              namaIkan: ikan.nama,
              berat: ikan.berat,
              hargaPerKg: ikan.harga,
              gajiPerKg: ikan.gajiPerKg,
              totalNilai: ikan.berat * ikan.harga,
              totalGaji: ikan.berat * ikan.gajiPerKg,
              createdAt: new Date(),
              updatedAt: new Date(),
            }
          })
        )
      )

      return { gaji: gajiRecord, detailIkan: detailIkanRecords }
    })

    // Potong pinjaman setelah gaji berhasil dibuat (di luar transaksi utama, tapi tetap aman
    // karena masing-masing potongPinjaman sudah transaksi sendiri)
    if (data.potonganPinjaman && data.potonganPinjaman.length > 0) {
      for (const p of data.potonganPinjaman) {
        if (p.jumlah > 0) {
          await PinjamanService.potongPinjaman(p.pinjamanId, result.gaji.id, p.jumlah)
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Data gaji berhasil disimpan',
      data: {
        id: result.gaji.id,
        namaAbk: result.gaji.abk.nama,
        gajiBersih: result.gaji.gajiBersih,
        tanggal: result.gaji.tanggal,
        detailIkan: result.detailIkan.map(detail => ({
          namaIkan: detail.namaIkan,
          berat: detail.berat,
          totalGaji: detail.totalGaji
        }))
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Error saving gaji data:', error)

    if (error instanceof Error) {
      if (error.message.includes('Foreign key constraint')) {
        return NextResponse.json({ error: 'Error referensi database' }, { status: 400 })
      }
      if (error.message.includes('melebihi sisa pinjaman')) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }
    }

    return NextResponse.json(
      { error: 'Terjadi kesalahan server saat menyimpan data' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

export async function GET(request: NextRequest) {
  try {
    const {searchParams} = new URL(request.url)
    const abkId = searchParams.get('abkId') || undefined
    const gajiData = await prisma.gaji.findMany({
      where: abkId ? { abkId } : {},
      include: {
        detailIkan: true,
        abk: { select: { nama: true, posisi: true } },
        keberangkatan: { include: { kapal: { select: { nama: true } } } },
      },
      orderBy: { tanggal: 'desc' },
      take: 50
    })

    return NextResponse.json({ success: true, data: gajiData })
  } catch (error) {
    console.error('Error fetching gaji data:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan saat mengambil data' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}