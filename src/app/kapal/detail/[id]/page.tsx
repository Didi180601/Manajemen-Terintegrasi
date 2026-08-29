// src/app/kapal/detail/[id]/page.tsx
"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Settings,
  Ruler,
  FileText,
  Edit,
  Trash2,
  CalendarDays,
  Users,
  ArrowUpRight,
  AlertTriangle,
} from "lucide-react";
import Card from "@/component/ui/card";
import Button from "@/component/ui/button";
import {formatDate} from '@/utils/format';
import BackButton from "@/component/ui/back-button";

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

interface AbkSummary {
  id: string;
  nama: string;
  posisi: string;
  status: string;
}

interface KeberangkatanSummary {
  id: string;
  tanggalBerangkat: string;
  tanggalKembali: string | null;
  status: "berlangsung" | "selesai" | "dibatalkan";
  peserta: Array<{ abk: { nama: string; posisi: string } }>;
  _count: { gaji: number };
}

export default function DetailKapalPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [kapal, setKapal] = useState<KapalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [abkList, setAbkList] = useState<AbkSummary[]>([]);
  const [keberangkatanList, setKeberangkatanList] = useState<KeberangkatanSummary[]>([]);

  useEffect(() => {
    const fetchKapalDetail = async () => {
      try {
        setLoading(true);
        const [response, abkResponse, keberangkatanResponse] = await Promise.all([
          fetch(`/api/kapal?id=${id}`),
          fetch(`/api/abk?kapal_id=${id}`),
          fetch(`/api/keberangkatan?kapal_id=${id}&limit=5`),
        ]);

        if (!response.ok) throw new Error("Failed to fetch kapal detail");

        const result = await response.json();
        const abkResult = await abkResponse.json();
        const keberangkatanResult = await keberangkatanResponse.json();

        if (result.success) {
          setKapal(result.data);
        } else {
          throw new Error(result.error || "Failed to fetch data");
        }

        setAbkList(abkResult.success ? abkResult.data : []);
        setKeberangkatanList(
          keberangkatanResult.success ? keberangkatanResult.data : [],
        );
      } catch (error) {
        console.error("Error fetching kapal detail:", error);
        setError("Gagal memuat detail kapal");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchKapalDetail();
    }
  }, [id]);

  const handleEdit = () => {
    router.push(`/kapal/edit/${id}`);
  };

  const handleDelete = async () => {
    if (confirm("Apakah Anda yakin ingin menghapus kapal ini?")) {
      try {
        const response = await fetch(`/api/kapal?id=${id}`, {
          method: "DELETE",
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.error || "Gagal menghapus kapal");
        }

        alert("Kapal berhasil dihapus!");
        router.push("/kapal");
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

  const certificateDate = kapal ? new Date(kapal.tanggalSertifikat) : null;
  const certificateExpired = certificateDate
    ? certificateDate.getTime() < Date.now()
    : false;

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-600">Memuat detail kapal...</p>
        </div>
      </div>
    );
  }

  if (error || !kapal) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <p className="text-red-800 font-semibold mb-2">Error</p>
          <p className="text-red-600 mb-4">{error || "Data tidak ditemukan"}</p>
          <Button onClick={() => router.push("/kapal")}>Kembali</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-5 rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-4">
          <BackButton fallbackHref="/kapal" label="Kembali" />
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">{kapal.nama}</h1>
              <span
                className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${
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
            </div>
            <p className="mt-1 text-gray-600">{kapal.jenis} · {kapal.nomorRegistrasi}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 lg:justify-end">
          <Button variant="secondary" onClick={handleEdit}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            <Trash2 className="h-4 w-4 mr-2" />
            Hapus
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="border-blue-200 bg-blue-50/60">
          <div className="flex items-center gap-3">
            <Users className="h-6 w-6 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">Total ABK</p>
              <p className="text-2xl font-bold text-gray-900">{abkList.length}</p>
            </div>
          </div>
        </Card>
        <Card className="border-emerald-200 bg-emerald-50/60">
          <div className="flex items-center gap-3">
            <CalendarDays className="h-6 w-6 text-emerald-600" />
            <div>
              <p className="text-sm text-gray-600">Perjalanan Terbaru</p>
              <p className="text-2xl font-bold text-gray-900">{keberangkatanList.length}</p>
            </div>
          </div>
        </Card>
        <Card className={certificateExpired ? "border-red-200 bg-red-50" : "border-amber-200 bg-amber-50/60"}>
          <div className="flex items-center gap-3">
            {certificateExpired ? <AlertTriangle className="h-6 w-6 text-red-600" /> : <FileText className="h-6 w-6 text-amber-600" />}
            <div>
              <p className="text-sm text-gray-600">Status Sertifikat</p>
              <p className={`text-lg font-bold ${certificateExpired ? "text-red-700" : "text-amber-700"}`}>
                {certificateExpired ? "Sudah berakhir" : "Masih berlaku"}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Informasi Umum */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Informasi Umum
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-gray-600">
              Nomor Registrasi
            </label>
            <p className="mt-1 text-gray-900">{kapal.nomorRegistrasi}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">
              Kapasitas
            </label>
            <p className="mt-1 text-gray-900">{kapal.kapasitas} ton</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">
              Tahun Pembuatan
            </label>
            <p className="mt-1 text-gray-900">{formatDate(kapal.tahunBuat)}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Pemilik</label>
            <p className="mt-1 text-gray-900">{kapal.pemilik}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">
              Jenis Kapal
            </label>
            <p className="mt-1 text-gray-900">{kapal.jenis}</p>
          </div>
        </div>
      </Card>

      {/* Dimensi */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Ruler className="h-5 w-5 mr-2 text-blue-600" />
          Dimensi Kapal
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="text-sm font-medium text-gray-600">Panjang</label>
            <p className="mt-1 text-gray-900">{kapal.dimensiPanjang} meter</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Lebar</label>
            <p className="mt-1 text-gray-900">{kapal.dimensiLebar} meter</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Tinggi</label>
            <p className="mt-1 text-gray-900">{kapal.dimensiTinggi} meter</p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="flex items-center text-lg font-semibold text-gray-900">
                <Users className="mr-2 h-5 w-5 text-blue-600" />
                ABK Terdaftar
              </h2>
              <p className="text-sm text-gray-500">Crew yang terhubung dengan kapal ini</p>
            </div>
            <span className="rounded-full bg-blue-50 px-2.5 py-1 text-sm font-semibold text-blue-700">{abkList.length}</span>
          </div>
          {abkList.length === 0 ? (
            <p className="rounded-lg bg-gray-50 p-4 text-sm text-gray-500">Belum ada ABK yang terdaftar.</p>
          ) : (
            <div className="divide-y divide-gray-100">
              {abkList.map((abk) => (
                <div key={abk.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-gray-900">{abk.nama}</p>
                    <p className="text-sm text-gray-500">{abk.posisi}</p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2 py-1 text-xs font-medium ${abk.status === "aktif" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-700"}`}>
                    {abk.status === "aktif" ? "Aktif" : abk.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="flex items-center text-lg font-semibold text-gray-900">
                <CalendarDays className="mr-2 h-5 w-5 text-emerald-600" />
                Riwayat Keberangkatan
              </h2>
              <p className="text-sm text-gray-500">Lima perjalanan terakhir kapal ini</p>
            </div>
            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-sm font-semibold text-emerald-700">{keberangkatanList.length}</span>
          </div>
          {keberangkatanList.length === 0 ? (
            <p className="rounded-lg bg-gray-50 p-4 text-sm text-gray-500">Belum ada riwayat keberangkatan.</p>
          ) : (
            <div className="space-y-3">
              {keberangkatanList.map((item) => (
                <button key={item.id} type="button" onClick={() => router.push(`/keuangan/keberangkatan/${item.id}`)} className="flex w-full items-center justify-between gap-3 rounded-lg border border-gray-100 p-3 text-left transition-colors hover:border-emerald-200 hover:bg-emerald-50/40">
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900">{formatDate(item.tanggalBerangkat)}</p>
                    <p className="truncate text-sm text-gray-500">{item.peserta.length} peserta · {item._count.gaji} transaksi gaji</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className={`rounded-full px-2 py-1 text-xs font-medium ${item.status === "selesai" ? "bg-green-100 text-green-800" : item.status === "berlangsung" ? "bg-blue-100 text-blue-800" : "bg-red-100 text-red-800"}`}>
                      {item.status === "selesai" ? "Selesai" : item.status === "berlangsung" ? "Berlangsung" : "Dibatalkan"}
                    </span>
                    <ArrowUpRight className="h-4 w-4 text-gray-400" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Mesin & Performa */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Settings className="h-5 w-5 mr-2 text-orange-600" />
          Mesin & Performa
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-sm font-medium text-gray-600">
              Mesin Utama
            </label>
            <p className="mt-1 text-gray-900">{kapal.mesinUtama}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">
              Daya Mesin
            </label>
            <p className="mt-1 text-gray-900">{kapal.dayaMesin} HP</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">
              Kecepatan Maksimal
            </label>
            <p className="mt-1 text-gray-900">{kapal.kecepatanMaksimal} knot</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">
              Bahan Bakar
            </label>
            <p className="mt-1 text-gray-900">{kapal.bahanBakar}</p>
          </div>
        </div>
      </Card>

      {/* Sertifikat */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <FileText className="h-5 w-5 mr-2 text-green-600" />
          Sertifikat & Kelaikan
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-sm font-medium text-gray-600">
              Nomor Sertifikat
            </label>
            <p className="mt-1 text-gray-900">{kapal.sertifikatKelaikan}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">
              Tanggal Sertifikat
            </label>
            <p className="mt-1 text-gray-900">
              {formatDate(kapal.tanggalSertifikat)}
            </p>
          </div>
        </div>
      </Card>

      {/* Metadata */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Metadata</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-sm font-medium text-gray-600">
              Dibuat Pada
            </label>
            <p className="mt-1 text-gray-900">{formatDate(kapal.createdAt)}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">
              Terakhir Diupdate
            </label>
            <p className="mt-1 text-gray-900">{formatDate(kapal.updatedAt)}</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
