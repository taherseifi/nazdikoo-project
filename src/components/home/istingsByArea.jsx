import { useNavigate } from 'react-router-dom'
import { MapPin } from 'lucide-react'

function ListingsByArea({ areas = [] }) {
  const navigate = useNavigate()

  return (
    <section className="bg-slate-50 px-4 py-16 md:px-6 md:py-20">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h2 className="text-3xl font-bold text-slate-800 md:text-5xl">
              خدمات بر اساس شهر
            </h2>
            <p className="mt-3 text-base text-slate-500">
              خدمات فعال و تاییدشده در شهرهای مختلف
            </p>
          </div>

          <button
            onClick={() => navigate('/listings')}
            className="text-sm font-medium text-slate-600 transition hover:text-blue-600"
          >
            مشاهده بیشتر ←
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          {areas.map((area) => (
            <button
              key={area.city}
              onClick={() => navigate(`/listings?city=${encodeURIComponent(area.city)}`)}
              className="group relative overflow-hidden rounded-[28px] text-right shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <img
                src={
                  area.image ||
                  'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?q=80&w=1200&auto=format&fit=crop'
                }
                alt={area.city}
                className="h-72 w-full object-cover transition duration-500 group-hover:scale-105"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

              <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                <div className="mb-2 flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-amber-400" />
                  <h3 className="text-2xl font-bold">{area.city}</h3>
                </div>

                <p className="text-sm text-white/90">
                  {area.count} خدمت فعال
                </p>
              </div>
            </button>
          ))}

          {areas.length === 0 && (
            <div className="rounded-3xl bg-white p-6 text-slate-500">
              هنوز شهری برای نمایش وجود ندارد
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default ListingsByArea