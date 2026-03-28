import { useMemo, useState } from 'react'
import { Eye, Save, Send } from 'lucide-react'
import RichTextEditor from '../../editor/RichTextEditor'
import SeoScorePanel from '../../editor/SeoScorePanel'
import BlogContentViewer from '../../blog/BlogContentViewer'
import { uploadBlogFeaturedImage } from '../../../services/supabase/blogEditorStorage.api'

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-آ-ی]/g, '')
}

function safeJsonParse(value) {
  if (!value) return null
  if (typeof value === 'object') return value

  try {
    return JSON.parse(value)
  } catch {
    return null
  }
}

function getInitialSeo(initialData) {
  return {
    page_type: 'blog',
    entity_id: initialData?.id ? String(initialData.id) : '',
    meta_title: initialData?.meta_title || '',
    meta_description: initialData?.meta_description || '',
    slug: initialData?.slug || '',
    canonical_url: initialData?.canonical_url || '',
    og_title: initialData?.og_title || '',
    og_description: initialData?.og_description || '',
    og_image: initialData?.og_image || initialData?.thumbnail_url || '',
    robots_index:
      typeof initialData?.robots_index === 'boolean'
        ? initialData.robots_index
        : true,
    robots_follow:
      typeof initialData?.robots_follow === 'boolean'
        ? initialData.robots_follow
        : true,
    focus_keyword: initialData?.focus_keyword || '',
    schema_type: initialData?.schema_type || 'Article',
    custom_schema_json: safeJsonParse(initialData?.custom_schema_json),
  }
}

function buildDefaultArticleSchema({
  title,
  description,
  image,
  slug,
  authorName,
}) {
  const baseUrl = import.meta.env.VITE_SITE_URL || 'https://example.com'
  const url = `${baseUrl}/blog/${slug}`

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title || '',
    description: description || '',
    image: image ? [image] : [],
    author: {
      '@type': 'Person',
      name: authorName || 'Admin',
    },
    mainEntityOfPage: url,
  }
}

