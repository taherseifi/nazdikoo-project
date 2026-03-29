import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../components/layout/Layout'
import Seo from '../components/common/Seo'
import StructuredData from '../components/common/StructuredData'
import Hero from '../components/home/Hero'
import StatsSection from '../components/home/StatsSection'
import ExploreCategories from '../components/home/ExploreCategories'
import TrendingListings from '../components/home/TrendingListings'
import BlogSection from '../components/home/BlogSection'
import ListingsByArea from '../components/home/ListingsByArea'
import ServicesIntro from '../components/home/ServicesIntro'
import { getCategories } from '../services/supabase/categories.api'
import {
  getBusinessesGroupedByCity,
  getFeaturedBusinesses,
} from '../services/supabase/businesses.api'
import { getCanonicalUrl } from '../utils/seo/getCanonicalUrl'

function Home() {
  const [categories, setCategories] = useState([])
  const [featuredBusinesses, setFeaturedBusinesses] = useState([])
  const [areas, setAreas] = useState([])

  useEffect(() => {
    async function fetchHomeData() {
      try {
        const [categoriesData, featuredData, areasData] = await Promise.all([
          getCategories(),
          getFeaturedBusinesses(6),
          getBusinessesGroupedByCity(4),
        ])

        setCategories(categoriesData || [])
        setFeaturedBusinesses(featuredData || [])
        setAreas(areasData || [])
      } catch (error) {
        console.error(error)
      }
    }

    fetchHomeData()
  }, [])

  const homeSchema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        name: 'Nazdikoo',
        url: getCanonicalUrl('/'),
        potentialAction: {
          '@type': 'SearchAction',
          target: `${getCanonicalUrl('/listings')}?search={search_term_string}`,
          'query-input': 'required name=search_term_string',
        },
      },
      {
        '@type': 'Organization',
        name: 'Nazdikoo',
        url: getCanonicalUrl('/'),
        logo: `${getCanonicalUrl('/')}/logo.png`.replace(/([^:]\/)\/+/g, '$1'),
      },
    ],
  }

  return (
    <Layout>
      <Seo
        title="خدمات ایرانی در استانبول | بهترین دکتر، آرایشگاه و کسب‌وکارها | Nazdikoo"
        description="در نزدیکو بهترین خدمات ایرانی در استانبول و شهرهای دیگر را پیدا کنید؛ از پزشک و آرایشگاه تا خدمات ساختمانی، زیبایی و کسب‌وکارهای ایرانی."
        canonical={getCanonicalUrl('/')}
      />

      <StructuredData data={homeSchema} />

      <div className="sr-only">
        <h1>خدمات ایرانی در استانبول و شهرهای دیگر | Nazdikoo</h1>
        <p>
          نزدیکو مرجع معرفی و جستجوی خدمات ایرانی در شهرهای مختلف است. در این
          سایت می‌توانید پزشک، آرایشگاه، خدمات ساختمانی، زیبایی، آموزشی و دیگر
          کسب‌وکارهای ایرانی را پیدا کنید، اطلاعات تماس آن‌ها را ببینید و راحت‌تر
          انتخاب کنید.
        </p>
      </div>

      <Hero />
      <StatsSection />


      <section className="bg-white px-4 py-16 md:px-6 md:py-20">
        <div className="mx-auto max-w-5xl rounded-[32px] border border-slate-100 bg-slate-200/55 p-8 text-center shadow-sm md:p-12">
          <span className="inline-flex rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-700">
          خدمات نزدیکو
        </span>
          <h2 className="mt-5 text-3xl font-bold leading-tight text-slate-800 md:text-5xl">
از خدمات روزمره تا خدمات تخصصی، همه در یکجا          </h2>

          <p className="mt-4 leading-8 text-slate-600">
          در نزدیکو می‌تونی انواع خدمات مثل پزشک، وکیل، مربی، تعمیرکار،
          کابینت‌ساز، خدمات پت، آموزش، طراحی، خودرو، حمل‌ونقل، خانه و تاسیسات
          و بسیاری خدمات دیگر را بر اساس دسته‌بندی و شهر جستجو کنی و سریع‌تر به
          گزینه مناسب خودت برسی.
          </p>

          <p className="mt-4 leading-8 text-slate-600">
            هدف نزدیکو این است که کاربران راحت‌تر به خدمات معتبر ایرانی دسترسی
            داشته باشند و کسب‌وکارها هم بهتر دیده شوند. با مرور دسته‌بندی‌ها،
            مشاهده خدمات ویژه و بررسی کسب‌وکارهای هر منطقه، می‌توانی انتخاب
            سریع‌تر و مطمئن‌تری داشته باشی.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/listings"
              className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              مشاهده همه خدمات
            </Link>

            <Link
              to="/blogs"
              className="rounded-2xl border border-slate-300 px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              مطالعه بلاگ‌ها
            </Link>

            <Link
              to="/faq"
              className="rounded-2xl border border-slate-300 px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              سوالات متداول
            </Link>
          </div>
        </div>
      </section>

      <ExploreCategories categories={categories} />
      <TrendingListings businesses={featuredBusinesses} />
      <ListingsByArea areas={areas} />
      <BlogSection />
    </Layout>
  )
}

export default Home