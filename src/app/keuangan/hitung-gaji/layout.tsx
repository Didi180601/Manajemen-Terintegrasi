// src/app/keuangan/hitung-gaji/layout.tsx
export default function HitungGajiLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md">
        <div className="bg-blue-600 text-white p-4 rounded-t-lg">
          <h1 className="text-2xl font-bold">Kalkulator Gaji</h1>
          <p className="text-blue-100">Hitung gaji bersih dan komponen penggajian</p>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  )
}