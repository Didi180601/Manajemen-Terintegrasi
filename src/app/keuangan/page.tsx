'use client'
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Calculator, TrendingUp, Users, DollarSign, PieChart, BarChart3, ArrowUpRight, ArrowDownRight } from 'lucide-react'

// Mock data - dalam implementasi nyata, data ini akan diambil dari database
const mockData = {
  gaji: {
    totalABK: 15,
    totalGajiBulanIni: 45000000,
    rataRataGaji: 3000000,
    totalBonus: 2500000,
    totalPotongan: 1200000,
    produktivitasTertinggi: {
      nama: "Budi Santoso",
      gaji: 4500000,
      totalTangkapan: 180
    }
  },
  modal: {
    totalModal: 125000000,
    modalTerpakai: 89000000,
    sisaModal: 36000000,
    biayaOperasionalBulan: 12000000,
    biayaMarketingBulan: 3500000,
    cadanganDarurat: 25000000
  },
  keuntungan: {
    pendapatanBulanIni: 95000000,
    keuntunganKotor: 52000000,
    keuntunganBersih: 38000000,
    marginKeuntungan: 40.0,
    roi: 30.4,
    targetBulanan: 45000000,
    pencapaianTarget: 84.4
  }
}

const KeuanganOverview = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('bulan-ini')
  const [data, setData] = useState(mockData)

  // Simulasi loading data berdasarkan periode
  const loadData = (period: string) => {
    // Dalam implementasi nyata, ini akan memanggil API
    console.log(`Loading data for period: ${period}`)
    // setData(...) dengan data sesuai periode
  }

  useEffect(() => {
    loadData(selectedPeriod)
  }, [selectedPeriod])

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-lg">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Dashboard Keuangan</h1>
              <p className="text-blue-100 mt-2">Overview keuangan bisnis perikanan</p>
            </div>
            <div className="flex items-center space-x-2">
              <PieChart className="w-8 h-8" />
            </div>
          </div>
        </div>
        
        {/* Filter Periode */}
        <div className="p-6 border-b">
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700">Periode:</label>
            <select 
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="bulan-ini">Bulan Ini</option>
              <option value="bulan-lalu">Bulan Lalu</option>
              <option value="3-bulan">3 Bulan Terakhir</option>
              <option value="tahun-ini">Tahun Ini</option>
            </select>
          </div>
        </div>

        {/* Quick Stats Cards */}
        <div className="p-6">
          <div className="grid md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-600 text-sm font-medium">Pendapatan</p>
                  <p className="text-2xl font-bold text-green-800">
                    Rp {data.keuntungan.pendapatanBulanIni.toLocaleString('id-ID')}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-600 text-sm font-medium">Total Gaji ABK</p>
                  <p className="text-2xl font-bold text-blue-800">
                    Rp {data.gaji.totalGajiBulanIni.toLocaleString('id-ID')}
                  </p>
                </div>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-600 text-sm font-medium">Modal Terpakai</p>
                  <p className="text-2xl font-bold text-purple-800">
                    Rp {data.modal.modalTerpakai.toLocaleString('id-ID')}
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-purple-600" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-4 rounded-lg border border-yellow-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-600 text-sm font-medium">Keuntungan Bersih</p>
                  <p className="text-2xl font-bold text-yellow-800">
                    Rp {data.keuntungan.keuntunganBersih.toLocaleString('id-ID')}
                  </p>
                </div>
                <BarChart3 className="w-8 h-8 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Gaji & SDM */}
        <div className="bg-white rounded-lg shadow-md flex flex-col">
          <div className="bg-blue-600 text-white p-4 rounded-t-lg">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Gaji & SDM</h2>
              <Users className="w-6 h-6" />
            </div>
          </div>
          <div className="p-6 flex-1 flex flex-col">
            {/* Stats Section - Fixed Height */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-600 h-12 flex items-center justify-center">{data.gaji.totalABK}</p>
                <p className="text-sm text-gray-600">Total ABK</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-green-600 h-12 flex items-center justify-center">
                  Rp {data.gaji.rataRataGaji.toLocaleString('id-ID')}
                </p>
                <p className="text-sm text-gray-600">Rata-rata Gaji</p>
              </div>
            </div>

            {/* Detail Section - Fixed Height */}
            <div className="bg-gray-50 p-3 rounded-lg mb-4 h-20">
              <h4 className="font-semibold text-gray-800 mb-2">Detail Penggajian</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Lorem, ipsum.</span>
                  <span className="font-medium text-green-600">
                    +Rp {data.gaji.totalBonus.toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Lorem, ipsum dolor.</span>
                  <span className="font-medium text-red-600">
                    -Rp {data.gaji.totalPotongan.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            </div>

            {/* ABK Terbaik Section - Fixed Height */}
            <div className="bg-blue-50 p-3 rounded-lg mb-4 h-20">
              <h4 className="font-semibold text-blue-800 mb-1">ABK Terbaik</h4>
              <p className="text-sm font-medium">{data.gaji.produktivitasTertinggi.nama}</p>
              <div className="flex justify-between text-xs">
                <span>Gaji: Rp {data.gaji.produktivitasTertinggi.gaji.toLocaleString('id-ID')}</span>
                <span>Tangkapan: {data.gaji.produktivitasTertinggi.totalTangkapan} kg</span>
              </div>
            </div>

            {/* Button - Push to bottom */}
            <div className="mt-auto">
              <Link 
                href="/keuangan/hitung-gaji"
                className="block w-full bg-blue-600 text-white text-center py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Kelola Gaji ABK
              </Link>
            </div>
          </div>
        </div>

        {/* Modal & Investasi */}
        <div className="bg-white rounded-lg shadow-md flex flex-col">
          <div className="bg-purple-600 text-white p-4 rounded-t-lg">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Modal & Investasi</h2>
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
          <div className="p-6 flex-1 flex flex-col">
            {/* Stats Section - Fixed Height */}
            <div className="text-center mb-4">
              <p className="text-3xl font-bold text-purple-600 h-12 flex items-center justify-center">
                Rp {data.modal.totalModal.toLocaleString('id-ID')}
              </p>
              <p className="text-sm text-gray-600">Total Modal</p>
            </div>

            {/* Progress Section - Fixed Height */}
            <div className="bg-gray-50 p-3 rounded-lg mb-4 h-20">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Penggunaan Modal</span>
                <span className="text-sm font-bold text-purple-600">
                  {((data.modal.modalTerpakai / data.modal.totalModal) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-purple-600 h-2 rounded-full" 
                  style={{width: `${(data.modal.modalTerpakai / data.modal.totalModal) * 100}%`}}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-gray-600 mt-1">
                <span>Terpakai: Rp {data.modal.modalTerpakai.toLocaleString('id-ID')}</span>
                <span>Sisa: Rp {data.modal.sisaModal.toLocaleString('id-ID')}</span>
              </div>
            </div>

            {/* Detail Cards Section - Fixed Height */}
            <div className="grid grid-cols-2 gap-2 text-sm mb-4 h-20">
              <div className="bg-red-50 p-2 rounded flex flex-col justify-center">
                <p className="text-red-600 font-medium text-xs">Operasional/Bulan</p>
                <p className="font-bold text-sm">Rp {data.modal.biayaOperasionalBulan.toLocaleString('id-ID')}</p>
              </div>
              <div className="bg-green-50 p-2 rounded flex flex-col justify-center">
                <p className="text-green-600 font-medium text-xs">Cadangan Darurat</p>
                <p className="font-bold text-sm">Rp {data.modal.cadanganDarurat.toLocaleString('id-ID')}</p>
              </div>
            </div>

            {/* Button - Push to bottom */}
            <div className="mt-auto">
              <Link 
                href="/keuangan/hitung-modal"
                className="block w-full bg-purple-600 text-white text-center py-2 rounded-md hover:bg-purple-700 transition-colors"
              >
                Kelola Modal Usaha
              </Link>
            </div>
          </div>
        </div>

        {/* Keuntungan & Performance */}
        <div className="bg-white rounded-lg shadow-md flex flex-col">
          <div className="bg-green-600 text-white p-4 rounded-t-lg">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Keuntungan & Performance</h2>
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
          <div className="p-6 flex-1 flex flex-col">
            {/* Stats Section - Fixed Height */}
            <div className="grid grid-cols-2 gap-4 text-center mb-4">
              <div>
                <p className="text-2xl font-bold text-green-600 h-12 flex items-center justify-center">
                  {data.keuntungan.marginKeuntungan.toFixed(1)}%
                </p>
                <p className="text-sm text-gray-600">Margin Keuntungan</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600 h-12 flex items-center justify-center">
                  {data.keuntungan.roi.toFixed(1)}%
                </p>
                <p className="text-sm text-gray-600">ROI</p>
              </div>
            </div>

            {/* Analysis Section - Fixed Height */}
            <div className="bg-gray-50 p-3 rounded-lg mb-4 h-20">
              <h4 className="font-semibold text-gray-800 mb-2">Analisis Keuntungan</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Keuntungan Kotor:</span>
                  <span className="font-medium text-green-600">
                    Rp {data.keuntungan.keuntunganKotor.toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Keuntungan Bersih:</span>
                  <span className="font-medium text-green-600">
                    Rp {data.keuntungan.keuntunganBersih.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            </div>

            {/* Target Section - Fixed Height */}
            <div className="bg-yellow-50 p-3 rounded-lg mb-4 h-20">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-semibold text-yellow-800">Target Bulanan</h4>
                <div className="flex items-center">
                  {data.keuntungan.pencapaianTarget >= 100 ? (
                    <ArrowUpRight className="w-4 h-4 text-green-600" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4 text-red-600" />
                  )}
                  <span className={`text-sm font-bold ml-1 ${
                    data.keuntungan.pencapaianTarget >= 100 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {data.keuntungan.pencapaianTarget.toFixed(1)}%
                  </span>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    data.keuntungan.pencapaianTarget >= 100 ? 'bg-green-600' : 'bg-yellow-600'
                  }`}
                  style={{width: `${Math.min(data.keuntungan.pencapaianTarget, 100)}%`}}
                ></div>
              </div>
              <p className="text-xs text-gray-600 mt-1">
                Target: Rp {data.keuntungan.targetBulanan.toLocaleString('id-ID')}
              </p>
            </div>

            {/* Button - Push to bottom */}
            <div className="mt-auto">
              <Link 
                href="/keuangan/hitung-keuntungan"
                className="block w-full bg-green-600 text-white text-center py-2 rounded-md hover:bg-green-700 transition-colors"
              >
                Analisis Keuntungan
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Aksi Cepat</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <Link 
            href="/keuangan/hitung-gaji"
            className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors group h-20"
          >
            <Calculator className="w-8 h-8 text-blue-600 mr-3 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-semibold text-blue-800 group-hover:text-blue-900">Hitung Gaji ABK</h3>
              <p className="text-sm text-blue-600">Kelola penggajian anak buah kapal</p>
            </div>
          </Link>

          <Link 
            href="/keuangan/hitung-modal"
            className="flex items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors group h-20"
          >
            <DollarSign className="w-8 h-8 text-purple-600 mr-3 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-semibold text-purple-800 group-hover:text-purple-900">Kelola Modal</h3>
              <p className="text-sm text-purple-600">Perencanaan modal dan investasi</p>
            </div>
          </Link>

          <Link 
            href="/keuangan/hitung-keuntungan"
            className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors group h-20"
          >
            <TrendingUp className="w-8 h-8 text-green-600 mr-3 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-semibold text-green-800 group-hover:text-green-900">Analisis Profit</h3>
              <p className="text-sm text-green-600">Hitung margin dan ROI bisnis</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Tips Section */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">💡 Tips Pengelolaan Keuangan</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">Sistem Gaji ABK</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Buat sistem insentif berdasarkan hasil tangkapan</li>
              <li>• Monitor produktivitas setiap ABK secara berkala</li>
              <li>• Sesuaikan gaji dengan performa dan pengalaman</li>
            </ul>
          </div>
          <div className="bg-white p-4 rounded-lg">
            <h3 className="font-semibold text-purple-800 mb-2">Pengelolaan Modal</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Siapkan cadangan darurat minimal 6 bulan operasional</li>
              <li>• Monitor cashflow dan arus kas secara rutin</li>
              <li>• Diversifikasi sumber pendanaan dan investasi</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default KeuanganOverview