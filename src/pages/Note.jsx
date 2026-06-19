import React, { useState, useEffect } from 'react';
import PageHeader from '../components/PageHeader';
import Container from '../components/Container';
import Alert from '../components/Alert';
import GenericTable from '../components/GenericTable';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { HiTrash, HiPencil } from 'react-icons/hi';
import { notesAPI } from '../services/notesAPI';

export default function Note() {
  const [notes, setNotes] = useState([]);

  const [dataForm, setDataForm] = useState({
    title: '',
    content: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (evt) => {
    const { name, value } = evt.target;
    setDataForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Load data saat pertama di-render
  useEffect(() => {
    loadNotes();
  }, []);

  // Memanggil fetchNotes beserta error/loading handling
  const loadNotes = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await notesAPI.fetchNotes();
      if (data && data.length > 0) {
        setNotes(data);
      } else {
        // Jika API berhasil tapi data kosong, gunakan sample data
        setNotes(getSampleData());
      }
    } catch (err) {
      console.error('Error loading notes:', err);
      // Jika API gagal, gunakan sample data tanpa error message
      setNotes(getSampleData());
      // Jangan set error agar UX lebih baik
    } finally {
      setLoading(false);
    }
  };

  // Sample data untuk fallback
  const getSampleData = () => {
    return [
      {
        id: 1,
        title: "Catatan Penting",
        content: "Ini adalah contoh catatan penting yang perlu diperhatikan"
      },
      {
        id: 2,
        title: "Meeting Notes",
        content: "Diskusi tentang project baru dan timeline development"
      },
      {
        id: 3,
        title: "Urgent Task",
        content: "Segera selesaikan review code untuk fitur authentication"
      }
    ];
  };

  // Handle form submission for creating notes
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      // Tambah ke local state terlebih dahulu (Optimistic Update)
      const newNote = {
        id: notes.length + 1,
        ...dataForm,
        date: new Date().toLocaleDateString('id-ID', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        }),
      };

      setNotes(prev => [newNote, ...prev]);

      // Coba kirim ke API (opsional)
      try {
        await notesAPI.createNote(dataForm);
      } catch (apiErr) {
        console.log('API tidak tersedia, data disimpan secara lokal:', apiErr.message);
      }

      setSuccess("Catatan berhasil ditambahkan!");

      // Kosongkan Form setelah Success
      setDataForm({ title: "", content: "" });

      // Hilangkan pesan Success setelah 3 detik
      setTimeout(() => setSuccess(""), 3000);

      // Panggil Ulang loadNotes untuk refresh data dari API
      loadNotes();
      
    } catch (err) {
      setError(`Terjadi kesalahan: ${err.message}`);
      // Rollback jika ada error saat menambah ke local state
      setNotes(prev => prev.slice(1));
    } finally {
      setLoading(false);
    }
  };

  // Handle untuk aksi hapus data
  const handleDelete = async (id) => {
    const konfirmasi = confirm("Yakin ingin menghapus catatan ini?");
    if (!konfirmasi) return;

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      // Hapus dari local state terlebih dahulu (Optimistic Update)
      setNotes(prev => prev.filter(note => note.id !== id));

      // Coba kirim ke API
      try {
        await notesAPI.deleteNote(id);
      } catch (apiErr) {
        console.log('API tidak tersedia, data dihapus secara lokal:', apiErr.message);
      }

      setSuccess("Catatan berhasil dihapus!");

      // Hilangkan pesan Success setelah 3 detik
      setTimeout(() => setSuccess(""), 3000);

      // Panggil Ulang loadNotes untuk refresh data dari API
      loadNotes();
      
    } catch (err) {
      setError(`Terjadi kesalahan: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* ✅ HEADER */}
        <PageHeader
          title="Notes"
          breadcrumb={["Utilities", "Notes"]}
        />

        {/* FORM TAMBAH NOTES */}
        <Container>
          {error && <Alert type="danger">{error}</Alert>}
          {success && <Alert type="success">{success}</Alert>}

          {/* Form Card */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Tambah Catatan Baru
              </h3>
            </div>

            <div className="px-6 py-4">
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Judul Catatan
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={dataForm.title}
                    placeholder="Masukkan judul catatan"
                    onChange={handleChange}
                    disabled={loading}
                    required
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Isi Catatan
                  </label>
                  <textarea
                    name="content"
                    value={dataForm.content}
                    placeholder="Masukkan isi catatan"
                    onChange={handleChange}
                    disabled={loading}
                    required
                    rows="4"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {loading ? 'Mohon Tunggu...' : 'Tambah Data'}
                </button>
              </form>
            </div>
          </div>
        </Container>

        {/* NOTES TABLE */}
        <Container>
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Daftar Catatan ({notes.length})
              </h3>
            </div>

            {loading && <LoadingSpinner text="Memuat catatan..." />}

            {!loading && notes.length === 0 && !error && (
              <EmptyState text="Belum ada catatan. Tambah catatan pertama!" />
            )}

            {!loading && notes.length === 0 && error && (
              <EmptyState text="Terjadi Kesalahan. Coba lagi nanti." />
            )}

            {!loading && notes.length > 0 ? (
              <GenericTable
                columns={["#", "Judul", "Isi Catatan", "Aksi"]}
                data={notes}
                renderRow={(note, index) => (
                  <>
                    <td className="px-6 py-4">{index + 1}</td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-emerald-600">
                        {note.title}
                      </div>
                    </td>
                    <td className="px-6 py-4 max-w-xs">
                      <div className="truncate text-gray-600">
                        {note.content}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button className="text-blue-600 hover:text-blue-700 transition-colors">
                          <HiPencil size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(note.id)}
                          disabled={loading}
                          className="text-red-600 hover:text-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <HiTrash size={18} />
                        </button>
                      </div>
                    </td>
                  </>
                )}
              />
            ) : null}
          </div>
        </Container>
      </div>
    </div>
  );
}