import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Layout from '../components/layout/Layout'
import Seo from '../components/common/Seo'
import StructuredData from '../components/common/StructuredData'
import PageHero from '../components/common/PageHero'
import BlogContentViewer from '../components/blog/BlogContentViewer'
import { CalendarDays } from 'lucide-react'
import JsonLd from '../components/seo/JsonLd'
import {
  buildBlogSchema,
  buildBreadcrumbSchema,
} from '../utils/schema'
import { getSeoEntry } from '../services/supabase/seo.api'
import { buildSeoPayload } from '../utils/seo/buildSeoPayload'
import { getCanonicalUrl } from '../utils/seo/getCanonicalUrl'

import {
  getBlogById,
  getBlogBySlug,
  getPublishedBlogs,
} from '../services/supabase/blogs.api'
import {
  createBlogComment,
  getBlogComments,
} from '../services/supabase/blogComments.api'
import {
  getBusinesses,
  getFeaturedBusinesses,
} from '../services/supabase/businesses.api'

function BlogDetails() {
  const { id, slug } = useParams()

  const [blog, setBlog] = useState(null)
  const [seoEntry, setSeoEntry] = useState(null)
  const [comments, setComments] = useState([])
  const [recentBlogs, setRecentBlogs] = useState([])
  const [featuredServices, setFeaturedServices] = useState([])
  const [latestServices, setLatestServices] = useState([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    name: '',
    email: '',
    comment: '',
  })

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        setError('')

        const blogData = id
          ? await getBlogById(id)
          : await getBlogBySlug(slug)

        setBlog(blogData)

        const [
          seoData,
          commentsData,
          blogsData,
          featuredData,
          latestData,
        ] = await Promise.all([
          getSeoEntry('blog', blogData.id),
          getBlogComments(blogData.id),
          getPublishedBlogs(6),
          getFeaturedBusinesses(3),
          getBusinesses(),
        ])

        setSeoEntry(seoData)
        setComments(commentsData || [])

        const filteredRecentBlogs = (blogsData || []).filter(
          (item) => item.slug !== blogData.slug
        )

        setRecentBlogs(
          filteredRecentBlogs.length > 0
            ? filteredRecentBlogs.slice(0, 5)
            : (blogsData || []).slice(0, 5)
        )

        setFeaturedServices((featuredData || []).slice(0, 3))
        setLatestServices((latestData || []).slice(0, 3))
      } catch (err) {
        console.error(err)
        setError(err?.message || 'خطا در دریافت بلاگ')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [id, slug])

  function handleChange(e) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()

    if (!blog) return

    try {
      setError('')

      await createBlogComment({
        blog_id: blog.id,
        name: form.name,
        email: form.email,
        comment: form.comment,
      })

      const newComments = await getBlogComments(blog.id)
      setComments(newComments || [])

      setForm({
        name: '',
        email: '',
        comment: '',
      })
    } catch (err) {
      console.error(err)
      setError(err?.message || 'ثبت نظر انجام نشد')
    }
  }

  const seo = useMemo(() => {
    if (!blog) return null

    return buildSeoPayload({
      seoEntry,
      path: `/blogs/${blog.slug}`,
      fallback: {
        title: blog.meta_title || blog.title,
        description: blog.meta_description || blog.excerpt || 'مشاهده جزئیات مقاله',
        image: blog.thumbnail_url || '',
      },
    })
  }, [blog, seoEntry])

const blogSchema = useMemo(() => {
  return buildBlogSchema(blog)
}, [blog])

