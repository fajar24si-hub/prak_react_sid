import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";

export default function MemberProfile() {
    const { user, profile, customer, refreshProfile } = useAuth();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");
    const [dataForm, setDataForm] = useState({
        full_name: profile?.full_name || "",
        phone: customer?.phone || "",
        address: customer?.address || "",
    });

    const handleChange = (evt) => {
        const { name, value } = evt.target;
        setDataForm({
            ...dataForm,
            [name]: value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccess("");

        try {
            // Update profile
            const { error: profileError } = await supabase
                .from("profiles")
                .update({ full_name: dataForm.full_name })
                .eq("id", user.id);

            if (profileError) throw profileError;

            // Update customer (jika ada)
            if (customer) {
                const { error: customerError } = await supabase
                    .from("customers")
                    .update({
                        phone: dataForm.phone,
                        address: dataForm.address,
                    })
                    .eq("user_id", user.id);

                if (customerError) throw customerError;
            }

            await refreshProfile();
            setSuccess("Profil berhasil diperbarui!");
        } catch (err) {
            setError(err.message || "Gagal memperbarui profil");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Profile Info */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Profil Saya</h3>

                {error && (
                    <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 text-sm">{error}</div>
                )}
                {success && (
                    <div className="bg-green-100 text-green-700 p-3 rounded-lg mb-4 text-sm">{success}</div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            type="email"
                            value={user?.email || ""}
                            disabled
                            className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-500"
                        />
                        <p className="text-xs text-gray-400 mt-1">Email tidak dapat diubah</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                        <input
                            name="full_name"
                            value={dataForm.full_name}
                            onChange={handleChange}
                            type="text"
                            className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">No. Telepon</label>
                        <input
                            name="phone"
                            value={dataForm.phone}
                            onChange={handleChange}
                            type="text"
                            className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg"
                            placeholder="08xxxxxxxxxx"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Alamat</label>
                        <textarea
                            name="address"
                            value={dataForm.address}
                            onChange={handleChange}
                            rows={3}
                            className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg"
                            placeholder="Alamat lengkap Anda"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-6
                            rounded-lg transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? "Menyimpan..." : "Simpan Perubahan"}
                    </button>
                </form>
            </div>

            {/* Membership Info */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h4 className="font-bold text-gray-800 mb-3">Informasi Membership</h4>
                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <span className="text-gray-500 w-40 text-sm">No. Member</span>
                        <span className="text-gray-800 font-medium">{customer?.membership_number || "-"}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-gray-500 w-40 text-sm">Tipe Membership</span>
                        <span className="bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">
                            {customer?.membership_type || "Basic"}
                        </span>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-gray-500 w-40 text-sm">Status</span>
                        <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full">
                            {customer?.status || "Active"}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}