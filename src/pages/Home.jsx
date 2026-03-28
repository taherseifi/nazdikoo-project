import { useEffect, useState } from 'react'
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

function Home() {
  const [categories, setCategories] = useState([])
  const [featuredBusinesses, setFeaturedBusinesses] = useState([])
  const [areas, setAreas] = useState([])

  useEffect(() => {
    async function fetchHomeData() {
      try {
        const [categoriesData, featuredData, areasData] =
          await Promise.all([
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
    '@type': 'WebSite',
    name: 'نزدیکو',
    url: 'https://nazdikoo.com',
    potentialAction: {
      '@type': 'SearchAction',
      target:
        'https://nazdikoo.com/listings?category={category}&city={city}',
      'query-input': 'required name=category',
    },
  }

  return (
    <Layout>
      <Seo
        title="نزدیکو | مرجع خدمات ایرانیان در سراسر دنیا"
        description="نزدیکو پلتفرم جستجو و معرفی خدمات ایرانیان در سراسر دنیا است. بهترین آرایشگاه، پزشک، خدمات ساختمانی و کسب‌وکارهای ایرانی را سریع و آسان پیدا کن."
        canonical="https://nazdikoo.com"
      />

      <StructuredData data={homeSchema} />

      <Hero />
      <StatsSection />
      <ServicesIntro />
      <ExploreCategories categories={categories} />
      <TrendingListings businesses={featuredBusinesses} />
      <ListingsByArea areas={areas} />
      <BlogSection />
    </Layout>
  )
}

export default Home