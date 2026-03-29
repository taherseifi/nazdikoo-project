import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import BlogPostForm from '../components/admin/blog/BlogPostForm'
import { createBlog } from '../services/supabase/blogs.api'
import { upsertSeoEntry } from '../services/supabase/seo.api'

export default function AdminBlogCreate() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  async function handleCreateBlog(payload) {
    try {
      setLoading(true)

      const { seo, ...blogPayload } = payload

      const createdBlog = await createBlog(blogPayload)

      if (seo) {
        await upsertSeoEntry({
          ...seo,
          page_type: 'blog',
          entity_id: String(createdBlog.id),
          slug: blogPayload.slug,
        })
      }

      window.alert('بلاگ با موفقیت ایجاد شد')
      navigate('/admin/blogs')
    } catch (error) {
      console.error(error)
      window.alert(error?.message || 'ایجاد بلاگ انجام نشد')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 p-5 bg-slate-500">
      <div className="rounded-3xl bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">ایجاد بلاگ جدید</h1>
        <p className="mt-2 text-sm text-slate-500">
          مقاله جدید را ایجاد کن و همزمان تنظیمات سئو را هم ثبت کن.
        </p>
      </div>

      <BlogPostForm
        loading={loading}
        onSubmit={handleCreateBlog}
      />
    </div>
  )
}