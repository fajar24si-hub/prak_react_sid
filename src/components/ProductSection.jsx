import ProductCard from "./ProductCard";

export default function ProductSection({ title, products = [] }) {
  return (
    <section className="py-16 px-4">
      <h2 className="text-3xl font-bold text-center mb-10">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            image={product.image}
            title={product.title}
            category={product.category}
            price={product.price}
            description={product.description}
          />
        ))}
      </div>
    </section>
  );
}
