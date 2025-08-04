// src/app/keuangan/hitung-modal/page.tsx
'use client'
import React, { useState } from 'react'

const HitungModal = () => {
  const [modalAwal, setModalAwal] = useState<number>(0)
  const [biayaOperasional, setBiayaOperasional] = useState<number>(0)
  const [biayaMarketing, setBiayaMarketing] = useState<number>(0)
  const [cadanganDarurat, setCadanganDarurat] = useState<number>(0)
  const [inventoryAwal, setInventoryAwal] = useState<number>(0)
  const [biayaSetup, setBiayaSetup] = useState<number>(0)
  const [targetBulan, setTargetBulan] = useState<number>(6)

  const calculateModal = () => {
    const totalBiayaOperasional = biayaOperasional * targetBulan
    const totalBiayaMarketing = biayaMarketing * targetBulan
    const totalModal = modalAwal + totalBiayaOperasional + totalBiayaMarketing + cadanganDarurat + inventoryAwal + biayaSetup
    const modalPerBulan = totalModal / targetBulan

    return {
      totalBiayaOperasional,
      totalBiayaMarketing,
      totalModal,
      modalPerBulan,
      breakdown: {
        modalAwal: (modalAwal / totalModal) * 100 || 0,
        operasional: (totalBiayaOperasional / totalModal) * 100 || 0,
        marketing: (totalBiayaMarketing / totalModal) * 100 || 0,
        cadangan: (cadanganDarurat / totalModal) * 100 || 0,
        inventory: (inventoryAwal / totalModal) * 100 || 0,
        setup: (biayaSetup / totalModal) * 100 || 0
      }
    }
  }

  const result = calculateModal()

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        {/* Input Form */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">Input Kebutuhan Modal</h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Modal Awal Investasi (Rp)
            </label>
            <input
              type="number"
              value={modalAwal}
              onChange={(e) => setModalAwal(Number(e.target.value))}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Masukkan modal awal"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Biaya Operasional per Bulan (Rp)
            </label>
            <input
              type="number"
              value={biayaOperasional}
              onChange={(e) => setBiayaOperasional(Number(e.target.value))}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Sewa, listrik, gaji, dll"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Biaya Marketing per Bulan (Rp)
            </label>
            <input
              type="number"
              value={biayaMarketing}
              onChange={(e) => setBiayaMarketing(Number(e.target.value))}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Iklan, promosi, dll"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cadangan Darurat (Rp)
            </label>
            <input
              type="number"
              value={cadanganDarurat}
              onChange={(e) => setCadanganDarurat(Number(e.target.value))}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Dana cadangan"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Inventory/Stok Awal (Rp)
            </label>
            <input
              type="number"
              value={inventoryAwal}
              onChange={(e) => setInventoryAwal(Number(e.target.value))}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Stok produk awal"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Biaya Setup & Peralatan (Rp)
            </label>
            <input
              type="number"
              value={biayaSetup}
              onChange={(e) => setBiayaSetup(Number(e.target.value))}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Peralatan, setup, dll"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Periode (Bulan)
            </label>
            <input
              type="number"
              value={targetBulan}
              onChange={(e) => setTargetBulan(Number(e.target.value))}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Berapa bulan"
              min="1"
            />
          </div>
        </div>

        {/* Result */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">Hasil Perhitungan</h2>
          
          <div className="bg-gray-50 p-4 rounded-lg space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Modal Awal:</span>
              <span className="font-semibold">Rp {modalAwal.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Biaya Operasional ({targetBulan} bulan):</span>
              <span className="font-semibold">Rp {result.totalBiayaOperasional.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Biaya Marketing ({targetBulan} bulan):</span>
              <span className="font-semibold">Rp {result.totalBiayaMarketing.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Cadangan Darurat:</span>
              <span className="font-semibold">Rp {cadanganDarurat.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Inventory Awal:</span>
              <span className="font-semibold">Rp {inventoryAwal.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Biaya Setup:</span>
              <span className="font-semibold">Rp {biayaSetup.toLocaleString('id-ID')}</span>
            </div>
            <hr className="border-gray-300" />
            <div className="flex justify-between text-lg">
              <span className="font-bold text-gray-800">Total Modal Dibutuhkan:</span>
              <span className="font-bold text-purple-600">Rp {result.totalModal.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Modal per Bulan:</span>
              <span className="font-semibold text-blue-600">Rp {result.modalPerBulan.toLocaleString('id-ID')}</span>
            </div>
          </div>

          {/* Breakdown Chart */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-3">Breakdown Modal (%)</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Modal Awal</span>
                <div className="flex items-center">
                  <div className="w-20 h-2 bg-gray-200 rounded mr-2">
                    <div 
                      className="h-2 bg-purple-500 rounded" 
                      style={{width: `${result.breakdown.modalAwal}%`}}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">{result.breakdown.modalAwal.toFixed(1)}%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Operasional</span>
                <div className="flex items-center">
                  <div className="w-20 h-2 bg-gray-200 rounded mr-2">
                    <div 
                      className="h-2 bg-blue-500 rounded" 
                      style={{width: `${result.breakdown.operasional}%`}}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">{result.breakdown.operasional.toFixed(1)}%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Marketing</span>
                <div className="flex items-center">
                  <div className="w-20 h-2 bg-gray-200 rounded mr-2">
                    <div 
                      className="h-2 bg-green-500 rounded" 
                      style={{width: `${result.breakdown.marketing}%`}}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">{result.breakdown.marketing.toFixed(1)}%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Cadangan</span>
                <div className="flex items-center">
                  <div className="w-20 h-2 bg-gray-200 rounded mr-2">
                    <div 
                      className="h-2 bg-yellow-500 rounded" 
                      style={{width: `${result.breakdown.cadangan}%`}}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">{result.breakdown.cadangan.toFixed(1)}%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="font-semibold text-purple-800 mb-2">Tips Perencanaan Modal</h3>
            <ul className="text-sm text-purple-700 space-y-1">
              <li>• Siapkan cadangan darurat minimal 3-6 bulan operasional</li>
              <li>• Hitung modal kerja untuk cashflow lancar</li>
              <li>• Pertimbangkan seasonality bisnis</li>
              <li>• Review dan update proyeksi secara berkala</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HitungModal