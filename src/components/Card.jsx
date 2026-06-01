export default function Card({ children }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow p-5">
      {children}
    </div>
  );
}
