export default function FeatureSection({ features = [] }) {
  return (
    <section className="py-16 px-4 bg-gray-50">
      <h2 className="text-3xl font-bold text-center mb-10">Fitur Unggulan</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {features.map((feature, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow p-6 text-center"
          >
            <div className="text-4xl mb-4">{feature.icon}</div>
            <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
            <p className="text-gray-600">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
