# 📋 PLAN Implementasi — Sistem Manajemen Member & Pesanan
**Berdasarkan PRD v1.0 | 26 Juni 2026**

---

## 📊 Status Saat Ini vs Target PRD

| Komponen | Status Saat Ini | Target PRD |
|---|---|---|
| React + Vite | ✅ Sudah ada | — |
| Tailwind CSS + Shadcn | ✅ Sudah ada | — |
| React Router DOM | ✅ Sudah ada | — |
| Supabase Client | ⚠️ Hanya di notesAPI.js (REST) | Perlu @supabase/supabase-js SDK |
| Auth (Login) | ⚠️ Dummyjson.com | Supabase Auth |
| Auth (Register) | ❌ Kosong/tanpa logika | Supabase Auth + auto profile |
| Protected Routes | ❌ Tidak ada | Role-based guards |
| Dashboard | ⚠️ Data hardcode | Query real dari Supabase |
| Products CRUD | ⚠️ Data hardcode | Full CRUD ke Supabase |
| Customers CRUD | ❌ File tidak ada | Full CRUD + role management |
| Orders CRUD | ⚠️ Data hardcode | Full CRUD + status workflow |
| Member Dashboard | ❌ Tidak ada | Halaman baru |
| Riwayat Pesanan | ❌ Tidak ada | Halaman baru |
| Poin & Tier System | ❌ Tidak ada | Otomatis via trigger |

---

## 🔴 FASE 1 — Fondasi (Database + Supabase Setup)

### Langkah 1.1: Setup Database di Supabase SQL Editor
Jalankan SQL berikut **berurutan** di Supabase Dashboard → SQL Editor:

**Step A — Buat Semua Tabel:**
```sql
-- 1. profiles
CREATE TABLE profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   TEXT NOT NULL,
  role        TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member', 'guest')),
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 2. customers
CREATE TABLE customers (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES profiles(id) ON DELETE SET NULL,
  full_name       TEXT NOT NULL,
  email           TEXT UNIQUE NOT NULL,
  phone           TEXT,
  address         TEXT,
  points          INTEGER NOT NULL DEFAULT 0,
  lifetime_points INTEGER NOT NULL DEFAULT 0,
  tier            TEXT NOT NULL DEFAULT 'Bronze' CHECK (tier IN ('Bronze', 'Silver', 'Gold', 'Platinum')),
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- 3. products
CREATE TABLE products (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  description TEXT,
  price       NUMERIC(12,2) NOT NULL CHECK (price >= 0),
  stock       INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  category    TEXT,
  image_url   TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 4. orders
CREATE TABLE orders (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id   UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
  created_by    UUID REFERENCES profiles(id) ON DELETE SET NULL,
  status        TEXT NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending','confirmed','shipped','delivered','cancelled')),
  total_amount  NUMERIC(12,2) NOT NULL DEFAULT 0,
  points_earned INTEGER NOT NULL DEFAULT 0,
  notes         TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 5. order_items
CREATE TABLE order_items (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id    UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id  UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  quantity    INTEGER NOT NULL CHECK (quantity > 0),
  unit_price  NUMERIC(12,2) NOT NULL,
  subtotal    NUMERIC(12,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 6. point_transactions
CREATE TABLE point_transactions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  order_id    UUID REFERENCES orders(id) ON DELETE SET NULL,
  type        TEXT NOT NULL CHECK (type IN ('earn', 'redeem', 'adjust')),
  points      INTEGER NOT NULL,
  description TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 7. tiers
CREATE TABLE tiers (
  id                  SERIAL PRIMARY KEY,
  name                TEXT UNIQUE NOT NULL,
  min_points          INTEGER NOT NULL,
  max_points          INTEGER,
  discount_percentage NUMERIC(5,2) NOT NULL DEFAULT 0,
  color               TEXT,
  description         TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- Seed data tiers
INSERT INTO tiers (name, min_points, max_points, discount_percentage, color) VALUES
  ('Bronze',   0,     999,   0,    '#CD7F32'),
  ('Silver',   1000,  4999,  5,    '#C0C0C0'),
  ('Gold',     5000,  9999,  10,   '#FFD700'),
  ('Platinum', 10000, NULL,  15,   '#E5E4E2');
```

**Step B — Helper Functions:**
```sql
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION get_customer_id()
RETURNS UUID AS $$
  SELECT id FROM customers
  WHERE user_id = auth.uid()
  LIMIT 1;
$$ LANGUAGE SQL SECURITY DEFINER STABLE;
```

**Step C — Enable RLS + Policies** (copy dari PRD section 8.1 - 8.9)

