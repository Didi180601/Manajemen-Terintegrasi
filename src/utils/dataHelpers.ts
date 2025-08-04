import kapalData from '@/data/kapal.json'
import abkData from '@/data/abk.json'
import keuanganData from '@/data/keuangan.json'
import maintenanceData from '@/data/pemeliharaan.json'

export function getKapalCount() {
  return kapalData.length
}

export function getAbkCount() {
  return abkData.filter(abk => abk.status === 'aktif').length
}

export function getKeuanganSummary() {
  const pemasukan = keuanganData
    .filter(item => item.jenis === 'pemasukan')
    .reduce((sum, item) => sum + item.jumlah, 0)
  
  const pengeluaran = keuanganData
    .filter(item => item.jenis === 'pengeluaran')
    .reduce((sum, item) => sum + item.jumlah, 0)
  
  return {
    pemasukan,
    pengeluaran,
    keuntungan: pemasukan - pengeluaran
  }
}

export function getMaintenanceCount() {
  return maintenanceData.filter(item => item.status === 'scheduled').length
}

export function getKapalById(id: number) {
  return kapalData.find(kapal => kapal.id === id)
}

export function getAbkByKapalId(kapalId: number) {
  return abkData.filter(abk => abk.kapal_id === kapalId)
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(amount)
}

export function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}