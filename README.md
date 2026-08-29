<!-- # UML Aplikasi Manajemen Terintegrasi

Dokumen ini berisi diagram UML untuk aplikasi manajemen operasional dan keuangan perikanan. Diagram dibuat berdasarkan struktur data, fitur utama, dan alur bisnis yang terdapat di aplikasi ini. -->

<!-- ## 1. Overview Aplikasi

Aplikasi ini menangani beberapa domain utama:

- Manajemen kapal
- Manajemen ABK (anak buah kapal)
- Keberangkatan kapal dan peserta
- Pengelolaan solar dan biaya operasional
- Penghitungan gaji berdasarkan tangkapan ikan
- Manajemen pinjaman ABK
- Dashboard keuangan dan target bisnis -->

---

## 1. Entity Relationship Diagram (ERD)

```mermaid
erDiagram
    KAPAL ||--o{ ABK : memiliki
    KAPAL ||--o{ KEBERANGKATAN : melaksanakan
    ABK ||--o{ PESERTA_KEBERANGKATAN : mengikuti
    KEBERANGKATAN ||--o{ PESERTA_KEBERANGKATAN : berisi
    ABK ||--o{ GAJI : menerima
    KEBERANGKATAN ||--o{ GAJI : terkait
    GAJI ||--o{ DETAIL_IKAN : terdiri
    GAJI ||--o{ POTONGAN_PINJAMAN : memuat
    ABK ||--o{ PINJAMAN : memiliki
    PINJAMAN ||--o{ POTONGAN_PINJAMAN : dipotong
    KEBERANGKATAN ||--o{ SOLAR_KEBERANGKATAN : memakai
    PENGISIAN_SOLAR ||--o{ SOLAR_KEBERANGKATAN : digunakan
    KEBERANGKATAN ||--o{ BIAYA_LAIN_KEBERANGKATAN : mencatat

    KAPAL {
        string id PK
        string nama
        string jenis
        string nomor_registrasi UK
        float kapasitas
        string status
        datetime tahun_buat
        string pemilik
        float dimensi_panjang
        float dimensi_lebar
        float dimensi_tinggi
        string mesin_utama
        float daya_mesin
        float kecepatan_maksimal
        string bahan_bakar
        string sertifikat_kelaikan
        datetime tanggal_sertifikat
    }

    ABK {
        string id PK
        string nama
        string posisi
        string kapal_id FK
        datetime tanggal_bergabung
        string status
        string no_ktp UK
        string alamat
        string no_telepon
    }

    KEBERANGKATAN {
        string id PK
        string kapal_id FK
        datetime tanggal_berangkat
        datetime tanggal_kembali
        string status
    }

    PESERTA_KEBERANGKATAN {
        string id PK
        string keberangkatan_id FK
        string abk_id FK
        float bekal
    }

    GAJI {
        string id PK
        string abk_id FK
        string keberangkatan_id FK
        float bonus_harian
        float potongan
        float total_berat
        float total_nilai_ikan
        float total_gaji_ikan
        float gaji_bruto
        float gaji_bersih
        datetime tanggal
    }

    DETAIL_IKAN {
        string id PK
        string gaji_id FK
        string nama_ikan
        float berat
        float harga_per_kg
        float gaji_per_kg
        float total_nilai
        float total_gaji
    }

    PINJAMAN {
        string id PK
        string abk_id FK
        float jumlah
        float sisa_pinjaman
        datetime tanggal
        string keterangan
        string status
    }

    POTONGAN_PINJAMAN {
        string id PK
        string pinjaman_id FK
        string gaji_id FK
        float jumlah
    }

    PENGISIAN_SOLAR {
        string id PK
        datetime tanggal
        float jumlah_liter
        float harga_per_liter
        float total_harga
        string keterangan
    }

    SOLAR_KEBERANGKATAN {
        string id PK
        string keberangkatan_id FK
        string pengisian_solar_id FK
        float porsi_biaya
    }

    BIAYA_LAIN_KEBERANGKATAN {
        string id PK
        string keberangkatan_id FK
        string deskripsi
        float jumlah
        datetime tanggal
    }

    TARIF_IKAN {
        string id PK
        string posisi
        string nama_ikan
        float gaji_per_kg
    }

    TARGET_BISNIS {
        string id PK
        string periode
        float target_pendapatan
        float target_keuntungan
        float target_tangkapan
        float realisasi_pendapatan
        float realisasi_keuntungan
        float realisasi_tangkapan
    }

    BIAYA_OPERASIONAL {
        string id PK
        datetime tanggal
        string kategori
        string deskripsi
        float jumlah
        string bukti_pembayaran
    }
```

<!-- ### Penjelasan ERD

ERD di atas menggambarkan relasi antar entitas utama dalam sistem manajemen perikanan, yaitu:

