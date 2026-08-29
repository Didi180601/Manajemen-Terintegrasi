"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  UserPlus,
  DollarSign,
  Eye,
  Edit,
  Trash2,
  RefreshCw,
} from "lucide-react";
import Card from "@/component/ui/card";
import Table from "@/component/ui/table";
import Button from "@/component/ui/button";
import BackButton from "@/component/ui/back-button";
import { formatCurrency, formatDate } from "@/utils/format";

interface Kapal {
  id: string;
  nama: string;
  jenis: string;
}

interface AbkData {
  id: string;
  nama: string;
  posisi: string;
  kapal_id: string;
  kapal?: Kapal;
  tanggal_bergabung: string;
  status: "aktif" | "cuti" | "nonaktif";
}

export default function AbkPage() {
  const router = useRouter();
  const [abkList, setAbkList] = useState<AbkData[]>([]);
  const [loading, setLoading] = useState(true);
  const [gajiSummary, setGajiSummary] = useState<Record<string, number>>({});

  // FETCH DATA
  useEffect(() => {
    const fetchAbk = async () => {
      try {
        const res = await fetch("/api/abk");
        const json = await res.json();
        setAbkList(json.data || []);
      } catch (error) {
        console.error("Gagal memuat data ABK:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchGajiSummary = async () => {
      try {
        const res = await fetch("/api/gaji/summary");
        const json = await res.json();
        if (json.success) {
          setGajiSummary(json.data);
        }
      } catch (error) {
        console.error("Gagal memuat ringkasan gaji:", error);
      }
    };
    fetchAbk();
    fetchGajiSummary();
  }, []);

  const totalGaji = abkList
    .filter((abk) => abk.status === "aktif")
    .reduce((sum, abk) => sum + (gajiSummary[abk.id] || 0), 0);

  const getStatusBadge = (status: string) => {
    const statusClasses = {
      aktif: "bg-green-100 text-green-800",
      cuti: "bg-yellow-100 text-yellow-800",
      nonaktif: "bg-red-100 text-red-800",
    };
    return statusClasses[status as keyof typeof statusClasses];
  };

  const handleAddAbk = () => {
    router.push("/abk/tambah-abk");
  };

  // 🔥 OPTIMISTIC DELETE
  const handleDeleteAbk = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus ABK ini?")) return;

    const previousData = [...abkList];

    // Optimistic UI
    setAbkList((prev) => prev.filter((abk) => abk.id !== id));

    try {
      const res = await fetch("/api/abk", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (!res.ok) {
        throw new Error("Delete gagal");
      }
    } catch (error) {
      console.error(error);
      setAbkList(previousData);
      alert("Gagal menghapus ABK, data dikembalikan.");
    }
  };

  const headers = [
    "Nama ABK",
    "Posisi",
    "Kapal",
    "Gaji",
    "Tanggal Bergabung",
    "Status",
    "Aksi",
  ];

  // ⏳ LOADING STATE
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <RefreshCw className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Memuat data ABK...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <BackButton />
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manajemen ABK</h1>
          <p className="text-gray-600">Kelola data anak buah kapal</p>
        </div>
        <Button variant="primary" size="md" onClick={handleAddAbk}>
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
              <p className="text-2xl font-bold text-gray-900">
                {abkList.length}
              </p>
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
                {abkList.filter((abk) => abk.status === "aktif").length}
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
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(totalGaji)}
              </p>
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
          {abkList.map((abk) => (
            <tr key={abk.id} className="hover:bg-gray-50">
              <td className="px-6 py-4">{abk.nama}</td>
              <td className="px-6 py-4">{abk.posisi}</td>
              <td className="px-6 py-4">{abk.kapal?.nama || "-"}</td>
              <td className="px-6 py-4">
                {gajiSummary[abk.id] ? (
                  formatCurrency(gajiSummary[abk.id])
                ) : (
                  <span className="text-gray-400">Belum ada gaji</span>
                )}
              </td>
              <td className="px-6 py-4">{formatDate(abk.tanggal_bergabung)}</td>
              <td className="px-6 py-4">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(abk.status)}`}
                >
                  {abk.status}
                </span>
              </td>
              <td className="px-6 py-4">
                <div className="flex space-x-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => router.push(`/abk/detail/${abk.id}`)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="secondary" size="sm"
                    onClick={() => router.push(`/abk/edit/${abk.id}`)}
                  >
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
  );
}
