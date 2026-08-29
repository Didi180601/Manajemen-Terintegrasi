// src/app/api/dashboard/keuangan/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface ABKStats {
  abkId: string
  nama: string
  totalGaji: number
  totalTangkapan: number
}

interface ABKStatsMap {
  [key: string]: ABKStats
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const period = searchParams.get('period') || 'bulan-ini'

    const { startDate, endDate } = getDateRange(period)

    // 1. QUERY DATA GAJI ABK dengan detail ikan + relasi ABK
    const gajiData = await prisma.gaji.findMany({
      where: {
        tanggal: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        detailIkan: true,
        abk: { select: { id: true, nama: true } }
      },
      orderBy: {
        tanggal: 'desc'
      }
    })

    // 2. HITUNG STATISTIK GAJI
    const uniqueABK = [...new Set(gajiData.map(g => g.abkId))]
    const totalABK = uniqueABK.length

    const totalGajiBulanIni = gajiData.reduce((sum, g) => sum + g.gajiBersih, 0)
    const totalPotongan = gajiData.reduce((sum, g) => sum + g.potongan, 0)
    const rataRataGaji = totalABK > 0 ? totalGajiBulanIni / totalABK : 0

    // 3. CARI ABK DENGAN PRODUKTIVITAS TERTINGGI
    const abkStats: ABKStatsMap = gajiData.reduce((acc: ABKStatsMap, g) => {
      if (!acc[g.abkId]) {
        acc[g.abkId] = {
          abkId: g.abkId,
          nama: g.abk.nama,
          totalGaji: 0,
          totalTangkapan: 0
        }
      }
      acc[g.abkId].totalGaji += g.gajiBersih
      acc[g.abkId].totalTangkapan += g.totalBerat
      return acc
    }, {})

    const produktivitasTertinggi: ABKStats | null = Object.keys(abkStats).length > 0
      ? Object.values(abkStats).reduce((max: ABKStats, current: ABKStats) =>
          current.totalTangkapan > max.totalTangkapan ? current : max
        )
      : null

    // 4. HITUNG TOTAL NILAI IKAN DAN TOTAL GAJI DARI IKAN
    const totalNilaiIkan = gajiData.reduce((sum, g) => sum + g.totalNilaiIkan, 0)
    const totalGajiIkan = gajiData.reduce((sum, g) => sum + g.totalGajiIkan, 0)

    // 5. DATA MODAL — dari struktur Keberangkatan (bekal + solar + biaya lain)
    const [bekalResult, solarResult, biayaLainResult] = await Promise.all([
      prisma.pesertaKeberangkatan.aggregate({
        where: { keberangkatan: { tanggalBerangkat: { gte: startDate, lte: endDate } } },
        _sum: { bekal: true },
      }),
      prisma.solarKeberangkatan.aggregate({
        where: { keberangkatan: { tanggalBerangkat: { gte: startDate, lte: endDate } } },
        _sum: { porsiBiaya: true },
      }),
      prisma.biayaLainKeberangkatan.aggregate({
        where: { keberangkatan: { tanggalBerangkat: { gte: startDate, lte: endDate } } },
        _sum: { jumlah: true },
      }),
    ])

    const totalModal =
      (bekalResult._sum.bekal || 0) +
      (solarResult._sum.porsiBiaya || 0) +
      (biayaLainResult._sum.jumlah || 0)
    const modalTerpakai = totalModal
    const sisaModal = 0

    // 6. HITUNG KEUNTUNGAN
    const pendapatanBulanIni = totalNilaiIkan
    const totalGajiDibayar = totalGajiBulanIni
    const keuntunganBersih = totalNilaiIkan - totalGajiBulanIni - totalModal
    const marginKeuntungan = totalNilaiIkan > 0
      ? (keuntunganBersih / totalNilaiIkan) * 100
      : 0

    // 7. RETURN RESPONSE
    return NextResponse.json({
      success: true,
      data: {
        gaji: {
          totalABK,
          totalGajiBulanIni: Math.round(totalGajiBulanIni),
          rataRataGaji: Math.round(rataRataGaji),
          totalPotongan: Math.round(totalPotongan),
          produktivitasTertinggi: produktivitasTertinggi ? {
            nama: produktivitasTertinggi.nama,
            gaji: Math.round(produktivitasTertinggi.totalGaji),
            totalTangkapan: Math.round(produktivitasTertinggi.totalTangkapan)
          } : null
        },
        modal: {
          totalModal: Math.round(totalModal),
          modalTerpakai: Math.round(modalTerpakai),
          sisaModal: Math.round(sisaModal)
        },
        keuntungan: {
          pendapatanBulanIni: Math.round(pendapatanBulanIni),
          totalNilaiIkan: Math.round(totalNilaiIkan),
          totalGajiDibayar: Math.round(totalGajiDibayar),
          keuntunganBersih: Math.round(keuntunganBersih),
          marginKeuntungan: Math.round(marginKeuntungan * 10) / 10
        },
        periode: {
          period,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        }
      }
    })

  } catch (error) {
    console.error('Error fetching dashboard data:', error)

    if (error instanceof Error) {
      return NextResponse.json(
        {
          success: false,
          error: 'Terjadi kesalahan saat mengambil data dashboard',
          details: error.message
        },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Terjadi kesalahan server yang tidak diketahui'
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

function getDateRange(period: string): { startDate: Date; endDate: Date } {
  const now = new Date()
  let startDate: Date
  let endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)

  switch (period) {
    case 'bulan-ini':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0)
      break

    case 'bulan-lalu':
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0)
      endDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999)
      break

    case '3-bulan':
      startDate = new Date(now.getFullYear(), now.getMonth() - 2, 1, 0, 0, 0, 0)
      break

    case 'tahun-ini':
      startDate = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0)
      break

    default:
      startDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0)
  }

  return { startDate, endDate }
}