import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../components/layout/Layout'
import PageHero from '../components/common/PageHero'
import { supabase } from '../services/supabase/client'
import { ArrowRight, Plus, Pencil, Trash2 } from 'lucide-react'

const initialCategoryForm = {
  name: '',
  slug: '',
  icon: '',
  description: '',
}

const initialSubcategoryForm = {
  name: '',
  slug: '',
  category_id: '',
}

function AdminCategoriesManager() {
  const [categories, setCategories] = useState([])
  const [subcategories, setSubcategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const [categoryForm, setCategoryForm] = useState(initialCategoryForm)
  const [subcategoryForm, setSubcategoryForm] = useState(initialSubcategoryForm)

  const [editingCategoryId, setEditingCategoryId] = useState(null)
  const [editingSubcategoryId, setEditingSubcategoryId] = useState(null)

  const [search, setSearch] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      setLoading(true)
      setError('')
      setMessage('')

      const [categoriesResult, subcategoriesResult] = await Promise.all([
        supabase.from('categories').select('*').order('name', { ascending: true }),
        supabase
          .from('subcategories')
          .select('*, categories(id, name, slug)')
          .order('name', { ascending: true }),
      ])

      if (categoriesResult.error) throw categoriesResult.error
      if (subcategoriesResult.error) throw subcategoriesResult.error

      setCategories(categoriesResult.data || [])
      setSubcategories(subcategoriesResult.data || [])
    } catch (err) {
      console.error(err)
      setError(err.message || 'دریافت اطلاعات دسته‌بندی‌ها انجام نشد')
    } finally {
      setLoading(false)
    }
  }

  function handleCategoryChange(e) {
    const { name, value } = e.target
    setCategoryForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  function handleSubcategoryChange(e) {
    const { name, value } = e.target
    setSubcategoryForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  function resetCategoryForm() {
    setCategoryForm(initialCategoryForm)
    setEditingCategoryId(null)
  }

  function resetSubcategoryForm() {
    setSubcategoryForm(initialSubcategoryForm)
    setEditingSubcategoryId(null)
  }

  async function handleSaveCategory(e) {
    e.preventDefault()

    try {
      setActionLoading(true)
      setError('')
      setMessage('')

      if (!categoryForm.name.trim()) throw new Error('نام دسته‌بندی را وارد کن')
      if (!categoryForm.slug.trim()) throw new Error('اسلاگ دسته‌بندی را وارد کن')

      if (editingCategoryId) {
        const { error } = await supabase
          .from('categories')
          .update({
            name: categoryForm.name.trim(),
            slug: categoryForm.slug.trim(),
            icon: categoryForm.icon.trim() || null,
            description: categoryForm.description.trim() || null,
          })
          .eq('id', editingCategoryId)

        if (error) throw error
        setMessage('دسته‌بندی با موفقیت ویرایش شد')
      } else {
        const { error } = await supabase.from('categories').insert({
          name: categoryForm.name.trim(),
          slug: categoryForm.slug.trim(),
          icon: categoryForm.icon.trim() || null,
          description: categoryForm.description.trim() || null,
        })

        if (error) throw error
        setMessage('دسته‌بندی جدید با موفقیت اضافه شد')
      }

      resetCategoryForm()
      await loadData()
    } catch (err) {
      console.error(err)
      setError(err.message || 'ذخیره دسته‌بندی انجام نشد')
    } finally {
      setActionLoading(false)
    }
  }

  async function handleSaveSubcategory(e) {
    e.preventDefault()

    try {
      setActionLoading(true)
      setError('')
      setMessage('')

      if (!subcategoryForm.name.trim()) throw new Error('نام زیردسته را وارد کن')
      if (!subcategoryForm.slug.trim()) throw new Error('اسلاگ زیردسته را وارد کن')
      if (!subcategoryForm.category_id) throw new Error('دسته‌بندی اصلی را انتخاب کن')

      if (editingSubcategoryId) {
        const { error } = await supabase
          .from('subcategories')
          .update({
            name: subcategoryForm.name.trim(),
            slug: subcategoryForm.slug.trim(),
            category_id: subcategoryForm.category_id,
          })
          .eq('id', editingSubcategoryId)

        if (error) throw error
        setMessage('زیردسته با موفقیت ویرایش شد')
      } else {
        const { error } = await supabase.from('subcategories').insert({
          name: subcategoryForm.name.trim(),
          slug: subcategoryForm.slug.trim(),
          category_id: subcategoryForm.category_id,
        })

        if (error) throw error
        setMessage('زیردسته جدید با موفقیت اضافه شد')
      }

      resetSubcategoryForm()
      await loadData()
    } catch (err) {
      console.error(err)
      setError(err.message || 'ذخیره زیردسته انجام نشد')
    } finally {
      setActionLoading(false)
    }
  }

  function handleEditCategory(item) {
    setEditingCategoryId(item.id)
    setCategoryForm({
      name: item.name || '',
      slug: item.slug || '',
      icon: item.icon || '',
      description: item.description || '',
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handleEditSubcategory(item) {
    setEditingSubcategoryId(item.id)
    setSubcategoryForm({
      name: item.name || '',
      slug: item.slug || '',
      category_id: item.category_id || '',
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function handleDeleteCategory(id) {
    const confirmed = window.confirm(
      'این دسته‌بندی حذف شود؟ اگر زیردسته یا خدمت به آن وصل باشد ممکن است خطا بگیری.'
    )
    if (!confirmed) return

    try {
      setActionLoading(true)
      setError('')
      setMessage('')

      const { error } = await supabase.from('categories').delete().eq('id', id)
      if (error) throw error

      if (editingCategoryId === id) {
        resetCategoryForm()
      }

      setMessage('دسته‌بندی حذف شد')
      await loadData()
    } catch (err) {
      console.error(err)
      setError(err.message || 'حذف دسته‌بندی انجام نشد')
    } finally {
      setActionLoading(false)
    }
  }

  async function handleDeleteSubcategory(id) {
    const confirmed = window.confirm('این زیردسته حذف شود؟')
    if (!confirmed) return

    try {
      setActionLoading(true)
      setError('')
      setMessage('')

      const { error } = await supabase.from('subcategories').delete().eq('id', id)
      if (error) throw error

      if (editingSubcategoryId === id) {
        resetSubcategoryForm()
      }

      setMessage('زیردسته حذف شد')
      await loadData()
    } catch (err) {
      console.error(err)
      setError(err.message || 'حذف زیردسته انجام نشد')
    } finally {
      setActionLoading(false)
    }
  }

  const filteredCategories = useMemo(() => {
    const keyword = search.trim().toLowerCase()
    if (!keyword) return categories

    return categories.filter((item) => {
      return (
        item.name?.toLowerCase().includes(keyword) ||
        item.slug?.toLowerCase().includes(keyword) ||
        item.icon?.toLowerCase().includes(keyword)
      )
    })
  }, [categories, search])

  const filteredSubcategories = useMemo(() => {
    const keyword = search.trim().toLowerCase()
    if (!keyword) return subcategories

    return subcategories.filter((item) => {
      return (
        item.name?.toLowerCase().includes(keyword) ||
        item.slug?.toLowerCase().includes(keyword) ||
        item.categories?.name?.toLowerCase().includes(keyword)
      )
    })
  }, [subcategories, search])

  return (
    <Layout>
      <PageHero
        title="مدیریت دسته‌بندی‌ها"
        subtitle="اضافه کردن، ویرایش و حذف دسته‌بندی‌ها و زیردسته‌ها بدون نیاز به ورود به دیتابیس"
      />

      <section className="bg-slate-50 px-4 py-10 md:px-6">
        <div className="mx-auto max-w-7xl space-y-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Link
              to="/admin"
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm"
            >
              <ArrowRight className="h-4 w-4" />
              بازگشت به داشبورد
            </Link>

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="جستجو در دسته‌بندی و زیردسته..."
              className="w-full max-w-md rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-500"
            />
          </div>

          {error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
              {error}
            </div>
          ) : null}

          {message ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
              {message}
            </div>
          ) : null}

          <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center gap-2">
                <Plus className="h-5 w-5 text-slate-700" />
                <h2 className="text-2xl font-bold text-slate-800">
                  {editingCategoryId ? 'ویرایش دسته‌بندی' : 'افزودن دسته‌بندی'}
                </h2>
              </div>

              <form onSubmit={handleSaveCategory} className="space-y-4">
                <input
                  name="name"
                  value={categoryForm.name}
                  onChange={handleCategoryChange}
                  placeholder="نام دسته‌بندی"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
                />

                <input
                  name="slug"
                  value={categoryForm.slug}
                  onChange={handleCategoryChange}
                  placeholder="slug"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
                />

                <input
                  name="icon"
                  value={categoryForm.icon}
                  onChange={handleCategoryChange}
                  placeholder="icon مثل: scissors یا utensils یا monitor"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
                />

                <textarea
                  rows={5}
                  name="description"
                  value={categoryForm.description}
                  onChange={handleCategoryChange}
                  placeholder="توضیح دسته‌بندی"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
                />

                <div className="flex flex-wrap gap-3">
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-medium text-white disabled:opacity-60"
                  >
                    {editingCategoryId ? 'ذخیره ویرایش' : 'افزودن دسته‌بندی'}
                  </button>

                  {editingCategoryId ? (
                    <button
                      type="button"
                      onClick={resetCategoryForm}
                      className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-medium text-slate-700"
                    >
                      انصراف
                    </button>
                  ) : null}
                </div>
              </form>
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center gap-2">
                <Plus className="h-5 w-5 text-slate-700" />
                <h2 className="text-2xl font-bold text-slate-800">
                  {editingSubcategoryId ? 'ویرایش زیردسته' : 'افزودن زیردسته'}
                </h2>
              </div>

              <form onSubmit={handleSaveSubcategory} className="space-y-4">
                <select
                  name="category_id"
                  value={subcategoryForm.category_id}
                  onChange={handleSubcategoryChange}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
                >
                  <option value="">انتخاب دسته‌بندی اصلی</option>
                  {categories.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>

                <input
                  name="name"
                  value={subcategoryForm.name}
                  onChange={handleSubcategoryChange}
                  placeholder="نام زیردسته"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
                />

                <input
                  name="slug"
                  value={subcategoryForm.slug}
                  onChange={handleSubcategoryChange}
                  placeholder="slug"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
                />

                <div className="flex flex-wrap gap-3">
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-medium text-white disabled:opacity-60"
                  >
                    {editingSubcategoryId ? 'ذخیره ویرایش' : 'افزودن زیردسته'}
                  </button>

                  {editingSubcategoryId ? (
                    <button
                      type="button"
                      onClick={resetSubcategoryForm}
                      className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-medium text-slate-700"
                    >
                      انصراف
                    </button>
                  ) : null}
                </div>
              </form>
            </div>
          </div>

          {loading ? (
            <div className="rounded-2xl bg-white p-6 shadow-sm">در حال بارگذاری...</div>
          ) : (
            <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
              <div className="rounded-3xl bg-white p-6 shadow-sm">
                <h3 className="mb-5 text-2xl font-bold text-slate-800">
                  همه دسته‌بندی‌ها
                </h3>

                <div className="space-y-4">
                  {filteredCategories.length === 0 ? (
                    <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">
                      دسته‌بندی‌ای پیدا نشد
                    </div>
                  ) : (
                    filteredCategories.map((item) => (
                      <div
                        key={item.id}
                        className="rounded-2xl border border-slate-200 p-4"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <div className="text-lg font-bold text-slate-800">
                              {item.name}
                            </div>
                            <div className="mt-1 text-sm text-slate-500">
                              slug: {item.slug}
                            </div>
                            <div className="mt-1 text-sm text-slate-500">
                              icon: {item.icon || '---'}
                            </div>
                            {item.description ? (
                              <p className="mt-3 text-sm leading-7 text-slate-600">
                                {item.description}
                              </p>
                            ) : null}
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => handleEditCategory(item)}
                              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white"
                            >
                              <Pencil className="h-4 w-4" />
                              ویرایش
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteCategory(item.id)}
                              className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white"
                            >
                              <Trash2 className="h-4 w-4" />
                              حذف
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="rounded-3xl bg-white p-6 shadow-sm">
                <h3 className="mb-5 text-2xl font-bold text-slate-800">
                  همه زیردسته‌ها
                </h3>

                <div className="space-y-4">
                  {filteredSubcategories.length === 0 ? (
                    <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">
                      زیردسته‌ای پیدا نشد
                    </div>
                  ) : (
                    filteredSubcategories.map((item) => (
                      <div
                        key={item.id}
                        className="rounded-2xl border border-slate-200 p-4"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <div className="text-lg font-bold text-slate-800">
                              {item.name}
                            </div>
                            <div className="mt-1 text-sm text-slate-500">
                              slug: {item.slug}
                            </div>
                            <div className="mt-1 text-sm text-slate-500">
                              دسته اصلی: {item.categories?.name || '---'}
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => handleEditSubcategory(item)}
                              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white"
                            >
                              <Pencil className="h-4 w-4" />
                              ویرایش
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteSubcategory(item.id)}
                              className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white"
                            >
                              <Trash2 className="h-4 w-4" />
                              حذف
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </Layout>
  )
}

export default AdminCategoriesManager