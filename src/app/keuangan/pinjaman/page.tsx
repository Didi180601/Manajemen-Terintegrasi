"use client";
import { useState, useEffect } from "react";
import { Wallet, Plus, RefreshCw, User } from "lucide-react";
import BackButton from "@/component/ui/back-button";

interface AbkOption {
  id: string;
  nama: string;
  posisi: string;
  status?: string;
}

interface PotonganRiwayat {
  jumlah: number;
  createdAt: string;
  gaji: { tanggal: string; gajiBersih: number };
}

interface PinjamanData {
  id: string;
  abkId: string;
  jumlah: number;
  sisaPinjaman: number;
  tanggal: string;
  keterangan: string | null;
  status: "belum_lunas" | "lunas";
  potongan: PotonganRiwayat[];
}

export default function KelolaPinjamanPage() {
  const [abkList, setAbkList] = useState<AbkOption[]>([]);
  const [loadingAbk, setLoadingAbk] = useState(true);

  const [selectedAbkId, setSelectedAbkId] = useState("");
  const [pinjamanList, setPinjamanList] = useState<PinjamanData[]>([]);
  const [loadingPinjaman, setLoadingPinjaman] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [jumlah, setJumlah] = useState<number>(0);
  const [tanggal, setTanggal] = useState("");
  const [keterangan, setKeterangan] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAbk = async () => {
      try {
        const res = await fetch("/api/abk");
        const json = await res.json();
        const list: AbkOption[] = json.data || [];
        setAbkList(list.filter((a) => !a.status || a.status === "aktif"));
      } catch (err) {
        console.error("Gagal memuat ABK:", err);
      } finally {
        setLoadingAbk(false);
      }
    };
    fetchAbk();
  }, []);

  const fetchPinjaman = async (abkId: string) => {
    if (!abkId) {
      setPinjamanList([]);
      return;
    }
    setLoadingPinjaman(true);
    try {
      const res = await fetch(`/api/pinjaman/abk/${abkId}`);
      const json = await res.json();
      setPinjamanList(json.data || []);
    } catch (err) {
      console.error("Gagal memuat pinjaman:", err);
    } finally {
      setLoadingPinjaman(false);
    }
  };

  const handleSelectAbk = (abkId: string) => {
    setSelectedAbkId(abkId);
    setShowForm(false);
    fetchPinjaman(abkId);
  };

  const formatRupiah = (n: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);

  const formatTanggal = (dateString: string) =>
    new Date(dateString).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedAbkId) {
      setError("Pilih ABK terlebih dahulu");
      return;
    }
    if (!jumlah || jumlah <= 0) {
      setError("Jumlah pinjaman harus lebih dari 0");
      return;
    }
    if (!tanggal) {
      setError("Tanggal wajib diisi");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/pinjaman", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ abkId: selectedAbkId, jumlah, tanggal, keterangan }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Gagal mencatat pinjaman");
      }

      setJumlah(0);
      setTanggal("");
      setKeterangan("");
      setShowForm(false);
      fetchPinjaman(selectedAbkId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedAbk = abkList.find((a) => a.id === selectedAbkId);
  const totalSisaPinjaman = pinjamanList
    .filter((p) => p.status === "belum_lunas")
    .reduce((sum, p) => sum + p.sisaPinjaman, 0);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <BackButton fallbackHref="/keuangan" />
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <Wallet className="h-5 w-5 mr-2 text-gray-400" />
          Kelola Pinjaman ABK
        </h1>
        <p className="text-gray-600">Catat pinjaman baru dan lihat riwayat potongan dari gaji</p>
      </div>

      {/* Pilih ABK */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Pilih ABK / Nahkoda</label>
        <select
          value={selectedAbkId}
          onChange={(e) => handleSelectAbk(e.target.value)}
          disabled={loadingAbk}
          className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 bg-white disabled:bg-gray-100"
        >
          <option value="">{loadingAbk ? "Memuat..." : "-- Pilih ABK --"}</option>
          {abkList.map((a) => (
            <option key={a.id} value={a.id}>{a.nama} ({a.posisi})</option>
          ))}
        </select>
      </div>

      {selectedAbkId && (
        <>
          {/* Ringkasan */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex justify-between items-center">
            <div className="flex items-center">
              <User className="h-8 w-8 text-orange-400 mr-3" />
              <div>
                <p className="font-semibold text-gray-800">{selectedAbk?.nama}</p>
                <p className="text-sm text-gray-500">{selectedAbk?.posisi}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-orange-600">Total Sisa Pinjaman</p>
              <p className="text-xl font-bold text-orange-800">{formatRupiah(totalSisaPinjaman)}</p>
            </div>
          </div>

          {/* Tombol tambah */}
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800">Riwayat Pinjaman</h2>
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-1" />
              Catat Pinjaman Baru
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-800 text-sm">{error}</div>
          )}

          {/* Form tambah pinjaman */}
          {showForm && (
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border p-4 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Jumlah Pinjaman (Rp) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={jumlah || ""}
                    onChange={(e) => setJumlah(Number(e.target.value) || 0)}
                    onFocus={(e) => e.target.select()}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    placeholder="Contoh: 1000000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tanggal <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={tanggal}
                    onChange={(e) => setTanggal(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Keterangan (opsional)</label>
                <input
                  type="text"
                  value={keterangan}
                  onChange={(e) => setKeterangan(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="Misal: untuk keperluan keluarga"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSubmitting ? "Menyimpan..." : "Simpan Pinjaman"}
                </button>
              </div>
            </form>
          )}

          {/* Daftar Riwayat */}
          {loadingPinjaman ? (
            <div className="flex justify-center py-8">
              <RefreshCw className="h-8 w-8 text-blue-600 animate-spin" />
            </div>
          ) : pinjamanList.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border p-8 text-center text-gray-500">
              Belum ada riwayat pinjaman untuk ABK ini
            </div>
          ) : (
            <div className="space-y-3">
              {pinjamanList.map((p) => (
                <div key={p.id} className="bg-white rounded-lg shadow-sm border p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-800">{formatRupiah(p.jumlah)}</span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            p.status === "lunas"
                              ? "bg-green-100 text-green-800"
                              : "bg-orange-100 text-orange-800"
                          }`}
                        >
                          {p.status === "lunas" ? "Lunas" : "Belum Lunas"}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">
                        {formatTanggal(p.tanggal)} {p.keterangan && `— ${p.keterangan}`}
                      </p>
                    </div>
                    {p.status === "belum_lunas" && (
                      <div className="text-right">
                        <p className="text-xs text-gray-500">Sisa</p>
                        <p className="font-semibold text-orange-600">{formatRupiah(p.sisaPinjaman)}</p>
                      </div>
                    )}
                  </div>

                  {p.potongan.length > 0 && (
                    <div className="mt-3 pt-3 border-t space-y-1">
                      <p className="text-xs font-medium text-gray-500 mb-1">Riwayat Potongan:</p>
                      {p.potongan.map((pot, i) => (
                        <div key={i} className="flex justify-between text-xs text-gray-600">
                          <span>Trip {formatTanggal(pot.gaji.tanggal)}</span>
                          <span className="font-medium text-red-600">- {formatRupiah(pot.jumlah)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}