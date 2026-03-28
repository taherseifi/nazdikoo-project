import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Layout from '../components/layout/Layout'
import Seo from '../components/common/Seo'
import StructuredData from '../components/common/StructuredData'
import PageHero from '../components/common/PageHero'
import { ChevronLeft } from 'lucide-react'

import { supabase } from '../services/supabase/client'
import { getSeoEntry } from '../services/supabase/seo.api'
import { buildSeoPayload } from '../utils/seo/buildSeoPayload'
import { getCanonicalUrl } from '../utils/seo/getCanonicalUrl'
import {
  getBusinesses,
  getFeaturedBusinesses,
} from '../services/supabase/businesses.api'

function CategoryPage() {
  const { slug } = useParams()

  const [category, setCategory] = useState(null)
  const [seoEntry, setSeoEntry] = useState(null)
  const [subcategories, setSubcategories] = useState([])
  const [categoryBusinesses, setCategoryBusinesses] = useState([])
  const [featuredServices, setFeaturedServices] = useState([])
  const [latestServices, setLatestServices] = useState([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        setError('')

        const { data: categoryData, error: categoryError } = await supabase
          .from('categories')
          .select('*')
          .eq('slug', slug)
          .single()

        if (categoryError) throw categoryError
        if (!categoryData) throw new Error('دسته‌بندی پیدا نشد')

        setCategory(categoryData)

        const [
          seoData,
          subcategoriesResult,
          businessesResult,
          featuredData,
          latestData,
        ] = await Promise.all([
          getSeoEntry('category', categoryData.id),
          supabase
            .from('subcategories')
            .select('id, name, slug, category_id')
            .eq('category_id', categoryData.id)
            .order('name', { ascending: true }),
          supabase
            .from('businesses')
            .select('*')
            .eq('category_id', categoryData.id)
            .order('created_at', { ascending: false }),
          getFeaturedBusinesses(3),
          getBusinesses(null, null, 6),
        ])

        if (subcategoriesResult.error) throw subcategoriesResult.error
        if (businessesResult.error) throw businessesResult.error

        setSeoEntry(seoData)
        setSubcategories(subcategoriesResult.data || [])
        setCategoryBusinesses(businessesResult.data || [])
        setFeaturedServices((featuredData || []).slice(0, 3))
        setLatestServices((latestData || []).slice(0, 3))
      } catch (err) {
        console.error(err)
        setError(err?.message || 'خطا در دریافت اطلاعات دسته‌بندی')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [slug])

  const seo = useMemo(() => {
    if (!category) return null

    return buildSeoPayload({
      seoEntry,
      path: `/category/${category.slug}`,
      fallback: {
        title: `${category.name} | نزدیکو`,
        description:
          category.description ||
          `مشاهده خدمات مرتبط با ${category.name}، معرفی کسب‌وکارها، بررسی خدمات و پیدا کردن بهترین گزینه‌ها در نزدیکو.`,
        image: categoryBusinesses?.[0]?.image_url || '',
      },
    })
  }, [category, seoEntry, categoryBusinesses])

  const categorySchema = useMemo(() => {
    if (!category) return null

    return {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: category.name || '',
      description:
        category.description ||
        `لیست خدمات و کسب‌وکارهای مرتبط با ${category.name}`,
      url: getCanonicalUrl(`/category/${category.slug}`),
      mainEntity: {
        '@type': 'ItemList',
        numberOfItems: categoryBusinesses.length,
        itemListElement: categoryBusinesses.slice(0, 20).map((item, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          url: getCanonicalUrl(`/business/${item.slug}`),
          name: item.title,
        })),
      },
    }
  }, [category, categoryBusinesses])

  if (loading) {
    return (
      <Layout>
        <div className="px-4 pt-32 pb-16 md:px-6">در حال بارگذاری...</div>
      </Layout>
    )
  }

  if (error && !category) {
    return (
      <Layout>
        <div className="px-4 pt-32 pb-16 text-red-500 md:px-6">{error}</div>
      </Layout>
    )
  }

  if (!category) {
    return (
      <Layout>
        <div className="px-4 pt-32 pb-16 text-red-500 md:px-6">
          دسته‌بندی پیدا نشد
        </div>
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
          />
          <StructuredData data={seoEntry?.custom_schema_json || categorySchema} />
        </>
      ) : null}

      <PageHero
        title={category.name}
        subtitle={
          category.description ||
          `لیست خدمات، کسب‌وکارها و زیرشاخه‌های مرتبط با ${category.name}`
        }
      />

      <section className="bg-slate-50 px-4 py-12 md:px-6">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-8">
            <div className="rounded-[28px] bg-white p-6 shadow-sm md:p-8">
              <span className="inline-flex rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-700">
                Category
              </span>

              <h1 className="mt-5 text-3xl font-bold text-slate-800 md:text-5xl">
                خدمات {category.name}
              </h1>

              <p className="mt-4 text-base leading-8 text-slate-600">
                {category.description ||
                  `در این صفحه می‌توانید خدمات مرتبط با ${category.name} را مشاهده کنید، کسب‌وکارهای فعال را بررسی کنید و با زیرشاخه‌های مهم این دسته آشنا شوید.`}
              </p>
            </div>

            {subcategories.length > 0 ? (
              <div className="rounded-[28px] bg-white p-6 shadow-sm md:p-8">
                <h2 className="text-2xl font-bold text-slate-800 md:text-3xl">
                  زیرشاخه‌های {category.name}
                </h2>

                <p className="mt-3 text-base leading-8 text-slate-600">
                  در دسته {category.name} می‌توانید خدمات تخصصی متنوعی را پیدا
                  کنید. زیرشاخه‌های این بخش به شما کمک می‌کنند راحت‌تر خدمت
                  موردنظر خود را پیدا کنید.
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                  {subcategories.map((item) => (
                    <Link
                      key={item.id}
                      to={`/listings?category=${category.slug}&subcategory=${item.slug}`}
                      className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="rounded-[28px] bg-white p-6 shadow-sm md:p-8">
              <div className="mb-6 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-slate-800 md:text-3xl">
                    خدمات مرتبط با {category.name}
                  </h2>
                  <p className="mt-2 text-sm text-slate-500">
                    {categoryBusinesses.length} مورد ثبت شده
                  </p>
                </div>

                <Link
                  to={`/listings?category=${category.slug}`}
                  className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-blue-200 hover:text-blue-700"
                >
                  مشاهده همه
                  <ChevronLeft className="h-4 w-4" />
                </Link>
              </div>

              {categoryBusinesses.length === 0 ? (
                <div className="rounded-2xl bg-slate-50 p-5 text-slate-500">
                  هنوز خدمتی در این دسته‌بندی ثبت نشده است.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  {categoryBusinesses.map((item) => (
                    <Link
                      key={item.id}
                      to={`/business/${item.slug}`}
                      className="overflow-hidden rounded-[24px] border border-slate-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                    >
                      <img
                        src={item.image_url || item.cover_image || '/placeholder.jpg'}
                        alt={item.title}
                        className="h-52 w-full object-cover"
                      />

                      <div className="p-5">
                        <h3 className="text-xl font-bold text-slate-800">
                          {item.title}
                        </h3>

                        <div className="mt-2 text-sm text-slate-500">
                          {item.city || 'بدون شهر'}
                        </div>

                        {item.description ? (
                          <p className="mt-3 line-clamp-3 text-sm leading-7 text-slate-600">
                            {item.description}
                          </p>
                        ) : null}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-[28px] bg-white p-6 shadow-sm md:p-8">
              <h2 className="text-2xl font-bold text-slate-800 md:text-3xl">
                درباره خدمات {category.name}
              </h2>

              <div className="mt-5 space-y-5 text-base leading-8 text-slate-600">
                <p>
                  اگر به دنبال بهترین خدمات {category.name} هستی، این صفحه به تو
                  کمک می‌کند کسب‌وکارهای فعال این حوزه را راحت‌تر پیدا کنی.
                  کاربران می‌توانند خدمات ثبت‌شده را بررسی کنند، اطلاعات تماس و
                  موقعیت را ببینند و مناسب‌ترین گزینه را انتخاب کنند.
                </p>

                {subcategories.length > 0 ? (
                  <p>
                    در این دسته‌بندی، زیرشاخه‌هایی مانند{' '}
                    {subcategories.map((item) => item.name).join('، ')} وجود
                    دارند که باعث می‌شوند جستجوی خدمات برای کاربر دقیق‌تر و
                    سریع‌تر انجام شود.
                  </p>
                ) : null}

                <p>
                  نزدیکو تلاش می‌کند خدمات مرتبط با {category.name} را به‌صورت
                  منظم، قابل جستجو و کاربردی نمایش دهد تا کاربران بتوانند با
                  اطمینان بیشتری کسب‌وکار موردنظر خود را انتخاب کنند.
                </p>
              </div>
            </div>

            <div className="block xl:hidden">
              <SidebarSection
                title="آخرین خدمات"
                items={latestServices}
                type="service"
              />
            </div>
          </div>

          <aside className="space-y-6">
            {subcategories.length > 0 ? (
              <SidebarSubcategories
                categorySlug={category.slug}
                items={subcategories}
              />
            ) : null}

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

function SidebarSubcategories({ categorySlug, items = [] }) {
  return (
    <div className="rounded-[28px] bg-white p-5 shadow-sm">
      <h3 className="mb-5 text-2xl font-bold text-slate-800">زیرشاخه‌ها</h3>

      <div className="space-y-3">
        {items.map((item) => (
          <Link
            key={item.id}
            to={`/listings?category=${categorySlug}&subcategory=${item.slug}`}
            className="block rounded-2xl p-3 transition hover:bg-slate-50"
          >
            <div className="font-medium text-slate-700">{item.name}</div>
          </Link>
        ))}
      </div>
    </div>
  )
}

function SidebarSection({ title, items = [], type = 'service' }) {
  return (
    <div className="rounded-[28px] bg-white p-5 shadow-sm">
      <h3 className="mb-5 text-2xl font-bold text-slate-800">{title}</h3>

      {items.length === 0 ? (
        <p className="text-sm text-slate-500">موردی برای نمایش وجود ندارد</p>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <Link
              key={item.id}
              to={`/business/${item.slug}`}
              className="flex items-center gap-3 rounded-2xl p-2 transition hover:bg-slate-50"
            >
              <img
                src={item.image_url || item.cover_image || '/placeholder.jpg'}
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

export default CategoryPage