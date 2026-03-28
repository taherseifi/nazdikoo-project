import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import { getPublishedBlogs } from '../../services/supabase/blogs.api'

function BlogSection() {
  const navigate = useNavigate()
  const [blogs, setBlogs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadBlogs() {
      try {
        const data = await getPublishedBlogs(6)
        setBlogs(data)
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    loadBlogs()
  }, [])

  return (
    <section className="bg-white px-4 py-16 md:px-6 md:py-20">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h2 className="text-3xl font-bold text-slate-800 md:text-5xl">
              وبلاگ نزدیکو
            </h2>
            <p className="mt-3 text-base text-slate-500">
              مقاله‌ها و نکات کاربردی درباره خدمات و انتخاب بهتر
            </p>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/blogs')}
              className="text-sm font-medium text-slate-600 transition hover:text-blue-600"
            >
              مشاهده بیشتر ←
            </button>

            <div className="hidden items-center gap-2 md:flex">
              <button className="blog-prev flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-100">
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button className="blog-next flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-100">
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div>در حال بارگذاری بلاگ‌ها...</div>
        ) : blogs.length === 0 ? (
          <div className="rounded-3xl bg-slate-50 p-6 text-slate-500">
            هنوز بلاگی منتشر نشده
          </div>
        ) : (
          <Swiper
            modules={[Navigation]}
            navigation={{
              nextEl: '.blog-next',
              prevEl: '.blog-prev',
            }}
            spaceBetween={24}
            slidesPerView={1}
            breakpoints={{
              768: { slidesPerView: 2 },
              1200: { slidesPerView: 3 },
            }}
          >
            {blogs.map((post) => (
              <SwiperSlide key={post.id}>
                <article className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
                  <Link to={`/blogs/${post.slug}`}>
                    <img
                      src={post.thumbnail_url}
                      alt={post.title}
                      className="h-64 w-full object-cover"
                    />
                  </Link>

                  <div className="p-6">
                    <Link to={`/blogs/${post.slug}`}>
                      <h3 className="line-clamp-2 text-2xl font-bold text-slate-800">
                        {post.title}
                      </h3>
                    </Link>

                    <p className="mt-4 line-clamp-3 text-base leading-8 text-slate-500">
                      {post.excerpt}
                    </p>

                    <div className="mt-6 flex items-center gap-2 text-sm text-slate-500">
                      <CalendarDays className="h-4 w-4" />
                      <span>
                        {new Date(post.created_at).toLocaleDateString('fa-IR')}
                      </span>
                    </div>
                  </div>
                </article>
              </SwiperSlide>
            ))}
          </Swiper>
        )}
      </div>
    </section>
  )
}

export default BlogSection