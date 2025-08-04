// src/app/keuangan/hitung-gaji/page.tsx
'use client'
import React, { useState } from 'react'

interface JenisIkan {
  id: number
  nama: string
  berat: number
  harga: number
  gajiPerKg: number
}

const HitungGaji = () => {
  const [namaAbk, setNamaAbk] = useState<string>('')
  const [jenisIkan, setJenisIkan] = useState<JenisIkan[]>([
    { id: 1, nama: 'Parang', berat: 0, harga: 0, gajiPerKg: 0 }
  ])
  const [bonusHarian, setBonusHarian] = useState<number>(0)
  const [potongan, setPotongan] = useState<number>(0)

  const addJenisIkan = () => {
    const newId = jenisIkan.length + 1
    setJenisIkan([...jenisIkan, { id: newId, nama: '', berat: 0, harga: 0, gajiPerKg: 0 }])
  }

  const removeJenisIkan = (id: number) => {
    if (jenisIkan.length > 1) {
      setJenisIkan(jenisIkan.filter(ikan => ikan.id !== id))
    }
  }

  const updateJenisIkan = (id: number, field: keyof JenisIkan, value: string | number) => {
    setJenisIkan(jenisIkan.map(ikan => 
      ikan.id === id ? { ...ikan, [field]: value } : ikan
    ))
  }

  const calculateGaji = () => {
    let totalBerat = 0
    let totalNilaiIkan = 0
    let totalGajiIkan = 0
    
    const detailIkan = jenisIkan.map(ikan => {
      const nilaiIkan = ikan.berat * ikan.harga
      const gajiIkan = ikan.berat * ikan.gajiPerKg
      
      totalBerat += ikan.berat
      totalNilaiIkan += nilaiIkan
      totalGajiIkan += gajiIkan
      
      return {
        ...ikan,
        nilaiIkan,
        gajiIkan
      }
    })

    const gajiBruto = totalGajiIkan + bonusHarian
    const gajiBersih = gajiBruto - potongan

    return {
      detailIkan,
      totalBerat,
      totalNilaiIkan,
      totalGajiIkan,
      gajiBruto,
      gajiBersih,
      bonusHarian,
      potongan
    }
  }

  const result = calculateGaji()

  return (
    <div className="space-y-6">
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Input Form */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">Data ABK & Hasil Tangkapan</h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nama ABK
            </label>
            <input
              type="text"
              value={namaAbk}
              onChange={(e) => setNamaAbk(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Masukkan nama ABK"
            />
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-800">Hasil Tangkapan Ikan</h3>
              <button
                onClick={addJenisIkan}
                className="bg-blue-500 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-600 transition-colors"
              >
                + Tambah Ikan
              </button>
            </div>
            
            {jenisIkan.map((ikan, index) => (
              <div key={ikan.id} className="bg-gray-50 p-4 rounded-lg space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-700">Ikan #{index + 1}</span>
                  {jenisIkan.length > 1 && (
                    <button
                      onClick={() => removeJenisIkan(ikan.id)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      Hapus
                    </button>
                  )}
                </div>
                
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Jenis Ikan
                    </label>
                    <input
                      type="text"
                      value={ikan.nama}
                      onChange={(e) => updateJenisIkan(ikan.id, 'nama', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-blue-500"
                      placeholder="Contoh: Parang"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Berat (kg)
                    </label>
                    <input
                      type="number"
                      value={ikan.berat}
                      onChange={(e) => updateJenisIkan(ikan.id, 'berat', Number(e.target.value))}
                      className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-blue-500"
                      placeholder="30"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Harga/kg (Rp)
                    </label>
                    <input
                      type="number"
                      value={ikan.harga}
                      onChange={(e) => updateJenisIkan(ikan.id, 'harga', Number(e.target.value))}
                      className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-blue-500"
                      placeholder="50000"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Gaji/kg (Rp)
                    </label>
                    <input
                      type="number"
                      value={ikan.gajiPerKg}
                      onChange={(e) => updateJenisIkan(ikan.id, 'gajiPerKg', Number(e.target.value))}
                      className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-blue-500"
                      placeholder="10000"
                    />
                  </div>
                </div>
                
                {ikan.berat > 0 && ikan.harga > 0 && (
                  <div className="bg-white p-3 rounded border text-sm">
                    <div className="flex justify-between">
                      <span>Nilai Ikan:</span>
                      <span className="font-medium">Rp {(ikan.berat * ikan.harga).toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Gaji dari Ikan ini:</span>
                      <span className="font-medium text-green-600">Rp {(ikan.berat * ikan.gajiPerKg).toLocaleString('id-ID')}</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bonus Harian (Rp)
              </label>
              <input
                type="number"
                value={bonusHarian}
                onChange={(e) => setBonusHarian(Number(e.target.value))}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Bonus tambahan"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Potongan (Rp)
              </label>
              <input
                type="number"
                value={potongan}
                onChange={(e) => setPotongan(Number(e.target.value))}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Makan, hutang, dll"
              />
            </div>
          </div>
        </div>

        {/* Result */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">Hasil Perhitungan Gaji ABK</h2>
          
          {namaAbk && (
            <div className="bg-blue-50 p-3 rounded-lg">
              <h3 className="font-semibold text-blue-800">ABK: {namaAbk}</h3>
            </div>
          )}

          {/* Detail per jenis ikan */}
          {result.detailIkan.some(ikan => ikan.berat > 0) && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-3">Detail Hasil Tangkapan</h3>
              <div className="space-y-2">
                {result.detailIkan.map((ikan, index) => (
                  ikan.berat > 0 && (
                    <div key={ikan.id} className="bg-white p-3 rounded border">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-gray-700">
                          {ikan.nama || `Ikan #${index + 1}`}
                        </span>
                        <span className="text-sm text-gray-500">{ikan.berat} kg</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-600">Nilai Ikan:</span>
                          <div className="font-medium">Rp {ikan.nilaiIkan.toLocaleString('id-ID')}</div>
                        </div>
                        <div>
                          <span className="text-gray-600">Gaji:</span>
                          <div className="font-medium text-green-600">Rp {ikan.gajiIkan.toLocaleString('id-ID')}</div>
                        </div>
                      </div>
                    </div>
                  )
                ))}
              </div>
            </div>
          )}
          
          {/* Summary */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Berat Ikan:</span>
              <span className="font-semibold">{result.totalBerat} kg</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Nilai Ikan:</span>
              <span className="font-semibold">Rp {result.totalNilaiIkan.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Gaji dari Ikan:</span>
              <span className="font-semibold text-blue-600">Rp {result.totalGajiIkan.toLocaleString('id-ID')}</span>
            </div>
            {result.bonusHarian > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Bonus Harian:</span>
                <span className="font-semibold text-green-600">+ Rp {result.bonusHarian.toLocaleString('id-ID')}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-600">Gaji Bruto:</span>
              <span className="font-semibold">Rp {result.gajiBruto.toLocaleString('id-ID')}</span>
            </div>
            {result.potongan > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Potongan:</span>
                <span className="font-semibold text-red-600">- Rp {result.potongan.toLocaleString('id-ID')}</span>
              </div>
            )}
            <hr className="border-gray-300" />
            <div className="flex justify-between text-lg">
              <span className="font-bold text-gray-800">Total Gaji Bersih:</span>
              <span className="font-bold text-green-600">Rp {result.gajiBersih.toLocaleString('id-ID')}</span>
            </div>
          </div>

          {/* Informasi sistem bagi hasil */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">Sistem Bagi Hasil ABK</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Gaji ABK dihitung berdasarkan berat ikan yang ditangkap</li>
              <li>• Setiap jenis ikan memiliki rate gaji per kg yang berbeda</li>
              <li>• Gaji = (Berat × Gaji per kg) + Bonus - Potongan</li>
              <li>• Sistem ini mendorong produktivitas ABK dalam menangkap ikan</li>
            </ul>
          </div>

          {/* Tips untuk Juragan */}
          {result.totalBerat > 0 && (
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-800 mb-2">Analisis Produktivitas</h3>
              <div className="text-sm text-green-700 space-y-1">
                <div>• Rata-rata gaji per kg: Rp {(result.totalGajiIkan / result.totalBerat || 0).toLocaleString('id-ID')}</div>
                <div>• Persentase gaji dari nilai ikan: {((result.totalGajiIkan / result.totalNilaiIkan) * 100 || 0).toFixed(1)}%</div>
                <div>• Efisiensi: {result.totalBerat > 50 ? 'Sangat Baik' : result.totalBerat > 20 ? 'Baik' : 'Perlu Ditingkatkan'}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default HitungGaji