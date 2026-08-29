"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Ship, Save, Plus, Trash2 } from "lucide-react";
import BackButton from "@/component/ui/back-button";

interface KapalOption {
  id: string;
  nama: string;
}

interface AbkOption {
  id: string;
  nama: string;
  posisi: string;
  status?: string;
}

interface PesertaInput {
  abkId: string;
  nama: string;
  posisi: string;
  bekal: number;
}

// Rentang bekal umum di lapangan, sekadar saran default — tetap bisa diedit manual
const DEFAULT_BEKAL: Record<string, number> = {
  Nahkoda: 75000,
  "Anak Buah Kapal": 35000,
};

export default function TambahKeberangkatanPage() {
  const router = useRouter();

  const [kapalList, setKapalList] = useState<KapalOption[]>([]);
  const [abkList, setAbkList] = useState<AbkOption[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const [kapalId, setKapalId] = useState("");
  const [tanggalBerangkat, setTanggalBerangkat] = useState("");
  const [peserta, setPeserta] = useState<PesertaInput[]>([]);
  const [selectedAbkId, setSelectedAbkId] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [kapalRes, abkRes] = await Promise.all([
          fetch("/api/kapal"),
          fetch("/api/abk"),
        ]);
        const kapalJson = await kapalRes.json();
        const abkJson = await abkRes.json();

        setKapalList(kapalJson.data || []);
        setAbkList((abkJson.data || []).filter((a: AbkOption) => !a.status || a.status === "aktif"));
      } catch (err) {
        console.error("Gagal memuat data:", err);
      } finally {
        setLoadingData(false);
      }
    };
    fetchData();
  }, []);

  // ABK yang ada di kapal yang dipilih, dan belum ditambahkan ke daftar peserta
  const abkTersedia = abkList.filter(
    (a) => !peserta.some((p) => p.abkId === a.id)
  );

  const handleAddPeserta = () => {
    if (!selectedAbkId) return;
    const abk = abkList.find((a) => a.id === selectedAbkId);
    if (!abk) return;

    setPeserta((prev) => [
      ...prev,
      {
        abkId: abk.id,
        nama: abk.nama,
        posisi: abk.posisi,
        bekal: DEFAULT_BEKAL[abk.posisi] || 30000,
      },
    ]);
    setSelectedAbkId("");
  };

  const handleRemovePeserta = (abkId: string) => {
    setPeserta((prev) => prev.filter((p) => p.abkId !== abkId));
  };

  const handleBekalChange = (abkId: string, value: number) => {
    setPeserta((prev) =>
      prev.map((p) => (p.abkId === abkId ? { ...p, bekal: value } : p))
    );
  };

  const totalBekal = peserta.reduce((sum, p) => sum + p.bekal, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!kapalId) {
      setError("Kapal wajib dipilih");
      return;
    }
    if (!tanggalBerangkat) {
      setError("Tanggal berangkat wajib diisi");
      return;
    }
    if (peserta.length === 0) {
      setError("Minimal harus ada 1 peserta (Nahkoda/ABK)");
      return;
    }
    if (peserta.some((p) => p.bekal <= 0)) {
      setError("Bekal setiap peserta harus lebih dari 0");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/keberangkatan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kapal_id: kapalId,
          tanggalBerangkat,
          peserta: peserta.map((p) => ({ abkId: p.abkId, bekal: p.bekal })),
        }),
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || "Gagal mencatat keberangkatan");
      }

      alert("Keberangkatan berhasil dicatat!");
      router.push("/keuangan/keberangkatan");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingData) {
    return <div className="max-w-4xl mx-auto p-6 text-center text-gray-600">Memuat data...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center space-x-4">
        <BackButton fallbackHref="/keuangan/keberangkatan" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Catat Keberangkatan Baru</h1>
          <p className="text-gray-600">Pilih kapal, peserta, dan bekal masing-masing</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-6">
        {/* Kapal & Tanggal */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kapal <span className="text-red-500">*</span>
            </label>
            <select
              value={kapalId}
              onChange={(e) => setKapalId(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Pilih Kapal --</option>
              {kapalList.map((k) => (
                <option key={k.id} value={k.id}>{k.nama}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tanggal Berangkat <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={tanggalBerangkat}
              onChange={(e) => setTanggalBerangkat(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Tambah Peserta */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-medium text-gray-800 mb-3">Peserta & Bekal</h3>

          <div className="flex gap-2 mb-4">
            <select
              value={selectedAbkId}
              onChange={(e) => setSelectedAbkId(e.target.value)}
              className="flex-1 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Pilih ABK/Nahkoda --</option>
              {abkTersedia.map((a) => (
                <option key={a.id} value={a.id}>{a.nama} ({a.posisi})</option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleAddPeserta}
              disabled={!selectedAbkId}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="h-4 w-4 mr-1" />
              Tambah
            </button>
          </div>

          {peserta.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-6 bg-gray-50 rounded-lg">
              Belum ada peserta ditambahkan
            </p>
          ) : (
            <div className="space-y-2">
              {peserta.map((p) => (
                <div key={p.abkId} className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{p.nama}</p>
                    <p className="text-xs text-gray-500">{p.posisi}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Bekal (Rp)</label>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={p.bekal || ""}
                      onChange={(e) => handleBekalChange(p.abkId, Number(e.target.value) || 0)}
                      onFocus={(e) => e.target.select()}
                      placeholder="Contoh: 75000"
                      className="w-32 p-2 border border-gray-300 rounded-md text-sm"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemovePeserta(p.abkId)}
                    className="text-red-500 hover:text-red-700 p-2"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {peserta.length > 0 && (
            <div className="flex justify-between items-center mt-4 pt-4 border-t text-sm">
              <span className="text-gray-600">Total Bekal Keseluruhan:</span>
              <span className="font-bold text-blue-600">
                Rp {totalBekal.toLocaleString("id-ID")}
              </span>
            </div>
          )}
        </div>

        {/* Submit */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <button
            type="button"
            onClick={() => router.push("/keuangan/keberangkatan")}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            <Save className="h-4 w-4 mr-2" />
            {isSubmitting ? "Menyimpan..." : "Simpan Keberangkatan"}
          </button>
        </div>
      </form>
    </div>
  );
}