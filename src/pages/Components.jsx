import { useState } from "react";
import PageHeader from "../components/PageHeader";

// 1. Basic Component
import Button from "../components/Button";
import Badge from "../components/Badge";
import Avatar from "../components/Avatar";

// 2. Layout Component
import Container from "../components/Container";
import Footer from "../components/Footer";

// 3. Data Display Component
import Card from "../components/Card";
import ProductCard from "../components/ProductCard";
import Table from "../components/Table";

// 4. Form Component
import InputField from "../components/InputField";
import TextArea from "../components/TextArea";
import SelectField from "../components/SelectField";

// 5. Feedback Component
import Alert from "../components/Alert";
import Modal from "../components/Modal";

// 6. Section Component
import HeroSection from "../components/HeroSection";
import FeatureSection from "../components/FeatureSection";
import ProductSection from "../components/ProductSection";

// --- Data untuk Table ---
const headers = ["No", "Nama Produk", "Kategori", "Harga", "Aksi"];
const products = [
  { id: 1, name: "Laptop Asus", category: "Elektronik", price: "Rp 8.000.000" },
  { id: 2, name: "Sepatu Sport", category: "Fashion",    price: "Rp 450.000"  },
  { id: 3, name: "Jam Tangan",   category: "Aksesoris",  price: "Rp 799.000"  },
];

// --- Data untuk FeatureSection ---
const features = [
  { icon: "🚀", title: "Cepat",   description: "Performa tinggi untuk semua perangkat." },
  { icon: "🔒", title: "Aman",    description: "Keamanan data pengguna terjamin." },
  { icon: "🎨", title: "Modern",  description: "Desain UI yang bersih dan intuitif." },
];

// --- Data untuk ProductSection ---
const sectionProducts = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff",
    title: "Sepatu Sport",
    category: "Fashion",
    price: "Rp 450.000",
    description: "Sepatu sport modern dengan desain nyaman dan ringan.",
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9",
    title: "Smartphone",
    category: "Elektronik",
    price: "Rp 4.500.000",
    description: "Smartphone dengan performa cepat dan kamera jernih.",
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30",
    title: "Jam Tangan",
    category: "Aksesoris",
    price: "Rp 799.000",
    description: "Jam tangan elegan cocok untuk segala kesempatan.",
  },
];

export default function Components() {
  const [showModal, setShowModal] = useState(false);

  return (
    <div>
      <PageHeader title="Components" breadcrumb={["Dashboard", "Components"]} />

      {/* ===== 1. BASIC COMPONENT ===== */}

      {/* Button */}
      <div className="flex gap-2 mt-4">
        <Button type="primary">Edit</Button>
        <Button type="success">Simpan</Button>
        <Button type="danger">Hapus</Button>
      </div>

      {/* Badge */}
      <div className="flex gap-2 mt-4">
        <Badge type="success">Aktif</Badge>
        <Badge type="warning">Pending</Badge>
        <Badge type="danger">Nonaktif</Badge>
      </div>

      {/* Avatar */}
      <div className="flex gap-2 mt-4">
        <Avatar name="Plini" />
        <Avatar name="Renora" />
        <Avatar name="Sol" />
      </div>

      {/* ===== 2. LAYOUT COMPONENT ===== */}

      {/* Container */}
      <Container className="bg-gray-100">
        <h1 className="text-3xl font-bold mb-4">Daftar Produk</h1>
        <p className="text-gray-600">Berikut adalah daftar produk terbaru.</p>
      </Container>

      {/* Footer */}
      <Footer />

      {/* ===== 3. DATA DISPLAY COMPONENT ===== */}

      {/* Card */}
      <div className="mt-4 w-t">
        <Card>
          <h2 className="text-xl font-bold">Judul Card</h2>
          <p className="text-gray-600">Ini adalah isi dari card.</p>
        </Card>
      </div>

      {/* ProductCard */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <ProductCard
          image="https://images.unsplash.com/photo-1542291026-7eec264c27ff"
          title="Sepatu Sport"
          category="Fashion"
          price="Rp 450.000"
          description="Sepatu sport modern dengan desain nyaman dan ringan untuk aktivitas sehari-hari."
        />
        <ProductCard
          image="https://images.unsplash.com/photo-1511707171634-5f897ff02aa9"
          title="Smartphone"
          category="Elektronik"
          price="Rp 4.500.000"
          description="Smartphone dengan performa cepat, kamera jernih, dan baterai tahan lama."
        />
      </div>

      {/* Table */}
      <div className="mt-4">
        <Table headers={headers}>
          {products.map((product, index) => (
            <tr key={product.id} className="hover:bg-gray-50">
              <td className="border px-4 py-3">{index + 1}</td>
              <td className="border px-4 py-3">{product.name}</td>
              <td className="border px-4 py-3">{product.category}</td>
              <td className="border px-4 py-3">{product.price}</td>
              <td className="border px-4 py-3">
                <button className="bg-blue-600 text-white px-3 py-1 rounded">
                  Detail
                </button>
              </td>
            </tr>
          ))}
        </Table>
      </div>

      {/* ===== 4. FORM COMPONENT ===== */}
      <div className="mt-4 max-w-md">
        <InputField label="Nama" name="nama" placeholder="Masukkan nama..." />
        <TextArea label="Deskripsi" name="deskripsi" placeholder="Masukkan deskripsi..." />
        <SelectField
          label="Kategori"
          name="kategori"
          options={[
            { value: "elektronik", label: "Elektronik" },
            { value: "fashion",    label: "Fashion"    },
            { value: "aksesoris",  label: "Aksesoris"  },
          ]}
        />
      </div>

      {/* ===== 5. FEEDBACK COMPONENT ===== */}

      {/* Alert */}
      <div className="mt-4">
        <Alert type="success">Data berhasil disimpan!</Alert>
        <Alert type="warning">Perhatikan pengisian form.</Alert>
        <Alert type="danger">Terjadi kesalahan, coba lagi.</Alert>
        <Alert type="info">Informasi: Sistem sedang dalam pemeliharaan.</Alert>
      </div>

      {/* Modal trigger */}
      <div className="mt-4">
        <Button type="primary" onClick={() => setShowModal(true)}>
          Buka Modal
        </Button>
      </div>

      {showModal && (
        <Modal title="Contoh Modal" onClose={() => setShowModal(false)}>
          <p className="text-gray-600">Ini adalah isi dari modal.</p>
          <div className="flex justify-end gap-2 mt-4">
            <Button type="secondary" onClick={() => setShowModal(false)}>Batal</Button>
            <Button type="primary" onClick={() => setShowModal(false)}>Simpan</Button>
          </div>
        </Modal>
      )}

      {/* ===== 6. SECTION COMPONENT ===== */}

      <div className="mt-4">
        <HeroSection
          title="Selamat Datang di MyApp"
          subtitle="Temukan produk terbaik dengan harga terjangkau."
          buttonText="Mulai Belanja"
        />
      </div>

      <FeatureSection features={features} />

      <ProductSection title="Produk Terbaru" products={sectionProducts} />
    </div>
  );
}
