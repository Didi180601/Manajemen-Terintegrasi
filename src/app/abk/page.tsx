// src/app/abk/page.tsx
'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Users, UserPlus, DollarSign, Eye, Edit, Trash2 } from 'lucide-react'
import Card from '@/component/ui/card'
import Table from '@/component/ui/table'
import Button from '@/component/ui/button'
import abkData from '@/data/abk.json'
import kapalData from '@/data/kapal.json'
import { formatCurrency, formatDate } from '@/utils/dataHelpers'

// Interface untuk data yang ada di JSON
interface ExistingAbkData {
  id: number
  nama: string
  posisi: string
  kapal_id: number
  gaji: number
  tanggal_bergabung: string
  status: 'aktif' | 'cuti' | 'nonaktif'
}

// Interface untuk data ABK lengkap (dengan field tambahan)
interface AbkData extends ExistingAbkData {
  no_ktp?: string
  alamat?: string
  no_telepon?: string
}

export default function AbkPage() {
  const router = useRouter()
  const [abkList, setAbkList] = useState<AbkData[]>(abkData as AbkData[])

  // Load data from localStorage if available (for newly added ABK)
  useEffect(() => {
    const savedData = localStorage.getItem('abkData')
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData)
        // Merge with existing data, avoiding duplicates
        const existingIds = abkData.map(abk => abk.id)
        const newData = parsedData.filter((abk: any) => !existingIds.includes(abk.id))
        setAbkList([...abkData as AbkData[], ...newData])
      } catch (error) {
        console.error('Error loading saved data:', error)
      }
    }
  }, [])

  const totalGaji = abkList
    .filter(abk => abk.status === 'aktif')
    .reduce((sum, abk) => sum + abk.gaji, 0)

  const getKapalName = (kapalId: number) => {
    const kapal = kapalData.find(k => k.id === kapalId)
    return kapal?.nama || 'Tidak Ada'
  }

  const getStatusBadge = (status: string) => {
    const statusClasses = {
      'aktif': 'bg-green-100 text-green-800',
      'cuti': 'bg-yellow-100 text-yellow-800',
      'nonaktif': 'bg-red-100 text-red-800'
    }
    return statusClasses[status as keyof typeof statusClasses] || 'bg-gray-100 text-gray-800'
  }

  const handleAddAbk = () => {
    router.push('/abk/tambah-abk')
  }

  const handleDeleteAbk = (id: number) => {
    if (confirm('Apakah Anda yakin ingin menghapus ABK ini?')) {
      setAbkList(prev => prev.filter(abk => abk.id !== id))
      // Also update localStorage
      const updatedList = abkList.filter(abk => abk.id !== id)
      const newData = updatedList.filter(abk => !abkData.some(original => original.id === abk.id))
      localStorage.setItem('abkData', JSON.stringify(newData))
      alert('ABK berhasil dihapus!')
    }
  }

  const headers = [
    'Nama ABK',
    'Posisi', 
    'Kapal',
    'Gaji',
    'Tanggal Bergabung',
    'Status',
    'Aksi'
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manajemen ABK</h1>
          <p className="text-gray-600">Kelola data anak buah kapal</p>
        </div>
        <Button 
          variant="primary" 
          size="md"
          onClick={handleAddAbk}
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Tambah ABK
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total ABK</p>
              <p className="text-2xl font-bold text-gray-900">{abkList.length}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Users className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">ABK Aktif</p>
              <p className="text-2xl font-bold text-gray-900">
                {abkList.filter(abk => abk.status === 'aktif').length}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <DollarSign className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Gaji</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalGaji)}</p>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Daftar ABK</h2>
          <div className="flex space-x-2">
            <Button variant="secondary" size="sm">
              Filter
            </Button>
            <Button variant="secondary" size="sm">
              Export
            </Button>
          </div>
        </div>
        <Table headers={headers}>
          {abkList.map(abk => (
            <tr key={abk.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{abk.nama}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{abk.posisi}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{getKapalName(abk.kapal_id)}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{formatCurrency(abk.gaji)}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{formatDate(abk.tanggal_bergabung)}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(abk.status)}`}>
                  {abk.status.charAt(0).toUpperCase() + abk.status.slice(1)}
                </span>
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
                    onClick={() => handleDeleteAbk(abk.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </Table>
      </Card>
    </div>
  )
}