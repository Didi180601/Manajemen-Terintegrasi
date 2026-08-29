// src/app/abk/tambah-abk/page.tsx
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  UserPlus,
  Save,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import Card from "@/component/ui/card";
import Button from "@/component/ui/button";
import BackButton from "@/component/ui/back-button";

interface AbkFormData {
  kapal_id: string;
  nama: string;
  posisi: string;
  tanggal_bergabung: string;
  status: "aktif" | "cuti" | "nonaktif";
  no_ktp: string;
  alamat: string;
  no_telepon: string;
}

export default function TambahAbkPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<AbkFormData>({
    nama: "",
    posisi: "",
    kapal_id: "",
    tanggal_bergabung: "",
    status: "aktif",
    no_ktp: "",
    alamat: "",
    no_telepon: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<
    Partial<Record<keyof AbkFormData, string>>
  >({});
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({
    type: null,
    message: "",
  });

  const posisiOptions = ["Nahkoda", "Anak Buah Kapal"];

  const statusOptions = [
    { value: "aktif", label: "Aktif" },
    { value: "cuti", label: "Cuti" },
    { value: "nonaktif", label: "Non-Aktif" },
  ];

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
    if (errors[name as keyof AbkFormData]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof AbkFormData, string>> = {};

    if (!formData.nama.trim()) newErrors.nama = "Nama wajib diisi";
    if (!formData.posisi) newErrors.posisi = "Posisi wajib dipilih";
    if (!formData.kapal_id) newErrors.kapal_id = "Kapal wajib dipilih";
    if (!formData.tanggal_bergabung)
      newErrors.tanggal_bergabung = "Tanggal bergabung wajib diisi";
    if (!formData.no_ktp.trim()) newErrors.no_ktp = "No. KTP wajib diisi";
    if (formData.no_ktp.length !== 16)
      newErrors.no_ktp = "No. KTP harus 16 digit";
    if (!formData.alamat.trim()) newErrors.alamat = "Alamat wajib diisi";
    if (!formData.no_telepon.trim())
      newErrors.no_telepon = "No. telepon wajib diisi";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  interface KapalOption {
    id: string;
    nama: string;
  }
  const [kapalList, setKapalList] = useState<KapalOption[]>([]);
  const [loadingKapal, setLoadingKapal] = useState(true);
  useEffect(() => {
  const fetchKapal = async () => {
    try {
      setLoadingKapal(true)
      const res = await fetch('/api/kapal')
      const result = await res.json()

      if (result.success) {
        setKapalList(result.data)
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error('Gagal memuat kapal:', error)
    } finally {
      setLoadingKapal(false)
    }
  }

  fetchKapal()
}, [])


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: "" });

    try {
      // API call to save ABK data
      const response = await fetch("/api/abk", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || `HTTP error! status: ${response.status}`,
        );
      }

      // Show success message
      setSubmitStatus({
        type: "success",
        message: `ABK ${formData.nama} berhasil ditambahkan!`,
      });

      // Redirect after 2 seconds
      setTimeout(() => {
        router.push("/abk");
      }, 2000);
    } catch (error) {
      console.error("Error adding ABK:", error);
      setSubmitStatus({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Terjadi kesalahan saat menambah ABK",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (
      confirm(
        "Apakah Anda yakin ingin membatalkan? Data yang sudah diisi akan hilang.",
      )
    ) {
      router.push("/abk");
    }
  };

  return (
    <div className="space-y-6">
      {/* Status Message */}
      {submitStatus.type && (
        <div
          className={`p-4 rounded-lg ${
            submitStatus.type === "success"
              ? "bg-green-50 border border-green-200 text-green-800"
              : "bg-red-50 border border-red-200 text-red-800"
          }`}
        >
          <div className="flex items-center">
            {submitStatus.type === "success" ? (
              <CheckCircle className="w-5 h-5 mr-2" />
            ) : (
              <AlertCircle className="w-5 h-5 mr-2" />
            )}
            {submitStatus.message}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <BackButton fallbackHref="/abk" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Tambah ABK Baru
            </h1>
            <p className="text-gray-600">Isi data lengkap anak buah kapal</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-blue-100 rounded-lg">
            <UserPlus className="h-6 w-6 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Form */}
      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information Section */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Informasi Personal
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Nama */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Lengkap <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="nama"
                  value={formData.nama}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.nama ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Masukkan nama lengkap"
                  disabled={isSubmitting}
                />
                {errors.nama && (
                  <p className="text-red-500 text-sm mt-1">{errors.nama}</p>
                )}
              </div>

              {/* No KTP */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  No. KTP <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="no_ktp"
                  value={formData.no_ktp}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.no_ktp ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Masukkan nomor KTP (16 digit)"
                  maxLength={16}
                  disabled={isSubmitting}
                />
                {errors.no_ktp && (
                  <p className="text-red-500 text-sm mt-1">{errors.no_ktp}</p>
                )}
              </div>

              {/* No Telepon */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  No. Telepon <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="no_telepon"
                  value={formData.no_telepon}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.no_telepon ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Masukkan nomor telepon"
                  disabled={isSubmitting}
                />
                {errors.no_telepon && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.no_telepon}
                  </p>
                )}
              </div>

              {/* Alamat */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alamat <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="alamat"
                  value={formData.alamat}
                  onChange={handleInputChange}
                  rows={3}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.alamat ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Masukkan alamat lengkap"
                  disabled={isSubmitting}
                />
                {errors.alamat && (
                  <p className="text-red-500 text-sm mt-1">{errors.alamat}</p>
                )}
              </div>
            </div>
          </div>

          {/* Job Information Section */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Informasi Pekerjaan
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Posisi */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Posisi <span className="text-red-500">*</span>
                </label>
                <select
                  name="posisi"
                  value={formData.posisi}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.posisi ? "border-red-500" : "border-gray-300"
                  }`}
                  disabled={isSubmitting}
                >
                  <option value="">Pilih posisi</option>
                  {posisiOptions.map((posisi) => (
                    <option key={posisi} value={posisi}>
                      {posisi}
                    </option>
                  ))}
                </select>
                {errors.posisi && (
                  <p className="text-red-500 text-sm mt-1">{errors.posisi}</p>
                )}
              </div>

              {/* Kapal */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kapal <span className="text-red-500">*</span>
                </label>
                <select
                  name="kapal_id"
                  value={formData.kapal_id}
                  onChange={handleInputChange}
                  disabled={isSubmitting || loadingKapal}
                  className={`w-full px-3 py-2 border rounded-lg ${
                    errors.kapal_id ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <option value="">
                    {loadingKapal ? "Memuat kapal..." : "Pilih kapal"}
                  </option>

                  {kapalList.map((kapal) => (
                    <option key={kapal.id} value={kapal.id}>
                      {kapal.nama}
                    </option>
                  ))}
                </select>

                {errors.kapal_id && (
                  <p className="text-red-500 text-sm mt-1">{errors.kapal_id}</p>
                )}
              </div>

              {/* Tanggal Bergabung */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tanggal Bergabung <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="tanggal_bergabung"
                  value={formData.tanggal_bergabung}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.tanggal_bergabung
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  disabled={isSubmitting}
                />
                {errors.tanggal_bergabung && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.tanggal_bergabung}
                  </p>
                )}
              </div>

              {/* Status*/}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status <span className="text-red-500">*</span>
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isSubmitting}
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
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
              {isSubmitting ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Simpan ABK
                </>
              )}
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}
