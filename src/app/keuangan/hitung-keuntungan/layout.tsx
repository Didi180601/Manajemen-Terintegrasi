// src/app/keuangan/hitung-keuntungan/layout.tsx
export default function HitungKeuntunganLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md">
        <div className="bg-green-600 text-white p-4 rounded-t-lg">
          <h1 className="text-2xl font-bold">Kalkulator Keuntungan</h1>
          <p className="text-green-100">Hitung margin keuntungan dan profit bisnis</p>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  )
}