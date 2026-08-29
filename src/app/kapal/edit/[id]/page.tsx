// src/app/kapal/edit/[id]/page.tsx
"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Save, Ship } from "lucide-react";
import Card from "@/component/ui/card";
import Button from "@/component/ui/button";
import BackButton from "@/component/ui/back-button";

interface KapalFormData {
  nama: string;
  jenis: string;
  nomorRegistrasi: string;
  kapasitas: string;
  status: "aktif" | "maintenance" | "nonaktif";
  tahunBuat: string;
  pemilik: string;
  dimensiPanjang: string;
  dimensiLebar: string;
  dimensiTinggi: string;
  mesinUtama: string;
  dayaMesin: string;
  kecepatanMaksimal: string;
  bahanBakar: string;
  sertifikatKelaikan: string;
  tanggalSertifikat: string;
}

export default function EditKapalPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<
    Partial<Record<keyof KapalFormData, string>>
  >({});

  const [formData, setFormData] = useState<KapalFormData>({
    nama: "",
    jenis: "",
    nomorRegistrasi: "",
    kapasitas: "",
    status: "aktif",
    tahunBuat: "",
    pemilik: "",
    dimensiPanjang: "",
    dimensiLebar: "",
    dimensiTinggi: "",
    mesinUtama: "",
    dayaMesin: "",
    kecepatanMaksimal: "",
    bahanBakar: "",
    sertifikatKelaikan: "",
    tanggalSertifikat: "",
  });

  const statusOptions = [
    { value: "aktif", label: "Aktif" },
    { value: "maintenance", label: "Maintenance" },
    { value: "nonaktif", label: "Non-Aktif" },
  ];

  // Fetch kapal data untuk di-edit
  useEffect(() => {
    const fetchKapalData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/kapal?id=${id}`);

        if (!response.ok) {
          throw new Error("Failed to fetch kapal data");
        }

        const result = await response.json();

        if (result.success) {
          const kapal = result.data;
          setFormData({
            nama: kapal.nama,
            jenis: kapal.jenis,
            nomorRegistrasi: kapal.nomorRegistrasi,
            kapasitas: String(kapal.kapasitas),
            status: kapal.status,
            tahunBuat: kapal.tahunBuat.split("T")[0], // Format untuk input date
            pemilik: kapal.pemilik,
            dimensiPanjang: String(kapal.dimensiPanjang),
            dimensiLebar: String(kapal.dimensiLebar),
            dimensiTinggi: String(kapal.dimensiTinggi),
            mesinUtama: kapal.mesinUtama,
            dayaMesin: String(kapal.dayaMesin),
            kecepatanMaksimal: String(kapal.kecepatanMaksimal),
            bahanBakar: kapal.bahanBakar,
            sertifikatKelaikan: kapal.sertifikatKelaikan,
            tanggalSertifikat: kapal.tanggalSertifikat.split("T")[0], // Format untuk input date
          });
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

    if (id) {
      fetchKapalData();
    }
  }, [id]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name as keyof KapalFormData]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof KapalFormData, string>> = {};

    if (!formData.nama.trim()) newErrors.nama = "Nama kapal wajib diisi";
    if (!formData.jenis.trim()) newErrors.jenis = "Jenis kapal wajib diisi";
    if (!formData.nomorRegistrasi.trim())
      newErrors.nomorRegistrasi = "Nomor registrasi wajib diisi";
    if (!formData.kapasitas || Number(formData.kapasitas) <= 0)
      newErrors.kapasitas = "Kapasitas wajib diisi dan harus lebih dari 0";
    if (!formData.tahunBuat) {
      newErrors.tahunBuat = "Tanggal pembuatan kapal wajib diisi";
    } else {
      const tanggal = new Date(formData.tahunBuat);
      const sekarang = new Date();
      const tahunMinimal = new Date("1900-01-01");

      if (
        isNaN(tanggal.getTime()) ||
        tanggal < tahunMinimal ||
        tanggal > sekarang
      ) {
        newErrors.tahunBuat = "Tanggal pembuatan kapal tidak valid";
      }
    }
    if (!formData.pemilik.trim())
      newErrors.pemilik = "Pemilik kapal wajib diisi";
    if (!formData.dimensiPanjang || Number(formData.dimensiPanjang) <= 0)
      newErrors.dimensiPanjang = "Panjang kapal wajib diisi";
    if (!formData.dimensiLebar || Number(formData.dimensiLebar) <= 0)
      newErrors.dimensiLebar = "Lebar kapal wajib diisi";
    if (!formData.dimensiTinggi || Number(formData.dimensiTinggi) <= 0)
      newErrors.dimensiTinggi = "Tinggi kapal wajib diisi";
    if (!formData.mesinUtama.trim())
      newErrors.mesinUtama = "Mesin utama wajib diisi";
    if (!formData.dayaMesin || Number(formData.dayaMesin) <= 0)
      newErrors.dayaMesin = "Daya mesin wajib diisi";
    if (!formData.kecepatanMaksimal || Number(formData.kecepatanMaksimal) <= 0)
      newErrors.kecepatanMaksimal = "Kecepatan maksimal wajib diisi";
    if (!formData.bahanBakar.trim())
      newErrors.bahanBakar = "Bahan bakar wajib diisi";
    if (!formData.sertifikatKelaikan.trim())
      newErrors.sertifikatKelaikan = "Nomor sertifikat kelaikan wajib diisi";
    if (!formData.tanggalSertifikat)
      newErrors.tanggalSertifikat = "Tanggal sertifikat wajib diisi";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/kapal?id=${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          kapasitas: Number(formData.kapasitas),
          dimensiPanjang: Number(formData.dimensiPanjang),
          dimensiLebar: Number(formData.dimensiLebar),
          dimensiTinggi: Number(formData.dimensiTinggi),
          dayaMesin: Number(formData.dayaMesin),
          kecepatanMaksimal: Number(formData.kecepatanMaksimal),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Gagal mengupdate data kapal");
      }

      if (result.success) {
        alert("Kapal berhasil diupdate!");
        router.push(`/kapal/detail/${id}`);
      } else {
        throw new Error(result.error || "Gagal mengupdate data kapal");
      }
    } catch (error) {
      console.error("Error updating kapal:", error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Gagal mengupdate data kapal");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (
      confirm(
        "Apakah Anda yakin ingin membatalkan? Perubahan yang sudah diisi akan hilang.",
      )
    ) {
      router.push(`/kapal/detail/${id}`);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-600">Memuat data kapal...</p>
        </div>
      </div>
    );
  }

  if (error && !formData.nama) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <p className="text-red-800 font-semibold mb-2">Error</p>
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => router.push("/kapal")}>Kembali</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <BackButton fallbackHref={`/kapal/detail/${id}`} />
          <div className="p-2 bg-blue-100 rounded-lg">
            <Ship className="h-6 w-6 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Form */}
      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information Section */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Informasi Dasar
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Nama Kapal */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Kapal <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="nama"
                  value={formData.nama}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.nama ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Masukkan nama kapal"
                />
                {errors.nama && (
                  <p className="text-red-500 text-sm mt-1">{errors.nama}</p>
                )}
              </div>

              {/* Jenis Kapal */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Jenis Kapal <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="jenis"
                  value={formData.jenis}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.jenis ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Masukkan jenis kapal (contoh: Kapal Cargo)"
                />
                {errors.jenis && (
                  <p className="text-red-500 text-sm mt-1">{errors.jenis}</p>
                )}
              </div>

              {/* Nomor Registrasi */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nomor Registrasi <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="nomorRegistrasi"
                  value={formData.nomorRegistrasi}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.nomorRegistrasi
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  placeholder="Masukkan nomor registrasi"
                />
                {errors.nomorRegistrasi && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.nomorRegistrasi}
                  </p>
                )}
              </div>

              {/* Kapasitas */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kapasitas (ton) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  name="kapasitas"
                  value={formData.kapasitas}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.kapasitas ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Contoh: 12.5"
                  min="0"
                />
                {errors.kapasitas && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.kapasitas}
                  </p>
                )}
              </div>

              {/* Tahun Buat */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tahun Buat <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="tahunBuat"
                  value={formData.tahunBuat}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.tahunBuat ? "border-red-500" : "border-gray-300"
                  }`}
                  min="1900"
                  max={new Date().toISOString().split("T")[0]}
                />
                {errors.tahunBuat && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.tahunBuat}
                  </p>
                )}
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status <span className="text-red-500">*</span>
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Pemilik */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pemilik <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="pemilik"
                  value={formData.pemilik}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.pemilik ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Masukkan nama pemilik"
                />
                {errors.pemilik && (
                  <p className="text-red-500 text-sm mt-1">{errors.pemilik}</p>
                )}
              </div>
            </div>
          </div>

          {/* Specifications Section */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Spesifikasi Teknis
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Dimensi */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Panjang (m) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  name="dimensiPanjang"
                  value={formData.dimensiPanjang}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.dimensiPanjang ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Contoh: 6"
                  min="0"
                  step="0.1"
                />
                {errors.dimensiPanjang && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.dimensiPanjang}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lebar (m) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  name="dimensiLebar"
                  value={formData.dimensiLebar}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.dimensiLebar ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Contoh: 8"
                  min="0"
                  step="0.1"
                />
                {errors.dimensiLebar && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.dimensiLebar}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tinggi (m) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  name="dimensiTinggi"
                  value={formData.dimensiTinggi}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.dimensiTinggi ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Contoh: 150"
                  min="0"
                  step="0.1"
                />
                {errors.dimensiTinggi && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.dimensiTinggi}
                  </p>
                )}
              </div>

              {/* Mesin Utama */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mesin Utama <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="mesinUtama"
                  value={formData.mesinUtama}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.mesinUtama ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Masukkan jenis mesin utama"
                />
                {errors.mesinUtama && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.mesinUtama}
                  </p>
                )}
              </div>

              {/* Daya Mesin */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Daya Mesin (HP) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  name="dayaMesin"
                  value={formData.dayaMesin}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.dayaMesin ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Contoh: 12"
                  min="0"
                />
                {errors.dayaMesin && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.dayaMesin}
                  </p>
                )}
              </div>

              {/* Kecepatan Maksimal */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kecepatan Maksimal (knot){" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  name="kecepatanMaksimal"
                  value={formData.kecepatanMaksimal}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.kecepatanMaksimal
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  placeholder="Contoh: 10"
                  min="0"
                  step="0.1"
                />
                {errors.kecepatanMaksimal && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.kecepatanMaksimal}
                  </p>
                )}
              </div>

              {/* Bahan Bakar */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bahan Bakar <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="bahanBakar"
                  value={formData.bahanBakar}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.bahanBakar ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Masukkan jenis bahan bakar (contoh: Solar)"
                />
                {errors.bahanBakar && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.bahanBakar}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Certificate Section */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Sertifikat & Dokumen
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Sertifikat Kelaikan */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nomor Sertifikat Kelaikan{" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="sertifikatKelaikan"
                  value={formData.sertifikatKelaikan}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.sertifikatKelaikan
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  placeholder="Masukkan nomor sertifikat"
                />
                {errors.sertifikatKelaikan && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.sertifikatKelaikan}
                  </p>
                )}
              </div>

              {/* Tanggal Sertifikat */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tanggal Berlaku Sertifikat{" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="tanggalSertifikat"
                  value={formData.tanggalSertifikat}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.tanggalSertifikat
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                />
                {errors.tanggalSertifikat && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.tanggalSertifikat}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <Button
              variant="secondary"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}
