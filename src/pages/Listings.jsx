import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import {
  getAvailableCities,
  getAvailableCountries,
  getFilteredBusinesses,
  
} from '../services/supabase/businesses.api'
import { getCategories } from '../services/supabase/categories.api'
import { getSeoEntry } from '../services/supabase/seo.api'
import { buildSeoPayload } from '../utils/seo/buildSeoPayload'
import { getCanonicalUrl } from '../utils/seo/getCanonicalUrl'
import Layout from '../components/layout/Layout'
import Seo from '../components/common/Seo'
import StructuredData from '../components/common/StructuredData'
import BusinessCard from '../components/business/BusinessCard'
import PageHero from '../components/common/PageHero'

function Listings() {
  const [searchParams, setSearchParams] = useSearchParams()

  const initialCategorySlug = searchParams.get('category') || ''
  const initialCity = searchParams.get('city') || ''
  const initialCountry = searchParams.get('country') || ''
  const initialSortBy = searchParams.get('sort') || 'newest'

  const [businesses, setBusinesses] = useState([])
  const [categories, setCategories] = useState([])
  const [countries, setCountries] = useState([])
  const [cities, setCities] = useState([])
  const [category, setCategory] = useState(null)
  const [seoEntry, setSeoEntry] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [filters, setFilters] = useState({
    country: initialCountry,
    city: initialCity,
    categoryId: '',
    sortBy: initialSortBy,
  })

  useEffect(() => {
    async function loadInitialData() {
      try {
        setLoading(true)
        setError('')

        const [categoriesData, countriesData] = await Promise.all([
          getCategories(),
          getAvailableCountries(),
        ])

        setCategories(categoriesData || [])
        setCountries(countriesData || [])

        let foundCategory = null

        if (initialCategorySlug) {
          foundCategory = (categoriesData || []).find(
            (item) => item.slug === initialCategorySlug
          )

          setCategory(foundCategory || null)

          if (foundCategory?.id) {
            setFilters((prev) => ({
              ...prev,
              categoryId: String(foundCategory.id),
            }))
          }
        }

        if (foundCategory?.id) {
          const categorySeo = await getSeoEntry('category', foundCategory.id)
          setSeoEntry(categorySeo)
        } else {
          const listingsSeo = await getSeoEntry('static_page', 'listings')
          setSeoEntry(listingsSeo)
        }
      } catch (err) {
        console.error(err)
        setError(err.message || 'خطا در دریافت اطلاعات اولیه')
      } finally {
        setLoading(false)
      }
    }

    loadInitialData()
  }, [initialCategorySlug])

  useEffect(() => {
    async function loadCities() {
      try {
        const citiesData = await getAvailableCities(filters.country)
        setCities(citiesData || [])
      } catch (err) {
        console.error(err)
      }
    }

    loadCities()
  }, [filters.country])

  useEffect(() => {
    async function loadFilteredBusinesses() {
      try {
        setLoading(true)
        setError('')

        const data = await getFilteredBusinesses(filters)
        setBusinesses(data || [])
      } catch (err) {
        console.error(err)
        setError(err.message || 'خطا در دریافت کسب‌وکارها')
      } finally {
        setLoading(false)
      }
    }

    loadFilteredBusinesses()
  }, [filters])

  useEffect(() => {
    async function syncCategorySeo() {
      try {
        if (!filters.categoryId) {
          setCategory(null)
          const listingsSeo = await getSeoEntry('static_page', 'listings')
          setSeoEntry(listingsSeo)
          return
        }

        const selectedCategory = categories.find(
          (item) => String(item.id) === String(filters.categoryId)
        )

        setCategory(selectedCategory || null)

        if (selectedCategory?.id) {
          const categorySeo = await getSeoEntry('category', selectedCategory.id)
          setSeoEntry(categorySeo)
        }
      } catch (err) {
        console.error(err)
      }
    }

    if (categories.length > 0) {
      syncCategorySeo()
    }
  }, [filters.categoryId, categories])

  useEffect(() => {
    const params = new URLSearchParams()

    if (filters.country) params.set('country', filters.country)
    if (filters.city) params.set('city', filters.city)
    if (filters.sortBy && filters.sortBy !== 'newest') {
      params.set('sort', filters.sortBy)
    }

    if (filters.categoryId) {
      const selectedCategory = categories.find(
        (item) => String(item.id) === String(filters.categoryId)
      )

      if (selectedCategory?.slug) {
        params.set('category', selectedCategory.slug)
      }
    }

    setSearchParams(params, { replace: true })
  }, [filters, categories, setSearchParams])

  const pageTitle = useMemo(() => {
    if (category?.name && filters.city) {
      return `${category.name} در ${filters.city}`
    }

    if (category?.name && filters.country) {
      return `${category.name} در ${filters.country}`
    }

    if (category?.name) {
      return category.name
    }

    if (filters.city && filters.country) {
      return `خدمات در ${filters.city}، ${filters.country}`
    }

    if (filters.city) {
      return `خدمات در ${filters.city}`
    }

    if (filters.country) {
      return `خدمات در ${filters.country}`
    }

    return 'همه خدمات'
  }, [category, filters.city, filters.country])

  const pageDescription = useMemo(() => {
    if (category?.name && filters.city) {
      return `لیست ${category.name} در ${filters.city} به همراه اطلاعات تماس، آدرس و جزئیات کامل کسب‌وکارها.`
    }

    if (category?.name && filters.country) {
      return `لیست ${category.name} در ${filters.country} به همراه اطلاعات تماس، آدرس و جزئیات کامل کسب‌وکارها.`
    }

    if (category?.name) {
      return `لیست ${category.name} و خدمات مرتبط به همراه اطلاعات تماس، آدرس و جزئیات کامل.`
    }

    if (filters.city && filters.country) {
      return `مشاهده خدمات و کسب‌وکارهای فعال در ${filters.city}، ${filters.country} به همراه اطلاعات تماس و جزئیات کامل.`
    }

    if (filters.city) {
      return `مشاهده خدمات و کسب‌وکارهای فعال در ${filters.city} به همراه اطلاعات تماس و جزئیات کامل.`
    }

    if (filters.country) {
      return `مشاهده خدمات و کسب‌وکارهای فعال در ${filters.country} به همراه اطلاعات تماس و جزئیات کامل.`
    }

    return 'همه خدمات ثبت‌شده را بر اساس شهر، کشور، نوع خدمت و مرتب‌سازی دلخواه جستجو و فیلتر کن.'
  }, [category, filters.city, filters.country])

  const canonicalPath = useMemo(() => {
    const params = new URLSearchParams()

    if (filters.country) params.set('country', filters.country)
    if (filters.city) params.set('city', filters.city)

    if (filters.categoryId) {
      const selectedCategory = categories.find(
        (item) => String(item.id) === String(filters.categoryId)
      )
      if (selectedCategory?.slug) {
        params.set('category', selectedCategory.slug)
      }
    }

    if (filters.sortBy && filters.sortBy !== 'newest') {
      params.set('sort', filters.sortBy)
    }

    const queryString = params.toString()
    return queryString ? `/listings?${queryString}` : '/listings'
  }, [filters, categories])

  const seo = useMemo(() => {
    return buildSeoPayload({
      seoEntry,
      path: canonicalPath,
      fallback: {
        title: pageTitle,
        description: pageDescription,
        image: businesses?.[0]?.image_url || '',
      },
    })
  }, [seoEntry, canonicalPath, pageTitle, pageDescription, businesses])

  const listingsSchema = useMemo(() => {
    return {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: pageTitle,
      description: pageDescription,
      url: getCanonicalUrl(canonicalPath),
    }
  }, [pageTitle, pageDescription, canonicalPath])

  function handleFilterChange(key, value) {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  function resetFilters() {
    setFilters({
      country: '',
      city: '',
      categoryId: '',
      sortBy: 'newest',
    })
  }

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
      <StructuredData data={seoEntry?.custom_schema_json || listingsSchema} />

      <PageHero
        title={pageTitle}
        subtitle="خدمات را بر اساس شهر، کشور، نوع خدمت و مرتب‌سازی دلخواه فیلتر کن."
      />

      <section className="px-4 pb-10 md:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-3xl font-bold">فیلتر و جستجوی خدمات</h2>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
              <select
                value={filters.country}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    country: e.target.value,
                    city: '',
                  }))
                }
                className="rounded-2xl border border-slate-800 px-4 py-3 outline-none"
              >
                <option value="">همه کشورها</option>
                {countries.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>

              <select
                value={filters.city}
                onChange={(e) => handleFilterChange('city', e.target.value)}
                className="rounded-2xl border border-slate-800 px-4 py-3 outline-none"
              >
                <option value="">همه شهرها</option>
                {cities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>

              <select
                value={filters.categoryId}
                onChange={(e) => handleFilterChange('categoryId', e.target.value)}
                className="rounded-2xl border border-slate-800 px-4 py-3 outline-none"
              >
                <option value="">همه خدمات</option>
                {categories.map((item) => (
                  <option key={item.id} value={String(item.id)}>
                    {item.name}
                  </option>
                ))}
              </select>

              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="rounded-2xl border border-slate-800 px-4 py-3 outline-none"
              >
                <option value="newest">جدیدترین‌ها</option>
                <option value="top">بهترین‌ها</option>
                <option value="best-rated">بیشترین امتیاز</option>
                <option value="featured">ویژه‌شده‌ها</option>
                <option value="most-reviewed">بیشترین نظر</option>
              </select>

              <button
                type="button"
                onClick={resetFilters}
                className="rounded-2xl bg-slate-900 px-4 py-3 font-medium text-white transition hover:bg-slate-800"
              >
                پاک کردن فیلترها
              </button>
            </div>

            <div className="mt-5 flex flex-wrap gap-3 text-sm text-gray-600">
              {filters.categoryId && (
                <span className="rounded-full bg-gray-100 px-4 py-2">
                  نوع خدمت: {category?.name || 'انتخاب شده'}
                </span>
              )}

              {filters.country && (
                <span className="rounded-full bg-gray-100 px-4 py-2">
                  کشور: {filters.country}
                </span>
              )}

              {filters.city && (
                <span className="rounded-full bg-gray-100 px-4 py-2">
                  شهر: {filters.city}
                </span>
              )}

              {!filters.categoryId && !filters.country && !filters.city && (
                <span className="rounded-full bg-gray-100 px-4 py-2">
                  همه خدمات
                </span>
              )}
            </div>
          </div>

          {loading && <div>در حال بارگذاری کسب‌وکارها...</div>}
          {error && <div className="text-red-500">{error}</div>}

          {!loading && !error && businesses.length === 0 && (
            <div className="rounded-2xl bg-white p-6 shadow">موردی پیدا نشد</div>
          )}

          {!loading && !error && businesses.length > 0 && (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {businesses.map((business) => (
                <BusinessCard key={business.id} business={business} />
              ))}
            </div>
          )}
        </div>
      </section>
    </Layout>
  )
}

export default Listings