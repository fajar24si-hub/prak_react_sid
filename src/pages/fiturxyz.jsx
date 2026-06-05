import PageHeader from "../components/PageHeader";
import Container from "../components/Container";

export default function FiturXyz() {
  return (
    <div>
      <PageHeader title="Fitur XYZ" />
      <Container>
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-4xl font-bold text-green-600 mb-4">
            Fitur XYZ
          </h1>
          <p className="text-lg text-gray-700 leading-relaxed">
            Ini adalah halaman untuk fitur XYZ. Anda dapat menambahkan konten 
            dan fungsionalitas sesuai kebutuhan.
          </p>
        </div>
      </Container>
    </div>
  );
}
