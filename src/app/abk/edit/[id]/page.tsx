"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { UserPlus, Save } from "lucide-react";
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

interface KapalOption {
  id: string;
  nama: string;
}

export default function EditAbkPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

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

  const [kapalList, setKapalList] = useState<KapalOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof AbkFormData, string>>>({});
  const [error, setError] = useState<string | null>(null);

  const posisiOptions = ["Nahkoda", "Anak Buah Kapal"];
  const statusOptions = [
    { value: "aktif", label: "Aktif" },
    { value: "cuti", label: "Cuti" },
    { value: "nonaktif", label: "Non-Aktif" },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [abkRes, kapalRes] = await Promise.all([
          fetch(`/api/abk/${id}`),
          fetch("/api/kapal"),
        ]);
        const abkJson = await abkRes.json();
        const kapalJson = await kapalRes.json();

        if (abkJson.success) {
          const abk = abkJson.data;
          setFormData({
            nama: abk.nama,
            posisi: abk.posisi,
            kapal_id: abk.kapal_id,
            tanggal_bergabung: abk.tanggal_bergabung.split("T")[0],
            status: abk.status,
            no_ktp: abk.no_ktp,
            alamat: abk.alamat,
            no_telepon: abk.no_telepon,
          });
        } else {
          throw new Error(abkJson.error);
        }
        setKapalList(kapalJson.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Gagal memuat data ABK");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchData();
  }, [id]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof AbkFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof AbkFormData, string>> = {};
    if (!formData.nama.trim()) newErrors.nama = "Nama wajib diisi";
    if (!formData.posisi) newErrors.posisi = "Posisi wajib dipilih";
    if (!formData.kapal_id) newErrors.kapal_id = "Kapal wajib dipilih";
    if (!formData.tanggal_bergabung) newErrors.tanggal_bergabung = "Tanggal bergabung wajib diisi";
    if (!formData.no_ktp.trim()) newErrors.no_ktp = "No. KTP wajib diisi";
    if (formData.no_ktp.length !== 16) newErrors.no_ktp = "No. KTP harus 16 digit";
    if (!formData.alamat.trim()) newErrors.alamat = "Alamat wajib diisi";
    if (!formData.no_telepon.trim()) newErrors.no_telepon = "No. telepon wajib diisi";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/abk/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || "Gagal mengupdate ABK");
      }

      alert("Data ABK berhasil diupdate!");
      router.push("/abk");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="max-w-3xl mx-auto p-6 text-center text-gray-600">Memuat data...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <BackButton fallbackHref="/abk" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Data ABK</h1>
            <p className="text-gray-600">Perbarui informasi anak buah kapal</p>
          </div>
        </div>
        <div className="p-2 bg-blue-100 rounded-lg">
          <UserPlus className="h-6 w-6 text-blue-600" />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">{error}</div>
      )}

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nama Lengkap <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="nama"
                value={formData.nama}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  errors.nama ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.nama && <p className="text-red-500 text-sm mt-1">{errors.nama}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Posisi <span className="text-red-500">*</span>
              </label>
              <select
                name="posisi"
                value={formData.posisi}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg ${errors.posisi ? "border-red-500" : "border-gray-300"}`}
              >
                <option value="">Pilih posisi</option>
                {posisiOptions.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
              {errors.posisi && <p className="text-red-500 text-sm mt-1">{errors.posisi}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kapal <span className="text-red-500">*</span>
              </label>
              <select
                name="kapal_id"
                value={formData.kapal_id}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg ${errors.kapal_id ? "border-red-500" : "border-gray-300"}`}
              >
                <option value="">Pilih kapal</option>
                {kapalList.map((k) => <option key={k.id} value={k.id}>{k.nama}</option>)}
              </select>
              {errors.kapal_id && <p className="text-red-500 text-sm mt-1">{errors.kapal_id}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                No. KTP <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="no_ktp"
                value={formData.no_ktp}
                onChange={handleInputChange}
                maxLength={16}
                className={`w-full px-3 py-2 border rounded-lg ${errors.no_ktp ? "border-red-500" : "border-gray-300"}`}
              />
              {errors.no_ktp && <p className="text-red-500 text-sm mt-1">{errors.no_ktp}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                No. Telepon <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="no_telepon"
                value={formData.no_telepon}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg ${errors.no_telepon ? "border-red-500" : "border-gray-300"}`}
              />
              {errors.no_telepon && <p className="text-red-500 text-sm mt-1">{errors.no_telepon}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Alamat <span className="text-red-500">*</span>
              </label>
              <textarea
                name="alamat"
                value={formData.alamat}
                onChange={handleInputChange}
                rows={3}
                className={`w-full px-3 py-2 border rounded-lg ${errors.alamat ? "border-red-500" : "border-gray-300"}`}
              />
              {errors.alamat && <p className="text-red-500 text-sm mt-1">{errors.alamat}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tanggal Bergabung <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="tanggal_bergabung"
                value={formData.tanggal_bergabung}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg ${errors.tanggal_bergabung ? "border-red-500" : "border-gray-300"}`}
              />
              {errors.tanggal_bergabung && <p className="text-red-500 text-sm mt-1">{errors.tanggal_bergabung}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                {statusOptions.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t">
            <Button variant="secondary" onClick={() => router.push("/abk")} disabled={isSubmitting}>
              Batal
            </Button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
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