import { Link } from 'react-router-dom'

function BusinessCard({ business }) {
  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow transition hover:-translate-y-1 hover:shadow-lg border-slate-300 border ">
      <Link to={`/business/${business.slug}`}>
        <img
          src={business.image_url || business.cover_image}
          alt={business.title}
          className="h-52 w-full object-cover"
        />
      </Link>

      <div className="p-5">
        <div className="mb-3 flex items-start justify-between gap-3">
          <h2 className="line-clamp-1 text-xl font-bold text-gray-900">
            {business.title}
          </h2>

          {business.is_featured && (
            <span className="shrink-0 rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-700">
              ویژه
            </span>
          )}
        </div>

        <p className="mb-4 line-clamp-2 text-sm text-gray-600">
          {business.description}
        </p>

        <div className="mb-4 space-y-1 text-sm text-gray-700">
          <p>دسته‌بندی: {business.categories?.name || '---'}</p>
          <p>شهر: {business.city}</p>
          <p>منطقه: {business.region || '---'}</p>
          <p>امتیاز: {business.rating_avg}</p>
        </div>

        <Link
          to={`/business/${business.slug}`}
          className="inline-flex rounded-xl bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
        >
          مشاهده جزئیات
        </Link>
      </div>
    </div>
  )
}

export default BusinessCard