"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Ship,
  Users,
  Fuel,
  Package,
  TrendingUp,
  Plus,
  RefreshCw,
  Calendar,
} from "lucide-react";
import BackButton from "@/component/ui/back-button";

interface KeberangkatanDetail {
  id: string;
  tanggalBerangkat: string;
  tanggalKembali: string | null;
  status: "berlangsung" | "selesai" | "dibatalkan";
  kapal: { nama: string; jenis: string };
  peserta: Array<{
    abkId: string;
    bekal: number;
    abk: { nama: string; posisi: string };
  }>;
  gaji: Array<{
    id: string;
    gajiBersih: number;
    totalNilaiIkan: number;
    totalBerat: number;
    abk: { nama: string; posisi: string };
    detailIkan: Array<{ namaIkan: string; berat: number }>;
  }>;
  solarUsage: Array<{
    porsiBiaya: number;
    pengisianSolar: {
      tanggal: string;
      jumlahLiter: number;
      keterangan: string | null;
    };
  }>;
  biayaLain: Array<{
    id: string;
    deskripsi: string;
    jumlah: number;
    tanggal: string;
  }>;
  ringkasan: {
    totalBekal: number;
    totalSolar: number;
    totalBiayaLain: number;
    totalModal: number;
    totalTangkapan: number;
    totalGajiDibayar: number;
    keuntungan: number;
  };
}

const STATUS_STYLES: Record<string, { badge: string; label: string }> = {
  berlangsung: { badge: "bg-blue-100 text-blue-800", label: "Berlangsung" },
  selesai: { badge: "bg-green-100 text-green-800", label: "Selesai" },
  dibatalkan: { badge: "bg-red-100 text-red-800", label: "Dibatalkan" },
};

