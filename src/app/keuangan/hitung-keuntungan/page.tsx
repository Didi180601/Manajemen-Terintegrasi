// src/app/keuangan/hitung-keuntungan/page.tsx
'use client'
import React, { useState } from 'react'

const HitungKeuntungan = () => {
  const [hargaBeli, setHargaBeli] = useState<number>(0)
  const [hargaJual, setHargaJual] = useState<number>(0)
  const [jumlahProduk, setJumlahProduk] = useState<number>(1)
  const [biayaOperasional, setBiayaOperasional] = useState<number>(0)

  const calculateKeuntungan = () => {
    const totalHargaBeli = hargaBeli * jumlahProduk
    const totalHargaJual = hargaJual * jumlahProduk
    const keuntunganKotor = totalHargaJual - totalHargaBeli
    const keuntunganBersih = keuntunganKotor - biayaOperasional
    const marginKeuntungan = totalHargaJual > 0 ? (keuntunganBersih / totalHargaJual) * 100 : 0
    const roi = totalHargaBeli > 0 ? (keuntunganBersih / totalHargaBeli) * 100 : 0

    return {
      totalHargaBeli,
      totalHargaJual,
      keuntunganKotor,
      keuntunganBersih,
      marginKeuntungan,
      roi
    }
  }

  const result = calculateKeuntungan()

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        {/* Input Form */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">Input Data Produk</h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Harga Beli per Unit (Rp)
            </label>
            <input
              type="number"
              value={hargaBeli}
              onChange={(e) => setHargaBeli(Number(e.target.value))}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Masukkan harga beli"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Harga Jual per Unit (Rp)
            </label>
            <input
              type="number"
              value={hargaJual}
              onChange={(e) => setHargaJual(Number(e.target.value))}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Masukkan harga jual"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Jumlah Produk
            </label>
            <input
              type="number"
              value={jumlahProduk}
              onChange={(e) => setJumlahProduk(Number(e.target.value))}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Masukkan jumlah produk"
              min="1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Biaya Operasional (Rp)
            </label>
            <input
              type="number"
              value={biayaOperasional}
              onChange={(e) => setBiayaOperasional(Number(e.target.value))}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Masukkan biaya operasional"
            />
          </div>
        </div>

        {/* Result */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">Hasil Perhitungan</h2>
          
          <div className="bg-gray-50 p-4 rounded-lg space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Harga Beli:</span>
              <span className="font-semibold">Rp {result.totalHargaBeli.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Harga Jual:</span>
              <span className="font-semibold">Rp {result.totalHargaJual.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Keuntungan Kotor:</span>
              <span className={`font-semibold ${result.keuntunganKotor >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                Rp {result.keuntunganKotor.toLocaleString('id-ID')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Biaya Operasional:</span>
              <span className="font-semibold text-red-600">- Rp {biayaOperasional.toLocaleString('id-ID')}</span>
            </div>
            <hr className="border-gray-300" />
            <div className="flex justify-between text-lg">
              <span className="font-bold text-gray-800">Keuntungan Bersih:</span>
              <span className={`font-bold ${result.keuntunganBersih >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                Rp {result.keuntunganBersih.toLocaleString('id-ID')}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-600">
                {result.marginKeuntungan.toFixed(1)}%
              </div>
              <div className="text-sm text-blue-700">Margin Keuntungan</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-purple-600">
                {result.roi.toFixed(1)}%
              </div>
              <div className="text-sm text-purple-700">ROI</div>
            </div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-2">Informasi</h3>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Margin = (Keuntungan Bersih ÷ Total Jual) × 100%</li>
              <li>• ROI = (Keuntungan Bersih ÷ Total Beli) × 100%</li>
              <li>• Keuntungan Bersih = Keuntungan Kotor - Biaya Operasional</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HitungKeuntungan