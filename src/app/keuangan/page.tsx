"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Calculator,
  TrendingUp,
  Users,
  DollarSign,
  PieChart,
  BarChart3,
  RefreshCw,
  Ship,
  Wallet,
} from "lucide-react";
import BackButton from "@/component/ui/back-button";

interface DashboardData {
  gaji: {
    totalABK: number;
    totalGajiBulanIni: number;
    rataRataGaji: number;
    totalPotongan: number;
    produktivitasTertinggi: {
      nama: string;
      gaji: number;
      totalTangkapan: number;
    } | null;
  };
  modal: {
    totalModal: number;
    modalTerpakai: number;
    sisaModal: number;
  };
  keuntungan: {
    pendapatanBulanIni: number;
    totalNilaiIkan: number;
    totalGajiDibayar: number;
    keuntunganBersih: number;
    marginKeuntungan: number;
  };
}

const KeuanganOverview = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("bulan-ini");
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async (period: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/dashboard/keuangan?period=${period}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      if (result.success) {
        setData(result.data);
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      console.error("Error loading dashboard data:", err);
      setError(err instanceof Error ? err.message : "Gagal memuat data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData(selectedPeriod);
  }, [selectedPeriod]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <RefreshCw className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Memuat data keuangan...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-800 font-semibold mb-2">Error memuat data</p>
          <p className="text-red-600 text-sm mb-4">{error}</p>
          <button
            onClick={() => loadData(selectedPeriod)}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <p className="text-yellow-800">Tidak ada data tersedia</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <BackButton />
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-lg">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Dashboard Keuangan</h1>
              <p className="text-blue-100 mt-2">
                Overview keuangan bisnis perikanan
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <PieChart className="w-8 h-8" />
            </div>
          </div>
        </div>

        {/* Filter Periode */}
        <div className="p-6 border-b">
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700">
              Periode:
            </label>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="bulan-ini">Bulan Ini</option>
              <option value="bulan-lalu">Bulan Lalu</option>
              <option value="3-bulan">3 Bulan Terakhir</option>
              <option value="tahun-ini">Tahun Ini</option>
            </select>
            <button
              onClick={() => loadData(selectedPeriod)}
              className="ml-auto flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Quick Stats Cards */}
        <div className="p-6">
          <div className="grid md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-600 text-sm font-medium">
                    Pendapatan
                  </p>
                  <p className="text-2xl font-bold text-green-800">
                    Rp{" "}
                    {data.keuntungan.pendapatanBulanIni.toLocaleString("id-ID")}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-600 text-sm font-medium">
                    Total Gaji ABK
                  </p>
                  <p className="text-2xl font-bold text-blue-800">
                    Rp {data.gaji.totalGajiBulanIni.toLocaleString("id-ID")}
                  </p>
                </div>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-600 text-sm font-medium">
                    Total Modal
                  </p>
                  <p className="text-2xl font-bold text-purple-800">
                    Rp {data.modal.totalModal.toLocaleString("id-ID")}
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-purple-600" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-4 rounded-lg border border-yellow-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-600 text-sm font-medium">
                    Keuntungan Bersih
                  </p>
                  <p className="text-2xl font-bold text-yellow-800">
                    Rp{" "}
                    {data.keuntungan.keuntunganBersih.toLocaleString("id-ID")}
                  </p>
                </div>
                <BarChart3 className="w-8 h-8 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Gaji & SDM */}
        <div className="bg-white rounded-lg shadow-md flex flex-col">
          <div className="bg-blue-600 text-white p-4 rounded-t-lg">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Gaji & SDM</h2>
              <Users className="w-6 h-6" />
            </div>
          </div>
          <div className="p-6 flex-1 flex flex-col">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-600 h-12 flex items-center justify-center">
                  {data.gaji.totalABK}
                </p>
                <p className="text-sm text-gray-600">Total ABK</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-green-600 h-12 flex items-center justify-center">
                  Rp {data.gaji.rataRataGaji.toLocaleString("id-ID")}
                </p>
                <p className="text-sm text-gray-600">Rata-rata Gaji</p>
              </div>
            </div>

            <div className="bg-gray-50 p-3 rounded-lg mb-4 min-h-20">
              <h4 className="font-semibold text-gray-800 mb-2">
                Detail Penggajian
              </h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Gaji Dibayar:</span>
                  <span className="font-medium text-blue-600">
                    Rp {data.gaji.totalGajiBulanIni.toLocaleString("id-ID")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Potongan:</span>
                  <span className="font-medium text-red-600">
                    -Rp {data.gaji.totalPotongan.toLocaleString("id-ID")}
                  </span>
                </div>
              </div>
            </div>

            {data.gaji.produktivitasTertinggi ? (
              <div className="bg-blue-50 p-3 rounded-lg mb-4 min-h-20">
                <h4 className="font-semibold text-blue-800 mb-1">
                  ABK Terbaik
                </h4>
                <p className="text-sm font-medium">
                  {data.gaji.produktivitasTertinggi.nama}
                </p>
                <div className="flex justify-between text-xs">
                  <span>
                    Gaji: Rp{" "}
                    {data.gaji.produktivitasTertinggi.gaji.toLocaleString(
                      "id-ID",
                    )}
                  </span>
                  <span>
                    Tangkapan: {data.gaji.produktivitasTertinggi.totalTangkapan}{" "}
                    kg
                  </span>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 p-3 rounded-lg mb-4 min-h-20 flex items-center justify-center">
                <p className="text-sm text-gray-500">Belum ada data ABK</p>
              </div>
            )}

            <div className="mt-auto">
              <Link
                href="/keuangan/hitung-gaji"
                className="block w-full bg-blue-600 text-white text-center py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Kelola Gaji ABK
              </Link>
            </div>
          </div>
        </div>

        {/* Modal & Keberangkatan */}
        <div className="bg-white rounded-lg shadow-md flex flex-col">
          <div className="bg-purple-600 text-white p-4 rounded-t-lg">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Modal per Keberangkatan</h2>
              <Ship className="w-6 h-6" />
            </div>
          </div>
          <div className="p-6 flex-1 flex flex-col">
            <div className="text-center mb-4">
              <p className="text-3xl font-bold text-purple-600 h-12 flex items-center justify-center">
                Rp {data.modal.totalModal.toLocaleString("id-ID")}
              </p>
              <p className="text-sm text-gray-600">Total Modal Periode Ini</p>
            </div>

            <div className="bg-blue-50 p-3 rounded-lg mb-4 min-h-20 flex items-center justify-center">
              <div className="text-center">
                <p className="text-sm text-blue-700 mb-1">
                  Terdiri dari bekal peserta, solar, dan biaya lain
                </p>
                <p className="text-xs text-blue-600">
                  Dicatat per keberangkatan kapal
                </p>
              </div>
            </div>

            <div className="mt-auto">
              <Link
                href="/keuangan/keberangkatan"
                className="block w-full bg-purple-600 text-white text-center py-2 rounded-md hover:bg-purple-700 transition-colors"
              >
                Lihat Keberangkatan
              </Link>
            </div>
          </div>
        </div>

        {/* Keuntungan & Performance */}
        <div className="bg-white rounded-lg shadow-md flex flex-col">
          <div className="bg-green-600 text-white p-4 rounded-t-lg">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Keuntungan & Performance</h2>
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
          <div className="p-6 flex-1 flex flex-col">
            <div className="text-center mb-4">
              <p className="text-3xl font-bold text-green-600 h-12 flex items-center justify-center">
                {data.keuntungan.marginKeuntungan.toFixed(1)}%
              </p>
              <p className="text-sm text-gray-600">Margin Keuntungan</p>
            </div>

            <div className="bg-gray-50 p-3 rounded-lg mb-4 min-h-20">
              <h4 className="font-semibold text-gray-800 mb-2">
                Analisis Keuntungan
              </h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Nilai Ikan:</span>
                  <span className="font-medium text-blue-600">
                    Rp {data.keuntungan.totalNilaiIkan.toLocaleString("id-ID")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Gaji ABK:</span>
                  <span className="font-medium text-red-600">
                    -Rp{" "}
                    {data.keuntungan.totalGajiDibayar.toLocaleString("id-ID")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Modal:</span>
                  <span className="font-medium text-red-600">
                    -Rp {data.modal.totalModal.toLocaleString("id-ID")}
                  </span>
                </div>
                <div className="flex justify-between border-t pt-1 mt-1">
                  <span className="text-gray-800 font-semibold">
                    Keuntungan Bersih:
                  </span>
                  <span className="font-bold text-green-600">
                    Rp{" "}
                    {data.keuntungan.keuntunganBersih.toLocaleString("id-ID")}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-green-50 p-3 rounded-lg mb-4 min-h-20">
              <h4 className="font-semibold text-green-800 mb-2">
                Status Performance
              </h4>
              <p className="text-sm text-green-700">
                {data.keuntungan.marginKeuntungan >= 30
                  ? "Sangat Baik"
                  : data.keuntungan.marginKeuntungan >= 20
                    ? "Baik"
                    : data.keuntungan.marginKeuntungan >= 10
                      ? "Cukup"
                      : "Perlu Ditingkatkan"}
              </p>
              <p className="text-xs text-green-600 mt-1">
                Margin keuntungan {data.keuntungan.marginKeuntungan.toFixed(1)}%
                dari total nilai ikan
              </p>
            </div>

            <div className="mt-auto">
              <Link
                href="/keuangan/keberangkatan"
                className="block w-full bg-green-600 text-white text-center py-2 rounded-md hover:bg-green-700 transition-colors"
              >
                Lihat Detail per Trip
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Aksi Cepat</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <Link
            href="/keuangan/keberangkatan"
            className="flex items-center p-4 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors group h-20"
          >
            <Ship className="w-8 h-8 text-indigo-600 mr-3 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-semibold text-indigo-800 group-hover:text-indigo-900">
                Keberangkatan
              </h3>
              <p className="text-sm text-indigo-600">
                Catat modal & peserta per trip
              </p>
            </div>
          </Link>

          <Link
            href="/keuangan/hitung-gaji"
            className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors group h-20"
          >
            <Calculator className="w-8 h-8 text-blue-600 mr-3 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-semibold text-blue-800 group-hover:text-blue-900">
                Hitung Gaji ABK
              </h3>
              <p className="text-sm text-blue-600">
                Kelola penggajian anak buah kapal
              </p>
            </div>
          </Link>
          <Link
            href="/keuangan/pinjaman"
            className="flex items-center p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors group h-20"
          >
            <Wallet className="w-8 h-8 text-orange-600 mr-3 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-semibold text-orange-800 group-hover:text-orange-900">
                Kelola Pinjaman
              </h3>
              <p className="text-sm text-orange-600">
                Catat dan pantau pinjaman ABK
              </p>
            </div>
          </Link>
        </div>
      </div>

      {/* Tips Section */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          💡 Tips Pengelolaan Keuangan
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">
              Sistem Gaji ABK
            </h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Buat sistem insentif berdasarkan hasil tangkapan</li>
              <li>• Monitor produktivitas setiap ABK secara berkala</li>
              <li>• Sesuaikan gaji dengan performa dan pengalaman</li>
            </ul>
          </div>
          <div className="bg-white p-4 rounded-lg">
            <h3 className="font-semibold text-purple-800 mb-2">
              Pengelolaan Modal
            </h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Catat modal setiap kali kapal berangkat</li>
              <li>• Pastikan solar dialokasikan dengan tepat antar trip</li>
              <li>• Monitor keuntungan per keberangkatan secara rutin</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KeuanganOverview;
