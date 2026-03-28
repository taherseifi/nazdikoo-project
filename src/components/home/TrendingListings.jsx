import { Link, useNavigate } from 'react-router-dom'
import { useMemo } from 'react'
import { BadgeCheck, ChevronLeft, ChevronRight, MapPin, Star } from 'lucide-react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'

function RatingStars({ rating = 0 }) {
  const normalized = Math.max(0, Math.min(5, Number(rating) || 0))
  const fullStars = Math.round(normalized)

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${
            star <= fullStars
              ? 'fill-amber-400 text-amber-400'
              : 'text-slate-300'
          }`}
        />
      ))}
    </div>
  )
}

function TrendingListings({ businesses = [] }) {
  const navigate = useNavigate()

  const featuredBusinesses = useMemo(() => {
    return (businesses || []).filter(
      (business) => business?.is_featured && business?.is_approved
    )
  }, [businesses])

  return (
    <section className="bg-white px-4 py-16 md:px-6 md:py-20">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h2 className="text-3xl font-bold text-slate-800 md:text-5xl">
              خدمات ویژه
            </h2>
            <p className="mt-3 text-base text-slate-500">
              مجموعه‌ای از خدمات تاییدشده و پیشنهادی نزدیکو
            </p>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/listings')}
              className="text-sm font-medium text-slate-600 transition hover:text-blue-600"
            >
              مشاهده بیشتر ←
            </button>

            <div className="hidden items-center gap-2 md:flex">
              <button className="trending-prev flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-100">
                <ChevronRight className="h-5 w-5" />
              </button>
              <button className="trending-next flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-100">
                <ChevronLeft className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {featuredBusinesses.length === 0 ? (
          <div className="rounded-3xl bg-slate-50 p-6 text-slate-500">
            هنوز خدمت ویژه‌ای برای نمایش وجود ندارد
          </div>
        ) : (
          <Swiper
            modules={[Navigation]}
            navigation={{
              nextEl: '.trending-next',
              prevEl: '.trending-prev',
            }}
            spaceBetween={24}
            slidesPerView={1}
            breakpoints={{
              768: {
                slidesPerView: 2,
              },
              1200: {
                slidesPerView: 3,
              },
            }}
          >
            {featuredBusinesses.map((business) => (
              <SwiperSlide key={business.id}>
                <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-slate-950 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
                  <Link
                    to={`/business/${business.slug}`}
                    className="relative block overflow-hidden"
                  >
                    <img
                      src={business.image_url || business.cover_image}
                      alt={business.title}
                      className="h-80 w-full object-cover transition duration-500 hover:scale-105"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-transparent" />

                    <div className="absolute right-4 top-4 flex flex-wrap gap-2">
                      <span className="rounded-full bg-white/95 px-3 py-1 text-xs font-medium text-slate-700 shadow">
                        ویژه
                      </span>

                      {business.categories?.name && (
                        <span className="rounded-full bg-pink-500 px-3 py-1 text-xs font-medium text-white shadow">
                          {business.categories.name}
                        </span>
                      )}
                    </div>

                    <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                      <div className="mb-2 flex items-center gap-2">
                        <h3 className="text-2xl font-bold">{business.title}</h3>
                        <BadgeCheck className="h-5 w-5 text-emerald-400" />
                      </div>

                      <div className="flex items-center gap-2 text-sm text-white/90">
                        <MapPin className="h-4 w-4" />
                        <span>
                          {business.city}
                          {business.country ? `، ${business.country}` : ''}
                        </span>
                      </div>
                    </div>
                  </Link>

                  <div className="flex items-center justify-between bg-white px-5 py-4">
                    <div className="flex items-center gap-3">
                      <RatingStars rating={business.rating_avg} />
                      <span className="font-semibold text-slate-700">
                        {Number(business.rating_avg || 0).toFixed(1)}
                      </span>
                      <span className="text-sm text-slate-500">
                        ({business.reviews_count || 0} نظر)
                      </span>
                    </div>

                    <Link
                      to={`/business/${business.slug}`}
                      className="text-sm font-medium text-blue-600 hover:text-blue-700"
                    >
                      مشاهده
                    </Link>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        )}
      </div>
    </section>
  )
}

export default TrendingListings