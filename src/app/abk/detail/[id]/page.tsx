"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { User, Ship, Wallet, TrendingUp, RefreshCw } from "lucide-react";
import { formatCurrency, formatDate } from "@/utils/format";
import BackButton from "@/component/ui/back-button";

interface AbkDetail {
  id: string;
  nama: string;
  posisi: string;
  status: string;
  no_ktp: string;
  alamat: string;
  no_telepon: string;
  tanggal_bergabung: string;
  kapal: { nama: string };
}

interface GajiHistory {
  id: string;
  gajiBersih: number;
  totalNilaiIkan: number;
  tanggal: string;
  keberangkatan: { kapal: { nama: string } } | null;
}

interface PinjamanHistory {
  id: string;
  jumlah: number;
  sisaPinjaman: number;
  tanggal: string;
  status: string;
}

export default function DetailAbkPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [abk, setAbk] = useState<AbkDetail | null>(null);
  const [gajiHistory, setGajiHistory] = useState<GajiHistory[]>([]);
  const [pinjamanHistory, setPinjamanHistory] = useState<PinjamanHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"gaji" | "pinjaman">("gaji");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [abkRes, gajiRes, pinjamanRes] = await Promise.all([
          fetch(`/api/abk/${id}`),
          fetch(`/api/gaji?abkId=${id}`),
          fetch(`/api/pinjaman/abk/${id}`),
        ]);
        const abkJson = await abkRes.json();
        const gajiJson = await gajiRes.json();
        const pinjamanJson = await pinjamanRes.json();

        if (abkJson.success) setAbk(abkJson.data);
        setGajiHistory(gajiJson.data || []);
        setPinjamanHistory(pinjamanJson.data || []);
      } catch (err) {
        console.error("Gagal memuat detail ABK:", err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6 flex items-center justify-center h-64">
        <RefreshCw className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (!abk) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center text-gray-500">
        ABK tidak ditemukan.
        <button onClick={() => router.push("/abk")} className="block mt-4 text-blue-600 hover:underline">
          Kembali ke daftar ABK
        </button>
      </div>
    );
  }

  const totalGajiKeseluruhan = gajiHistory.reduce((sum, g) => sum + g.gajiBersih, 0);
  const totalSisaPinjaman = pinjamanHistory
    .filter((p) => p.status === "belum_lunas")
    .reduce((sum, p) => sum + p.sisaPinjaman, 0);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <BackButton fallbackHref="/abk" label="Kembali ke Daftar ABK" />

      {/* Profil */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-100 rounded-full">
            <User className="h-8 w-8 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{abk.nama}</h1>
            <p className="text-gray-600">{abk.posisi} — {abk.kapal.nama}</p>
          </div>
          <span
            className={`ml-auto px-3 py-1 rounded-full text-sm font-medium ${
              abk.status === "aktif" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
            }`}
          >
            {abk.status}
          </span>
        </div>
        <div className="grid md:grid-cols-3 gap-4 mt-6 pt-6 border-t text-sm">
          <div><span className="text-gray-500">No. KTP</span><p className="font-medium">{abk.no_ktp}</p></div>
          <div><span className="text-gray-500">No. Telepon</span><p className="font-medium">{abk.no_telepon}</p></div>
          <div><span className="text-gray-500">Bergabung</span><p className="font-medium">{formatDate(abk.tanggal_bergabung)}</p></div>
        </div>
      </div>

      {/* Ringkasan */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
          <TrendingUp className="h-8 w-8 text-green-600 mr-3" />
          <div>
            <p className="text-sm text-green-600">Total Gaji Diterima</p>
            <p className="text-xl font-bold text-green-800">{formatCurrency(totalGajiKeseluruhan)}</p>
          </div>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex items-center">
          <Wallet className="h-8 w-8 text-orange-600 mr-3" />
          <div>
            <p className="text-sm text-orange-600">Sisa Pinjaman</p>
            <p className="text-xl font-bold text-orange-800">{formatCurrency(totalSisaPinjaman)}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab("gaji")}
            className={`px-6 py-3 text-sm font-medium ${activeTab === "gaji" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500"}`}
          >
            Riwayat Gaji ({gajiHistory.length})
          </button>
          <button
            onClick={() => setActiveTab("pinjaman")}
            className={`px-6 py-3 text-sm font-medium ${activeTab === "pinjaman" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500"}`}
          >
            Riwayat Pinjaman ({pinjamanHistory.length})
          </button>
        </div>

        <div className="p-6">
          {activeTab === "gaji" && (
            gajiHistory.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-6">Belum ada riwayat gaji</p>
            ) : (
              <div className="space-y-2">
                {gajiHistory.map((g) => (
                  <div key={g.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg text-sm">
                    <div>
                      <p className="text-gray-700">{formatDate(g.tanggal)}</p>
                      {g.keberangkatan && (
                        <p className="text-xs text-gray-500 flex items-center">
                          <Ship className="h-3 w-3 mr-1" />{g.keberangkatan.kapal.nama}
                        </p>
                      )}
                    </div>
                    <span className="font-semibold text-green-600">{formatCurrency(g.gajiBersih)}</span>
                  </div>
                ))}
              </div>
            )
          )}

          {activeTab === "pinjaman" && (
            pinjamanHistory.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-6">Belum ada riwayat pinjaman</p>
            ) : (
              <div className="space-y-2">
                {pinjamanHistory.map((p) => (
                  <div key={p.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg text-sm">
                    <div>
                      <p className="text-gray-700">{formatDate(p.tanggal)}</p>
                      <p className="text-xs text-gray-500">Awal: {formatCurrency(p.jumlah)}</p>
                    </div>
                    <div className="text-right">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          p.status === "lunas" ? "bg-green-100 text-green-800" : "bg-orange-100 text-orange-800"
                        }`}
                      >
                        {p.status === "lunas" ? "Lunas" : "Belum Lunas"}
                      </span>
                      {p.status === "belum_lunas" && (
                        <p className="text-xs text-orange-600 mt-1">Sisa: {formatCurrency(p.sisaPinjaman)}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}