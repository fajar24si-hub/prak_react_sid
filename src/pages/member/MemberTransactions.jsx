import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";

export default function MemberTransactions() {
    const { user } = useAuth();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchTransactions();
        }
    }, [user]);

    const fetchTransactions = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from("transactions")
                .select("*")
                .eq("user_id", user.id)
                .order("created_at", { ascending: false });

            if (error) throw error;
            setTransactions(data || []);
        } catch (err) {
            console.error("Error fetching transactions:", err.message);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return "-";
        return new Date(dateStr).toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "long",
            year: "numeric",
        });
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "completed":
                return "bg-green-100 text-green-700";
            case "pending":
                return "bg-yellow-100 text-yellow-700";
            case "cancelled":
                return "bg-red-100 text-red-700";
            default:
                return "bg-gray-100 text-gray-700";
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Riwayat Transaksi</h3>

                {loading ? (
                    <div className="text-center py-10">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
                        <p className="text-sm text-gray-500 mt-3">Memuat data...</p>
                    </div>
                ) : transactions.length === 0 ? (
                    <div className="text-center py-10">
                        <div className="text-4xl mb-3">📋</div>
                        <p className="text-gray-500 text-sm">Belum ada transaksi</p>
                        <p className="text-gray-400 text-xs mt-1">Transaksi Anda akan muncul di sini</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="text-left py-3 px-4 font-semibold text-gray-600">No.</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-600">Tanggal</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-600">Deskripsi</th>
                                    <th className="text-right py-3 px-4 font-semibold text-gray-600">Jumlah</th>
                                    <th className="text-center py-3 px-4 font-semibold text-gray-600">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.map((trx, index) => (
                                    <tr key={trx.id} className="border-b border-gray-100 hover:bg-gray-50">
                                        <td className="py-3 px-4 text-gray-500">{index + 1}</td>
                                        <td className="py-3 px-4 text-gray-700">{formatDate(trx.created_at)}</td>
                                        <td className="py-3 px-4 text-gray-700">{trx.description || "-"}</td>
                                        <td className="py-3 px-4 text-right font-medium text-gray-800">
                                            {formatCurrency(trx.amount || 0)}
                                        </td>
                                        <td className="py-3 px-4 text-center">
                                            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${getStatusColor(trx.status)}`}>
                                                {trx.status || "pending"}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}