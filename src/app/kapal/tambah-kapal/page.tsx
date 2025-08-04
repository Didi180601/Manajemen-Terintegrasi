// src/app/kapal/tambah-kapal/page.tsx
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Ship, Save } from 'lucide-react'
import Card from '@/component/ui/card'
import Button from '@/component/ui/button'

interface KapalFormData {
  nama: string
  jenis: string
  nomor_registrasi: string
  kapasitas: number
  status: 'aktif' | 'maintenance' | 'nonaktif'
  tahun_buat: number
  pemilik: string
  pelabuhan_asal: string
  dimensi_panjang: number
  dimensi_lebar: number
  dimensi_tinggi: number
  mesin_utama: string
  daya_mesin: number
  kecepatan_maksimal: number
  bahan_bakar: string
  sertifikat_kelaikan: string
  tanggal_sertifikat: string
}

export default function TambahKapalPage() {
  const router = useRouter()
  const [formData, setFormData] = useState<KapalFormData>({
    nama: '',
    jenis: '',
    nomor_registrasi: '',
    kapasitas: 0,
    status: 'aktif',
    tahun_buat: new Date().getFullYear(),
    pemilik: '',
    pelabuhan_asal: '',
    dimensi_panjang: 0,
    dimensi_lebar: 0,
    dimensi_tinggi: 0,
    mesin_utama: '',
    daya_mesin: 0,
    kecepatan_maksimal: 0,
    bahan_bakar: '',
    sertifikat_kelaikan: '',
    tanggal_sertifikat: ''
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<keyof KapalFormData, string>>>({})

  const jenisKapalOptions = [
    'Kapal Cargo',
    'Kapal Tanker',
    'Kapal Penumpang',
    'Kapal Nelayan',
    'Kapal Tug Boat',
    'Kapal Patroli',
    'Kapal Supply',
    'Kapal Container',
    'Kapal Bulk Carrier',
    'Kapal Ro-Ro'
  ]

  const statusOptions = [
    { value: 'aktif', label: 'Aktif' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'nonaktif', label: 'Non-Aktif' }
  ]

  const bahanBakarOptions = [
    'Solar (Marine Gas Oil)',
    'Fuel Oil (HFO)',
    'Marine Diesel Oil (MDO)',
    'LNG (Liquefied Natural Gas)',
    'Bensin'
  ]

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: ['kapasitas', 'tahun_buat', 'dimensi_panjang', 'dimensi_lebar', 'dimensi_tinggi', 'daya_mesin', 'kecepatan_maksimal'].includes(name) 
        ? Number(value) 
        : value
    }))

    // Clear error when user starts typing
    if (errors[name as keyof KapalFormData]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof KapalFormData, string>> = {}

    if (!formData.nama.trim()) newErrors.nama = 'Nama kapal wajib diisi'
    if (!formData.jenis) newErrors.jenis = 'Jenis kapal wajib dipilih'
    if (!formData.nomor_registrasi.trim()) newErrors.nomor_registrasi = 'Nomor registrasi wajib diisi'
    if (!formData.kapasitas || formData.kapasitas <= 0) newErrors.kapasitas = 'Kapasitas wajib diisi dan harus lebih dari 0'
    if (!formData.tahun_buat || formData.tahun_buat < 1900 || formData.tahun_buat > new Date().getFullYear()) {
      newErrors.tahun_buat = 'Tahun buat tidak valid'
    }
    if (!formData.pemilik.trim()) newErrors.pemilik = 'Pemilik kapal wajib diisi'
    if (!formData.pelabuhan_asal.trim()) newErrors.pelabuhan_asal = 'Pelabuhan asal wajib diisi'
    if (!formData.dimensi_panjang || formData.dimensi_panjang <= 0) newErrors.dimensi_panjang = 'Panjang kapal wajib diisi'
    if (!formData.dimensi_lebar || formData.dimensi_lebar <= 0) newErrors.dimensi_lebar = 'Lebar kapal wajib diisi'
    if (!formData.dimensi_tinggi || formData.dimensi_tinggi <= 0) newErrors.dimensi_tinggi = 'Tinggi kapal wajib diisi'
    if (!formData.mesin_utama.trim()) newErrors.mesin_utama = 'Mesin utama wajib diisi'
    if (!formData.daya_mesin || formData.daya_mesin <= 0) newErrors.daya_mesin = 'Daya mesin wajib diisi'
    if (!formData.kecepatan_maksimal || formData.kecepatan_maksimal <= 0) newErrors.kecepatan_maksimal = 'Kecepatan maksimal wajib diisi'
    if (!formData.bahan_bakar) newErrors.bahan_bakar = 'Bahan bakar wajib dipilih'
    if (!formData.sertifikat_kelaikan.trim()) newErrors.sertifikat_kelaikan = 'Nomor sertifikat kelaikan wajib diisi'
    if (!formData.tanggal_sertifikat) newErrors.tanggal_sertifikat = 'Tanggal sertifikat wajib diisi'

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
      const existingData = JSON.parse(localStorage.getItem('kapalData') || '[]')
      const newId = existingData.length > 0 ? Math.max(...existingData.map((kapal: any) => kapal.id)) + 1 : 1
      
      const newKapal = {
        id: newId,
        ...formData
      }
      
      const updatedData = [...existingData, newKapal]
      localStorage.setItem('kapalData', JSON.stringify(updatedData))
      
      // Show success message and redirect
      alert('Kapal berhasil ditambahkan!')
      router.push('/kapal')
      
    } catch (error) {
      console.error('Error adding kapal:', error)
      alert('Terjadi kesalahan saat menambah kapal')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    if (confirm('Apakah Anda yakin ingin membatalkan? Data yang sudah diisi akan hilang.')) {
      router.push('/kapal')
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
            onClick={() => router.push('/kapal')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tambah Kapal Baru</h1>
            <p className="text-gray-600">Isi data lengkap kapal</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Ship className="h-6 w-6 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Form */}
      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information Section */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Informasi Dasar</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Nama Kapal */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Kapal <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="nama"
                  value={formData.nama}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.nama ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Masukkan nama kapal"
                />
                {errors.nama && <p className="text-red-500 text-sm mt-1">{errors.nama}</p>}
              </div>

              {/* Jenis Kapal */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Jenis Kapal <span className="text-red-500">*</span>
                </label>
                <select
                  name="jenis"
                  value={formData.jenis}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.jenis ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Pilih jenis kapal</option>
                  {jenisKapalOptions.map(jenis => (
                    <option key={jenis} value={jenis}>{jenis}</option>
                  ))}
                </select>
                {errors.jenis && <p className="text-red-500 text-sm mt-1">{errors.jenis}</p>}
              </div>

              {/* Nomor Registrasi */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nomor Registrasi <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="nomor_registrasi"
                  value={formData.nomor_registrasi}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.nomor_registrasi ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Masukkan nomor registrasi"
                />
                {errors.nomor_registrasi && <p className="text-red-500 text-sm mt-1">{errors.nomor_registrasi}</p>}
              </div>

              {/* Kapasitas */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kapasitas (ton) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="kapasitas"
                  value={formData.kapasitas}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.kapasitas ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="0"
                  min="0"
                />
                {errors.kapasitas && <p className="text-red-500 text-sm mt-1">{errors.kapasitas}</p>}
              </div>

              {/* Tahun Buat */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tahun Buat <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="tahun_buat"
                  value={formData.tahun_buat}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.tahun_buat ? 'border-red-500' : 'border-gray-300'
                  }`}
                  min="1900"
                  max={new Date().getFullYear()}
                />
                {errors.tahun_buat && <p className="text-red-500 text-sm mt-1">{errors.tahun_buat}</p>}
              </div>

              {/* Status */}
              <div>
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

              {/* Pemilik */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pemilik <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="pemilik"
                  value={formData.pemilik}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.pemilik ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Masukkan nama pemilik"
                />
                {errors.pemilik && <p className="text-red-500 text-sm mt-1">{errors.pemilik}</p>}
              </div>

              {/* Pelabuhan Asal */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pelabuhan Asal <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="pelabuhan_asal"
                  value={formData.pelabuhan_asal}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.pelabuhan_asal ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Masukkan pelabuhan asal"
                />
                {errors.pelabuhan_asal && <p className="text-red-500 text-sm mt-1">{errors.pelabuhan_asal}</p>}
              </div>
            </div>
          </div>

          {/* Specifications Section */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Spesifikasi Teknis</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Dimensi */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Panjang (m) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="dimensi_panjang"
                  value={formData.dimensi_panjang}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.dimensi_panjang ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="0"
                  min="0"
                  step="0.1"
                />
                {errors.dimensi_panjang && <p className="text-red-500 text-sm mt-1">{errors.dimensi_panjang}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lebar (m) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="dimensi_lebar"
                  value={formData.dimensi_lebar}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.dimensi_lebar ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="0"
                  min="0"
                  step="0.1"
                />
                {errors.dimensi_lebar && <p className="text-red-500 text-sm mt-1">{errors.dimensi_lebar}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tinggi (m) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="dimensi_tinggi"
                  value={formData.dimensi_tinggi}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.dimensi_tinggi ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="0"
                  min="0"
                  step="0.1"
                />
                {errors.dimensi_tinggi && <p className="text-red-500 text-sm mt-1">{errors.dimensi_tinggi}</p>}
              </div>

              {/* Mesin Utama */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mesin Utama <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="mesin_utama"
                  value={formData.mesin_utama}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.mesin_utama ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Masukkan jenis mesin utama"
                />
                {errors.mesin_utama && <p className="text-red-500 text-sm mt-1">{errors.mesin_utama}</p>}
              </div>

              {/* Daya Mesin */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Daya Mesin (HP) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="daya_mesin"
                  value={formData.daya_mesin}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.daya_mesin ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="0"
                  min="0"
                />
                {errors.daya_mesin && <p className="text-red-500 text-sm mt-1">{errors.daya_mesin}</p>}
              </div>

              {/* Kecepatan Maksimal */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kecepatan Maksimal (knot) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="kecepatan_maksimal"
                  value={formData.kecepatan_maksimal}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.kecepatan_maksimal ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="0"
                  min="0"
                  step="0.1"
                />
                {errors.kecepatan_maksimal && <p className="text-red-500 text-sm mt-1">{errors.kecepatan_maksimal}</p>}
              </div>

              {/* Bahan Bakar */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bahan Bakar <span className="text-red-500">*</span>
                </label>
                <select
                  name="bahan_bakar"
                  value={formData.bahan_bakar}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.bahan_bakar ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Pilih bahan bakar</option>
                  {bahanBakarOptions.map(bahan => (
                    <option key={bahan} value={bahan}>{bahan}</option>
                  ))}
                </select>
                {errors.bahan_bakar && <p className="text-red-500 text-sm mt-1">{errors.bahan_bakar}</p>}
              </div>
            </div>
          </div>

          {/* Certificate Section */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Sertifikat & Dokumen</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Sertifikat Kelaikan */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nomor Sertifikat Kelaikan <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="sertifikat_kelaikan"
                  value={formData.sertifikat_kelaikan}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.sertifikat_kelaikan ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Masukkan nomor sertifikat"
                />
                {errors.sertifikat_kelaikan && <p className="text-red-500 text-sm mt-1">{errors.sertifikat_kelaikan}</p>}
              </div>

              {/* Tanggal Sertifikat */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tanggal Berlaku Sertifikat <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="tanggal_sertifikat"
                  value={formData.tanggal_sertifikat}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.tanggal_sertifikat ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.tanggal_sertifikat && <p className="text-red-500 text-sm mt-1">{errors.tanggal_sertifikat}</p>}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <Button
              variant="secondary" 
              onClick={handleCancel}
            //   disabled={isSubmitting}
            >
              Batal
            </Button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Menyimpan...' : 'Simpan Kapal'}
            </button>
          </div>
        </form>
      </Card>
    </div>
  )
}