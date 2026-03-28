import { useNavigate } from 'react-router-dom'

function Categories({ categories }) {
  const navigate = useNavigate()

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
      {categories.map((cat) => (
        <div
          key={cat.id}
          onClick={() => navigate(`/listings?category=${cat.slug}`)}
          className="cursor-pointer rounded-2xl bg-white p-4 shadow transition hover:shadow-lg"
        >
          <div className="text-lg font-semibold">{cat.name}</div>
          <div className="text-sm text-gray-500">{cat.slug}</div>
        </div>
      ))}
    </div>
  )
}

export default Categories