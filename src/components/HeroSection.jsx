export default function HeroSection({ title, subtitle, buttonText }) {
  return (
    <section className="bg-blue-600 text-white py-20 px-4 text-center">
      <h1 className="text-4xl font-bold mb-4">{title}</h1>
      <p className="text-blue-100 text-lg mb-8">{subtitle}</p>
      <button className="bg-white text-blue-600 font-bold px-6 py-3 rounded-lg hover:bg-blue-50">
        {buttonText}
      </button>
    </section>
  );
}
