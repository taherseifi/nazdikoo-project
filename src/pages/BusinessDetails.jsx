import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Layout from '../components/layout/Layout'
import Seo from '../components/common/Seo'
import StructuredData from '../components/common/StructuredData'
import PageHero from '../components/common/PageHero'
import { getSeoEntry } from '../services/supabase/seo.api'
import { buildSeoPayload } from '../utils/seo/buildSeoPayload'
import { getCanonicalUrl } from '../utils/seo/getCanonicalUrl'
import { Helmet } from 'react-helmet-async';
import {
  getBusinessBySlug,
  getBusinesses,
  getFeaturedBusinesses,
} from '../services/supabase/businesses.api'
import {
  createReview,
  getReviewsByBusinessId,
} from '../services/supabase/reviews.api'
import JsonLd from '../components/seo/JsonLd'
import {
  buildBusinessSchema,
  buildBreadcrumbSchema,
  buildReviewsSchema,
} from '../utils/schema'

function BusinessDetails() {
  const { slug } = useParams()

  const [business, setBusiness] = useState(null)
  const [seoEntry, setSeoEntry] = useState(null)
  const [reviews, setReviews] = useState([])
  const [featuredServices, setFeaturedServices] = useState([])
  const [latestServices, setLatestServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reviewForm, setReviewForm] = useState({
    reviewer_name: '',
    rating: 5,
    comment: '',
  })
  const [reviewSubmitting, setReviewSubmitting] = useState(false)
  const [reviewMessage, setReviewMessage] = useState('')
  const [reviewError, setReviewError] = useState('')
  const [activeGalleryImage, setActiveGalleryImage] = useState('')

  async function loadBusinessDetails() {
    try {
      setLoading(true)
      setError('')

      const businessData = await getBusinessBySlug(slug)
      setBusiness(businessData)
      setActiveGalleryImage(
        businessData.image_url || businessData.cover_image || businessData.gallery?.[0] || ''
      )

      const [seoData, reviewsData, featuredData, latestData] = await Promise.all([
        getSeoEntry('service', businessData.id),
        getReviewsByBusinessId(businessData.id),
        getFeaturedBusinesses(3),
        getBusinesses(null, null, 6),
      ])

      setSeoEntry(seoData)
      setReviews(reviewsData || [])
      setFeaturedServices((featuredData || []).filter((item) => item.slug !== businessData.slug).slice(0, 3))
      setLatestServices((latestData || []).filter((item) => item.slug !== businessData.slug).slice(0, 3))
    } catch (err) {
      console.error(err)
      setError(err.message || 'خطا در دریافت اطلاعات')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadBusinessDetails()
  }, [slug])

  const galleryImages = useMemo(() => {
    if (!business) return []
    const images = [
      business.image_url,
      business.cover_image,
      ...(Array.isArray(business.gallery) ? business.gallery : []),
    ].filter(Boolean)
    return [...new Set(images)]
  }, [business])

  const mapQuery = useMemo(() => {
    if (!business) return ''
    const parts = [business.address, business.region, business.city, business.country].filter(Boolean)
    return encodeURIComponent(parts.join(', '))
  }, [business])

  const mapEmbedUrl =
    business?.latitude && business?.longitude
      ? `https://www.google.com/maps?q=${business.latitude},${business.longitude}&z=15&output=embed`
      : mapQuery
      ? `https://www.google.com/maps?q=${mapQuery}&output=embed`
      : ''

  const mapOpenUrl =
    business?.latitude && business?.longitude
      ? `https://www.google.com/maps/search/?api=1&query=${business.latitude},${business.longitude}`
      : mapQuery
      ? `https://www.google.com/maps/search/?api=1&query=${mapQuery}`
      : ''

  const seo = useMemo(() => {
    if (!business) return null
    return buildSeoPayload({
      seoEntry,
      path: `/business/${business.slug}`,
      fallback: {
        title: business.title,
        description: business.description || 'مشاهده جزئیات این خدمت',
        image: business.image_url || business.cover_image || '',
      },
    })
  }, [business, seoEntry])

  const businessSchema = useMemo(() => buildBusinessSchema(business), [business])

  const breadcrumbSchema = useMemo(() => {
    if (!business) return null
    return buildBreadcrumbSchema([
      { name: 'خانه', url: '/' },
      { name: 'خدمات', url: '/listings' },
      { name: business.title, url: `/business/${business.slug}` },
    ])
  }, [business])

  const reviewsSchema = useMemo(() => buildReviewsSchema(reviews || []), [reviews])

  const localBusinessSchema = useMemo(() => {
    if (!business) return null
    return {
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      name: business.title,
      description: business.description || '',
      image: business.image_url || business.cover_image || '',
      telephone: business.phone || '',
      address: business.address || '',
      url: getCanonicalUrl(`/business/${business.slug}`),
    }
  }, [business])

  function handleReviewChange(event) {
    const { name, value } = event.target
    setReviewForm((prev) => ({ ...prev, [name]: value }))
  }

  async function handleReviewSubmit(event) {
    event.preventDefault()
    if (!business) return

    try {
      setReviewSubmitting(true)
      setReviewError('')
      setReviewMessage('')

      if (!reviewForm.reviewer_name.trim()) {
        setReviewError('نام خودت را وارد کن')
        return
      }

      if (!reviewForm.comment.trim()) {
        setReviewError('متن نظر را وارد کن')
        return
      }

      await createReview({
        business_id: business.id,
        reviewer_name: reviewForm.reviewer_name,
        rating: Number(reviewForm.rating),
        comment: reviewForm.comment,
      })

      setReviewForm({ reviewer_name: '', rating: 5, comment: '' })
      setReviewMessage('نظر شما با موفقیت ثبت شد.')

      const updatedReviews = await getReviewsByBusinessId(business.id)
      setReviews(updatedReviews || [])
    } catch (err) {
      setReviewError(err.message || 'ثبت نظر انجام نشد')
    } finally {
      setReviewSubmitting(false)
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="p-4 md:p-6">در حال بارگذاری جزئیات...</div>
      </Layout>
    )
  }

  if (error && !business) {
    return (
      <Layout>
        <div className="p-4 text-red-500 md:p-6">{error}</div>
      </Layout>
    )
  }

  return (
    <Layout>
      {seo ? (
        <>
        <Helmet>
  <title>{blogTitle} | مجله تخصصی نزدیکو</title>
  <meta name="description" content={blogSummary} />
  <meta name="keywords" content={`${blogTags}, نزدیکو، استانبول، راهنمای ترکیه`} />
  <link rel="canonical" href={`https://nazdikoo.com/blogs/${blogSlug}`} />
  
  <meta property="og:title" content={blogTitle} />
  <meta property="og:description" content={blogSummary} />
  <meta property="og:type" content="article" />
  <meta property="og:image" content={blogThumbnailUrl} />
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
    
          <StructuredData data={seoEntry?.custom_schema_json || localBusinessSchema} />
          <JsonLd data={businessSchema} />
          <JsonLd data={breadcrumbSchema} />
          {reviewsSchema?.map((item, i) => (
            <JsonLd key={i} data={item} />
          ))}
        </>
      ) : null}

      <PageHero
        title={business.title}
        subtitle={`مشاهده جزئیات کامل ${business.title} و اطلاعات تماس، موقعیت و نظرات کاربران.`}
      />

      <div className="bg-slate-50 p-4 md:p-6">
        <div className="mx-auto max-w-7xl">
          {!loading && !error && business && (
            <div className="mt-8 grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1fr)_320px]">
              <div className="space-y-8">
                <div className="overflow-hidden rounded-3xl bg-white shadow">
                  {activeGalleryImage && (
                    <img
                      src={activeGalleryImage}
                      alt={business.title}
                      className="h-72 w-full object-cover md:h-96"
                    />
                  )}

                  {galleryImages.length > 1 && (
                    <div className="grid grid-cols-2 gap-3 border-t p-4 md:grid-cols-4">
                      {galleryImages.map((image, index) => (
                        <button
                          key={`${image}-${index}`}
                          type="button"
                          onClick={() => setActiveGalleryImage(image)}
                          className={`overflow-hidden rounded-2xl border transition ${
                            activeGalleryImage === image ? 'border-gray-900' : 'border-gray-200'
                          }`}
                        >
                          <img
                            src={image}
                            alt={`${business.title}-${index}`}
                            className="h-24 w-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="p-6 md:p-8">
                    <div className="mb-4 flex flex-wrap items-center gap-3">
                      <h1 className="text-3xl font-bold text-gray-900">{business.title}</h1>
                      {business.is_featured && (
                        <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-700">
                          ویژه
                        </span>
                      )}
                    </div>

                    <p className="mb-6 leading-8 text-gray-700">{business.description}</p>

                    <div className="grid grid-cols-1 gap-4 text-sm text-gray-700 md:grid-cols-2">
                      <p>دسته‌بندی: {business.categories?.name || '---'}</p>
                      <p>زیرشاخه: {business.subcategories?.name || '---'}</p>
                      <p>کشور: {business.country}</p>
                      <p>شهر: {business.city}</p>
                      <p>منطقه: {business.region || '---'}</p>
                      <p>آدرس: {business.address}</p>
                      <p>تلفن: {business.phone}</p>
                      <p>واتساپ: {business.whatsapp}</p>
                      <p>ایمیل: {business.email || '---'}</p>
                      <p>وبسایت: {business.website || '---'}</p>
                      <p>امتیاز: {business.rating_avg}</p>
                      <p>تعداد نظرات: {business.reviews_count}</p>
                    </div>

                    <div className="mt-8 rounded-2xl bg-slate-50 p-5">
                      <h2 className="text-2xl font-bold text-slate-800">چرا این صفحه مهم است؟</h2>
                      <p className="mt-3 leading-8 text-slate-600">
                        در این صفحه می‌توانی اطلاعات تماس، موقعیت روی نقشه، تصاویر،
                        جزئیات خدمات و نظرات کاربران را ببینی. این کمک می‌کند قبل از
                        تماس یا مراجعه، شناخت بهتری از این کسب‌وکار داشته باشی.
                      </p>
                    </div>
                  </div>
                </div>

                <section className="rounded-3xl bg-white p-5 shadow md:p-6">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <h2 className="text-2xl font-bold">موقعیت روی نقشه</h2>
                    {mapOpenUrl && (
                      <a
                        href={mapOpenUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-xl bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
                      >
                        باز کردن در گوگل مپ
                      </a>
                    )}
                  </div>

                  {mapEmbedUrl ? (
                    <div className="overflow-hidden rounded-2xl border">
                      <iframe
                        title={`map-${business.slug}`}
                        src={mapEmbedUrl}
                        className="h-[350px] w-full md:h-[450px]"
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                      />
                    </div>
                  ) : (
                    <div className="rounded-2xl bg-gray-50 p-4 text-sm text-gray-600">
                      برای این کسب‌وکار آدرس کافی برای نمایش نقشه ثبت نشده است.
                    </div>
                  )}
                </section>

                <section className="rounded-3xl bg-white p-5 shadow md:p-6">
                  <h2 className="mb-4 text-2xl font-bold">ثبت نظر</h2>
                  <form onSubmit={handleReviewSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-800">نام</label>
                        <input
                          type="text"
                          name="reviewer_name"
                          value={reviewForm.reviewer_name}
                          onChange={handleReviewChange}
                          className={inputClass}
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-800">امتیاز</label>
                        <select
                          name="rating"
                          value={reviewForm.rating}
                          onChange={handleReviewChange}
                          className={inputClass}
                        >
                          <option value={5}>5</option>
                          <option value={4}>4</option>
                          <option value={3}>3</option>
                          <option value={2}>2</option>
                          <option value={1}>1</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-800">متن نظر</label>
                      <textarea
                        name="comment"
                        rows={4}
                        value={reviewForm.comment}
                        onChange={handleReviewChange}
                        className={`${inputClass} resize-none`}
                      />
                    </div>

                    {reviewError && (
                      <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
                        {reviewError}
                      </div>
                    )}

                    {reviewMessage && (
                      <div className="rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
                        {reviewMessage}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={reviewSubmitting}
                      className="rounded-2xl bg-gray-900 px-6 py-3 font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {reviewSubmitting ? 'در حال ثبت نظر...' : 'ثبت نظر'}
                    </button>
                  </form>
                </section>

                <section>
                  <h2 className="mb-4 text-2xl font-bold">نظرات</h2>

                  {reviews.length === 0 ? (
                    <div className="rounded-2xl bg-white p-6 shadow">هنوز نظری ثبت نشده</div>
                  ) : (
                    <div className="space-y-4">
                      {reviews.map((review) => (
                        <div key={review.id} className="rounded-2xl bg-white p-5 shadow">
                          <div className="mb-2 flex items-center justify-between gap-3">
                            <h3 className="font-semibold text-gray-900">{review.reviewer_name}</h3>
                            <span className="text-sm text-yellow-600">امتیاز: {review.rating}</span>
                          </div>
                          <p className="text-sm leading-7 text-gray-700">{review.comment}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              </div>

              <aside className="space-y-6">
                <SidebarSection title="خدمات ویژه" items={featuredServices} />
                <SidebarSection title="آخرین خدمات" items={latestServices} />
              </aside>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}

function SidebarSection({ title, items = [] }) {
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
                src={item.image_url || item.cover_image}
                alt={item.title}
                className="h-16 w-16 rounded-xl object-cover"
              />

              <div className="min-w-0 flex-1">
                <div className="line-clamp-1 font-medium text-slate-700">{item.title}</div>
                <div className="mt-1 text-sm text-slate-500">{item.city}</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

const inputClass =
  'w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none transition focus:border-gray-400'

export default BusinessDetails