**Step D — Triggers** (copy dari PRD section 9.1 - 9.3)

### Langkah 1.2: Install Supabase SDK
```bash
npm install @supabase/supabase-js
```

### Langkah 1.3: Buat Environment Variables
**File: `.env`**
```env
VITE_SUPABASE_URL=https://efekbmcgcekjngbxfhyf.supabase.co
VITE_SUPABASE_ANON_KEY=<ambil dari Supabase Dashboard → Settings → API>
```

### Langkah 1.4: Buat Supabase Client
**File baru: `src/lib/supabase.js`**
```js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

### Langkah 1.5: Buat Auth Context
**File baru: `src/context/AuthContext.jsx`**
- State: `user`, `profile` (dengan role), `loading`, `customer`
- Functions: `login(email, password)`, `register(email, password, fullName)`, `logout()`
- Listener: `supabase.auth.onAuthStateChange()`
- Fetch profile dari tabel `profiles` saat auth state berubah
- Fetch customer dari tabel `customers` berdasarkan `user_id`

### Langkah 1.6: Update main.jsx
- Wrap `<App />` dengan `<AuthProvider>`

### Langkah 1.7: Buat Akun Admin Pertama
1. Register via halaman register (otomatis jadi `member`)
2. Buka Supabase Dashboard → Table Editor → profiles
3. Ubah role dari `member` ke `admin` untuk akun tersebut

---

## 🟡 FASE 2 — Autentikasi

### Langkah 2.1: Modifikasi Login.jsx
**File: `src/pages/auth/Login.jsx`** (MODIFIKASI, bukan buat baru)
- [ ] Ganti `axios.post("https://dummyjson.com/...")` → `supabase.auth.signInWithPassword()`
- [ ] Setelah login berhasil, fetch profile dari `profiles` tabel
- [ ] Redirect berdasarkan role:
  - `admin` → `/`
  - `member` → `/member/dashboard`
  - `guest` → `/products`
- [ ] Tampilkan error dari Supabase (invalid credentials, email not confirmed, dll)
- [ ] Tambah link "Belum punya akun? Register" dan "Lupa password?"

### Langkah 2.2: Modifikasi Register.jsx
**File: `src/pages/auth/Register.jsx`** (MODIFIKASI)
- [ ] Tambah state management (`useState` untuk form fields)
- [ ] Tambah field `nama lengkap` (sesuai PRD)
- [ ] Hubungkan ke `supabase.auth.signUp()` dengan `full_name` di metadata
- [ ] Trigger otomatis membuat baris di `profiles` (sudah di-handle SQL trigger)
- [ ] Buat baris di `customers` setelah register berhasil
- [ ] Tambah loading & error handling
- [ ] Redirect ke `/login` setelah berhasil
- [ ] Tambah toast/alert sukses "Registrasi berhasil, silakan login"

### Langkah 2.3: Buat ProtectedRoute Component
**File baru: `src/components/auth/ProtectedRoute.jsx`**
```jsx
// Props: allowedRoles (array), children
// Logic:
// 1. Cek apakah user sudah login (dari AuthContext)
// 2. Jika belum → redirect ke /login
// 3. Jika sudah login tapi role tidak sesuai → redirect ke /unauthorized
// 4. Jika sesuai → render children
```

### Langkah 2.4: Buat Member Layout
**File baru: `src/layouts/MemberLayout.jsx`**
- Sidebar khusus member (Dashboard, Pesanan Saya, Profil)
- Header dengan info member (nama, tier, poin)
- Outlet untuk child routes

### Langkah 2.5: Update Routing di App.jsx
**File: `src/App.jsx`** (MODIFIKASI)
```
Routes yang perlu ditambah/diubah:

ADMIN ROUTES (ProtectedRoute allowedRoles={['admin']}) → MainLayout:
├── /              → Dashboard
├── /orders        → Orders (Admin CRUD)
├── /customers     → Customers (Admin CRUD)
├── /products      → Products (Admin CRUD)
├── /products/:id  → ProductDetail

MEMBER ROUTES (ProtectedRoute allowedRoles={['member', 'admin']}) → MemberLayout:
├── /member/dashboard  → MemberDashboard (BARU)
├── /member/pesanan    → RiwayatPesanan (BARU)

PUBLIC ROUTES → AuthLayout:
├── /login         → Login
├── /register      → Register
├── /forgot        → Forgot

