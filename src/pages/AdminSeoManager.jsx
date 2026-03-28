import { useEffect, useMemo, useState } from 'react'
import {
  Search,
  Trash2,
  Save,
  RefreshCw,
  Settings2,
} from 'lucide-react'

import SeoFieldsForm from '../components/admin/seo/SeoFieldsForm'
import {
  getSeoEntry,
  upsertSeoEntry,
  deleteSeoEntry,
  listSeoEntries,
} from '../services/supabase/seo.api'
import {
  SEO_PAGE_TYPES,
  STATIC_PAGE_KEYS,
  DEFAULT_SEO_ENTRY,
} from '../utils/seo/seoModel'
import { validateSeoPayload } from '../utils/seo/validateSeoPayload'
import { getSeoStatus } from '../utils/seo/getSeoStatus'
import { supabase } from '../services/supabase/client'

function mapStaticPagesToItems() {
  return STATIC_PAGE_KEYS.map((item) => ({
    id: item.value,
    title: item.label,
    slug: item.value,
    updated_at: null,
  }))
}

export default function AdminSeoManager() {
  const [pageType, setPageType] = useState(SEO_PAGE_TYPES.STATIC_PAGE)
  const [search, setSearch] = useState('')
  const [items, setItems] = useState([])
  const [itemsLoading, setItemsLoading] = useState(false)
  const [seoMap, setSeoMap] = useState({})

  const [selectedItem, setSelectedItem] = useState(null)
  const [seoValues, setSeoValues] = useState(DEFAULT_SEO_ENTRY)
  const [seoErrors, setSeoErrors] = useState({})
  const [seoLoading, setSeoLoading] = useState(false)
  const [seoDeleting, setSeoDeleting] = useState(false)
  const [schemaText, setSchemaText] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    setItems([])
    setSeoMap({})
    setSelectedItem(null)
    setSeoValues(DEFAULT_SEO_ENTRY)
    setSeoErrors({})
    setSchemaText('')
    setMessage('')
    fetchItems(pageType)
  }, [pageType])

  async function fetchItems(type) {
    try {
      setItemsLoading(true)
      setMessage('')

      let fetchedItems = []

      if (type === SEO_PAGE_TYPES.STATIC_PAGE) {
        fetchedItems = mapStaticPagesToItems()
      } else if (type === SEO_PAGE_TYPES.BLOG) {
        const { data, error } = await supabase
          .from('blogs')
          .select('id, title, slug, updated_at')
          .order('updated_at', { ascending: false })

        if (error) throw error

        fetchedItems = (data || []).map((item) => ({
          id: String(item.id),
          title: item.title,
          slug: item.slug,
          updated_at: item.updated_at || null,
        }))
      } else if (type === SEO_PAGE_TYPES.SERVICE) {
        const { data, error } = await supabase
          .from('businesses')
          .select('id, title, slug, created_at')
          .order('created_at', { ascending: false })

        if (error) throw error

        fetchedItems = (data || []).map((item) => ({
          id: String(item.id),
          title: item.title,
          slug: item.slug,
          updated_at: item.created_at || null,
        }))
      } else if (type === SEO_PAGE_TYPES.CATEGORY) {
        const { data, error } = await supabase
          .from('categories')
          .select('id, name, slug')
          .order('name', { ascending: true })

        if (error) throw error

        fetchedItems = (data || []).map((item) => ({
          id: String(item.id),
          title: item.name,
          slug: item.slug,
          updated_at: null,
        }))
      } else if (type === SEO_PAGE_TYPES.SUBCATEGORY) {
        const { data, error } = await supabase
          .from('subcategories')
          .select('id, name, slug, category_id, categories(name)')
          .order('name', { ascending: true })

        if (error) throw error

        fetchedItems = (data || []).map((item) => ({
          id: String(item.id),
          title: item.categories?.name
            ? `${item.name} - ${item.categories.name}`
            : item.name,
          slug: item.slug,
          updated_at: null,
        }))
      }

      setItems(fetchedItems)

      const seoEntries = await listSeoEntries(type)
      const nextSeoMap = {}

      for (const entry of seoEntries || []) {
        nextSeoMap[String(entry.entity_id)] = entry
      }

      setSeoMap(nextSeoMap)
    } catch (error) {
      console.error('fetchItems error:', error)
      setItems([])
      setSeoMap({})
      setMessage(error?.message || 'خطا در دریافت لیست آیتم‌ها')
    } finally {
      setItemsLoading(false)
    }
  }

  async function handleSelectItem(item) {
    setSelectedItem(item)
    setSeoErrors({})
    setMessage('')

    try {
      setSeoLoading(true)

      const seo = await getSeoEntry(pageType, item.id)

      const nextValues = {
        ...DEFAULT_SEO_ENTRY,
        page_type: pageType,
        entity_id: String(item.id),
        meta_title: seo?.meta_title || '',
        meta_description: seo?.meta_description || '',
        slug: seo?.slug || item.slug || '',
        canonical_url: seo?.canonical_url || '',
        og_title: seo?.og_title || '',
        og_description: seo?.og_description || '',
        og_image: seo?.og_image || '',
        robots_index:
          typeof seo?.robots_index === 'boolean' ? seo.robots_index : true,
        robots_follow:
          typeof seo?.robots_follow === 'boolean' ? seo.robots_follow : true,
        focus_keyword: seo?.focus_keyword || '',
        schema_type: seo?.schema_type || '',
        custom_schema_json: seo?.custom_schema_json || null,
      }

      setSeoValues(nextValues)
      setSchemaText(
        nextValues.custom_schema_json
          ? JSON.stringify(nextValues.custom_schema_json, null, 2)
          : ''
      )
    } catch (error) {
      console.error('handleSelectItem error:', error)
      setMessage(error?.message || 'خطا در دریافت اطلاعات سئو')
    } finally {
      setSeoLoading(false)
    }
  }

  function handleSeoChange(event) {
    const { name, value, type, checked } = event.target

    setSeoValues((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  function handleSchemaChange(event) {
    const value = event.target.value
    setSchemaText(value)

    if (!value.trim()) {
      setSeoValues((prev) => ({
        ...prev,
        custom_schema_json: null,
      }))
      setSeoErrors((prev) => ({
        ...prev,
        custom_schema_json: undefined,
      }))
      return
    }

    try {
      const parsed = JSON.parse(value)
      setSeoValues((prev) => ({
        ...prev,
        custom_schema_json: parsed,
      }))
      setSeoErrors((prev) => ({
        ...prev,
        custom_schema_json: undefined,
      }))
    } catch {
      setSeoErrors((prev) => ({
        ...prev,
        custom_schema_json: 'JSON وارد شده معتبر نیست.',
      }))
    }
  }

  async function handleSave() {
    if (!selectedItem) return

    setMessage('')

    const payload = {
      ...seoValues,
      page_type: pageType,
      entity_id: selectedItem.id,
    }

    const errors = validateSeoPayload(payload)
    setSeoErrors(errors)

    const hasErrors = Object.values(errors).some(Boolean)
    if (hasErrors) return

    try {
      setSeoLoading(true)
      const saved = await upsertSeoEntry(payload)

      setSeoMap((prev) => ({
        ...prev,
        [String(selectedItem.id)]: saved,
      }))

      setMessage('تنظیمات سئو با موفقیت ذخیره شد')
    } catch (error) {
      console.error('handleSave error:', error)
      setMessage(error?.message || 'ذخیره تنظیمات سئو انجام نشد')
    } finally {
      setSeoLoading(false)
    }
  }

  async function handleDelete() {
    if (!selectedItem) return

    const confirmed = window.confirm(
      'آیا از حذف تنظیمات سئوی این صفحه مطمئن هستید؟'
    )
    if (!confirmed) return

    try {
      setSeoDeleting(true)

      await deleteSeoEntry(pageType, selectedItem.id)

      setSeoMap((prev) => {
        const next = { ...prev }
        delete next[String(selectedItem.id)]
        return next
      })

      setSeoValues({
        ...DEFAULT_SEO_ENTRY,
        page_type: pageType,
        entity_id: selectedItem.id,
        slug: selectedItem.slug || '',
      })
      setSchemaText('')
      setSeoErrors({})
      setMessage('تنظیمات سئو حذف شد')
    } catch (error) {
      console.error('handleDelete error:', error)
      setMessage(error?.message || 'حذف تنظیمات سئو انجام نشد')
    } finally {
      setSeoDeleting(false)
    }
  }

  function handleReset() {
    if (!selectedItem) return

    setSeoValues({
      ...DEFAULT_SEO_ENTRY,
      page_type: pageType,
      entity_id: selectedItem.id,
      slug: selectedItem.slug || '',
    })
    setSchemaText('')
    setSeoErrors({})
    setMessage('فرم به حالت پیش‌فرض برگشت')
  }

  const filteredItems = useMemo(() => {
    const keyword = search.trim().toLowerCase()
    if (!keyword) return items

    return items.filter((item) => {
      return (
        item.title?.toLowerCase().includes(keyword) ||
        item.slug?.toLowerCase().includes(keyword) ||
        item.id?.toLowerCase().includes(keyword)
      )
    })
  }, [items, search])

  function getBadgeClasses(tone) {
    if (tone === 'green') {
      return 'bg-emerald-100 text-emerald-700'
    }

    if (tone === 'yellow') {
      return 'bg-amber-100 text-amber-700'
    }

    return 'bg-slate-100 text-slate-600'
  }

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
      <aside className="space-y-5">
        <div className="rounded-3xl bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <Settings2 className="h-5 w-5 text-slate-700" />
            <h2 className="text-lg font-bold text-slate-800">SEO Manager</h2>
          </div>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">
              نوع صفحه
            </span>
            <select
              value={pageType}
              onChange={(e) => setPageType(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
            >
              <option value={SEO_PAGE_TYPES.STATIC_PAGE}>صفحات ثابت</option>
              <option value={SEO_PAGE_TYPES.BLOG}>بلاگ‌ها</option>
              <option value={SEO_PAGE_TYPES.SERVICE}>خدمات</option>
              <option value={SEO_PAGE_TYPES.CATEGORY}>دسته‌بندی‌ها</option>
              <option value={SEO_PAGE_TYPES.SUBCATEGORY}>زیردسته‌ها</option>
            </select>
          </label>

          <div className="relative mt-4">
            <Search className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="جستجو..."
              className="w-full rounded-2xl border border-slate-200 py-3 pr-11 pl-4 outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div className="rounded-3xl bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-800">لیست آیتم‌ها</h3>
            <button
              type="button"
              onClick={() => fetchItems(pageType)}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              بروزرسانی
            </button>
          </div>

          <div className="max-h-[70vh] space-y-2 overflow-y-auto pr-1">
            {itemsLoading ? (
              <div className="rounded-2xl border border-slate-200 p-4 text-sm text-slate-500">
                در حال دریافت آیتم‌ها...
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 p-4 text-sm text-slate-500">
                موردی پیدا نشد
              </div>
            ) : (
              filteredItems.map((item) => {
                const isActive = selectedItem?.id === item.id
                const status = getSeoStatus(seoMap[String(item.id)])

                return (
                  <button
                    key={`${pageType}-${item.id}`}
                    type="button"
                    onClick={() => handleSelectItem(item)}
                    className={`w-full rounded-2xl border p-4 text-right transition ${
                      isActive
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold text-slate-800">
                          {item.title}
                        </div>
                        <div className="mt-1 truncate text-xs text-slate-500">
                          {item.slug || item.id}
                        </div>
                      </div>

                      <span
                        className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${getBadgeClasses(
                          status.tone
                        )}`}
                      >
                        {status.label}
                      </span>
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </div>
      </aside>

      <section className="space-y-5">
        <div className="rounded-3xl bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-xl font-bold text-slate-900">
                {selectedItem ? `سئوی "${selectedItem.title}"` : 'تنظیمات سئو'}
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                {selectedItem
                  ? `نوع صفحه: ${pageType} | شناسه: ${selectedItem.id}`
                  : 'از ستون سمت راست یک آیتم را انتخاب کن'}
              </p>
            </div>

            {selectedItem ? (
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700"
                >
                  <RefreshCw className="h-4 w-4" />
                  بازنشانی
                </button>

                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={seoDeleting}
                  className="inline-flex items-center gap-2 rounded-2xl border border-red-200 px-4 py-3 text-sm font-medium text-red-600 disabled:opacity-60"
                >
                  <Trash2 className="h-4 w-4" />
                  حذف
                </button>

                <button
                  type="button"
                  onClick={handleSave}
                  disabled={seoLoading}
                  className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-4 py-3 text-sm font-medium text-white disabled:opacity-60"
                >
                  <Save className="h-4 w-4" />
                  ذخیره
                </button>
              </div>
            ) : null}
          </div>

          {message ? (
            <div className="mt-4 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
              {message}
            </div>
          ) : null}
        </div>

        {selectedItem ? (
          <>
            <div className="rounded-3xl bg-white p-5 shadow-sm">
              <SeoFieldsForm
                values={seoValues}
                errors={seoErrors}
                onChange={handleSeoChange}
                onJsonChange={handleSchemaChange}
                schemaText={schemaText}
              />
            </div>

            <div className="rounded-3xl bg-white p-5 shadow-sm">
              <h3 className="mb-4 text-lg font-bold text-slate-800">
                پیش‌نمایش گوگل
              </h3>

              <div className="space-y-1 rounded-2xl border border-slate-200 p-4">
                <div className="truncate text-xl text-blue-700">
                  {seoValues.meta_title || selectedItem.title || 'عنوان صفحه'}
                </div>

                <div className="truncate text-sm text-emerald-700">
                  {seoValues.canonical_url ||
                    `${import.meta.env.VITE_SITE_URL || 'https://example.com'}/${
                      seoValues.slug || selectedItem.slug || selectedItem.id
                    }`}
                </div>

                <p className="text-sm leading-6 text-slate-600">
                  {seoValues.meta_description ||
                    'توضیحات متا برای این صفحه هنوز وارد نشده است.'}
                </p>
              </div>
            </div>
          </>
        ) : (
          <div className="rounded-3xl bg-white p-10 text-center shadow-sm">
            <h3 className="text-lg font-semibold text-slate-800">
              هنوز صفحه‌ای انتخاب نشده
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              از ستون سمت راست نوع صفحه را انتخاب کن و بعد روی آیتم موردنظر بزن.
            </p>
          </div>
        )}
      </section>
    </div>
  )
}