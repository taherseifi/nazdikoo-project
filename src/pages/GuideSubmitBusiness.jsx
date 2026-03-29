import { useEffect, useState } from 'react'
import Layout from '../components/layout/Layout'
import PageHero from '../components/common/PageHero'
import SidebarInfoBlocks from '../components/common/SidebarInfoBlocks'
import Seo from '../components/common/Seo'
import { getSeoEntry } from '../services/supabase/seo.api'
import { getBusinesses, getFeaturedBusinesses } from '../services/supabase/businesses.api'
import { Helmet } from 'react-helmet-async';


const guideSections = [
  {
    step: 'مرحله 1',
    title: 'انتخاب نوع کسب‌وکار و زیرشاخه دقیق',
    text: 'در فرم ثبت خدمات، ابتدا دسته اصلی کسب‌وکار را انتخاب کن و بعد از آن زیرشاخه دقیق شغل خودت را مشخص کن تا کاربران راحت‌تر تو را پیدا کنند.',
    image: '/images/guide-placeholder-1.jpg',
  },
  {
    step: 'مرحله 2',
    title: 'وارد کردن اطلاعات تماس و آدرس دقیق',
    text: 'شماره تماس، واتساپ، ایمیل، کشور، شهر، منطقه و آدرس را با دقت وارد کن. هرچه اطلاعات کامل‌تر باشد، اعتماد کاربر بیشتر می‌شود.',
    image: '/images/guide-placeholder-2.jpg',
  },
  {
    step: 'مرحله 3',
    title: 'آپلود عکس کاور و گالری',
    text: 'یک تصویر کاور مناسب و حداقل ۳ عکس برای گالری قرار بده تا صفحه خدماتت حرفه‌ای‌تر دیده شود و کاربر بهتر با کسب‌وکار تو آشنا شود.',
    image: '/images/guide-placeholder-3.jpg',
  },
  {
    step: 'مرحله 4',
    title: 'انتخاب موقعیت روی نقشه',
    text: 'روی نقشه، محل دقیق کسب‌وکار را مشخص کن تا در صفحه جزئیات خدمت، موقعیت تو برای کاربران نمایش داده شود.',
    image: '/images/guide-placeholder-4.jpg',
  },
]

function GuideSubmitBusiness() {
  const [featuredServices, setFeaturedServices] = useState([])
  const [latestServices, setLatestServices] = useState([])
  const [seo, setSeo] = useState(null)

  useEffect(() => {
    async function loadAll() {
      try {
        const [featured, latest, seoData] = await Promise.all([
          getFeaturedBusinesses(3),
          getBusinesses(null, null, 6),
          getSeoEntry('static', 'submit-business'),
        ])

        setFeaturedServices(featured || [])
        setLatestServices((latest || []).slice(0, 3))
        setSeo(seoData)
      } catch (error) {
        console.error(error)
      }
    }

    loadAll()
  }, [])

  return (
    <Layout>
      <Helmet>
  <title>راهنمای جامع ثبت تخصص در استانبول | نزدیکو</title>
  <meta 
    name="description" 
    content="چگونه در نزدیکو به عنوان متخصص ثبت‌نام کنیم؟ آموزش گام‌به‌گام برای ورود به بازار کار خدمات در استانبول و جذب مشتری." 
  />
  <meta 
    name="keywords" 
    content="آموزش ثبت نام نزدیکو، کار در استانبول، جذب مشتری فارسی زبان، راهنمای متخصصین نزدیکو" 
  />
  <link rel="canonical" href="https://nazdikoo.com/guide-submit-business" />
  
  <meta property="og:title" content="راهنمای ورود به بازار کار خدمات در استانبول" />
  <meta 
    property="og:description" 
    content="با این راهنما، پروفایل حرفه‌ای خود را در نزدیکو بسازید و در استانبول دیده شوید." 
  />
</Helmet>
      <Seo
        title={seo?.meta_title || 'آموزش ثبت خدمات | Nazdikoo'}
        description={seo?.meta_description || 'راهنمای ثبت خدمات'}
        canonical={seo?.canonical_url}
      />

      <PageHero
        title="آموزش ثبت خدمات"
        subtitle="راهنمای کامل ثبت کسب‌وکار"
      />


      <section className="bg-slate-100 px-4 py-12 md:px-6">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-6">
            <div className="rounded-[32px] bg-white p-6 shadow-sm md:p-8 border-slate-300 border">
              <span className="inline-flex rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-700">
                راهنمای ثبت خدمات
              </span>

              <h1 className="mt-5 text-3xl font-bold text-slate-800 md:text-5xl">
                چطور خدمات خودم را در نزدیکو ثبت کنم؟
              </h1>

              <p className="mt-4 max-w-3xl text-base leading-8 text-slate-600">
                این راهنما بهت کمک می‌کند اطلاعات خدماتت را درست، کامل و حرفه‌ای
                وارد کنی تا صفحه تو شانس بیشتری برای دیده شدن و جلب اعتماد کاربران
                داشته باشد.
              </p>
            </div>

            {guideSections.map((section, index) => (
              <div
                key={index}
                className="grid grid-cols-1 gap-6 rounded-[32px] bg-white p-6 shadow-sm md:grid-cols-2 md:p-8 border-slate-300 border"
              >
                <div className="order-2 flex flex-col justify-center md:order-1">
                  <span className="inline-flex w-fit rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 border-slate-300 border ">
                    {section.step}
                  </span>

                  <h2 className="mt-4 text-2xl font-bold text-slate-800 md:text-3xl">
                    {section.title}
                  </h2>

                  <p className="mt-4 text-base leading-8 text-slate-600">
                    {section.text}
                  </p>
                </div>

                <div className="order-1 md:order-2">
                  <img
                    src={section.image}
                    alt={section.title}
                    className="h-72 w-full rounded-[28px] object-cover"
                  />
                </div>
              </div>
            ))}
          </div>

          <aside>
            <SidebarInfoBlocks
              featuredServices={featuredServices}
              latestServices={latestServices}
            />
          </aside>
        </div>
      </section>
    </Layout>
  )
}

export default GuideSubmitBusiness