const breadcrumbSchema = useMemo(() => {
  if (!blog) return null

  return buildBreadcrumbSchema([
    { name: 'خانه', url: '/' },
    { name: 'بلاگ', url: '/blogs' },
    { name: blog.title, url: `/blogs/${blog.slug}` },
  ])
}, [blog])
  const articleSchema = useMemo(() => {
    if (!blog) return null

    return {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: blog.title || '',
      description: blog.excerpt || '',
      image: blog.thumbnail_url ? [blog.thumbnail_url] : [],
      author: {
        '@type': 'Person',
        name: blog.author_name || 'Admin',
      },
      datePublished: blog.created_at || undefined,
      dateModified: blog.updated_at || blog.created_at || undefined,
      mainEntityOfPage: getCanonicalUrl(`/blogs/${blog.slug}`),
    }
  }, [blog])

  if (loading) {
    return (
      <Layout>
        <div className="px-4 pt-32 pb-16 md:px-6">در حال بارگذاری...</div>
      </Layout>
    )
  }

  if (error && !blog) {
    return (
      <Layout>
        <div className="px-4 pt-32 pb-16 text-red-500 md:px-6">{error}</div>
      </Layout>
    )
  }

  if (!blog) {
    return (
      <Layout>
        <div className="px-4 pt-32 pb-16 text-red-500 md:px-6">بلاگ پیدا نشد</div>
      </Layout>
    )
  }

  return (
    <Layout>
      {seo ? (
        <>
          <Seo
            title={seo.title}
            description={seo.description}
            image={seo.image}
            url={seo.url}
            robots={seo.robots}
            ogTitle={seo.ogTitle}
            ogDescription={seo.ogDescription}
            type="article"
          />
       
          <StructuredData data={seoEntry?.custom_schema_json || articleSchema} />
          <JsonLd data={blogSchema} />
          <JsonLd data={breadcrumbSchema} />
        </>
      ) : null}

      <PageHero title={blog.title} subtitle={blog.excerpt} />

      <section className="bg-slate-50 px-4 py-12 md:px-6">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="rounded-[28px] bg-white p-6 shadow-sm md:p-8">
            {blog.thumbnail_url && (
              <figure className="mb-8">
                <img
                  src={blog.thumbnail_url}
                  alt={blog.featured_image_alt || blog.title}
                  title={blog.featured_image_title || blog.title}
                  className="h-[300px] w-full rounded-[24px] object-cover md:h-[480px]"
                />
                {blog.featured_image_description && (
                  <figcaption className="mt-3 text-center text-sm text-slate-500">
                    {blog.featured_image_description}
                  </figcaption>
                )}
              </figure>
            )}

            <h1 className="text-3xl font-bold text-slate-800 md:text-5xl">
              {blog.title}
            </h1>

            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-slate-500">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4" />
                <span>
                  {new Date(blog.created_at).toLocaleDateString('fa-IR')}
                </span>
              </div>
              <span>{blog.author_name || 'Admin'}</span>
            </div>

            <div className="mt-8">
              <BlogContentViewer
                contentJson={blog.content_json}
                contentHtml={blog.content_html}
              />
            </div>

            <section className="mt-12 rounded-[24px] bg-slate-50 p-6">
              <h2 className="mb-5 text-2xl font-bold text-slate-800">
                نظرات این بلاگ
              </h2>

              <div className="space-y-4">
                {comments.length === 0 ? (
                  <div className="rounded-2xl bg-white p-4 text-slate-500">
                    هنوز نظری ثبت نشده
                  </div>
                ) : (
                  comments.map((item) => (
                    <div key={item.id} className="rounded-2xl bg-white p-4 shadow-sm">
                      <div className="mb-2 font-semibold text-slate-800">
                        {item.name}
                      </div>
                      <div className="leading-8 text-slate-600">
                        {item.comment || item.message}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>

            <section className="mt-10 rounded-[24px] bg-slate-50 p-6">
              <h2 className="mb-5 text-2xl font-bold text-slate-800">
                ثبت نظر
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="نام"
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500"
                  />

                  <input
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="ایمیل"
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500"
                  />
                </div>

                <textarea
                  name="comment"
                  value={form.comment}
                  onChange={handleChange}
                  placeholder="نظر شما"
                  rows={6}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500"
                />

                {error ? (
                  <div className="rounded-2xl bg-red-50 p-4 text-red-600">
                    {error}
                  </div>
                ) : null}

                <button
                  type="submit"
                  className="rounded-2xl bg-blue-600 px-6 py-3 font-medium text-white transition hover:bg-blue-700"
                >
                  ثبت نظر
                </button>
              </form>
            </section>

            <div className="mt-10 block xl:hidden">
              <SidebarSection
                title="آخرین خدمات"
                items={latestServices}
                type="service"
              />
            </div>
          </div>

          <aside className="space-y-6">
            <SidebarSection
              title="پست‌های اخیر"
              items={recentBlogs}
              type="blog"
            />

            <SidebarSection
              title="خدمات ویژه"
              items={featuredServices}
              type="service"
            />

            <div className="hidden xl:block">
              <SidebarSection
                title="آخرین خدمات"
                items={latestServices}
                type="service"
              />
            </div>
          </aside>
        </div>
      </section>
    </Layout>
  )
}

function SidebarSection({ title, items = [], type = 'blog' }) {
  return (
    <div className="rounded-[28px] bg-white p-5 shadow-sm">
      <h3 className="mb-5 text-2xl font-bold text-slate-800">{title}</h3>

      {items.length === 0 ? (
        <p className="text-sm text-slate-500">موردی برای نمایش وجود ندارد</p>
      ) : type === 'blog' ? (
        <div className="space-y-4">
          {items.map((item) => (
            <Link
              key={item.id}
              to={`/blogs/${item.slug}`}
              className="block rounded-2xl p-3 transition hover:bg-slate-50"
            >
              <div className="font-medium leading-7 text-slate-700">
                {item.title}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <Link
              key={item.id}
              to={`/business/${item.slug}`}
              className="flex items-center gap-3 rounded-2xl p-2 transition hover:bg-slate-50"
            >
              <img
                src={item.image_url || item.cover_image}
                alt={item.title}
                className="h-16 w-16 rounded-xl object-cover"
              />

              <div className="min-w-0 flex-1">
                <div className="line-clamp-1 font-medium text-slate-700">
                  {item.title}
                </div>
                <div className="mt-1 text-sm text-slate-500">{item.city}</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export default BlogDetails