- Kapal berhubungan dengan ABK dan Keberangkatan
- Keberangkatan memiliki peserta dan pembiayaan terkait
- ABK menerima gaji dan dapat memiliki pinjaman
- Gaji terdiri atas detail tangkapan ikan dan potongan pinjaman
- Pengisian solar dan biaya lain terkait dengan perjalanan kapal
- TargetBisnis dan BiayaOperasional mendukung analisis keuangan dan performa bisnis -->

---

## 2. Class Diagram

```mermaid
classDiagram
    class Admin {
        +kelolaKapal()
        +kelolaABK()
        +kelolaKeberangkatan()
        +kelolaTarifIkan()
        +catatSolar()
        +catatBiayaLain()
        +hitungGajiABK()
        +kelolaPinjamanABK()
        +lihatDashboardKeuangan()
        +kelolaTargetBisnis()
    }

    class Kapal {
        -String id
        -String nama
        -String jenis
        -String nomorRegistrasi
        -Float kapasitas
        -String status
        -DateTime tahunBuat
        -String pemilik
        -Float dimensiPanjang
        -Float dimensiLebar
        -Float dimensiTinggi
        -String mesinUtama
        -Float dayaMesin
        -Float kecepatanMaksimal
        -String bahanBakar
        -String sertifikatKelaikan
        -DateTime tanggalSertifikat
        +tambahKapal()
        +ubahKapal()
        +hapusKapal()
    }

    class ABK {
        -String id
        -String nama
        -String posisi
        -String kapalId
        -DateTime tanggalBergabung
        -String status
        -String noKtp
        -String alamat
        -String noTelepon
        +tambahABK()
        +ubahABK()
        +hapusABK()
    }

    class Keberangkatan {
        -String id
        -String kapalId
        -DateTime tanggalBerangkat
        -DateTime tanggalKembali
        -String status
        +buatKeberangkatan()
        +aturStatus()
        +daftarkanPeserta()
    }

    class PesertaKeberangkatan {
        -String id
        -String keberangkatanId
        -String abkId
        -Float bekal
        +registrasiPeserta()
    }

    class TarifIkan {
        -String id
        -String posisi
        -String namaIkan
        -Float gajiPerKg
        +ambilTarif()
    }

    class Gaji {
        -String id
        -String abkId
        -String keberangkatanId
        -Float bonusHarian
        -Float potongan
        -Float totalBerat
        -Float totalNilaiIkan
        -Float totalGajiIkan
        -Float gajiBruto
        -Float gajiBersih
        -DateTime tanggal
        +hitungGaji()
        +buatSlipGaji()
    }

    class DetailIkan {
        -String id
        -String gajiId
        -String namaIkan
        -Float berat
        -Float hargaPerKg
        -Float gajiPerKg
        -Float totalNilai
        -Float totalGaji
    }

    class Pinjaman {
        -String id
        -String abkId
        -Float jumlah
        -Float sisaPinjaman
        -DateTime tanggal
        -String keterangan
        -String status
        +ajukanPinjaman()
        +updateStatusPelunasan()
    }

    class PotonganPinjaman {
        -String id
        -String pinjamanId
        -String gajiId
        -Float jumlah
    }

    class PengisianSolar {
        -String id
        -DateTime tanggal
        -Float jumlahLiter
        -Float hargaPerLiter
        -Float totalHarga
        -String keterangan
        +inputSolar()
    }

    class SolarKeberangkatan {
        -String id
        -String keberangkatanId
        -String pengisianSolarId
        -Float porsiBiaya
    }

    class BiayaLainKeberangkatan {
        -String id
        -String keberangkatanId
        -String deskripsi
        -Float jumlah
        -DateTime tanggal
        +catatBiaya()
    }

    class BiayaOperasional {
        -String id
        -DateTime tanggal
        -String kategori
        -String deskripsi
        -Float jumlah
        -String buktiPembayaran
        +inputBiayaOperasional()
    }

    class TargetBisnis {
        -String id
        -String periode
        -Float targetPendapatan
        -Float targetKeuntungan
        -Float targetTangkapan
        -Float realisasiPendapatan
        -Float realisasiKeuntungan
        -Float realisasiTangkapan
        +updateTarget()
        +updateRealisasi()
    }

    Admin --> Kapal
    Admin --> ABK
    Admin --> TarifIkan
    Admin --> TargetBisnis
    Keuangan --> PengisianSolar
    Keuangan --> BiayaLainKeberangkatan
    Keuangan --> Gaji
    Keuangan --> BiayaOperasional

    Kapal "1" --> "0..*" ABK
    Kapal "1" --> "0..*" Keberangkatan
    Keberangkatan "1" --> "0..*" PesertaKeberangkatan
    ABK "1" --> "0..*" PesertaKeberangkatan
    ABK "1" --> "0..*" Gaji
    ABK "1" --> "0..*" Pinjaman
    Keberangkatan "1" --> "0..*" Gaji
    Gaji "1" --> "0..*" DetailIkan
    Gaji "1" --> "0..*" PotonganPinjaman
    Pinjaman "1" --> "0..*" PotonganPinjaman
    Keberangkatan "1" --> "0..*" SolarKeberangkatan
    PengisianSolar "1" --> "0..*" SolarKeberangkatan
    Keberangkatan "1" --> "0..*" BiayaLainKeberangkatan
```

