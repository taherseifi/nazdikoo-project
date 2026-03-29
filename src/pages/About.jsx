import { useEffect, useMemo, useState } from 'react'
import Layout from '../components/layout/Layout'
import PageHero from '../components/common/PageHero'
import Seo from '../components/common/Seo'
import StructuredData from '../components/common/StructuredData'
import { getSeoEntry } from '../services/supabase/seo.api'
import { buildSeoPayload } from '../utils/seo/buildSeoPayload'
import { getCanonicalUrl } from '../utils/seo/getCanonicalUrl'
import { Helmet } from 'react-helmet-async';

function About() {
  const [seoEntry, setSeoEntry] = useState(null)

  useEffect(() => {
    async function loadSeo() {
      try {
        const data = await getSeoEntry('static_page', 'about')
        setSeoEntry(data)
      } catch (error) {
        console.error(error)
      }
    }

    loadSeo()
  }, [])

  const seo = useMemo(() => {
    return buildSeoPayload({
      seoEntry,
      path: '/about',
      fallback: {
        title: 'درباره ما',
        description:
          'آشنایی با نزدیکو، هدف ما و مسیری که برای ساده‌تر کردن پیدا کردن خدمات ساخته‌ایم.',
        image:
          'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1400&auto=format&fit=crop',
      },
    })
  }, [seoEntry])

  const aboutSchema = useMemo(() => {
    return {
      '@context': 'https://schema.org',
      '@type': 'AboutPage',
      name: 'درباره ما',
      description:
        'آشنایی با نزدیکو، هدف ما و مسیری که برای ساده‌تر کردن پیدا کردن خدمات ساخته‌ایم.',
      url: getCanonicalUrl('/about'),
    }
  }, [])

  return (
    <Layout>
      <Helmet>
  <title>درباره ما | داستان پلتفرم نزدیکو در ترکیه</title>
  <meta name="description" content="نزدیکو پلی است میان کاربران و متخصصین در استانبول. با اهداف و تیم ما برای بهبود کیفیت خدمات در ترکیه آشنا شوید." />
  <meta name="keywords" content="درباره نزدیکو، تیم نزدیکو، خدمات در ترکیه، استارتاپ استانبول" />
  <link rel="canonical" href="https://nazdikoo.com/about" />
</Helmet>
      <Seo
        title={seo.title}
        description={seo.description}
        image={seo.image}
        url={seo.url}
        robots={seo.robots}
        ogTitle={seo.ogTitle}
        ogDescription={seo.ogDescription}
      />
      <StructuredData data={seoEntry?.custom_schema_json || aboutSchema} />

      <PageHero
        title="درباره ما"
        subtitle="آشنایی با نزدیکو، هدف ما و مسیری که برای ساده‌تر کردن پیدا کردن خدمات ساخته‌ایم."
      />

      <section className="bg-slate-100/70 px-4 pb-16 md:px-6 md:pb-20">
        <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-2">
          <div>
            <span className="inline-flex rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-700">
              درباره نزدیکو
            </span>

            <h1 className="mt-5 text-4xl font-bold leading-tight text-slate-800 md:text-5xl">
              نزدیکو؛ پلی بین کاربران و خدمات‌دهندگان قابل اعتماد
            </h1>

            <p className="mt-6 text-lg leading-8 text-slate-600">
              نزدیکو با یک هدف ساده اما مهم شکل گرفت: پیدا کردن خدمات مناسب باید
              سریع، شفاف و قابل اعتماد باشد. ما این فضا را ساختیم تا کاربران
              بتوانند خدمات مورد نیازشان را راحت‌تر پیدا کنند و خدمات‌دهندگان هم
              بتوانند خودشان را بهتر معرفی کنند.
            </p>

            <p className="mt-4 text-lg leading-8 text-slate-600">
              از خدمات روزمره مثل تعمیرات، پزشک، وکیل و مربی گرفته تا خدمات تخصصی
              و محلی، نزدیکو تلاش می‌کند یک مرجع کاربردی و قابل اتکا برای جستجو،
              مقایسه و انتخاب باشد.
            </p>
          </div>

          <div className="overflow-hidden rounded-[32px] bg-white shadow-xl">
            <img
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1400&auto=format&fit=crop"
              alt="About Nazdikoo"
              className="h-full min-h-[320px] w-full object-cover"
            />
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-16 md:px-6 md:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-3xl bg-slate-50 p-6 shadow-sm">
              <h2 className="mb-3 text-2xl font-bold text-slate-800">
                مأموریت ما
              </h2>
              <p className="leading-8 text-slate-600">
                ساده‌کردن مسیر پیدا کردن خدمات باکیفیت و ایجاد بستری که در آن
                ارتباط بین مشتری و خدمات‌دهنده سریع‌تر، شفاف‌تر و مطمئن‌تر انجام
                شود.
              </p>
            </div>

            <div className="rounded-3xl bg-slate-50 p-6 shadow-sm">
              <h2 className="mb-3 text-2xl font-bold text-slate-800">
                چشم‌انداز ما
              </h2>
              <p className="leading-8 text-slate-600">
                تبدیل‌شدن به یکی از کاربردی‌ترین پلتفرم‌های خدمات محلی؛ جایی که
                هر کاربر بتواند در کمترین زمان، بهترین گزینه را پیدا کند.
              </p>
            </div>

            <div className="rounded-3xl bg-slate-50 p-6 shadow-sm">
              <h2 className="mb-3 text-2xl font-bold text-slate-800">
                ارزش ما
              </h2>
              <p className="leading-8 text-slate-600">
                ما روی سادگی، اعتماد، دسترسی‌پذیری و تجربه کاربری خوب تمرکز
                کرده‌ایم تا هم کاربران و هم خدمات‌دهندگان از حضور در این فضا
                سود ببرند.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-slate-100/70 px-4 py-16 md:px-6 md:py-20">
        <div className="mx-auto max-w-5xl rounded-[32px] bg-white p-8 text-center shadow-sm md:p-12">
          <h2 className="text-3xl font-bold text-slate-800 md:text-4xl">
            نزدیکو برای پیدا شدن بهتر خدمات ساخته شده
          </h2>
          <p className="mt-5 text-lg leading-8 text-slate-600">
            ما باور داریم هر خدمات‌دهنده خوب باید فرصت دیده‌شدن داشته باشد و هر
            کاربر باید بتواند با اطمینان انتخاب کند. نزدیکو این دو مسیر را به هم
            وصل می‌کند.
          </p>
        </div>
      </section>
    </Layout>
  )
}

export default About