export default function DetailKeberangkatanPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [data, setData] = useState<KeberangkatanDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const [showBiayaForm, setShowBiayaForm] = useState(false);
  const [biayaDeskripsi, setBiayaDeskripsi] = useState("");
  const [biayaJumlah, setBiayaJumlah] = useState<number>(0);
  const [submittingBiaya, setSubmittingBiaya] = useState(false);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/keberangkatan/${id}`);
      const json = await res.json();

      if (json.success) {
        setData(json.data);
      } else {
        throw new Error(json.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat detail");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchDetail();
  }, [id]);

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatTanggal = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const handleUpdateStatus = async (status: "selesai" | "dibatalkan") => {
    if (
      !confirm(
        `Ubah status keberangkatan menjadi "${STATUS_STYLES[status].label}"?`,
      )
    )
      return;

    setUpdatingStatus(true);
    try {
      const res = await fetch(`/api/keberangkatan/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          ...(status === "selesai" && {
            tanggalKembali: new Date().toISOString(),
          }),
        }),
      });
      const json = await res.json();
      if (json.success) {
        fetchDetail();
      } else {
        throw new Error(json.error);
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Gagal update status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleAddBiayaLain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!biayaDeskripsi.trim() || biayaJumlah <= 0) return;

    setSubmittingBiaya(true);
    try {
      const res = await fetch(`/api/keberangkatan/${id}/biaya-lain`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deskripsi: biayaDeskripsi,
          jumlah: biayaJumlah,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setBiayaDeskripsi("");
        setBiayaJumlah(0);
        setShowBiayaForm(false);
        fetchDetail();
      } else {
        throw new Error(json.error);
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Gagal menambah biaya");
    } finally {
      setSubmittingBiaya(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto p-6 flex items-center justify-center h-64">
        <RefreshCw className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-800 mb-4">{error || "Data tidak ditemukan"}</p>
          <button
            onClick={() => router.push("/keuangan/keberangkatan")}
            className="text-blue-600 hover:underline"
          >
            Kembali ke daftar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <BackButton fallbackHref="/keuangan/keberangkatan" />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <Ship className="h-5 w-5 mr-2 text-gray-400" />
                {data.kapal.nama}
              </h1>
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[data.status].badge}`}
              >
                {STATUS_STYLES[data.status].label}
              </span>
            </div>
            <p className="text-gray-600 flex items-center mt-1">
              <Calendar className="h-3.5 w-3.5 mr-1" />
              Berangkat {formatTanggal(data.tanggalBerangkat)}
              {data.tanggalKembali &&
                ` — Kembali ${formatTanggal(data.tanggalKembali)}`}
            </p>
          </div>
        </div>

        {data.status === "berlangsung" && (
          <div className="flex gap-2">
            <button
              onClick={() => handleUpdateStatus("selesai")}
              disabled={updatingStatus}
              className="px-3 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              Tandai Selesai
            </button>
            <button
              onClick={() => handleUpdateStatus("dibatalkan")}
              disabled={updatingStatus}
              className="px-3 py-2 border border-red-300 text-red-600 text-sm rounded-md hover:bg-red-50 disabled:opacity-50"
            >
              Batalkan
            </button>
          </div>
        )}
      </div>

      {/* Ringkasan Keuangan */}
      <div className="grid md:grid-cols-4 gap-4">
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <p className="text-purple-600 text-sm font-medium">Total Modal</p>
          <p className="text-xl font-bold text-purple-800">
            {formatRupiah(data.ringkasan.totalModal)}
          </p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-600 text-sm font-medium">Hasil Tangkapan</p>
          <p className="text-xl font-bold text-blue-800">
            {formatRupiah(data.ringkasan.totalTangkapan)}
          </p>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <p className="text-orange-600 text-sm font-medium">Gaji Dibayar</p>
          <p className="text-xl font-bold text-orange-800">
            {formatRupiah(data.ringkasan.totalGajiDibayar)}
          </p>
        </div>
        <div
          className={`rounded-lg p-4 border ${data.ringkasan.keuntungan >= 0 ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}
        >
          <p
            className={`text-sm font-medium ${data.ringkasan.keuntungan >= 0 ? "text-green-600" : "text-red-600"}`}
          >
            Keuntungan
          </p>
          <p
            className={`text-xl font-bold ${data.ringkasan.keuntungan >= 0 ? "text-green-800" : "text-red-800"}`}
          >
            {formatRupiah(data.ringkasan.keuntungan)}
          </p>
        </div>
      </div>

      {/* Peserta & Bekal */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <Users className="h-5 w-5 mr-2 text-gray-400" />
          Peserta & Bekal
        </h2>
        <div className="space-y-2">
          {data.peserta.map((p) => (
            <div
              key={p.abkId}
              className="flex justify-between items-center bg-gray-50 p-3 rounded-lg"
            >
              <div>
                <p className="font-medium text-gray-800">{p.abk.nama}</p>
                <p className="text-xs text-gray-500">{p.abk.posisi}</p>
              </div>
              <p className="font-medium text-gray-700">
                {formatRupiah(p.bekal)}
              </p>
            </div>
          ))}
        </div>
        <div className="flex justify-between items-center mt-3 pt-3 border-t text-sm">
          <span className="text-gray-600">Total Bekal</span>
          <span className="font-bold text-gray-900">
            {formatRupiah(data.ringkasan.totalBekal)}
          </span>
        </div>
      </div>

      {/* Solar */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Fuel className="h-5 w-5 mr-2 text-gray-400" />
            Penggunaan Solar
          </h2>
          <button
            onClick={() =>
              router.push(`/keuangan/solar/tambah?keberangkatanId=${id}`)
            }
            className="flex items-center text-sm text-blue-600 hover:text-blue-800"
          >
            <Plus className="h-4 w-4 mr-1" />
            Isi Solar
          </button>
        </div>
        {data.solarUsage.length === 0 ? (
          <p className="text-sm text-gray-500">
            Belum ada solar tercatat untuk keberangkatan ini
          </p>
        ) : (
          <div className="space-y-2">
            {data.solarUsage.map((s, i) => (
              <div
                key={i}
                className="flex justify-between items-center bg-gray-50 p-3 rounded-lg text-sm"
              >
                <div>
                  <p className="text-gray-700">
                    {formatTanggal(s.pengisianSolar.tanggal)} —{" "}
                    {s.pengisianSolar.jumlahLiter}L
                  </p>
                  {s.pengisianSolar.keterangan && (
                    <p className="text-xs text-gray-500">
                      {s.pengisianSolar.keterangan}
                    </p>
                  )}
                </div>
                <p className="font-medium text-gray-700">
                  {formatRupiah(s.porsiBiaya)}
                </p>
              </div>
            ))}
          </div>
        )}
        <div className="flex justify-between items-center mt-3 pt-3 border-t text-sm">
          <span className="text-gray-600">Total Porsi Solar</span>
          <span className="font-bold text-gray-900">
            {formatRupiah(data.ringkasan.totalSolar)}
          </span>
        </div>
      </div>

      {/* Biaya Lain */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center">
            <Package className="h-5 w-5 mr-2 text-gray-400" />
            Biaya Lain
          </h2>
          <button
            onClick={() => setShowBiayaForm(!showBiayaForm)}
            className="flex items-center text-sm text-blue-600 hover:text-blue-800"
          >
            <Plus className="h-4 w-4 mr-1" />
            Tambah Biaya
          </button>
        </div>

        {showBiayaForm && (
          <form
            onSubmit={handleAddBiayaLain}
            className="flex gap-2 mb-4 bg-gray-50 p-3 rounded-lg"
          >
            <input
              type="text"
              placeholder="Deskripsi (misal: Baterai, Lampu kelip)"
              value={biayaDeskripsi}
              onChange={(e) => setBiayaDeskripsi(e.target.value)}
              className="flex-1 p-2 border border-gray-300 rounded-md text-sm"
            />
            <input
              type="text"
              inputMode="decimal"
              placeholder="Contoh: 500000"
              value={biayaJumlah || ""}
              onChange={(e) => setBiayaJumlah(Number(e.target.value) || 0)}
              onFocus={(e) => e.target.select()}
              className="w-40 p-2 border border-gray-300 rounded-md text-sm"
            />
            <button
              type="submit"
              disabled={submittingBiaya}
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              Simpan
            </button>
          </form>
        )}

        {data.biayaLain.length === 0 ? (
          <p className="text-sm text-gray-500">Belum ada biaya lain tercatat</p>
        ) : (
          <div className="space-y-2">
            {data.biayaLain.map((b) => (
              <div
                key={b.id}
                className="flex justify-between items-center bg-gray-50 p-3 rounded-lg text-sm"
              >
                <span className="text-gray-700">{b.deskripsi}</span>
                <span className="font-medium text-gray-700">
                  {formatRupiah(b.jumlah)}
                </span>
              </div>
            ))}
          </div>
        )}
        <div className="flex justify-between items-center mt-3 pt-3 border-t text-sm">
          <span className="text-gray-600">Total Biaya Lain</span>
          <span className="font-bold text-gray-900">
            {formatRupiah(data.ringkasan.totalBiayaLain)}
          </span>
        </div>
      </div>

      {/* Hasil Tangkapan / Gaji */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <TrendingUp className="h-5 w-5 mr-2 text-gray-400" />
          Hasil Tangkapan per Orang
        </h2>
        {data.gaji.length === 0 ? (
          <div className="text-center py-6 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500 mb-2">
              Belum ada hasil tangkapan diinput untuk keberangkatan ini
            </p>
            <button
              onClick={() =>
                router.push(`/keuangan/hitung-gaji?keberangkatanId=${id}`)
              }
              className="text-blue-600 hover:underline text-sm"
            >
              Input hasil tangkapan
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {data.gaji.map((g) => (
              <div key={g.id} className="bg-gray-50 p-3 rounded-lg">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-medium text-gray-800">
                    {g.abk.nama}{" "}
                    <span className="text-xs text-gray-500">
                      ({g.abk.posisi})
                    </span>
                  </span>
                  <span className="font-bold text-green-600">
                    {formatRupiah(g.gajiBersih)}
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  {g.detailIkan
                    .map((d) => `${d.namaIkan} (${d.berat}kg)`)
                    .join(", ")}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
