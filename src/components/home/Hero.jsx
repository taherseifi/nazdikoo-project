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

    if (!query) {
      return allCities.slice(0, 8)
    }

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
    <section className="relative min-h-screen overflow-hidden">
      <img
        src="/hero2.webp"
        alt="خدمات ایرانی در استانبول"
        className="absolute inset-0 h-full w-full object-cover"
      />

      <div className="absolute inset-0 bg-black/40" />

      <div className="relative mx-auto flex min-h-screen max-w-7xl items-center px-4 pb-12 pt-28 md:px-6">
        <div className="w-full max-w-2xl rounded-3xl border border-white/20 bg-white/15 p-5 text-white shadow-2xl backdrop-blur-md md:p-8">
          <span className="inline-flex mb-5 md:mb-5 sm:mb-5 rounded-full bg-white/20 px-4 py-2 text-sm font-medium text-white">
            Nazdikoo
          </span>

          <h1
  className="
    text-white
    font-bold
    leading-tight
    text-2xl
    sm:text-3xl
    md:text-4xl
    lg:text-5xl
    xl:text-6xl
    max-w-[90%]
    md:max-w-2xl
    mx-auto
    text-center
    break-words
  "
>
      خدمات مورد نیازت، همین‌جاست      
    </h1>
    <br className="hidden sm:block" />
  <p className="mt-5 max-w-2xl text-lg leading-8 text-white/90 md:text-base">
  به‌راحتی جستجو کن، مقایسه کن و بهترین انتخاب رو داشته باش
          </p>

          <p className="mt-5 max-w-2xl text-sm leading-8 text-white/90 md:text-base">
            از پزشک و آرایشگاه تا وکیل، مربی، تعمیرکار و خدمات تخصصی. نزدیکو کمک
            می‌کند کسب‌وکارهای ایرانی را سریع‌تر پیدا کنی و اطلاعات تماس، آدرس و
            جزئیات آن‌ها را یکجا ببینی.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className="h-14 w-full rounded-2xl border border-white/20 bg-white px-4 text-gray-800 outline-none"
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
              className="h-14 w-full rounded-2xl border border-white/20 bg-white px-4 text-gray-800 outline-none disabled:cursor-not-allowed disabled:bg-gray-100"
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
                className="h-14 w-full rounded-2xl border border-white/20 bg-white px-4 text-gray-800 outline-none"
              />

              {showCitySuggestions && filteredCitySuggestions.length > 0 && (
                <div className="absolute z-20 mt-2 max-h-64 w-full overflow-y-auto rounded-2xl bg-white p-2 shadow-xl">
                  {filteredCitySuggestions.map((city) => (
                    <button
                      key={city}
                      type="button"
                      onClick={() => handleCitySelect(city)}
                      className="block w-full rounded-xl px-4 py-3 text-right text-sm text-gray-700 transition hover:bg-gray-100"
                    >
                      {city}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              type="submit"
              className="h-14 w-full rounded-2xl bg-blue-500 px-6 font-medium text-white transition hover:bg-blue-600"
            >
              جستجو در خدمات
            </button>

            <Link
              to="/nearby-services"
              className="inline-flex w-full items-center justify-center rounded-2xl border border-white/20 bg-white/10 px-5 py-3 font-medium text-white transition hover:bg-white/20"
            >
              مشاهده خدمات نزدیک شما روی نقشه
            </Link>
          </form>
        </div>
      </div>
    </section>
  )
}

export default Hero
