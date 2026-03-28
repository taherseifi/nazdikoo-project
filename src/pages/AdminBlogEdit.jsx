import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import BlogPostForm from '../components/admin/blog/BlogPostForm'
import { getBlogById, updateBlog } from '../services/supabase/blogs.api'
import { getSeoEntry, upsertSeoEntry } from '../services/supabase/seo.api'

export default function AdminBlogEdit() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(false)
  const [pageLoading, setPageLoading] = useState(true)
  const [initialData, setInitialData] = useState(null)

  useEffect(() => {
    async function fetchBlogData() {
      try {
        setPageLoading(true)

        const blog = await getBlogById(id)
        const seoEntry = await getSeoEntry('blog', id)

        setInitialData({
          ...blog,
          canonical_url: seoEntry?.canonical_url || '',
          og_title: seoEntry?.og_title || '',
          og_description: seoEntry?.og_description || '',
          og_image: seoEntry?.og_image || '',
          robots_index:
            typeof seoEntry?.robots_index === 'boolean'
              ? seoEntry.robots_index
              : true,
          robots_follow:
            typeof seoEntry?.robots_follow === 'boolean'
              ? seoEntry.robots_follow
              : true,
          schema_type: seoEntry?.schema_type || 'Article',
          custom_schema_json: seoEntry?.custom_schema_json || null,
        })
      } catch (error) {
        console.error(error)
        window.alert(error?.message || 'دریافت اطلاعات بلاگ انجام نشد')
      } finally {
        setPageLoading(false)
      }
    }

    fetchBlogData()
  }, [id])

  async function handleUpdateBlog(payload) {
    try {
      setLoading(true)

      const { seo, ...blogPayload } = payload

      await updateBlog(id, blogPayload)

      if (seo) {
        await upsertSeoEntry({
          ...seo,
          page_type: 'blog',
          entity_id: String(id),
          slug: blogPayload.slug,
        })
      }

      window.alert('بلاگ با موفقیت بروزرسانی شد')
      navigate('/admin/blogs')
    } catch (error) {
      console.error(error)
      window.alert(error?.message || 'ویرایش بلاگ انجام نشد')
    } finally {
      setLoading(false)
    }
  }

  if (pageLoading) {
    return (
      <div className="rounded-3xl bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-500">در حال دریافت اطلاعات بلاگ...</p>
      </div>
    )
  }

  if (!initialData) {
    return (
      <div className="rounded-3xl bg-white p-6 shadow-sm">
        <p className="text-sm text-red-500">اطلاعات بلاگ پیدا نشد.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">ویرایش بلاگ</h1>
        <p className="mt-2 text-sm text-slate-500">
          محتوای مقاله و تنظیمات سئوی آن را بروزرسانی کن.
        </p>
      </div>

      <BlogPostForm
        initialData={initialData}
        loading={loading}
        onSubmit={handleUpdateBlog}
      />
    </div>
  )
}