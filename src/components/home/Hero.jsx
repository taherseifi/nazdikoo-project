import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  getCategories,
  getSubcategoriesByCategoryId,
} from '../../services/supabase/categories.api'
import { getAvailableCities } from '../../services/supabase/businesses.api'

function Hero() {
  const navigate = useNavigate()

  const [categories, setCategories] = useState([])
  const [subcategories, setSubcategories] = useState([])
  const [allCities, setAllCities] = useState([])
  const [showCitySuggestions, setShowCitySuggestions] = useState(false)

  const [form, setForm] = useState({
    category: '',
    subcategory: '',
    city: '',
  })

  useEffect(() => {
    async function loadInitialData() {
      try {
        const [categoriesData, citiesData] = await Promise.all([
          getCategories(),
          getAvailableCities(),
        ])

        setCategories(categoriesData || [])
        setAllCities(citiesData || [])
      } catch (error) {
        console.error(error)
      }
    }

    loadInitialData()
  }, [])

  useEffect(() => {
    async function loadSubcategories() {
      try {
        setSubcategories([])
        setForm((prev) => ({
          ...prev,
          subcategory: '',
        }))

        if (!form.category) return

        const selectedCategory = categories.find(
          (item) => item.slug === form.category
        )

        if (!selectedCategory?.id) return

        const data = await getSubcategoriesByCategoryId(selectedCategory.id)
        setSubcategories(data || [])
      } catch (error) {
        console.error(error)
      }
    }

    if (categories.length > 0) {
      loadSubcategories()
    }
  }, [form.category, categories])

  const filteredCitySuggestions = useMemo(() => {
    const query = form.city.trim().toLowerCase()

    if (!query) return allCities.slice(0, 8)

    return allCities
      .filter((city) => city?.toLowerCase().includes(query))
      .slice(0, 8)
  }, [allCities, form.city])

  function handleChange(event) {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  function handleCitySelect(city) {
    setForm((prev) => ({
      ...prev,
      city,
    }))
    setShowCitySuggestions(false)
  }

  function handleSubmit(event) {
    event.preventDefault()

    const params = new URLSearchParams()
    if (form.category) params.set('category', form.category)
    if (form.subcategory) params.set('subcategory', form.subcategory)
    if (form.city) params.set('city', form.city)

    const queryString = params.toString()
    navigate(`/listings${queryString ? `?${queryString}` : ''}`)
  }

  return (
    <section className="relative h-screen overflow-hidden">
      <img
        src="/hero2.webp"
        alt="خدمات ایرانی"
        className="absolute inset-0 h-full w-full object-cover"
      />

      <div className="absolute inset-0 bg-black/45" />

      <div className="relative mx-auto flex h-screen max-w-7xl items-center px-4 pt-20 pb-4 sm:px-5 md:px-6 md:pt-24">
        <div className="w-full max-w-lg rounded-2xl border border-white/15 bg-white/10 p-4 text-white shadow-2xl backdrop-blur-md sm:p-5 md:max-w-xl md:p-6">
          <span className="mb-3 inline-flex rounded-full bg-white/15 px-3 py-1 text-[11px] font-medium text-white sm:text-xs">
            Nazdikoo
          </span>

          <h1 className="text-center text-2xl font-bold leading-tight text-white sm:text-3xl md:text-4xl">
            خدمات مورد نیازت،
            <br />
            همین‌جاست
          </h1>

          <p className="mt-3 text-center text-sm leading-6 text-white/90 md:text-[15px]">
            به‌راحتی جستجو کن، مقایسه کن و بهترین انتخاب رو داشته باش
          </p>

          <p className="mt-2 text-center text-xs leading-6 text-white/80 sm:text-sm">
            از پزشک و آرایشگاه تا وکیل، مربی، تعمیرکار و خدمات تخصصی.
          </p>

          <form onSubmit={handleSubmit} className="mt-5 space-y-3">
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className="h-11 w-full rounded-xl border border-white/20 bg-white px-4 text-sm text-gray-800 outline-none md:h-12"
            >
              <option value="">نوع خدمت را انتخاب کن</option>
              {categories.map((category) => (
                <option key={category.id} value={category.slug}>
                  {category.name}
                </option>
              ))}
            </select>

            <select
              name="subcategory"
              value={form.subcategory}
              onChange={handleChange}
              disabled={!form.category}
              className="h-11 w-full rounded-xl border border-white/20 bg-white px-4 text-sm text-gray-800 outline-none disabled:cursor-not-allowed disabled:bg-gray-100 md:h-12"
            >
              <option value="">زیرشاخه را انتخاب کن</option>
              {subcategories.map((subcategory) => (
                <option key={subcategory.id} value={subcategory.slug}>
                  {subcategory.name}
                </option>
              ))}
            </select>

            <div className="relative">
              <input
                type="text"
                name="city"
                value={form.city}
                onChange={handleChange}
                onFocus={() => setShowCitySuggestions(true)}
                placeholder="شهر را وارد کن"
                className="h-11 w-full rounded-xl border border-white/20 bg-white px-4 text-sm text-gray-800 outline-none md:h-12"
              />

              {showCitySuggestions && filteredCitySuggestions.length > 0 && (
                <div className="absolute z-20 mt-2 max-h-48 w-full overflow-y-auto rounded-xl bg-white p-2 shadow-xl">
                  {filteredCitySuggestions.map((city) => (
                    <button
                      key={city}
                      type="button"
                      onClick={() => handleCitySelect(city)}
                      className="block w-full rounded-lg px-3 py-2 text-right text-sm text-gray-700 transition hover:bg-gray-100"
                    >
                      {city}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              type="submit"
              className="h-11 w-full rounded-xl bg-blue-500 px-5 text-sm font-medium text-white transition hover:bg-blue-600 md:h-12"
            >
              جستجو در خدمات
            </button>

            <Link
              to="/nearby-services"
              className="inline-flex h-11 w-full items-center justify-center rounded-xl border border-white/20 bg-white/10 px-4 text-sm font-medium text-white transition hover:bg-white/20 md:h-12"
            >
              مشاهده روی نقشه
            </Link>
          </form>
        </div>
      </div>
    </section>
  )
}

export default Hero