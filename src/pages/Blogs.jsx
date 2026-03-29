import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../components/layout/Layout'
import PageHero from '../components/common/PageHero'
import Seo from '../components/common/Seo'
import StructuredData from '../components/common/StructuredData'
import { getPublishedBlogs } from '../services/supabase/blogs.api'
import { getSeoEntry } from '../services/supabase/seo.api'
import { buildSeoPayload } from '../utils/seo/buildSeoPayload'
import { getCanonicalUrl } from '../utils/seo/getCanonicalUrl'
import { CalendarDays } from 'lucide-react'

function Blogs() {
  const [blogs, setBlogs] = useState([])
  const [seoEntry, setSeoEntry] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadBlogs() {
      try {
        setLoading(true)
        const [blogsData, seoData] = await Promise.all([
          getPublishedBlogs(),
          getSeoEntry('static_page', 'blogs'),
        ])

        setBlogs(blogsData || [])
        setSeoEntry(seoData)
      } catch (err) {
        setError(err.message || 'خطا در دریافت بلاگ‌ها')
      } finally {
        setLoading(false)
      }
    }

    loadBlogs()
  }, [])

  const seo = useMemo(() => {
    return buildSeoPayload({
      seoEntry,
      path: '/blogs',
      fallback: {
        title: 'وبلاگ نزدیکو | مقاله‌ها و راهنمای خدمات ایرانی',
        description: 'مقاله‌ها و نکات کاربردی نزدیکو درباره خدمات، انتخاب بهتر و معرفی کسب‌وکارهای ایرانی.',
        image: blogs?.[0]?.thumbnail_url || '',
      },
    })
  }, [seoEntry, blogs])

  const blogsSchema = useMemo(() => {
    return {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: 'وبلاگ نزدیکو',
      description: 'مقاله‌ها و نکات کاربردی نزدیکو درباره خدمات، انتخاب بهتر و معرفی کسب‌وکارها.',
      url: getCanonicalUrl('/blogs'),
    }
  }, [])

  return (
    <Layout>
      <Seo
        title={seo.title}
        description={seo.description}
        image={seo.image}
        url={seo.url}
        robots={seo.robots}
        ogTitle={seo.ogTitle}
        ogDescription={seo.ogDescription}
      />
      <StructuredData data={seoEntry?.custom_schema_json || blogsSchema} />

      <PageHero
        title="وبلاگ"
        subtitle="مقاله‌ها و نکات کاربردی نزدیکو درباره خدمات، انتخاب بهتر و معرفی کسب‌وکارها."
      />

      <section className="bg-slate-50 px-4 py-12 md:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 rounded-[28px] bg-white p-6 shadow-sm md:p-8">
            <h1 className="text-3xl font-bold text-slate-800 md:text-5xl">وبلاگ نزدیکو</h1>
            <p className="mt-4 leading-8 text-slate-600">
              در وبلاگ نزدیکو می‌توانی مقاله‌ها و راهنماهای کاربردی درباره پیدا کردن
              خدمات ایرانی، انتخاب بهتر کسب‌وکارها، بررسی دسته‌بندی‌های مختلف و
              نکات مهم مربوط به زندگی و استفاده از خدمات در شهرهای مختلف را بخوانی.
            </p>
          </div>

          {loading && <div>در حال بارگذاری...</div>}
          {error && <div className="text-red-500">{error}</div>}

          {!loading && !error && (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {blogs.map((blog) => (
                <article
                  key={blog.id}
                  className="overflow-hidden rounded-[28px] border border-slate-300 bg-white shadow-lg transition hover:-translate-y-1 hover:shadow-md"
                >
                  <Link to={`/blogs/${blog.slug}`}>
                    <img
                      src={blog.thumbnail_url}
                      alt={blog.featured_image_alt || blog.title}
                      className="h-64 w-full object-cover"
                    />
                  </Link>

                  <div className="p-6">
                    <Link to={`/blogs/${blog.slug}`}>
                      <h2 className="line-clamp-2 text-2xl font-bold text-slate-800">{blog.title}</h2>
                    </Link>

                    <p className="mt-3 line-clamp-3 text-slate-500">{blog.excerpt}</p>

                    <div className="mt-5 flex items-center gap-2 text-sm text-slate-500">
                      <CalendarDays className="h-4 w-4" />
                      <span>{new Date(blog.created_at).toLocaleDateString('fa-IR')}</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </Layout>
  )
}

export default Blogs
