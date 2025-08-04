// src/app/abk/tambah-abk/page.tsx
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, UserPlus, Save } from 'lucide-react'
import Card from '@/component/ui/card'
import Button from '@/component/ui/button'
import kapalData from '@/data/kapal.json'

interface AbkFormData {
  nama: string
  posisi: string
  kapal_id: number
  gaji: number
  tanggal_bergabung: string
  status: 'aktif' | 'cuti' | 'nonaktif'
  no_ktp: string
  alamat: string
  no_telepon: string
}

export default function TambahAbkPage() {
  const router = useRouter()
  const [formData, setFormData] = useState<AbkFormData>({
    nama: '',
    posisi: '',
    kapal_id: 0,
    gaji: 0,
    tanggal_bergabung: '',
    status: 'aktif',
    no_ktp: '',
    alamat: '',
    no_telepon: ''
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<keyof AbkFormData, string>>>({})

  const posisiOptions = [
    'Nahkoda',
    'Chief Engineer',
    'Chief Officer',
    'Second Engineer',
    'Second Officer',
    'Third Officer',
    'Bosun',
    'AB (Able Seaman)',
    'OS (Ordinary Seaman)',
    'Oiler',
    'Wiper',
    'Cook',
    'Messman'
  ]

  const statusOptions = [
    { value: 'aktif', label: 'Aktif' },
    { value: 'cuti', label: 'Cuti' },
    { value: 'nonaktif', label: 'Non-Aktif' }
  ]

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'kapal_id' || name === 'gaji' ? Number(value) : value
    }))

    // Clear error when user starts typing
    if (errors[name as keyof AbkFormData]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof AbkFormData, string>> = {}

    if (!formData.nama.trim()) newErrors.nama = 'Nama wajib diisi'
    if (!formData.posisi) newErrors.posisi = 'Posisi wajib dipilih'
    if (!formData.kapal_id) newErrors.kapal_id = 'Kapal wajib dipilih'
    if (!formData.gaji || formData.gaji <= 0) newErrors.gaji = 'Gaji wajib diisi dan harus lebih dari 0'
    if (!formData.tanggal_bergabung) newErrors.tanggal_bergabung = 'Tanggal bergabung wajib diisi'
    if (!formData.no_ktp.trim()) newErrors.no_ktp = 'No. KTP wajib diisi'
    if (formData.no_ktp.length !== 16) newErrors.no_ktp = 'No. KTP harus 16 digit'
    if (!formData.alamat.trim()) newErrors.alamat = 'Alamat wajib diisi'
    if (!formData.no_telepon.trim()) newErrors.no_telepon = 'No. telepon wajib diisi'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    
    try {
      // Here you would typically make an API call to save the data
      // For now, we'll simulate it with a timeout
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // In a real app, you might store in localStorage or make API call
      const existingData = JSON.parse(localStorage.getItem('abkData') || '[]')
      const newId = existingData.length > 0 ? Math.max(...existingData.map((abk: any) => abk.id)) + 1 : 1
      
      const newAbk = {
        id: newId,
        ...formData
      }
      
      const updatedData = [...existingData, newAbk]
      localStorage.setItem('abkData', JSON.stringify(updatedData))
      
      // Show success message and redirect
      alert('ABK berhasil ditambahkan!')
      router.push('/abk')
      
    } catch (error) {
      console.error('Error adding ABK:', error)
      alert('Terjadi kesalahan saat menambah ABK')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    if (confirm('Apakah Anda yakin ingin membatalkan? Data yang sudah diisi akan hilang.')) {
      router.push('/abk')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button 
            variant="secondary" 
            size="sm"
            onClick={() => router.push('/abk')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tambah ABK Baru</h1>
            <p className="text-gray-600">Isi data lengkap anak buah kapal</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-blue-100 rounded-lg">
            <UserPlus className="h-6 w-6 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Form */}
      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information Section */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Informasi Personal</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Nama */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Lengkap <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="nama"
                  value={formData.nama}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.nama ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Masukkan nama lengkap"
                />
                {errors.nama && <p className="text-red-500 text-sm mt-1">{errors.nama}</p>}
              </div>

              {/* No KTP */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  No. KTP <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="no_ktp"
                  value={formData.no_ktp}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.no_ktp ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Masukkan nomor KTP (16 digit)"
                  maxLength={16}
                />
                {errors.no_ktp && <p className="text-red-500 text-sm mt-1">{errors.no_ktp}</p>}
              </div>

              {/* No Telepon */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  No. Telepon <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="no_telepon"
                  value={formData.no_telepon}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.no_telepon ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Masukkan nomor telepon"
                />
                {errors.no_telepon && <p className="text-red-500 text-sm mt-1">{errors.no_telepon}</p>}
              </div>

              {/* Alamat */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alamat <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="alamat"
                  value={formData.alamat}
                  onChange={handleInputChange}
                  rows={3}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.alamat ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Masukkan alamat lengkap"
                />
                {errors.alamat && <p className="text-red-500 text-sm mt-1">{errors.alamat}</p>}
              </div>
            </div>
          </div>

          {/* Job Information Section */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Informasi Pekerjaan</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Posisi */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Posisi <span className="text-red-500">*</span>
                </label>
                <select
                  name="posisi"
                  value={formData.posisi}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.posisi ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Pilih posisi</option>
                  {posisiOptions.map(posisi => (
                    <option key={posisi} value={posisi}>{posisi}</option>
                  ))}
                </select>
                {errors.posisi && <p className="text-red-500 text-sm mt-1">{errors.posisi}</p>}
              </div>

              {/* Kapal */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kapal <span className="text-red-500">*</span>
                </label>
                <select
                  name="kapal_id"
                  value={formData.kapal_id}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.kapal_id ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value={0}>Pilih kapal</option>
                  {kapalData.map(kapal => (
                    <option key={kapal.id} value={kapal.id}>{kapal.nama}</option>
                  ))}
                </select>
                {errors.kapal_id && <p className="text-red-500 text-sm mt-1">{errors.kapal_id}</p>}
              </div>

              {/* Gaji */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gaji <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="gaji"
                  value={formData.gaji}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.gaji ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="0"
                  min="0"
                />
                {errors.gaji && <p className="text-red-500 text-sm mt-1">{errors.gaji}</p>}
              </div>

              {/* Tanggal Bergabung */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tanggal Bergabung <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="tanggal_bergabung"
                  value={formData.tanggal_bergabung}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.tanggal_bergabung ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.tanggal_bergabung && <p className="text-red-500 text-sm mt-1">{errors.tanggal_bergabung}</p>}
              </div>

              {/* Status */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status <span className="text-red-500">*</span>
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <Button 
              variant="secondary" 
              onClick={handleCancel}
              // disabled={isSubmitting}
            >
              Batal
            </Button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Menyimpan...' : 'Simpan ABK'}
            </button>
          </div>
        </form>
      </Card>
    </div>
  )
}