GUEST ACCESS:
├── /products      → Products (read-only untuk guest)
```

### Langkah 2.6: Implementasi Logout
- Tambah tombol logout di Sidebar dan Header
- Panggil `supabase.auth.signOut()`
- Redirect ke `/login`

---

## 🟢 FASE 3 — CRUD Admin

### Langkah 3.1: CRUD Products
**File: `src/pages/Products.jsx`** (MODIFIKASI)
- [ ] Ganti import dari `data/products.js` → query `supabase.from('products').select()`
- [ ] Form "Add Product" → hubungkan ke `supabase.from('products').insert()`
- [ ] Form "Edit Product" → `supabase.from('products').update().eq('id', ...)`
- [ ] Soft delete → `supabase.from('products').update({ is_active: false })`
- [ ] Toggle aktif/nonaktif
- [ ] Filter berdasarkan kategori dan status
- [ ] Validasi: stok tidak boleh negatif, harga >= 0

### Langkah 3.2: CRUD Customer
**File: `src/pages/Customers.jsx`** (MODIFIKASI / BUAT BARU)
- [ ] Query: `supabase.from('customers').select('*, profiles(role)')`
- [ ] Tabel kolom: nama, email, telepon, tier, poin, tanggal daftar, aksi
- [ ] Tambah customer manual (form modal)
- [ ] Edit customer (nama, telepon, alamat)
- [ ] Soft delete → `update({ is_active: false })`
- [ ] Lihat detail customer (poin, tier, riwayat pesanan)
- [ ] **Ubah role** → dropdown dialog (admin/member/guest) → update `profiles.role`
- [ ] Filter berdasarkan tier dan status aktif
- [ ] Search berdasarkan nama atau email

### Langkah 3.3: CRUD Pesanan
**File: `src/pages/Orders.jsx`** (MODIFIKASI)
- [ ] Query: `supabase.from('orders').select('*, customers(full_name), order_items(*, products(name))')`
- [ ] Form buat pesanan baru:
  1. Pilih customer (dropdown, fetch dari `customers`)
  2. Pilih produk + quantity (multi-item)
  3. Auto-kalkulasi subtotal per item
  4. Insert ke `orders` → lalu loop insert `order_items`
  5. Total auto-update via trigger `recalculate_order_total()`
- [ ] Update status pesanan (dropdown: pending → confirmed → shipped → delivered → cancelled)
- [ ] Hapus pesanan (hanya status `pending`)
- [ ] **Logika stok**: Kurangi stok saat `confirmed`, kembalikan saat `cancelled`
- [ ] **Logika poin**: Otomatis via trigger saat `delivered`

---

## 🔵 FASE 4 — Dashboard & Member Pages

### Langkah 4.1: Dashboard Admin (Data Real)
**File: `src/pages/Dashboard.jsx`** (MODIFIKASI)
- [ ] Widget 1: Total customer aktif → `COUNT(*) FROM customers WHERE is_active = true`
- [ ] Widget 2: Total produk aktif → `COUNT(*) FROM products WHERE is_active = true`
- [ ] Widget 3: Total pesanan bulan ini → `COUNT(*) FROM orders WHERE created_at >= awal_bulan`
- [ ] Widget 4: Total pendapatan bulan ini → `SUM(total_amount) FROM orders WHERE status = 'delivered' AND created_at >= awal_bulan`
- [ ] Tabel: Pesanan terbaru (5 data) → JOIN orders + customers
- [ ] Tabel: Customer poin tertinggi (5 data)
- [ ] Grafik: Pesanan per hari 7 hari terakhir (opsional, bisa pakai recharts)

### Langkah 4.2: Dashboard Member (BARU)
**File baru: `src/pages/member/MemberDashboard.jsx`**
- [ ] Route: `/member/dashboard`
- [ ] Sambutan dengan nama member dari `profiles.full_name`
- [ ] Kartu tier saat ini (Bronze/Silver/Gold/Platinum) dengan visual warna
- [ ] Total poin saat ini dari `customers.points`
- [ ] Progress bar menuju tier berikutnya
  - Contoh: Bronze (500/1000 poin ke Silver)
- [ ] 5 pesanan terakhir (ringkasan: ID, tanggal, total, status)
- [ ] Tombol "Buat Pesanan Baru" → navigasi ke form pesanan

### Langkah 4.3: Riwayat Pesanan Member (BARU)
**File baru: `src/pages/member/RiwayatPesanan.jsx`**
- [ ] Route: `/member/pesanan`
- [ ] Query: `supabase.from('orders').select('*, order_items(*, products(name))').eq('customer_id', customerId)`
- [ ] Filter status: Semua, Pending, Confirmed, Shipped, Delivered, Cancelled
- [ ] Detail per pesanan: produk, jumlah, subtotal, total, poin didapat
- [ ] Tombol "Batalkan" (hanya untuk status `pending`)

---

## ⚪ FASE 5 — Penyempurnaan

### Langkah 5.1: Toast Notifications
- Install shadcn toast (jika belum)
- Tambah notifikasi untuk semua aksi CRUD: sukses, error, warning
- Auto-dismiss setelah 3-5 detik

### Langkah 5.2: Form Validation
- Validasi wajib (required fields)
- Validasi format email
- Validasi password (min 6 karakter, konfirmasi match)
- Validasi numerik (harga >= 0, stok >= 0, quantity > 0)
- Tampilkan error inline di form

### Langkah 5.3: Loading States
- Skeleton loader untuk tabel (ganti spinner biasa)
- Disable button saat loading
- Optimistic UI untuk delete & status update

### Langkah 5.4: Error Handling Global
- Handle Supabase errors: duplicate email, foreign key constraint, RLS denied
- Error boundary untuk catch unexpected errors
- Halaman 404 yang lebih informatif

### Langkah 5.5: Refactor notesAPI.js
- Migrasi dari REST API manual ke Supabase SDK
- Konsisten dengan pola yang baru

---

## 📁 Perubahan File yang Diperlukan

### File BARU (perlu dibuat):
| File | Fase | Keterangan |
|---|---|---|
| `.env` | 1 | Environment variables Supabase |
| `src/lib/supabase.js` | 1 | Supabase client initialization |
| `src/context/AuthContext.jsx` | 1 | Auth context (user, profile, role) |
| `src/components/auth/ProtectedRoute.jsx` | 2 | Route guard berdasarkan role |
| `src/layouts/MemberLayout.jsx` | 2 | Layout untuk halaman member |
| `src/pages/member/MemberDashboard.jsx` | 4 | Dashboard member |
| `src/pages/member/RiwayatPesanan.jsx` | 4 | Riwayat pesanan member |

### File MODIFIKASI (sudah ada, perlu diubah):
| File | Fase | Perubahan |
|---|---|---|
| `src/main.jsx` | 1 | Tambah AuthProvider wrapper |
| `src/App.jsx` | 2 | Update routing + protected routes |
| `src/pages/auth/Login.jsx` | 2 | Ganti ke Supabase Auth |
| `src/pages/auth/Register.jsx` | 2 | Tambah logika Supabase Auth |
| `src/components/Sidebar.jsx` | 2 | Tambah menu member, logout button |
| `src/components/Header.jsx` | 2 | Tampilkan user info real, logout |
| `src/pages/Products.jsx` | 3 | CRUD ke Supabase (ganti data hardcode) |
| `src/pages/Customers.jsx` | 3 | CRUD ke Supabase + role management |
| `src/pages/Orders.jsx` | 3 | CRUD ke Supabase + status workflow |
| `src/pages/Dashboard.jsx` | 4 | Query data real dari Supabase |
| `src/pages/Note.jsx` | 5 | Refactor ke Supabase SDK |
| `src/services/notesAPI.js` | 5 | Refactor ke Supabase SDK |

---

## ⏱️ Estimasi Waktu per Fase

| Fase | Estimasi | Prioritas |
|---|---|---|
| Fase 1 — Fondasi | Langkah 1.1–1.7 | 🔴 KRITIS (harus dulu) |
| Fase 2 — Autentikasi | Langkah 2.1–2.6 | 🔴 KRITIS |
| Fase 3 — CRUD Admin | Langkah 3.1–3.3 | 🟡 TINGGI |
| Fase 4 — Dashboard & Member | Langkah 4.1–4.3 | 🟡 TINGGI |
| Fase 5 — Penyempurnaan | Langkah 5.1–5.5 | 🟢 NORMAL |

---

## ⚠️ CATATAN PENTING

1. **Urutan eksekusi**: Fase 1 WAJIB selesai dulu sebelum Fase 2+ (butuh Supabase client & auth context)
2. **PRD Catatan #1**: "Jangan ubah halaman yang sudah ada kecuali untuk menambahkan logika (bukan desain)"
3. **PRD Catatan #2**: "Gunakan Shadcn Dialog untuk form add/edit"
4. **PRD Catatan #6**: "Cek stok produk sebelum insert order_items"
5. **PRD Catatan #7**: "Kurangi stok saat confirmed; kembalikan saat cancelled"
6. **PRD Catatan #10**: "Soft delete — jangan pernah hard delete customer dan produk"
7. **Supabase project sudah ada**: `efekbmcgcekjngbxfhyf.supabase.co` (dari notesAPI.js)
8. **Data dummy** di `src/data/products.js` dan `src/data/orders.js` bisa dijadikan **seed data** untuk tabel Supabase