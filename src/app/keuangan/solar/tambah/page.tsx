"use client";
import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Fuel, Save } from "lucide-react";
import BackButton from "@/component/ui/back-button";

interface KeberangkatanOption {
  id: string;
  tanggalBerangkat: string;
  kapal: { nama: string };
}

interface Alokasi {
  keberangkatanId: string;
  kapalNama: string;
  porsiBiaya: number;
}

function TambahSolarContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preSelectedId= searchParams.get("keberangkatanId");
  const [keberangkatanList, setKeberangkatanList] = useState<KeberangkatanOption[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const [tanggal, setTanggal] = useState("");
  const [jumlahLiter, setJumlahLiter] = useState<number>(0);
  const [hargaPerLiter, setHargaPerLiter] = useState<number>(0);
  const [keterangan, setKeterangan] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [alokasi, setAlokasi] = useState<Alokasi[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchKeberangkatan = async () => {
      try {
        const res = await fetch("/api/keberangkatan/berlangsung");
        const json = await res.json();
        const list: KeberangkatanOption[] = json.data || [];
        setKeberangkatanList(list);

        // Pre-select kalau datang dari link halaman detail keberangkatan
        if (preSelectedId && list.some((k) => k.id === preSelectedId)) {
          setSelectedIds([preSelectedId]);
          const kb = list.find((k) => k.id === preSelectedId)!;
          setAlokasi([{ keberangkatanId: preSelectedId, kapalNama: kb.kapal.nama, porsiBiaya: 0 }]);
        }
      } catch (err) {
        console.error("Gagal memuat keberangkatan:", err);
      } finally {
        setLoadingData(false);
      }
    };
    fetchKeberangkatan();
  }, [preSelectedId]);

  const totalHarga = jumlahLiter * hargaPerLiter;

  // Setiap kali totalHarga atau jumlah keberangkatan yang dipilih berubah,
  // bagi rata otomatis (tetap bisa diedit manual sesudahnya)
  const handleToggleKeberangkatan = (kb: KeberangkatanOption) => {
    const isSelected = selectedIds.includes(kb.id);
    let newSelectedIds: string[];

    if (isSelected) {
      newSelectedIds = selectedIds.filter((id) => id !== kb.id);
    } else {
      newSelectedIds = [...selectedIds, kb.id];
    }

    setSelectedIds(newSelectedIds);

    const porsiRata = newSelectedIds.length > 0 ? Math.round(totalHarga / newSelectedIds.length) : 0;
    const newAlokasi = newSelectedIds.map((id) => {
      const k = keberangkatanList.find((x) => x.id === id)!;
      return {
        keberangkatanId: id,
        kapalNama: k.kapal.nama,
        porsiBiaya: porsiRata,
      };
    });
    setAlokasi(newAlokasi);
  };

  const handlePorsiChange = (keberangkatanId: string, value: number) => {
    setAlokasi((prev) =>
      prev.map((a) => (a.keberangkatanId === keberangkatanId ? { ...a, porsiBiaya: value } : a))
    );
  };

  const handleRataBagi = () => {
    if (selectedIds.length === 0) return;
    const porsiRata = Math.round(totalHarga / selectedIds.length);
    setAlokasi((prev) => prev.map((a) => ({ ...a, porsiBiaya: porsiRata })));
  };

  const totalAlokasi = alokasi.reduce((sum, a) => sum + a.porsiBiaya, 0);
  const selisih = totalHarga - totalAlokasi;

  const formatRupiah = (n: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);

  const formatTanggal = (dateString: string) =>
    new Date(dateString).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!tanggal || !jumlahLiter || !hargaPerLiter) {
      setError("Tanggal, jumlah liter, dan harga per liter wajib diisi");
      return;
    }
    if (alokasi.length === 0) {
      setError("Pilih minimal 1 keberangkatan yang menggunakan solar ini");
      return;
    }
    if (Math.abs(selisih) > 1) {
      setError(`Total alokasi (${formatRupiah(totalAlokasi)}) belum sama dengan total harga solar (${formatRupiah(totalHarga)}). Selisih: ${formatRupiah(selisih)}`);
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/solar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tanggal,
          jumlahLiter,
          hargaPerLiter,
          keterangan,
          alokasi: alokasi.map((a) => ({ keberangkatanId: a.keberangkatanId, porsiBiaya: a.porsiBiaya })),
        }),
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || "Gagal mencatat pengisian solar");
      }

      alert("Pengisian solar berhasil dicatat!");
      router.push("/keuangan/keberangkatan");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingData) {
    return <div className="max-w-3xl mx-auto p-6 text-center text-gray-600">Memuat data...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <div className="flex items-center space-x-4">
        <BackButton fallbackHref="/keuangan/keberangkatan" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Fuel className="h-5 w-5 mr-2 text-gray-400" />
            Catat Pengisian Solar
          </h1>
          <p className="text-gray-600">Alokasikan biaya ke 1 atau lebih keberangkatan</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800 text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-6">
        {/* Data Solar */}
        <div className="grid md:grid-cols-3 gap-4">
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Jumlah Liter <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={jumlahLiter || ""}
              onChange={(e) => setJumlahLiter(Number(e.target.value) || 0)}
              onFocus={(e) => e.target.select()}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              placeholder="Contoh: 100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Harga per Liter <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={hargaPerLiter || ""}
              onChange={(e) => setHargaPerLiter(Number(e.target.value) || 0)}
              onFocus={(e) => e.target.select()}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              placeholder="Contoh: 15000"
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
            placeholder="Misal: untuk 2x keberangkatan"
          />
        </div>

        {totalHarga > 0 && (
          <div className="bg-blue-50 p-3 rounded-lg text-sm flex justify-between">
            <span className="text-blue-700">Total Harga Solar:</span>
            <span className="font-bold text-blue-800">{formatRupiah(totalHarga)}</span>
          </div>
        )}

        {/* Pilih Keberangkatan */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-medium text-gray-800 mb-3">
            Dipakai untuk Keberangkatan Mana? <span className="text-red-500">*</span>
          </h3>

          {keberangkatanList.length === 0 ? (
            <p className="text-sm text-gray-500 bg-gray-50 p-4 rounded-lg text-center">
              Tidak ada keberangkatan berstatus &quot;berlangsung&quot; saat ini. Catat keberangkatan terlebih dahulu.
            </p>
          ) : (
            <div className="space-y-2">
              {keberangkatanList.map((kb) => (
                <label
                  key={kb.id}
                  className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg cursor-pointer hover:bg-gray-100"
                >
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(kb.id)}
                    onChange={() => handleToggleKeberangkatan(kb)}
                    className="h-4 w-4"
                  />
                  <span className="flex-1 text-sm text-gray-800">
                    {kb.kapal.nama} — {formatTanggal(kb.tanggalBerangkat)}
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Alokasi Biaya */}
        {alokasi.length > 0 && (
          <div className="border-t pt-6">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-medium text-gray-800">Alokasi Biaya per Keberangkatan</h3>
              <button
                type="button"
                onClick={handleRataBagi}
                className="text-sm text-blue-600 hover:underline"
              >
                Bagi Rata
              </button>
            </div>
            <div className="space-y-2">
              {alokasi.map((a) => (
                <div key={a.keberangkatanId} className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
                  <span className="flex-1 text-sm text-gray-700">{a.kapalNama}</span>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={a.porsiBiaya || ""}
                    onChange={(e) => handlePorsiChange(a.keberangkatanId, Number(e.target.value) || 0)}
                    placeholder="Contoh: 500000"
                    onFocus={(e) => e.target.select()}
                    className="w-40 p-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>
              ))}
            </div>

            <div className={`flex justify-between items-center mt-3 pt-3 border-t text-sm ${Math.abs(selisih) > 1 ? "text-red-600" : "text-green-600"}`}>
              <span>Total Alokasi: {formatRupiah(totalAlokasi)}</span>
              <span className="font-medium">
                {Math.abs(selisih) > 1 ? `Selisih: ${formatRupiah(selisih)}` : "✓ Sudah sesuai"}
              </span>
            </div>
          </div>
        )}

        <div className="flex justify-end space-x-3 pt-4 border-t">
          <button
            type="button"
            onClick={() => router.back()}
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
            {isSubmitting ? "Menyimpan..." : "Simpan Pengisian Solar"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function TambahSolarPage() {
  return (
    <Suspense fallback={<div className="p-6 text-center text-gray-600">Memuat halaman...</div>}>
      <TambahSolarContent />
    </Suspense>
  );
}