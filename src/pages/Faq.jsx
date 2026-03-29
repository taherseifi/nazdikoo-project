import { useEffect, useState } from 'react'
import Layout from '../components/layout/Layout'
import PageHero from '../components/common/PageHero'
import AccordionItem from '../components/common/AccordionItem'
import SidebarInfoBlocks from '../components/common/SidebarInfoBlocks'
import Seo from '../components/common/Seo'
import { getBusinesses, getFeaturedBusinesses } from '../services/supabase/businesses.api'
import JsonLd from '../components/seo/JsonLd'
import { buildFaqSchema } from '../utils/schema'
import { getCanonicalUrl } from '../utils/seo/getCanonicalUrl'

const faqItems = [
  {
    question: 'چطور می‌توانم خدمات خودم را در نزدیکو ثبت کنم؟',
    answer:
      'از صفحه ثبت خدمات، اطلاعات کسب‌وکار، دسته‌بندی، زیرشاخه، اطلاعات تماس، عکس‌ها و موقعیت مکانی را وارد کنید. بعد از ثبت، درخواست شما بررسی می‌شود و در صورت تایید نمایش داده خواهد شد.',
  },
  {
    question: 'آیا ثبت خدمات در سایت رایگان است؟',
    answer:
      'در نسخه فعلی ثبت خدمات رایگان است. در آینده ممکن است برای خدمات ویژه یا امکانات تبلیغاتی، پلن‌های جداگانه اضافه شود.',
  },
  {
    question: 'بعد از ثبت، خدمات من چه زمانی نمایش داده می‌شود؟',
    answer:
      'بعد از ثبت، اطلاعات شما توسط ادمین بررسی می‌شود. در صورت تایید، صفحه خدمات شما در سایت منتشر خواهد شد.',
  },
  {
    question: 'آیا می‌توانم چند عکس برای خدماتم آپلود کنم؟',
    answer:
      'بله، هنگام ثبت خدمات می‌توانید یک عکس کاور و چند عکس برای گالری آپلود کنید تا صفحه شما کامل‌تر و حرفه‌ای‌تر نمایش داده شود.',
  },
  {
    question: 'اگر اطلاعات کسب‌وکارم تغییر کرد چه کار کنم؟',
    answer:
      'اگر بعداً نیاز به ویرایش اطلاعات داشتید، باید از طریق ارتباط با پشتیبانی یا پنل مدیریت هماهنگ شود تا اطلاعات جدید ثبت گردد.',
  },
]

const faqSchema = buildFaqSchema(faqItems)

function Faq() {
  const [featuredServices, setFeaturedServices] = useState([])
  const [latestServices, setLatestServices] = useState([])

  useEffect(() => {
    async function loadAll() {
      try {
        const [featured, latest] = await Promise.all([
          getFeaturedBusinesses(3),
          getBusinesses(null, null, 6),
        ])

        setFeaturedServices(featured || [])
        setLatestServices((latest || []).slice(0, 3))
      } catch (error) {
        console.error(error)
      }
    }

    loadAll()
  }, [])

  return (
    <Layout>
      <JsonLd data={faqSchema} />
      <Seo
        title="سوالات متداول | نزدیکو"
        description="پاسخ سوالات متداول کاربران نزدیکو درباره ثبت خدمات، تایید کسب‌وکار، آپلود تصاویر، اطلاعات تماس و نمایش صفحات خدمات."
        canonical={getCanonicalUrl('/faq')}
      />

      <PageHero title="سوالات متداول" subtitle="پاسخ سوالات پرتکرار کاربران" />

      <section className="bg-slate-100 px-4 py-12 md:px-6">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-5">
            <div className="rounded-[32px] bg-white p-6 shadow-sm md:p-8">
              <span className="inline-flex rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-700">
                FAQ
              </span>

              <h1 className="mt-5 text-3xl font-bold text-slate-800 md:text-5xl">
                پاسخ سوال‌های متداول کاربران
              </h1>

              <p className="mt-4 max-w-3xl text-base leading-8 text-slate-600">
                اگر درباره ثبت خدمات، نمایش کسب‌وکار، آپلود تصاویر، موقعیت نقشه یا
                نحوه تایید صفحه‌ات سوال داری، این بخش سریع‌ترین راه برای رسیدن به جواب است.
              </p>
            </div>

            <div className="space-y-4">
              {faqItems.map((item, index) => (
                <AccordionItem
                  className="rounded-2xl border border-slate-300 bg-white shadow-sm"
                  key={index}
                  question={item.question}
                  answer={item.answer}
                />
              ))}
            </div>
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

export default Faq
