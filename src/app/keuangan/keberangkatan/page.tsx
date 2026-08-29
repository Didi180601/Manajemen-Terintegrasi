"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Ship, Plus, RefreshCw, Eye, Calendar, Users } from "lucide-react";
import BackButton from "@/component/ui/back-button";

interface Peserta {
  abkId: string;
  bekal: number;
  abk: {
    nama: string;
    posisi: string;
  };
}

interface KeberangkatanData {
  id: string;
  tanggalBerangkat: string;
  tanggalKembali: string | null;
  status: "berlangsung" | "selesai" | "dibatalkan";
  kapal: {
    nama: string;
  };
  peserta: Peserta[];
  _count: {
    gaji: number;
  };
}

interface PaginationData {
  total: number;
  page: number;
  totalPages: number;
  limit: number;
}

const STATUS_STYLES: Record<string, { badge: string; label: string }> = {
  berlangsung: { badge: "bg-blue-100 text-blue-800", label: "Berlangsung" },
  selesai: { badge: "bg-green-100 text-green-800", label: "Selesai" },
  dibatalkan: { badge: "bg-red-100 text-red-800", label: "Dibatalkan" },
};

export default function DaftarKeberangkatanPage() {
  const router = useRouter();
  const [list, setList] = useState<KeberangkatanData[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    page: 1,
    totalPages: 0,
    limit: 20,
  });

  const fetchData = async (page = 1, status = "all") => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page: page.toString(), limit: "20" });
      if (status !== "all") params.append("status", status);

      const res = await fetch(`/api/keberangkatan?${params}`);
      const json = await res.json();

      if (json.success) {
        setList(json.data);
        setPagination(json.pagination);
      }
    } catch (err) {
      console.error("Gagal memuat data keberangkatan:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(1, statusFilter);
  }, [statusFilter]);

  const formatTanggal = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <BackButton fallbackHref="/keuangan" />
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Daftar Keberangkatan</h1>
          <p className="text-gray-600">Riwayat pelayaran kapal beserta modal dan peserta</p>
        </div>
        <button
          onClick={() => router.push("/keuangan/keberangkatan/tambah")}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Catat Keberangkatan
        </button>
      </div>

      {/* Filter Status */}
      <div className="flex gap-2">
        {["all", "berlangsung", "selesai", "dibatalkan"].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium ${
              statusFilter === status
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {status === "all" ? "Semua" : STATUS_STYLES[status]?.label}
          </button>
        ))}
        <button
          onClick={() => fetchData(pagination.page, statusFilter)}
          className="ml-auto flex items-center px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900"
        >
          <RefreshCw className={`h-4 w-4 mr-1 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <RefreshCw className="w-10 h-10 text-blue-600 animate-spin" />
        </div>
      ) : list.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <Ship className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">
            {statusFilter === "all"
              ? "Belum ada keberangkatan yang dicatat"
              : `Tidak ada keberangkatan dengan status "${STATUS_STYLES[statusFilter]?.label}"`}
          </p>
          <button
            onClick={() => router.push("/keuangan/keberangkatan/tambah")}
            className="mt-4 text-blue-600 hover:underline text-sm"
          >
            Catat keberangkatan pertama
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {list.map((item) => {
            const totalBekal = item.peserta.reduce((sum, p) => sum + p.bekal, 0);
            return (
              <div
                key={item.id}
                onClick={() => router.push(`/keuangan/keberangkatan/${item.id}`)}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 hover:shadow-md hover:border-blue-200 transition-all cursor-pointer"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900 flex items-center">
                        <Ship className="h-4 w-4 mr-2 text-gray-400" />
                        {item.kapal.nama}
                      </h3>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[item.status].badge}`}
                      >
                        {STATUS_STYLES[item.status].label}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                      <span className="flex items-center">
                        <Calendar className="h-3.5 w-3.5 mr-1" />
                        Berangkat: {formatTanggal(item.tanggalBerangkat)}
                      </span>
                      {item.tanggalKembali && (
                        <span>Kembali: {formatTanggal(item.tanggalKembali)}</span>
                      )}
                      <span className="flex items-center">
                        <Users className="h-3.5 w-3.5 mr-1" />
                        {item.peserta.length} orang
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {item.peserta.map((p) => (
                        <span
                          key={p.abkId}
                          className="text-xs bg-gray-50 text-gray-600 px-2 py-1 rounded"
                        >
                          {p.abk.nama} ({p.abk.posisi})
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="text-right ml-4">
                    <p className="text-xs text-gray-500">Total Bekal</p>
                    <p className="font-semibold text-gray-900">{formatRupiah(totalBekal)}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {item._count.gaji} transaksi gaji
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between border-t pt-4">
          <span className="text-sm text-gray-600">
            Halaman {pagination.page} dari {pagination.totalPages}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => fetchData(pagination.page - 1, statusFilter)}
              disabled={pagination.page === 1}
              className="px-3 py-1.5 border border-gray-300 rounded-md text-sm disabled:opacity-50"
            >
              Sebelumnya
            </button>
            <button
              onClick={() => fetchData(pagination.page + 1, statusFilter)}
              disabled={pagination.page === pagination.totalPages}
              className="px-3 py-1.5 border border-gray-300 rounded-md text-sm disabled:opacity-50"
            >
              Selanjutnya
            </button>
          </div>
        </div>
      )}
    </div>
  );
}