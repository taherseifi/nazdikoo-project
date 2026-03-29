import { useId } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  MapPin,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, Autoplay } from 'swiper/modules'

import 'swiper/css'
import 'swiper/css/pagination'

const fallbackCityImages = [
  'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1460317442991-0ec209397118?q=80&w=1200&auto=format&fit=crop',
]

function ListingsByArea({ areas = [] }) {
  const navigate = useNavigate()
  const sliderId = useId().replace(/:/g, '')

  const prevButtonClass = `areas-prev-${sliderId}`
  const nextButtonClass = `areas-next-${sliderId}`

  return (
    <section className="bg-slate-100/70 px-4 py-16 md:px-6 md:py-20">
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

          <div className="flex items-center gap-3 self-start md:self-auto">
            <button
              type="button"
              onClick={() => navigate('/listings')}
              className="text-sm font-medium text-slate-600 transition hover:text-blue-600"
            >
              مشاهده بیشتر ←
            </button>

            {areas.length > 1 && (
              <div className="hidden items-center gap-2 md:flex">
                <button
                  type="button"
                  aria-label="اسلاید قبلی"
                  className={`${prevButtonClass} flex h-11 w-11 items-center justify-center rounded-full border border-slate-500 bg-white text-slate-700 shadow-sm transition hover:border-blue-600 hover:text-blue-600`}
                >
                  <ChevronRight className="h-5 w-5" />
                </button>

                <button
                  type="button"
                  aria-label="اسلاید بعدی"
                  className={`${nextButtonClass} flex h-11 w-11 items-center justify-center rounded-full border border-slate-500 bg-white text-slate-700 shadow-sm transition hover:border-blue-600 hover:text-blue-600`}
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {areas.length > 0 ? (
          <div className="relative">
            <Swiper
              modules={[Navigation, Pagination, Autoplay]}
              spaceBetween={24}
              loop={areas.length > 1}
              autoplay={
                areas.length > 1
                  ? {
                      delay: 3500,
                      disableOnInteraction: false,
                      pauseOnMouseEnter: true,
                    }
                  : false
              }
              navigation={
                areas.length > 1
                  ? {
                      prevEl: `.${prevButtonClass}`,
                      nextEl: `.${nextButtonClass}`,
                    }
                  : false
              }
              pagination={
                areas.length > 1
                  ? {
                      clickable: true,
                    }
                  : false
              }
              breakpoints={{
                0: {
                  slidesPerView: 1,
                },
                640: {
                  slidesPerView: 1,
                },
                768: {
                  slidesPerView: 2,
                },
                1024: {
                  slidesPerView: 3,
                },
                1280: {
                  slidesPerView: 4,
                },
              }}
              className="!pb-12"
            >
              {areas.map((area, index) => (
                <SwiperSlide key={`${area.city}-${index}`}>
                  <button
                    type="button"
                    onClick={() =>
                      navigate(`/listings?city=${encodeURIComponent(area.city)}`)
                    }
                    className="group relative block w-full overflow-hidden rounded-[28px] text-right shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                  >
                    <img
                      src={
                        area.image ||
                        fallbackCityImages[index % fallbackCityImages.length]
                      }
                      alt={area.city}
                      className="h-72 w-full object-cover transition duration-500 group-hover:scale-105"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

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
                </SwiperSlide>
              ))}
            </Swiper>

            {areas.length > 1 && (
              <div className="mt-5 flex items-center justify-center gap-2 md:hidden">
                <button
                  type="button"
                  aria-label="اسلاید قبلی"
                  className={`${prevButtonClass} flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-blue-600 hover:text-blue-600`}
                >
                  <ChevronRight className="h-5 w-5" />
                </button>

                <button
                  type="button"
                  aria-label="اسلاید بعدی"
                  className={`${nextButtonClass} flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-blue-600 hover:text-blue-600`}
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-3xl bg-white p-6 text-slate-500 shadow-sm">
            هنوز شهری برای نمایش وجود ندارد
          </div>
        )}
      </div>
    </section>
  )
}

export default ListingsByArea