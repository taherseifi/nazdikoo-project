import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import Layout from '../components/layout/Layout'
import LocationPickerMap from '../components/map/LocationPickerMap'
import PageHero from '../components/common/PageHero'
import {
  getCategories,
  getSubcategoriesByCategoryId,
} from '../services/supabase/categories.api'
import { createBusiness } from '../services/supabase/businesses.api'
import {
  uploadBusinessImage,
  uploadBusinessImages,
} from '../services/supabase/storage.api'

const schema = z.object({
  title: z.string().min(3, 'عنوان باید حداقل ۳ کاراکتر باشد'),
  description: z.string().min(10, 'توضیحات باید حداقل ۱۰ کاراکتر باشد'),
  category_id: z.string().min(1, 'نوع کسب‌وکار را انتخاب کن'),
  subcategory_id: z.string().min(1, 'نوع دقیق شغل را انتخاب کن'),
  country: z.string().min(2, 'کشور را وارد کن'),
  city: z.string().min(2, 'شهر را وارد کن'),
  region: z.string().optional(),
  address: z.string().min(5, 'آدرس را کامل‌تر وارد کن'),
  phone: z.string().min(5, 'شماره تماس معتبر نیست'),
  whatsapp: z.string().min(5, 'شماره واتساپ معتبر نیست'),
  email: z.string().email('ایمیل معتبر نیست'),
  website: z.string().optional(),
})

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-آ-ی]/g, '')
}

