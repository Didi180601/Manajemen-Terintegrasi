import { Ship, Users, DollarSign, Wrench } from 'lucide-react'
import Card from '@/component/ui/card'
import { getKapalCount, getAbkCount, getKeuanganSummary, getMaintenanceCount } from '@/utils/dataHelpers'

export default function Dashboard() {
  const kapalCount = getKapalCount()
  const abkCount = getAbkCount()
  const keuanganSummary = getKeuanganSummary()
  const maintenanceCount = getMaintenanceCount()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Selamat datang di sistem manajemen perikanan</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-blue-50 border-blue-200">
          <div className="flex items-center">
            <div className="p-3 bg-blue-500 rounded-full">
              <Ship className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Kapal</p>
              <p className="text-2xl font-bold text-blue-600">{kapalCount}</p>
            </div>
          </div>
        </Card>

        <Card className="bg-green-50 border-green-200">
          <div className="flex items-center">
            <div className="p-3 bg-green-500 rounded-full">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total ABK</p>
              <p className="text-2xl font-bold text-green-600">{abkCount}</p>
            </div>
          </div>
        </Card>

        <Card className="bg-yellow-50 border-yellow-200">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-500 rounded-full">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Keuntungan</p>
              <p className="text-2xl font-bold text-yellow-600">
                {new Intl.NumberFormat('id-ID', { 
                  style: 'currency', 
                  currency: 'IDR',
                  maximumFractionDigits: 0
                }).format(keuanganSummary.keuntungan)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="bg-red-50 border-red-200">
          <div className="flex items-center">
            <div className="p-3 bg-red-500 rounded-full">
              <Wrench className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Maintenance</p>
              <p className="text-2xl font-bold text-red-600">{maintenanceCount}</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Aktivitas Terbaru</h3>
          <div className="space-y-3">
            <div className="flex items-center p-3 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
              <p className="text-sm text-gray-600">Kapal Sinar Jaya selesai maintenance</p>
            </div>
            <div className="flex items-center p-3 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
              <p className="text-sm text-gray-600">ABK baru bergabung: Ahmad Rizki</p>
            </div>
            <div className="flex items-center p-3 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
              <p className="text-sm text-gray-600">Pemasukan dari penjualan ikan: Rp 25.000.000</p>
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Jadwal Maintenance</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Sinar Jaya</p>
                <p className="text-sm text-gray-600">Engine maintenance</p>
              </div>
              <span className="text-sm font-medium text-orange-600">15 Feb 2025</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Bahari Indah</p>
                <p className="text-sm text-gray-600">Hull inspection</p>
              </div>
              <span className="text-sm font-medium text-orange-600">20 Feb 2025</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
