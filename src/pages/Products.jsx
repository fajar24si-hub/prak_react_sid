import { useState } from "react";
import { Link } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import { products } from "../data/products";
import {
  HiPlus,
  HiOutlineSearch,
  HiOutlineDocumentDownload,
  HiDotsHorizontal,
  HiOutlineCube,
} from "react-icons/hi";

export default function Products({ searchTerm = "" }) {
  const [showModal, setShowModal] = useState(false);

  const filtered = products.filter(
    (p) =>
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Fungsi untuk format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Fungsi untuk menentukan status stock
  const getStockStatus = (stock) => {
    if (stock <= 10)
      return {
        status: "Low Stock",
        color: "bg-red-50 text-red-600 border-red-100 animate-pulse",
      };
    if (stock <= 30)
      return {
        status: "Medium Stock",
        color: "bg-amber-50 text-amber-600 border-amber-100",
      };
    return {
      status: "In Stock",
      color: "bg-emerald-50 text-emerald-600 border-emerald-100",
    };
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] p-8 md:p-12 relative overflow-hidden text-slate-900 font-sans">
      {/* AMBIENT LIGHTING BACKGROUND */}
      <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-100/30 blur-[120px] rounded-full animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-100/20 blur-[100px] rounded-full"></div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* ✅ ELITE HEADER SECTION */}
        <PageHeader title="Products" breadcrumb={["Inventory", "Products"]}>
          <div className="flex gap-4">
            <button className="hidden md:flex items-center gap-2 px-5 py-3 bg-white border border-slate-100 text-slate-500 rounded-2xl hover:text-indigo-600 hover:shadow-xl hover:shadow-indigo-50 transition-all font-bold text-xs uppercase tracking-widest">
              <HiOutlineDocumentDownload className="text-lg" />
              Report
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="group flex items-center gap-2 px-8 py-3 bg-slate-900 text-white rounded-2xl shadow-2xl shadow-slate-200 hover:bg-indigo-600 hover:-translate-y-1 active:translate-y-0 transition-all font-bold text-sm"
            >
              <HiPlus className="group-hover:rotate-90 transition-transform" />
              Add Product
            </button>
          </div>
        </PageHeader>

        {/* 📊 TABLE CARD - ULTRA SLEEK */}
        <div className="mt-12 bg-white/70 backdrop-blur-md border border-white rounded-[2.5rem] shadow-[0_20px_50px_-20px_rgba(0,0,0,0.05)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-50">
                  <th className="px-10 py-6 text-[10px] uppercase tracking-[0.2em] font-black text-slate-400">
                    Product Code
                  </th>
                  <th className="px-10 py-6 text-[10px] uppercase tracking-[0.2em] font-black text-slate-400">
                    Product Name
                  </th>
                  <th className="px-10 py-6 text-[10px] uppercase tracking-[0.2em] font-black text-slate-400">
                    Brand
                  </th>
                  <th className="px-10 py-6 text-[10px] uppercase tracking-[0.2em] font-black text-slate-400">
                    Category
                  </th>
                  <th className="px-10 py-6 text-[10px] uppercase tracking-[0.2em] font-black text-slate-400 text-center">
                    Stock
                  </th>
                  <th className="px-10 py-6 text-[10px] uppercase tracking-[0.2em] font-black text-slate-400 text-right">
                    Price
                  </th>
                  <th className="px-10 py-6 text-[10px] uppercase tracking-[0.2em] font-black text-slate-400 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.length > 0 ? (
                  filtered.map((p) => {
                    const { status, color } = getStockStatus(p.stock);
                    return (
                      <tr
                        key={p.id}
                        className="group hover:bg-slate-50/50 transition-all duration-300"
                      >
                        <td className="px-10 py-6">
                          <div className="flex items-center gap-3 font-mono text-[11px] font-black text-indigo-500">
                            <span className="w-2 h-2 bg-indigo-500 rounded-full group-hover:scale-150 transition-transform"></span>
                            {p.code}
                          </div>
                        </td>
                        <td className="px-10 py-6">
                          <Link
                            to={`/products/${p.id}`}
                            className="font-bold text-slate-800 text-sm tracking-tight hover:text-indigo-600 transition-colors"
                          >
                            {p.title}
                          </Link>
                        </td>
                        <td className="px-10 py-6">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center font-black text-slate-500 text-xs border border-white shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-all">
                              {p.brand.charAt(0)}
                            </div>
                            <span className="text-sm font-semibold text-slate-700">
                              {p.brand}
                            </span>
                          </div>
                        </td>
                        <td className="px-10 py-6">
                          <span className="inline-flex items-center px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600">
                            {p.category}
                          </span>
                        </td>
                        <td className="px-10 py-6 text-center">
                          <span
                            className={`inline-flex items-center px-4 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border
                                                        ${color}`}
                          >
                            {p.stock}
                          </span>
                        </td>
                        <td className="px-10 py-6 text-right font-black text-slate-900 text-sm tracking-tighter">
                          {formatCurrency(p.price)}
                        </td>
                        <td className="px-10 py-6 text-right">
                          <button className="p-2 text-slate-300 hover:text-slate-900 hover:bg-white rounded-lg shadow-none hover:shadow-sm transition-all">
                            <HiDotsHorizontal />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="7" className="px-10 py-32 text-center">
                      <div className="flex flex-col items-center justify-center grayscale opacity-20">
                        <HiOutlineCube className="text-8xl mb-4" />
                        <p className="text-2xl font-black uppercase tracking-widest italic">
                          No Data Stream
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 🛡️ PREMIUM MODAL DESIGN */}
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <div
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-xl transition-all duration-500"
              onClick={() => setShowModal(false)}
            ></div>

            <div className="relative bg-white/90 border border-white rounded-[3rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] max-w-md w-full p-12 transform transition-all animate-in zoom-in duration-300">
              <div className="mb-10 text-center">
                <div className="w-16 h-16 bg-slate-900 text-white rounded-[1.5rem] flex items-center justify-center mx-auto mb-6 shadow-2xl rotate-3">
                  <HiPlus className="text-3xl" />
                </div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tighter italic">
                  Add Product
                </h2>
                <p className="text-slate-400 text-sm mt-2">
                  Register a new product to inventory.
                </p>
              </div>

              <div className="space-y-6">
                <div className="group">
                  <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 ml-2 transition-colors group-focus-within:text-indigo-600">
                    Product Name
                  </label>
                  <input
                    type="text"
                    placeholder="Product Title"
                    className="w-full bg-slate-50 border-none rounded-[1.2rem] px-6 py-4 text-slate-700 font-bold focus:ring-4 focus:ring-indigo-500/5 focus:bg-white shadow-inner transition-all"
                  />
                </div>
                <div className="group">
                  <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 ml-2 transition-colors group-focus-within:text-indigo-600">
                    Price
                  </label>
                  <div className="relative">
                    <div className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-slate-300">
                      Rp
                    </div>
                    <input
                      type="number"
                      placeholder="0.00"
                      className="w-full bg-slate-50 border-none rounded-[1.2rem] px-14 py-4 text-slate-700 font-bold focus:ring-4 focus:ring-indigo-500/5 focus:bg-white shadow-inner transition-all"
                    />
                  </div>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="w-full py-4 bg-slate-900 text-white font-black rounded-[1.2rem] hover:bg-indigo-600 transition-all uppercase tracking-widest text-sm"
                >
                  Add Product
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