<!-- ### Keterangan formal

Diagram class ini menampilkan struktur sistem secara konseptual, dengan entitas utama, relasi antar kelas, dan operasi yang relevan terhadap proses bisnis. Hubungan yang terdefinisi menunjukkan bagaimana data kapal, awak kapal, perjalanan, penggajian, dan keuangan terintegrasi dalam satu sistem. -->

---

## 3. Use Case Diagram

```mermaid
flowchart LR
    A((Admin))

    subgraph S["Sistem Manajemen Terintegrasi Perikanan"]
        U1["Mengelola data kapal"]
        U2["Mengelola data ABK"]
        U3["Menentukan jadwal keberangkatan"]
        U4["Mengelola peserta keberangkatan"]
        U5["Merekam konsumsi solar"]
        U6["Merekam biaya perjalanan"]
        U7["Mengatur tarif ikan"]
        U8["Menghitung gaji ABK"]
        U9["Mengelola pinjaman ABK"]
        U10["Menampilkan dashboard keuangan"]
        U11["Menyusun target bisnis"]
        U12["Melihat laporan dan statistik"]
    end

    A --> U1
    A --> U2
    A --> U3
    A --> U4
    A --> U5
    A --> U6
    A --> U7
    A --> U8
    A --> U9
    A --> U10
    A --> U11
    A --> U12
```

<!-- ### Interpretasi use case

Use case ini menggambarkan bahwa seluruh operasi sistem dilakukan oleh satu aktor utama, yaitu Admin. Berdasarkan kondisi nyata aplikasi, tidak terdapat aktor lain yang memiliki akses ke sistem, sehingga seluruh fungsi operasional, keuangan, dan pelaporan dijalankan oleh admin secara terintegrasi. -->

---

## 4. Activity Diagram

### 4.1 Activity Diagram: Proses Penghitungan Gaji ABK

```mermaid
flowchart TD
    A[Start] --> B[Masukkan data keberangkatan dan tangkapan]
    B --> C[Ambil data ABK yang terlibat]
    C --> D[Ambil tarif ikan sesuai posisi dan jenis ikan]
    D --> E[Hitung total berat dan nilai hasil tangkapan]
    E --> F[Hitung gaji dasar berdasarkan tarif ikan]
    F --> G[Tambahkan bonus harian]
    G --> H[Hitung potongan pinjaman]
    H --> I[Hitung gaji bruto]
    I --> J{Apakah ada potongan?}
    J -- Ya --> K[Kurangi potongan dari gaji bruto]
    J -- Tidak --> L[Gunakan gaji bruto sebagai gaji bersih]
    K --> M[Hitung gaji bersih]
    L --> M
    M --> N[Simpan data gaji ke database]
    N --> O[Generate laporan dan slip gaji]
    O --> P[End]
```

### 4.2 Activity Diagram: Proses Keberangkatan Kapal

```mermaid
flowchart TD
    A[Start] --> B[Admin menyiapkan data kapal]
    B --> C[Input jadwal keberangkatan]
    C --> D[Daftarkan peserta ABK]
    D --> E[Catat konsumsi solar dan biaya tambahan]
    E --> F{Status perjalanan}
    F -- Berlangsung --> G[Monitoring operasi perjalanan]
    G --> H[Catat hasil tangkapan dan aktivitas kapal]
    H --> I[Update status menjadi selesai]
    F -- Selesai --> I
    F -- Dibatalkan --> J[Update status menjadi dibatalkan]
    I --> K[Hitung gaji dan biaya operasional]
    J --> K
    K --> L[Generate laporan keuangan]
    L --> M[End]
```

---

<!-- ## 6. Ringkasan Arsitektur Domain

Sistem ini terdiri atas tiga domain utama, yaitu:

- Operational Domain: kapal, ABK, keberangkatan, peserta, dan konsumsi solar
- Payroll Domain: gaji, detail ikan, tarif ikan, dan potongan pinjaman
- Financial Domain: pinjaman, biaya operasional, target bisnis, dan dashboard keuangan

Dengan pendekatan tersebut, aplikasi mampu mengintegrasikan seluruh siklus operasional kapal mulai dari persiapan pemberangkatan, proses pelayaran, penghitungan gaji, hingga analisis keuntungan dan performa bisnis.

---

## 7. Catatan untuk Laporan Skripsi

Diagram UML ini telah disesuaikan dengan model data sebenarnya pada basis data Prisma dan fitur yang ada di aplikasi. Jika diperlukan, dokumen ini dapat dikembangkan lebih lanjut menjadi:

- Sequence Diagram
- Collaboration Diagram
- UML deployment diagram
- ERD versi formal untuk bab 2 dan 3
- Diagram relasi database untuk tujuan publikasi ilmiah -->
