// src/app/kapal/page.tsx - Optimized dengan Pagination & Filter
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Ship,
  Settings,
  Eye,
  Edit,
  Trash2,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Card from "@/component/ui/card";
import Table from "@/component/ui/table";
import Button from "@/component/ui/button";
import BackButton from "@/component/ui/back-button";
import { formatDate } from "@/utils/format";

interface KapalData {
  id: string;
  nama: string;
  jenis: string;
  nomorRegistrasi: string;
  kapasitas: number;
  status: "aktif" | "maintenance" | "nonaktif";
  tahunBuat: string;
  pemilik: string;
  dimensiPanjang: number;
  dimensiLebar: number;
  dimensiTinggi: number;
  mesinUtama: string;
  dayaMesin: number;
  kecepatanMaksimal: number;
  bahanBakar: string;
  sertifikatKelaikan: string;
  tanggalSertifikat: string;
  createdAt: string;
  updatedAt: string;
}

interface PaginationData {
  total: number;
  page: number;
  totalPages: number;
  limit: number;
}

export default function KapalPage() {
  const router = useRouter();
  const [kapalList, setKapalList] = useState<KapalData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    page: 1,
    totalPages: 0,
    limit: 10,
  });
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);

  const [stats, setStats] = useState({
    totalKapal: 0,
    statusBreakdown: {} as Record<string, number>,
  });

  const fetchKapalData = async (page = 1, status = "all") => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
      });

      if (status && status !== "all") {
        params.append("status", status);
      }

      const response = await fetch(`/api/kapal?${params}`);

      if (!response.ok) {
        throw new Error("Failed to fetch kapal data");
      }

      const result = await response.json();

      if (result.success) {
        setKapalList(result.data);
        setPagination(result.pagination);
      } else {
        throw new Error(result.error || "Failed to fetch data");
      }
    } catch (error) {
      console.error("Error fetching kapal data:", error);
      setError("Gagal memuat data kapal");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/kapal/stats");
      const result = await response.json();
      if (result.success) {
        setStats({
          totalKapal: result.data.summary.totalKapal,
          statusBreakdown: result.data.statusBreakdown,
        });
      }
    } catch (err) {
      console.error("Error fetching kapal stats:", err);
    }
  };

  useEffect(() => {
    fetchKapalData(1, statusFilter);
    fetchStats();
  }, []);

  const handleAddKapal = () => {
    router.push("/kapal/tambah-kapal");
  };

  const handleEditKapal = (id: string) => {
    router.push(`/kapal/edit/${id}`);
  };

  const handleViewKapal = (id: string) => {
    router.push(`/kapal/detail/${id}`);
  };

  const handleDeleteKapal = async (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus kapal ini?")) {
      try {
        const response = await fetch(`/api/kapal?id=${id}`, {
          method: "DELETE",
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.error || "Gagal menghapus kapal");
        }

        fetchKapalData(pagination.page, statusFilter);
        fetchStats();
        alert("Kapal berhasil dihapus!");
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Gagal menghapus kapal";
        if (message.includes("tidak dapat dihapus")) {
          console.warn("Kapal tidak dapat dihapus:", message);
        } else {
          console.error("Error deleting kapal:", error);
        }
        alert(message);
      }
    }
  };

  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status);
    fetchKapalData(1, status);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchKapalData(newPage, statusFilter);
    }
  };

  const handleRefresh = () => {
    fetchKapalData(pagination.page, statusFilter);
    fetchStats();
  };

  if (loading && kapalList.length === 0) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <RefreshCw className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Memuat data kapal...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <p className="text-red-800 font-semibold mb-2">Error memuat data</p>
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={handleRefresh} variant="danger">
            Coba Lagi
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <BackButton />
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
                {stats.totalKapal}
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
                {stats.statusBreakdown["aktif"] || 0}
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
                {stats.statusBreakdown["maintenance"] || 0}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filter */}
      {/* <Card>
        <div className="flex items-center justify-between">
          <Button
            type="button"
            variant="secondary"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filter Status
          </Button>
        </div>

        {showFilters && (
          <div className="pt-4 border-t mt-4">
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={statusFilter === "all" ? "primary" : "secondary"}
                size="sm"
                onClick={() => handleStatusFilterChange("all")}
              >
                Semua
              </Button>
              <Button
                variant={statusFilter === "aktif" ? "primary" : "secondary"}
                size="sm"
                onClick={() => handleStatusFilterChange("aktif")}
              >
                Aktif
              </Button>
              <Button
                variant={statusFilter === "maintenance" ? "primary" : "secondary"}
                size="sm"
                onClick={() => handleStatusFilterChange("maintenance")}
              >
                Maintenance
              </Button>
              <Button
                variant={statusFilter === "nonaktif" ? "primary" : "secondary"}
                size="sm"
                onClick={() => handleStatusFilterChange("nonaktif")}
              >
                Non-Aktif
              </Button>
            </div>
          </div>
        )}
      </Card> */}

      {/* Table */}
      <Card className="overflow-hidden">
        <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Daftar Kapal</h2>
            <p className="text-sm text-gray-500">
              Kelola data kapal yang terdaftar
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              Filter Status
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleRefresh}
              disabled={loading}
            >
              <RefreshCw
                className={`h-4 w-4 mr-1 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          </div>
        </div>

        {showFilters && (
          <div className="mb-6 border-y border-gray-200 py-4">
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={statusFilter === "all" ? "primary" : "secondary"}
                size="sm"
                onClick={() => handleStatusFilterChange("all")}
              >
                Semua
              </Button>
              <Button
                variant={statusFilter === "aktif" ? "primary" : "secondary"}
                size="sm"
                onClick={() => handleStatusFilterChange("aktif")}
              >
                Aktif
              </Button>
              <Button
                variant={statusFilter === "maintenance" ? "primary" : "secondary"}
                size="sm"
                onClick={() => handleStatusFilterChange("maintenance")}
              >
                Maintenance
              </Button>
              <Button
                variant={statusFilter === "nonaktif" ? "primary" : "secondary"}
                size="sm"
                onClick={() => handleStatusFilterChange("nonaktif")}
              >
                Non-Aktif
              </Button>
            </div>
          </div>
        )}

        {kapalList.length === 0 ? (
          <div className="text-center py-12">
            <Ship className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">
              {statusFilter !== "all"
                ? "Tidak ada kapal yang sesuai dengan filter"
                : "Belum ada data kapal"}
            </p>
            {statusFilter === "all" && (
              <Button onClick={handleAddKapal} className="mt-4">
                Tambah Kapal Pertama
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table
                headers={[
                  "Nama Kapal",
                  "No. Registrasi",
                  "Kapasitas",
                  "Status",
                  "Tahun",
                  "Pemilik",
                  "Aksi",
                ]}
              >
                {kapalList.map((kapal) => (
                  <tr key={kapal.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Ship className="h-5 w-5 text-gray-400 mr-2" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {kapal.nama}
                          </div>
                          <div className="text-sm text-gray-500">
                            {kapal.jenis}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {kapal.nomorRegistrasi}
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
                        {kapal.status === "aktif"
                          ? "Aktif"
                          : kapal.status === "maintenance"
                            ? "Maintenance"
                            : "Non-Aktif"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(kapal.tahunBuat)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {kapal.pemilik}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleViewKapal(kapal.id)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleEditKapal(kapal.id)}
                        >
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
                ))}
              </Table>
            </div>

            {/* Pagination */}
            <div className="mt-6 flex items-center justify-between border-t pt-4">
              <div className="text-sm text-gray-600">
                Menampilkan {(pagination.page - 1) * pagination.limit + 1} -{" "}
                {Math.min(
                  pagination.page * pagination.limit,
                  pagination.total
                )}{" "}
                dari {pagination.total} kapal
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1 || loading}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-gray-600">
                  Halaman {pagination.page} dari {pagination.totalPages}
                </span>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages || loading}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}