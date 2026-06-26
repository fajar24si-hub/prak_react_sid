import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import {
    HiUserAdd, HiMail, HiPhone, HiPencil, HiTrash,
    HiSearch, HiOutlineCloudDownload
} from "react-icons/hi";

export default function Customers() {
    const [showModal, setShowModal] = useState(false);
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [editingCustomer, setEditingCustomer] = useState(null);
    const [formData, setFormData] = useState({
        full_name: "",
        email: "",
        phone: "",
        address: "",
        membership_type: "Basic",
    });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from("customers")
                .select("*, profiles(full_name, email)")
                .order("created_at", { ascending: false });

            if (error) throw error;
            setCustomers(data || []);
        } catch (err) {
            console.error("Error fetching customers:", err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleAdd = () => {
        setEditingCustomer(null);
        setFormData({ full_name: "", email: "", phone: "", address: "", membership_type: "Basic" });
        setShowModal(true);
    };

    const handleEdit = (customer) => {
        setEditingCustomer(customer);
        setFormData({
            full_name: customer.profiles?.full_name || customer.full_name || "",
            email: customer.profiles?.email || customer.email || "",
            phone: customer.phone || "",
            address: customer.address || "",
            membership_type: customer.membership_type || "Basic",
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!confirm("Yakin ingin menghapus customer ini?")) return;
        try {
            const { error } = await supabase.from("customers").delete().eq("id", id);
            if (error) throw error;
            fetchCustomers();
        } catch (err) {
            alert("Gagal menghapus: " + err.message);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (editingCustomer) {
                const { error } = await supabase
                    .from("customers")
                    .update({
                        phone: formData.phone,
                        address: formData.address,
                        membership_type: formData.membership_type,
                    })
                    .eq("id", editingCustomer.id);
                if (error) throw error;
            } else {
                // Create new customer record
                const { error } = await supabase.from("customers").insert([{
                    full_name: formData.full_name,
                    email: formData.email,
                    phone: formData.phone,
                    address: formData.address,
                    membership_type: formData.membership_type,
                    membership_number: "MBR" + Date.now(),
                    status: "active",
                }]);
                if (error) throw error;
            }
            setShowModal(false);
            fetchCustomers();
        } catch (err) {
            alert("Gagal menyimpan: " + err.message);
        } finally {
            setSaving(false);
        }
    };

    const filtered = customers.filter((c) => {
        const name = c.profiles?.full_name || c.full_name || "";
        const email = c.profiles?.email || c.email || "";
        return (
            name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            email.toLowerCase().includes(searchTerm.toLowerCase())
        );
    });

    const getMembershipColor = (type) => {
        switch (type) {
            case "VIP": return "bg-slate-900 text-white";
            case "Gold": return "bg-gradient-to-r from-amber-400 to-orange-500 text-white";
            case "Silver": return "bg-gray-200 text-gray-700";
            default: return "bg-white text-slate-500 border border-slate-100";
        }
    };

    return (
        <div className="min-h-screen bg-[#F4F7FA] p-8 relative">
            <div className="relative z-10 max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Customer Management</h1>
                        <p className="text-sm text-slate-500 mt-1">Kelola data member dari Supabase</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-slate-500 rounded-xl hover:shadow transition-all text-xs font-bold">
                            <HiOutlineCloudDownload className="text-sm" /> Export
                        </button>
                        <button onClick={handleAdd} className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl shadow-lg hover:bg-indigo-600 transition-all font-bold text-sm">
                            <HiUserAdd className="text-lg" /> Tambah Customer
                        </button>
                    </div>
                </div>

                {/* Search */}
                <div className="mb-6">
                    <div className="relative max-w-md">
                        <HiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                        <input
                            type="text"
                            placeholder="Cari customer..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-white border-none rounded-2xl py-3 pl-12 pr-6 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-indigo-500/10 shadow-sm"
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    {loading ? (
                        <div className="text-center py-16">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500 mx-auto"></div>
                            <p className="text-sm text-gray-500 mt-4">Memuat data...</p>
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="text-center py-16">
                            <div className="text-5xl mb-4">👥</div>
                            <p className="text-gray-500 font-medium">Belum ada customer</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-100">
                                        <th className="px-6 py-4 text-[11px] uppercase tracking-wider font-bold text-slate-400">Customer</th>
                                        <th className="px-6 py-4 text-[11px] uppercase tracking-wider font-bold text-slate-400">Kontak</th>
                                        <th className="px-6 py-4 text-[11px] uppercase tracking-wider font-bold text-slate-400">Membership</th>
                                        <th className="px-6 py-4 text-[11px] uppercase tracking-wider font-bold text-slate-400">No. Member</th>
                                        <th className="px-6 py-4 text-[11px] uppercase tracking-wider font-bold text-slate-400 text-center">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {filtered.map((c) => (
                                        <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white text-sm">
                                                        {(c.profiles?.full_name || c.full_name || "?").charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-slate-800 text-sm">{c.profiles?.full_name || c.full_name || "-"}</div>
                                                        <div className="text-[10px] text-slate-400 font-mono">ID: {c.id?.slice(0, 8)}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-1">
                                                    <div className="text-sm text-slate-600 flex items-center gap-2">
                                                        <HiMail className="text-slate-300" />
                                                        {c.profiles?.email || c.email || "-"}
                                                    </div>
                                                    <div className="text-xs text-slate-400 flex items-center gap-2">
                                                        <HiPhone className="text-slate-200" />
                                                        {c.phone || "-"}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider ${getMembershipColor(c.membership_type)}`}>
                                                    {c.membership_type || "Basic"}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm font-mono text-slate-500">{c.membership_number || "-"}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex justify-center gap-2">
                                                    <button onClick={() => handleEdit(c)} className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors">
                                                        <HiPencil size={16} />
                                                    </button>
                                                    <button onClick={() => handleDelete(c.id)} className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors">
                                                        <HiTrash size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Modal */}
                {showModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>
                        <div className="relative bg-white rounded-3xl shadow-2xl max-w-lg w-full p-8">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-black text-slate-900">
                                    {editingCustomer ? "Edit Customer" : "Tambah Customer"}
                                </h2>
                                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-red-500 text-lg">✕</button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">Nama Lengkap</label>
                                    <input name="full_name" value={formData.full_name} onChange={handleInputChange}
                                        disabled={!!editingCustomer}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50"
                                        placeholder="Nama customer" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">Email</label>
                                    <input name="email" value={formData.email} onChange={handleInputChange}
                                        disabled={!!editingCustomer}
                                        type="email"
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50"
                                        placeholder="email@example.com" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">Telepon</label>
                                    <input name="phone" value={formData.phone} onChange={handleInputChange}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                        placeholder="08xxxxxxxxxx" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">Alamat</label>
                                    <textarea name="address" value={formData.address} onChange={handleInputChange}
                                        rows={2}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                        placeholder="Alamat lengkap" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">Tipe Membership</label>
                                    <select name="membership_type" value={formData.membership_type} onChange={handleInputChange}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
                                        <option value="Basic">Basic</option>
                                        <option value="Silver">Silver</option>
                                        <option value="Gold">Gold</option>
                                        <option value="VIP">VIP</option>
                                    </select>
                                </div>

                                <button type="submit" disabled={saving}
                                    className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-indigo-600 transition-all disabled:opacity-50">
                                    {saving ? "Menyimpan..." : editingCustomer ? "Simpan Perubahan" : "Tambah Customer"}
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}