export default function BlogPostForm({
  initialData,
  loading,
  onSubmit,
}) {
  const [title, setTitle] = useState(initialData?.title || '')
  const [slug, setSlug] = useState(initialData?.slug || '')
  const [excerpt, setExcerpt] = useState(initialData?.excerpt || '')
  const [thumbnailUrl, setThumbnailUrl] = useState(initialData?.thumbnail_url || '')
  const [thumbnailUploading, setThumbnailUploading] = useState(false)
  const [editorValue, setEditorValue] = useState({
    json: initialData?.content_json || null,
    html: initialData?.content_html || '',
    text: '',
  })
  const [previewOpen, setPreviewOpen] = useState(false)
  const [seo, setSeo] = useState(getInitialSeo(initialData))
  const [schemaText, setSchemaText] = useState(
    initialData?.custom_schema_json
      ? JSON.stringify(safeJsonParse(initialData.custom_schema_json), null, 2)
      : ''
  )

  const resolvedSlug = useMemo(() => {
    return seo.slug?.trim() || slug || slugify(title)
  }, [seo.slug, slug, title])

  const effectiveMetaTitle = useMemo(() => {
    return seo.meta_title?.trim() || title
  }, [seo.meta_title, title])

  const effectiveMetaDescription = useMemo(() => {
    return seo.meta_description?.trim() || excerpt
  }, [seo.meta_description, excerpt])

  const effectiveOgTitle = useMemo(() => {
    return seo.og_title?.trim() || effectiveMetaTitle
  }, [seo.og_title, effectiveMetaTitle])

  const effectiveOgDescription = useMemo(() => {
    return seo.og_description?.trim() || effectiveMetaDescription
  }, [seo.og_description, effectiveMetaDescription])

  const effectiveOgImage = useMemo(() => {
    return seo.og_image?.trim() || thumbnailUrl
  }, [seo.og_image, thumbnailUrl])

  const effectiveCanonicalUrl = useMemo(() => {
    if (seo.canonical_url?.trim()) return seo.canonical_url.trim()

    const baseUrl = import.meta.env.VITE_SITE_URL || 'https://example.com'
    return `${baseUrl}/blog/${resolvedSlug}`
  }, [seo.canonical_url, resolvedSlug])

  async function handleFeaturedImage(file) {
    if (!file) return

    try {
      setThumbnailUploading(true)
      const url = await uploadBlogFeaturedImage(file)
      setThumbnailUrl(url)

      setSeo((prev) => ({
        ...prev,
        og_image: prev.og_image || url,
      }))
    } catch (err) {
      window.alert(err.message || 'آپلود تصویر شاخص انجام نشد')
    } finally {
      setThumbnailUploading(false)
    }
  }

  function handleSeoChange(e) {
    const { name, value, type, checked } = e.target

    setSeo((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  function handleSchemaTextChange(e) {
    const value = e.target.value
    setSchemaText(value)

    if (!value.trim()) {
      setSeo((prev) => ({
        ...prev,
        custom_schema_json: null,
      }))
      return
    }

    try {
      const parsed = JSON.parse(value)
      setSeo((prev) => ({
        ...prev,
        custom_schema_json: parsed,
      }))
    } catch {
      // intentionally ignored while typing
    }
  }

  function buildPayload(isPublished) {
    const customSchema =
      seo.custom_schema_json ||
      (seo.schema_type === 'Article'
        ? buildDefaultArticleSchema({
            title,
            description: effectiveMetaDescription,
            image: effectiveOgImage,
            slug: resolvedSlug,
            authorName: initialData?.author_name || 'Admin',
          })
        : null)

    return {
      title,
      slug: resolvedSlug,
      excerpt,
      thumbnail_url: thumbnailUrl,
      content_json: editorValue?.json || null,
      content_html: editorValue?.html || '',
      is_published: isPublished,
      author_name: initialData?.author_name || 'Admin',

      // compatibility with existing blogs table
      meta_title: effectiveMetaTitle,
      meta_description: effectiveMetaDescription,
      focus_keyword: seo.focus_keyword || '',

      // centralized SEO payload
      seo: {
        page_type: 'blog',
        entity_id: initialData?.id ? String(initialData.id) : '',
        meta_title: effectiveMetaTitle,
        meta_description: effectiveMetaDescription,
        slug: resolvedSlug,
        canonical_url: effectiveCanonicalUrl,
        og_title: effectiveOgTitle,
        og_description: effectiveOgDescription,
        og_image: effectiveOgImage,
        robots_index: Boolean(seo.robots_index),
        robots_follow: Boolean(seo.robots_follow),
        focus_keyword: seo.focus_keyword || '',
        schema_type: seo.schema_type || 'Article',
        custom_schema_json: customSchema,
      },
    }
  }

  const googlePreviewTitle = effectiveMetaTitle || 'عنوان صفحه'
  const googlePreviewDescription =
    effectiveMetaDescription || 'توضیحات متا اینجا نمایش داده می‌شود.'
  const googlePreviewUrl = effectiveCanonicalUrl

  return (
    <div className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1fr)_340px]">
      <div className="space-y-6">
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <label className="block md:col-span-2">
              <span className="mb-2 block text-sm font-medium text-slate-800">
                عنوان مقاله
              </span>
              <input
                value={title}
                onChange={(e) => {
                  const next = e.target.value
                  setTitle(next)

                  if (!slug) setSlug(slugify(next))

                  setSeo((prev) => ({
                    ...prev,
                    meta_title: prev.meta_title || next,
                  }))
                }}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-800">
                Slug
              </span>
              <input
                value={resolvedSlug}
                onChange={(e) => {
                  const next = e.target.value
                  setSlug(next)
                  setSeo((prev) => ({ ...prev, slug: next }))
                }}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-800">
                کلمه کلیدی اصلی
              </span>
              <input
                name="focus_keyword"
                value={seo.focus_keyword}
                onChange={handleSeoChange}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
              />
            </label>

            <label className="block md:col-span-2">
              <span className="mb-2 block text-sm font-medium text-slate-800">
                خلاصه کوتاه
              </span>
              <textarea
                rows={3}
                value={excerpt}
                onChange={(e) => {
                  const next = e.target.value
                  setExcerpt(next)

                  setSeo((prev) => ({
                    ...prev,
                    meta_description: prev.meta_description || next,
                  }))
                }}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
              />
            </label>

            <label className="block md:col-span-2">
              <span className="mb-2 block text-sm font-medium text-slate-800">
                تصویر شاخص
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFeaturedImage(e.target.files?.[0])}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3"
              />
              {thumbnailUploading && (
                <div className="mt-2 text-sm text-slate-500">در حال آپلود...</div>
              )}
              {thumbnailUrl && (
                <img
                  src={thumbnailUrl}
                  alt="featured"
                  className="mt-4 h-56 w-full rounded-2xl object-cover"
                />
              )}
            </label>
          </div>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-bold text-slate-800">محتوای مقاله</h3>
          <RichTextEditor value={editorValue} onChange={setEditorValue} />
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <h3 className="mb-5 text-lg font-bold text-slate-800">تنظیمات SEO</h3>

          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <label className="block md:col-span-2">
                <span className="mb-2 block text-sm font-medium text-slate-800">
                  Meta Title
                </span>
                <input
                  name="meta_title"
                  value={seo.meta_title}
                  onChange={handleSeoChange}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
                />
              </label>

              <label className="block md:col-span-2">
                <span className="mb-2 block text-sm font-medium text-slate-800">
                  Meta Description
                </span>
                <textarea
                  name="meta_description"
                  rows={4}
                  value={seo.meta_description}
                  onChange={handleSeoChange}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-800">
                  Canonical URL
                </span>
                <input
                  name="canonical_url"
                  value={seo.canonical_url}
                  onChange={handleSeoChange}
                  placeholder="https://example.com/blog/post-slug"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-800">
                  Schema Type
                </span>
                <select
                  name="schema_type"
                  value={seo.schema_type}
                  onChange={handleSeoChange}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
                >
                  <option value="">انتخاب کنید</option>
                  <option value="Article">Article</option>
                  <option value="WebPage">WebPage</option>
                  <option value="BlogPosting">BlogPosting</option>
                </select>
              </label>
            </div>

            <div className="rounded-2xl border border-slate-200 p-4">
              <h4 className="mb-4 text-base font-semibold text-slate-800">
                Open Graph
              </h4>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-800">
                    OG Title
                  </span>
                  <input
                    name="og_title"
                    value={seo.og_title}
                    onChange={handleSeoChange}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-800">
                    OG Image
                  </span>
                  <input
                    name="og_image"
                    value={seo.og_image}
                    onChange={handleSeoChange}
                    placeholder="https://..."
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
                  />
                </label>

                <label className="block md:col-span-2">
                  <span className="mb-2 block text-sm font-medium text-slate-800">
                    OG Description
                  </span>
                  <textarea
                    name="og_description"
                    rows={3}
                    value={seo.og_description}
                    onChange={handleSeoChange}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
                  />
                </label>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 p-4">
              <h4 className="mb-4 text-base font-semibold text-slate-800">
                Robots
              </h4>

              <div className="flex flex-wrap gap-6">
                <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    name="robots_index"
                    checked={Boolean(seo.robots_index)}
                    onChange={handleSeoChange}
                  />
                  <span>Index</span>
                </label>

                <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    name="robots_follow"
                    checked={Boolean(seo.robots_follow)}
                    onChange={handleSeoChange}
                  />
                  <span>Follow</span>
                </label>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 p-4">
              <h4 className="mb-4 text-base font-semibold text-slate-800">
                Custom Schema JSON
              </h4>

              <textarea
                rows={10}
                value={schemaText}
                onChange={handleSchemaTextChange}
                placeholder='{
  "@context": "https://schema.org",
  "@type": "Article"
}'
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 font-mono text-sm outline-none focus:border-blue-500"
              />

              <p className="mt-2 text-xs text-slate-500">
                اگر خالی بگذاری، برای Article به‌صورت خودکار schema پیش‌فرض ساخته می‌شود.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <h4 className="mb-3 text-base font-semibold text-slate-800">
                پیش‌نمایش گوگل
              </h4>

              <div className="space-y-1">
                <div className="truncate text-xl text-blue-700">
                  {googlePreviewTitle || 'عنوان سئو'}
                </div>
                <div className="truncate text-sm text-emerald-700">
                  {googlePreviewUrl}
                </div>
                <p className="text-sm leading-6 text-slate-600">
                  {googlePreviewDescription}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              disabled={loading}
              onClick={() => onSubmit(buildPayload(false))}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-5 py-3 text-sm font-medium text-slate-700 disabled:opacity-60"
            >
              <Save className="h-4 w-4" />
              <span>Save Draft</span>
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={() => onSubmit(buildPayload(true))}
              className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-medium text-white disabled:opacity-60"
            >
              <Send className="h-4 w-4" />
              <span>Publish</span>
            </button>

            <button
              type="button"
              onClick={() => setPreviewOpen((prev) => !prev)}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-5 py-3 text-sm font-medium text-slate-700"
            >
              <Eye className="h-4 w-4" />
              <span>{previewOpen ? 'بستن Preview' : 'Preview'}</span>
            </button>
          </div>
        </div>

        {previewOpen && (
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <h3 className="mb-6 text-lg font-bold text-slate-800">پیش‌نمایش</h3>

            {thumbnailUrl && (
              <img
                src={thumbnailUrl}
                alt={title || 'blog thumbnail'}
                className="mb-6 h-72 w-full rounded-3xl object-cover"
              />
            )}

            <h1 className="text-4xl font-bold text-slate-800">{title}</h1>
            <p className="mt-4 text-lg leading-8 text-slate-500">{excerpt}</p>

            <div className="mt-8">
              <BlogContentViewer
                contentJson={editorValue?.json}
                contentHtml={editorValue?.html}
              />
            </div>
          </div>
        )}
      </div>

      <div className="space-y-6">
        <SeoScorePanel
          title={title}
          slug={resolvedSlug}
          excerpt={excerpt}
          metaTitle={effectiveMetaTitle}
          metaDescription={effectiveMetaDescription}
          focusKeyword={seo.focus_keyword}
          contentHtml={editorValue?.html || ''}
        />
      </div>
    </div>
  )
}