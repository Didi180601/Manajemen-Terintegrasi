'use client'
import React, { useState, useEffect } from 'react'
import BackButton from '@/component/ui/back-button'

interface JenisIkan {
  id: number
  nama: string
  berat: number
  harga: number
  gajiPerKg: number
}

interface KeberangkatanOption {
  id: string
  tanggalBerangkat: string
  kapal: { nama: string }
  peserta: Array<{
    abkId: string
    abk: { id: string; nama: string; posisi: string }
  }>
}

interface TarifOption {
  namaIkan: string
  gajiPerKg: number
}

interface PinjamanBelumLunas {
  id: string
  jumlah: number
  sisaPinjaman: number
  tanggal: string
  keterangan: string | null
}

const HitungGaji = () => {
  // ===== Keberangkatan =====
  const [keberangkatanList, setKeberangkatanList] = useState<KeberangkatanOption[]>([])
  const [loadingKeberangkatan, setLoadingKeberangkatan] = useState(true)
  const [keberangkatanId, setKeberangkatanId] = useState<string>('')

  // ===== ABK (difilter dari peserta keberangkatan yang dipilih) =====
  const [abkId, setAbkId] = useState<string>('')
  const [namaAbk, setNamaAbk] = useState<string>('')
  const [posisiAbk, setPosisiAbk] = useState<string>('')

  // ===== Tarif otomatis per posisi =====
  const [tarifList, setTarifList] = useState<TarifOption[]>([])

  // ===== Pinjaman =====
  const [pinjamanList, setPinjamanList] = useState<PinjamanBelumLunas[]>([])
  const [potonganPinjaman, setPotonganPinjaman] = useState<Record<string, number>>({})

  const [jenisIkan, setJenisIkan] = useState<JenisIkan[]>([
    { id: 1, nama: '', berat: 0, harga: 0, gajiPerKg: 0 }
  ])
  const [potongan, setPotongan] = useState<number>(0)
  const [bonusHarian, setBonusHarian] = useState<number>(0)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [submitStatus, setSubmitStatus] = useState<{ type: 'success' | 'error' | null, message: string }>({ type: null, message: '' })

  // ===== Ambil daftar keberangkatan berlangsung =====
  useEffect(() => {
    const fetchKeberangkatan = async () => {
      try {
        const res = await fetch('/api/keberangkatan/berlangsung')
        const json = await res.json()
        setKeberangkatanList(json.data || [])
      } catch (error) {
        console.error('Gagal memuat keberangkatan:', error)
      } finally {
        setLoadingKeberangkatan(false)
      }
    }
    fetchKeberangkatan()
  }, [])

  // Peserta dari keberangkatan yang dipilih saja
  const selectedKeberangkatan = keberangkatanList.find((k) => k.id === keberangkatanId)
  const abkOptions = selectedKeberangkatan?.peserta.map((p) => p.abk) || []

  const handlePilihKeberangkatan = (id: string) => {
    setKeberangkatanId(id)
    setAbkId('')
    setNamaAbk('')
    setPosisiAbk('')
    setTarifList([])
    setPinjamanList([])
    setPotonganPinjaman({})
  }

  // Saat pilih ABK: ambil tarif sesuai posisi + cek pinjaman belum lunas
  const handlePilihAbk = async (id: string) => {
    setAbkId(id)
    const selected = abkOptions.find((abk) => abk.id === id)
    setNamaAbk(selected ? selected.nama : '')
    setPosisiAbk(selected ? selected.posisi : '')
    setPotonganPinjaman({})

    if (!selected) return

    try {
      const [tarifRes, pinjamanRes] = await Promise.all([
        fetch(`/api/tarif-ikan?posisi=${encodeURIComponent(selected.posisi)}`),
        fetch(`/api/pinjaman/belum-lunas?abkId=${id}`),
      ])
      const tarifJson = await tarifRes.json()
      const pinjamanJson = await pinjamanRes.json()

      setTarifList(tarifJson.data || [])
      setPinjamanList(pinjamanJson.data || [])
    } catch (error) {
      console.error('Gagal memuat tarif/pinjaman:', error)
    }
  }

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
    setJenisIkan(jenisIkan.map(ikan => {
      if (ikan.id !== id) return ikan
      const updated = { ...ikan, [field]: value }

      // Auto-isi gajiPerKg dari tarif kalau nama ikan cocok dengan tarif yang ada
      if (field === 'nama') {
        const tarif = tarifList.find((t) => t.namaIkan.toLowerCase() === String(value).toLowerCase())
        if (tarif) {
          updated.gajiPerKg = tarif.gajiPerKg
        }
      }
      return updated
    }))
  }

  const handlePotonganPinjamanChange = (pinjamanId: string, value: number) => {
    setPotonganPinjaman((prev) => ({ ...prev, [pinjamanId]: value }))
  }

  const totalPotonganDariPinjaman = Object.values(potonganPinjaman).reduce((sum, v) => sum + (v || 0), 0)

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

      return { ...ikan, nilaiIkan, gajiIkan }
    })

    const gajiBruto = totalGajiIkan + bonusHarian
    const gajiBersih = gajiBruto - potongan

    return { detailIkan, totalBerat, totalNilaiIkan, totalGajiIkan, gajiBruto, gajiBersih, potongan, bonusHarian }
  }

  const submitGaji = async () => {
    if (!keberangkatanId) {
      setSubmitStatus({ type: 'error', message: 'Keberangkatan harus dipilih' })
      return
    }
    if (!abkId) {
      setSubmitStatus({ type: 'error', message: 'ABK harus dipilih' })
      return
    }

    const hasValidIkan = jenisIkan.some(ikan => ikan.nama.trim() && ikan.berat > 0 && ikan.gajiPerKg > 0)
    if (!hasValidIkan) {
      setSubmitStatus({ type: 'error', message: 'Minimal harus ada satu jenis ikan dengan data lengkap' })
      return
    }

    if (totalPotonganDariPinjaman > potongan) {
      setSubmitStatus({ type: 'error', message: 'Total potongan pinjaman melebihi total potongan yang diinput' })
      return
    }

    setIsSubmitting(true)
    setSubmitStatus({ type: null, message: '' })

    try {
      const result = calculateGaji()

      const potonganPinjamanPayload = Object.entries(potonganPinjaman)
        .filter(([, jumlah]) => jumlah > 0)
        .map(([pinjamanId, jumlah]) => ({ pinjamanId, jumlah }))

      const gajiData = {
        abkId,
        keberangkatanId,
        jenisIkan: jenisIkan.filter(ikan => ikan.nama.trim() && ikan.berat > 0),
        bonusHarian: result.bonusHarian,
        potongan,
        totalBerat: result.totalBerat,
        totalNilaiIkan: result.totalNilaiIkan,
        totalGajiIkan: result.totalGajiIkan,
        gajiBruto: result.gajiBruto,
        gajiBersih: result.gajiBersih,
        tanggal: new Date().toISOString(),
        potonganPinjaman: potonganPinjamanPayload,
      }

      const response = await fetch('/api/gaji', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(gajiData),
      })

      const resultJson = await response.json()
      if (!response.ok) {
        throw new Error(resultJson.error || `HTTP error! status: ${response.status}`)
      }

      setSubmitStatus({ type: 'success', message: `Gaji ABK ${namaAbk} berhasil disimpan ke database!` })
    } catch (error) {
      console.error('Error submitting gaji:', error)
      setSubmitStatus({
        type: 'error',
        message: `Gagal menyimpan data: ${error instanceof Error ? error.message : 'Unknown error'}`
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setKeberangkatanId('')
    setAbkId('')
    setNamaAbk('')
    setPosisiAbk('')
    setTarifList([])
    setPinjamanList([])
    setPotonganPinjaman({})
    setJenisIkan([{ id: 1, nama: '', berat: 0, harga: 0, gajiPerKg: 0 }])
    setPotongan(0)
    setBonusHarian(0)
    setSubmitStatus({ type: null, message: '' })
  }

  const result = calculateGaji()
  const canSubmit = keberangkatanId && abkId && jenisIkan.some(ikan => ikan.nama.trim() && ikan.berat > 0 && ikan.gajiPerKg > 0) && !isSubmitting

  const formatRupiah = (n: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)

  return (
    <div className="space-y-6 p-6">
      <BackButton fallbackHref="/keuangan" />
      {submitStatus.type && (
        <div className={`p-4 rounded-lg ${
          submitStatus.type === 'success'
            ? 'bg-green-50 border border-green-200 text-green-800'
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          {submitStatus.message}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">Data Keberangkatan & Hasil Tangkapan</h2>

          {/* ===== Pilih Keberangkatan ===== */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Keberangkatan</label>
            <select
              value={keberangkatanId}
              onChange={(e) => handlePilihKeberangkatan(e.target.value)}
              disabled={loadingKeberangkatan}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 bg-white disabled:bg-gray-100"
            >
              <option value="">
                {loadingKeberangkatan ? 'Memuat keberangkatan...' : '-- Pilih Keberangkatan --'}
              </option>
              {keberangkatanList.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.kapal.nama} — {new Date(k.tanggalBerangkat).toLocaleDateString('id-ID')}
                </option>
              ))}
            </select>
            {!loadingKeberangkatan && keberangkatanList.length === 0 && (
              <p className="text-sm text-red-500 mt-1">
                Tidak ada keberangkatan berstatus &quot;berlangsung&quot;. Catat keberangkatan terlebih dahulu.
              </p>
            )}
          </div>

          {/* ===== Pilih ABK (dari peserta keberangkatan) ===== */}
          {keberangkatanId && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nama ABK / Nahkoda</label>
              <select
                value={abkId}
                onChange={(e) => handlePilihAbk(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">-- Pilih ABK --</option>
                {abkOptions.map((abk) => (
                  <option key={abk.id} value={abk.id}>{abk.nama} ({abk.posisi})</option>
                ))}
              </select>
            </div>
          )}

          {/* ===== Info Pinjaman Belum Lunas ===== */}
          {abkId && pinjamanList.length > 0 && (
            <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg space-y-2">
              <h3 className="font-semibold text-orange-800">Pinjaman Belum Lunas</h3>
              {pinjamanList.map((p) => (
                <div key={p.id} className="flex items-center justify-between bg-white p-2 rounded border text-sm">
                  <div>
                    <p className="text-gray-700">{p.keterangan || 'Pinjaman'}</p>
                    <p className="text-xs text-gray-500">Sisa: {formatRupiah(p.sisaPinjaman)}</p>
                  </div>
                  <input
                    type="text"
                    inputMode="decimal"
                    placeholder="Contoh: 50000"
                    value={potonganPinjaman[p.id] || ''}
                    onChange={(e) => handlePotonganPinjamanChange(p.id, Number(e.target.value) || 0)}
                    onFocus={(e) => e.target.select()}
                    max={p.sisaPinjaman}
                    className="w-32 p-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>
              ))}
              <p className="text-xs text-orange-700">
                Total potongan dari pinjaman ({formatRupiah(totalPotonganDariPinjaman)}) akan otomatis masuk ke field &quot;Potongan&quot; di bawah — pastikan totalnya sesuai.
              </p>
            </div>
          )}

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-800">Hasil Tangkapan Ikan</h3>
              <button onClick={addJenisIkan} className="bg-blue-500 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-600">
                + Tambah Ikan
              </button>
            </div>

            {jenisIkan.map((ikan, index) => (
              <div key={ikan.id} className="bg-gray-50 p-4 rounded-lg space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-700">Ikan {index + 1}</span>
                  {jenisIkan.length > 1 && (
                    <button onClick={() => removeJenisIkan(ikan.id)} className="text-red-500 hover:text-red-700 text-sm">
                      Hapus
                    </button>
                  )}
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Jenis Ikan</label>
                    <input
                      type="text"
                      list={`tarif-list-${ikan.id}`}
                      value={ikan.nama}
                      onChange={(e) => updateJenisIkan(ikan.id, 'nama', e.target.value)}
                      onFocus={(e) => e.target.select()}
                      className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-blue-500"
                      placeholder="Contoh: Tondan"
                    />
                    <datalist id={`tarif-list-${ikan.id}`}>
                      {tarifList.map((t) => <option key={t.namaIkan} value={t.namaIkan} />)}
                    </datalist>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Berat (kg)</label>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={ikan.berat || ''}
                      onChange={(e) => updateJenisIkan(ikan.id, 'berat', e.target.value === '' ? 0 : Number(e.target.value))}
                      onFocus={(e) => e.target.select()}
                      className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-blue-500"
                      placeholder="30"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Harga/kg (Rp)</label>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={ikan.harga || ''}
                      onChange={(e) => updateJenisIkan(ikan.id, 'harga', e.target.value === '' ? 0 : Number(e.target.value))}
                      onFocus={(e) => e.target.select()}
                      className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-blue-500"
                      placeholder="50000"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Gaji/kg (Rp) {tarifList.some(t => t.namaIkan.toLowerCase() === ikan.nama.toLowerCase()) && (
                        <span className="text-green-600 text-xs">(auto)</span>
                      )}
                    </label>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={ikan.gajiPerKg || ''}
                      onChange={(e) => updateJenisIkan(ikan.id, 'gajiPerKg', e.target.value === '' ? 0 : Number(e.target.value))}
                      onFocus={(e) => e.target.select()}
                      className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-blue-500"
                      placeholder="10000"
                    />
                  </div>
                </div>

                {ikan.berat > 0 && ikan.harga > 0 && (
                  <div className="bg-white p-3 rounded border text-sm">
                    <div className="flex justify-between">
                      <span>Nilai Ikan:</span>
                      <span className="font-medium">{formatRupiah(ikan.berat * ikan.harga)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Gaji dari Ikan ini:</span>
                      <span className="font-medium text-green-600">{formatRupiah(ikan.berat * ikan.gajiPerKg)}</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bonus Harian (Rp)</label>
              <input
                type="text"
                inputMode="decimal"
                value={bonusHarian || ''}
                onChange={(e) => setBonusHarian(e.target.value === '' ? 0 : Number(e.target.value))}
                onFocus={(e) => e.target.select()}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="Contoh: 50000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Potongan (Rp) {totalPotonganDariPinjaman > 0 && (
                  <span className="text-xs text-orange-600">(termasuk {formatRupiah(totalPotonganDariPinjaman)} pinjaman)</span>
                )}
              </label>
              <input
                type="text"
                inputMode="decimal"
                value={potongan || ''}
                onChange={(e) => setPotongan(e.target.value === '' ? 0 : Number(e.target.value))}
                onFocus={(e) => e.target.select()}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="Makan, hutang, dll"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">Hasil Perhitungan Gaji ABK</h2>

          {namaAbk && (
            <div className="bg-blue-50 p-3 rounded-lg">
              <h3 className="font-semibold text-blue-800">{namaAbk} <span className="text-xs font-normal">({posisiAbk})</span></h3>
            </div>
          )}

          <div className="bg-gray-50 p-4 rounded-lg space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Berat Ikan:</span>
              <span className="font-semibold">{result.totalBerat} kg</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Nilai Ikan:</span>
              <span className="font-semibold">{formatRupiah(result.totalNilaiIkan)}</span>
            </div>
            <hr className="border-gray-300" />
            <div className="flex justify-between text-lg">
              <span className="font-bold text-gray-800">Total Gaji Ikan:</span>
              <span className="font-bold text-blue-600">{formatRupiah(result.totalGajiIkan)}</span>
            </div>
            {result.bonusHarian > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Bonus Harian:</span>
                <span className="font-semibold text-green-600">+ {formatRupiah(result.bonusHarian)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-600">Gaji Bruto:</span>
              <span className="font-semibold">{formatRupiah(result.gajiBruto)}</span>
            </div>
            {result.potongan > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Potongan:</span>
                <span className="font-semibold text-red-600">- {formatRupiah(result.potongan)}</span>
              </div>
            )}
            <hr className="border-gray-300" />
            <div className="flex justify-between text-lg">
              <span className="font-bold text-gray-800">Gaji Bersih:</span>
              <span className="font-bold text-green-600">{formatRupiah(result.gajiBersih)}</span>
            </div>
          </div>

          <div className="space-y-2">
            <button
              onClick={submitGaji}
              disabled={!canSubmit}
              className={`w-full py-3 px-4 rounded-md font-semibold transition-colors ${
                canSubmit ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isSubmitting ? 'Menyimpan...' : 'Submit Gaji ke Database'}
            </button>

            <button onClick={resetForm} className="w-full py-2 px-4 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50">
              Reset Form
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HitungGaji