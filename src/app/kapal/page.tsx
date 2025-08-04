// src/app/kapal/page.tsx
'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Ship, Users, Calendar, Settings, Eye, Edit, Trash2 } from "lucide-react"
import Card from "@/component/ui/card"
import Table from "@/component/ui/table"
import Button from "@/component/ui/button"
import kapalData from "@/data/kapal.json"
import { getAbkByKapalId } from "@/utils/dataHelpers"

// Interface untuk data yang ada di JSON
interface ExistingKapalData {
  id: number
  nama: string
  jenis: string
  nomor_registrasi: string
  kapasitas: number
  status: 'aktif' | 'maintenance' | 'nonaktif'
  tahun_buat: number
}

// Interface untuk data kapal lengkap (dengan field tambahan)
interface KapalData extends ExistingKapalData {
  pemilik?: string
  pelabuhan_asal?: string
  dimensi_panjang?: number
  dimensi_lebar?: number
  dimensi_tinggi?: number
  mesin_utama?: string
  daya_mesin?: number
  kecepatan_maksimal?: number
  bahan_bakar?: string
  sertifikat_kelaikan?: string
  tanggal_sertifikat?: string
}

export default function KapalPage() {
  const router = useRouter()
  const [kapalList, setKapalList] = useState<KapalData[]>(kapalData as KapalData[])

  // Load data from localStorage if available (for newly added kapal)
  useEffect(() => {
    const savedData = localStorage.getItem('kapalData')
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData)
        // Merge with existing data, avoiding duplicates
        const existingIds = kapalData.map(kapal => kapal.id)
        const newData = parsedData.filter((kapal: any) => !existingIds.includes(kapal.id))
        setKapalList([...kapalData as KapalData[], ...newData])
      } catch (error) {
        console.error('Error loading saved data:', error)
      }
    }
  }, [])

  const handleAddKapal = () => {
    router.push('/kapal/tambah-kapal')
  }

  const handleDeleteKapal = (id: number) => {
    if (confirm('Apakah Anda yakin ingin menghapus kapal ini?')) {
      setKapalList(prev => prev.filter(kapal => kapal.id !== id))
      // Also update localStorage
      const updatedList = kapalList.filter(kapal => kapal.id !== id)
      const newData = updatedList.filter(kapal => !kapalData.some(original => original.id === kapal.id))
      localStorage.setItem('kapalData', JSON.stringify(newData))
      alert('Kapal berhasil dihapus!')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manajemen Kapal</h1>
          <p className="text-gray-600">
            Kelola data kapal dan status operasional
          </p>
        </div>
        <Button onClick={handleAddKapal}>
          <Ship className="h-4 w-4 mr-2" />
          Tambah Kapal
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="flex items-center">
            <div className="p-3 bg-blue-500 rounded-full">
              <Ship className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Kapal</p>
              <p className="text-2xl font-bold text-blue-600">
                {kapalList.length}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="p-3 bg-green-500 rounded-full">
              <Ship className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Kapal Aktif</p>
              <p className="text-2xl font-bold text-green-600">
                {kapalList.filter((k) => k.status === "aktif").length}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="p-3 bg-orange-500 rounded-full">
              <Settings className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Maintenance</p>
              <p className="text-2xl font-bold text-orange-600">
                {kapalList.filter((k) => k.status === "maintenance").length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Daftar Kapal</h2>
          <div className="flex space-x-2">
            <Button variant="secondary" size="sm">
              Filter
            </Button>
            <Button variant="secondary" size="sm">
              Export
            </Button>
          </div>
        </div>
        <Table
          headers={[
            "Nama Kapal",
            "No. Registrasi",
            "Kapasitas",
            "Status",
            "Tahun",
            "ABK",
            "Aksi",
          ]}
        >
          {kapalList.map((kapal) => {
            const abkCount = getAbkByKapalId(kapal.id).length;
            return (
              <tr key={kapal.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <Ship className="h-5 w-5 text-gray-400 mr-2" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {kapal.nama}
                      </div>
                      <div className="text-sm text-gray-500">{kapal.jenis}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {kapal.nomor_registrasi}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {kapal.kapasitas} ton
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      kapal.status === "aktif"
                        ? "bg-green-100 text-green-800"
                        : kapal.status === "maintenance"
                        ? "bg-orange-100 text-orange-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {kapal.status === "aktif" ? "Aktif" : kapal.status === "maintenance" ? "Maintenance" : "Non-Aktif"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {kapal.tahun_buat}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center text-sm text-gray-900">
                    <Users className="h-4 w-4 mr-1" />
                    {abkCount} orang
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex space-x-2">
                    <Button variant="secondary" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="secondary" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="danger" 
                      size="sm"
                      onClick={() => handleDeleteKapal(kapal.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </Table>
      </Card>
    </div>
  )
}