function SubmitBusiness() {
  const [categories, setCategories] = useState([])
  const [subcategories, setSubcategories] = useState([])
  const [location, setLocation] = useState(null)
  const [pageError, setPageError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const [galleryFiles, setGalleryFiles] = useState([])
  const [galleryPreviews, setGalleryPreviews] = useState([])
  const [mapSearchLoading, setMapSearchLoading] = useState(false)
  const [mapSearchText, setMapSearchText] = useState('')
  const [mapLinkText, setMapLinkText] = useState('')
  const [locationResults, setLocationResults] = useState([])
  const [selectedLocationLabel, setSelectedLocationLabel] = useState('')

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      description: '',
      category_id: '',
      subcategory_id: '',
      country: 'ترکیه',
      city: '',
      region: '',
      address: '',
      phone: '',
      whatsapp: '',
      email: '',
      website: '',
    },
  })

  const selectedCategoryId = watch('category_id')

  useEffect(() => {
    async function loadCategories() {
      try {
        const data = await getCategories()
        setCategories(data)
      } catch (err) {
        setPageError(err.message || 'خطا در دریافت دسته‌بندی‌ها')
      }
    }

    loadCategories()
  }, [])

  useEffect(() => {
    async function loadSubcategories() {
      try {
        setSubcategories([])
        setValue('subcategory_id', '')

        if (!selectedCategoryId) return

        const data = await getSubcategoriesByCategoryId(selectedCategoryId)
        setSubcategories(data)
      } catch (err) {
        setPageError(err.message || 'خطا در دریافت زیرشاخه‌ها')
      }
    }

    loadSubcategories()
  }, [selectedCategoryId, setValue])

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview)
      }

      galleryPreviews.forEach((preview) => URL.revokeObjectURL(preview))
    }
  }, [imagePreview, galleryPreviews])

  const previewMapUrl = useMemo(() => {
    if (!location?.lat || !location?.lng) return ''
    return `https://www.google.com/maps/search/?api=1&query=${location.lat},${location.lng}`
  }, [location])

  function handleFileChange(event) {
    const file = event.target.files?.[0]

    if (!file) {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview)
      }

      setSelectedFile(null)
      setImagePreview('')
      return
    }

    if (imagePreview) {
      URL.revokeObjectURL(imagePreview)
    }

    setSelectedFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  function handleGalleryChange(event) {
    const files = Array.from(event.target.files || [])

    galleryPreviews.forEach((preview) => URL.revokeObjectURL(preview))

    setGalleryFiles(files)
    setGalleryPreviews(files.map((file) => URL.createObjectURL(file)))
  }

  function extractCoordinatesFromGoogleMapsUrl(url) {
    if (!url) return null

    try {
      const decodedUrl = decodeURIComponent(url.trim())

      const atMatch = decodedUrl.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*)/)
      if (atMatch) {
        return {
          lat: Number(atMatch[1]),
          lng: Number(atMatch[2]),
        }
      }

      const qMatch = decodedUrl.match(/[?&]q=(-?\d+\.?\d*),(-?\d+\.?\d*)/)
      if (qMatch) {
        return {
          lat: Number(qMatch[1]),
          lng: Number(qMatch[2]),
        }
      }

      const queryMatch = decodedUrl.match(/[?&]query=(-?\d+\.?\d*),(-?\d+\.?\d*)/)
      if (queryMatch) {
        return {
          lat: Number(queryMatch[1]),
          lng: Number(queryMatch[2]),
        }
      }

      const llMatch = decodedUrl.match(/[?&]ll=(-?\d+\.?\d*),(-?\d+\.?\d*)/)
      if (llMatch) {
        return {
          lat: Number(llMatch[1]),
          lng: Number(llMatch[2]),
        }
      }

      return null
    } catch {
      return null
    }
  }

  async function searchLocationByAddress() {
    const directQuery = mapSearchText.trim()
    const formAddress = watch('address')?.trim() || ''
    const formCity = watch('city')?.trim() || ''
    const formCountry = watch('country')?.trim() || ''

    const query = [directQuery || formAddress, formCity, formCountry]
      .filter(Boolean)
      .join(', ')

    if (!query) {
      setPageError('اول آدرس را وارد کن')
      return
    }

    try {
      setMapSearchLoading(true)
      setPageError('')
      setLocationResults([])
      setSelectedLocationLabel('')

      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5&addressdetails=1&accept-language=tr,fa,en&q=${encodeURIComponent(
          query
        )}`
      )

      const data = await response.json()

      if (!Array.isArray(data) || data.length === 0) {
        setPageError('برای این آدرس موقعیت پیدا نشد. آدرس را دقیق‌تر بنویس یا لینک گوگل مپ وارد کن')
        return
      }

      const normalizedResults = data.map((item) => ({
        label: item.display_name,
        lat: Number(item.lat),
        lng: Number(item.lon),
      }))

      setLocationResults(normalizedResults)

      if (normalizedResults.length === 1) {
        setLocation({
          lat: normalizedResults[0].lat,
          lng: normalizedResults[0].lng,
        })
        setSelectedLocationLabel(normalizedResults[0].label)

        if (!watch('address')?.trim() && directQuery) {
          setValue('address', directQuery)
        }
      }
    } catch {
      setPageError('جستجوی آدرس انجام نشد')
    } finally {
      setMapSearchLoading(false)
    }
  }

  function handleSelectSearchedLocation(item) {
    setLocation({
      lat: item.lat,
      lng: item.lng,
    })
    setSelectedLocationLabel(item.label)
    setPageError('')

    if (!watch('address')?.trim() && mapSearchText.trim()) {
      setValue('address', mapSearchText.trim())
    }
  }

  async function applyGoogleMapsLink() {
    const url = mapLinkText.trim()

    if (!url) {
      setPageError('اول لینک گوگل مپ را وارد کن')
      return
    }

    setPageError('')
    setLocationResults([])
    setSelectedLocationLabel('')

    const coordinates = extractCoordinatesFromGoogleMapsUrl(url)

    if (coordinates?.lat && coordinates?.lng) {
      setLocation(coordinates)
      setSelectedLocationLabel(`Google Maps: ${coordinates.lat}, ${coordinates.lng}`)
      return
    }

    setPageError('از این لینک مختصات مستقیم پیدا نشد. لینک کامل‌تری وارد کن یا از آدرس/کلیک روی نقشه استفاده کن')
  }

  async function onSubmit(values) {
    try {
      setPageError('')
      setSuccessMessage('')

      if (!location?.lat || !location?.lng) {
        setPageError('لطفاً موقعیت مکانی را روی نقشه انتخاب کن یا از آدرس/لینک استفاده کن')
        return
      }

      if (!selectedFile) {
        setPageError('لطفاً عکس کاور را انتخاب کن')
        return
      }

      if (galleryFiles.length < 3) {
        setPageError('حداقل ۳ عکس برای گالری لازم است')
        return
      }

      const slug = slugify(values.title)

      const uploadedImageUrl = await uploadBusinessImage(selectedFile, values.title, {
        imageType: 'cover',
      })

      const uploadedGalleryUrls = await uploadBusinessImages(galleryFiles, values.title)

      const payload = {
        title: values.title,
        slug,
        description: values.description,
        category_id: Number(values.category_id),
        subcategory_id: Number(values.subcategory_id),
        country: values.country,
        city: values.city,
        region: values.region || null,
        address: values.address,
        phone: values.phone,
        whatsapp: values.whatsapp,
        email: values.email,
        website: values.website || '',
        cover_image: uploadedImageUrl,
        image_url: uploadedImageUrl,
        gallery: uploadedGalleryUrls,
        is_featured: false,
        is_approved: false,
        rating_avg: 0,
        reviews_count: 0,
        latitude: location.lat,
        longitude: location.lng,
        google_maps_url: previewMapUrl || '',
      }

      await createBusiness(payload)

      setSuccessMessage('درخواست شما با موفقیت ثبت شد و بعد از تایید نمایش داده می‌شود.')
      reset()
      setLocation(null)
      setSelectedFile(null)
      setMapSearchText('')
      setMapLinkText('')
      setLocationResults([])
      setSelectedLocationLabel('')

      if (imagePreview) {
        URL.revokeObjectURL(imagePreview)
      }

      galleryPreviews.forEach((preview) => URL.revokeObjectURL(preview))

      setImagePreview('')
      setGalleryFiles([])
      setGalleryPreviews([])
      setSubcategories([])
    } catch (err) {
      setPageError(err.message || 'ثبت اطلاعات انجام نشد')
    }
  }

  return (
    <Layout>
      <PageHero
        title="ثبت خدمات"
        subtitle="اطلاعات کسب‌وکار خودت را ثبت کن تا بعد از بررسی و تایید در نزدیکو نمایش داده شود."
      />

      <div className="bg-slate-100 p-4 md:p-6">
        <div className="mx-auto max-w-5xl">
          <div className="mb-8 rounded-3xl border border-slate-300 bg-white p-6 shadow-sm md:p-8">
            <h1 className="mb-3 text-3xl font-bold">ثبت خدمات جدید</h1>
            <p className="text-gray-600">
              اطلاعات کسب‌وکار را وارد کن، عکس کاور و گالری را آپلود کن و لوکیشن دقیق را روی نقشه انتخاب کن.
            </p>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-6 rounded-3xl border border-slate-300 bg-white p-6 shadow-sm md:p-8"
          >
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <Field label="عنوان خدمات" error={errors.title?.message}>
                <input {...register('title')} className={inputClass} />
              </Field>

              <Field label="نوع کسب‌وکار" error={errors.category_id?.message}>
                <select {...register('category_id')} className={inputClass}>
                  <option value="">انتخاب نوع کسب‌وکار</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="نوع دقیق شغل" error={errors.subcategory_id?.message}>
                <select
                  {...register('subcategory_id')}
                  className={inputClass}
                  disabled={!selectedCategoryId}
                >
                  <option value="">
                    {selectedCategoryId
                      ? 'انتخاب نوع دقیق شغل'
                      : 'اول نوع کسب‌وکار را انتخاب کن'}
                  </option>

                  {subcategories.map((subcategory) => (
                    <option key={subcategory.id} value={subcategory.id}>
                      {subcategory.name}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="کشور" error={errors.country?.message}>
                <input {...register('country')} className={inputClass} />
              </Field>

              <Field label="شهر" error={errors.city?.message}>
                <input {...register('city')} className={inputClass} />
              </Field>

              <Field label="منطقه" error={errors.region?.message}>
                <input {...register('region')} className={inputClass} />
              </Field>

              <Field label="شماره تماس" error={errors.phone?.message}>
                <input {...register('phone')} className={inputClass} />
              </Field>

              <Field label="واتساپ" error={errors.whatsapp?.message}>
                <input {...register('whatsapp')} className={inputClass} />
              </Field>

              <Field label="ایمیل" error={errors.email?.message}>
                <input type="email" {...register('email')} className={inputClass} />
              </Field>

              <Field label="وبسایت" error={errors.website?.message}>
                <input {...register('website')} className={inputClass} />
              </Field>

              <div className="md:col-span-2">
                <Field label="آدرس دقیق" error={errors.address?.message}>
                  <input {...register('address')} className={inputClass} />
                </Field>
              </div>

              <div className="md:col-span-2">
                <Field label="توضیحات" error={errors.description?.message}>
                  <textarea
                    {...register('description')}
                    rows={5}
                    className={`${inputClass} resize-none`}
                  />
                </Field>
              </div>

              <div className="md:col-span-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-gray-800">
                    عکس کاور
                  </span>

                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="block w-full rounded-2xl border border-gray-200 px-4 py-3"
                  />
                </label>

                {imagePreview && (
                  <div className="mt-4 overflow-hidden rounded-2xl border">
                    <img
                      src={imagePreview}
                      alt="preview"
                      className="h-60 w-full object-cover"
                    />
                  </div>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-gray-800">
                    گالری تصاویر (حداقل ۳ عکس)
                  </span>

                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleGalleryChange}
                    className="block w-full rounded-2xl border border-gray-200 px-4 py-3"
                  />
                </label>

                {galleryPreviews.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3">
                    {galleryPreviews.map((preview, index) => (
                      <div
                        key={`${preview}-${index}`}
                        className="overflow-hidden rounded-2xl border"
                      >
                        <img
                          src={preview}
                          alt={`gallery-preview-${index + 1}`}
                          className="h-32 w-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="md:col-span-2">
                <div className="mb-2 block text-sm font-medium text-gray-800">
                  انتخاب موقعیت روی نقشه
                </div>

                <div className="mb-3 grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto]">
                  <input
                    type="text"
                    value={mapSearchText}
                    onChange={(e) => setMapSearchText(e.target.value)}
                    placeholder="آدرس را وارد کن، مثلا خیابان، محله، شهر"
                    className={inputClass}
                  />
                  <button
                    type="button"
                    onClick={searchLocationByAddress}
                    disabled={mapSearchLoading}
                    className="rounded-2xl bg-slate-800 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-900 disabled:opacity-60"
                  >
                    {mapSearchLoading ? 'در حال جستجو...' : 'ثبت آدرس روی نقشه'}
                  </button>
                </div>

                {locationResults.length > 1 && (
                  <div className="mb-4 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                    <div className="mb-3 text-sm font-medium text-slate-700">
                      چند موقعیت پیدا شد، مورد درست را انتخاب کن:
                    </div>

                    <div className="space-y-2">
                      {locationResults.map((item, index) => (
                        <button
                          key={`${item.lat}-${item.lng}-${index}`}
                          type="button"
                          onClick={() => handleSelectSearchedLocation(item)}
                          className="block w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-right text-sm text-slate-700 transition hover:border-blue-400 hover:bg-blue-50"
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto]">
                  <input
                    type="text"
                    value={mapLinkText}
                    onChange={(e) => setMapLinkText(e.target.value)}
                    placeholder="لینک کامل گوگل مپ را وارد کن"
                    className={inputClass}
                  />
                  <button
                    type="button"
                    onClick={applyGoogleMapsLink}
                    disabled={mapSearchLoading}
                    className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-60"
                  >
                    ثبت لینک روی نقشه
                  </button>
                </div>

                <div className="overflow-hidden rounded-2xl border">
                  <LocationPickerMap
                    value={location}
                    onChange={(nextLocation) => {
                      setLocation(nextLocation)
                      setLocationResults([])
                      setSelectedLocationLabel('')
                      setPageError('')
                    }}
                    height="500px"
                  />
                </div>

                {location && (
                  <div className="mt-3 space-y-2 text-sm text-gray-600">
                    <p>
                      لوکیشن انتخاب شد: {location.lat}, {location.lng}
                    </p>

                    {selectedLocationLabel && (
                      <p className="text-slate-600">
                        موقعیت انتخاب‌شده: {selectedLocationLabel}
                      </p>
                    )}

                    {previewMapUrl && (
                      <a
                        href={previewMapUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex text-blue-600 hover:text-blue-700"
                      >
                        مشاهده در گوگل مپ
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>

            {pageError && (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
                {pageError}
              </div>
            )}

            {successMessage && (
              <div className="rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
                {successMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-2xl bg-gray-900 px-6 py-3 font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? 'در حال ثبت...' : 'ثبت خدمات'}
            </button>
          </form>
        </div>
      </div>
    </Layout>
  )
}

function Field({ label, error, children }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-gray-800">
        {label}
      </span>
      {children}
      {error && <span className="mt-2 block text-sm text-red-500">{error}</span>}
    </label>
  )
}

const inputClass =
  'w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none transition focus:border-gray-400'

export default SubmitBusiness