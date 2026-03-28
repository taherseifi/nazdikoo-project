import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Layout from '../components/layout/Layout'
import PageHero from '../components/common/PageHero'
import LocationPickerMap from '../components/map/LocationPickerMap'
import {
  getBusinessByIdAdmin,
  updateBusinessAdmin,
} from '../services/supabase/businesses.api'
import {
  uploadBusinessImage,
  uploadBusinessImages,
} from '../services/supabase/storage.api'
import { deleteFileFromServer } from '../services/supabase/storage.api'

const initialForm = {
  title: '',
  slug: '',
  description: '',
  country: '',
  city: '',
  region: '',
  address: '',
  phone: '',
  whatsapp: '',
  email: '',
  website: '',
  image_url: '',
  cover_image: '',
  gallery: [],
  latitude: '',
  longitude: '',
  google_maps_url: '',
  is_approved: false,
  is_featured: false,
}

function AdminEditBusiness() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [form, setForm] = useState(initialForm)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [location, setLocation] = useState(null)

  const [selectedFile, setSelectedFile] = useState(null)
  const [imagePreview, setImagePreview] = useState('')

  const [galleryFiles, setGalleryFiles] = useState([])
  const [galleryPreviews, setGalleryPreviews] = useState([])

  const previewMapUrl = useMemo(() => {
    if (!location?.lat || !location?.lng) return ''
    return `https://www.google.com/maps/search/?api=1&query=${location.lat},${location.lng}`
  }, [location])

  useEffect(() => {
    async function loadBusiness() {
      try {
        setLoading(true)
        setError('')
        setSuccess('')

        const data = await getBusinessByIdAdmin(id)

        setForm({
          title: data?.title || '',
          slug: data?.slug || '',
          description: data?.description || '',
          country: data?.country || '',
          city: data?.city || '',
          region: data?.region || '',
          address: data?.address || '',
          phone: data?.phone || '',
          whatsapp: data?.whatsapp || '',
          email: data?.email || '',
          website: data?.website || '',
          image_url: data?.image_url || '',
          cover_image: data?.cover_image || '',
          gallery: Array.isArray(data?.gallery) ? data.gallery : [],
          latitude: data?.latitude || '',
          longitude: data?.longitude || '',
          google_maps_url: data?.google_maps_url || '',
          is_approved: !!data?.is_approved,
          is_featured: !!data?.is_featured,
        })

        setLocation(
          data?.latitude && data?.longitude
            ? {
                lat: Number(data.latitude),
                lng: Number(data.longitude),
              }
            : null
        )

        setImagePreview(data?.image_url || data?.cover_image || '')
        setGalleryPreviews(Array.isArray(data?.gallery) ? data.gallery : [])
      } catch (err) {
        setError(err.message || 'دریافت اطلاعات خدمت انجام نشد')
      } finally {
        setLoading(false)
      }
    }

    loadBusiness()
  }, [id])

  function handleChange(e) {
    const { name, value, type, checked } = e.target

    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  function handleFileChange(event) {
    const file = event.target.files?.[0]

    if (!file) {
      setSelectedFile(null)
      setImagePreview(form.image_url || form.cover_image || '')
      return
    }

    setSelectedFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  function handleGalleryChange(event) {
    const files = Array.from(event.target.files || [])

    setGalleryFiles(files)

    if (files.length > 0) {
      setGalleryPreviews(files.map((file) => URL.createObjectURL(file)))
    } else {
      setGalleryPreviews(Array.isArray(form.gallery) ? form.gallery : [])
    }
  }

 async function handleSubmit(e) {
  e.preventDefault()

  try {
    setSaving(true)
    setError('')
    setSuccess('')

    let finalCoverImage = form.cover_image || ''
    let finalImageUrl = form.image_url || ''
    let finalGallery = Array.isArray(form.gallery) ? form.gallery : []

    if (selectedFile instanceof File) {
      const uploadedImageUrl = await uploadBusinessImage(selectedFile)
      finalCoverImage = uploadedImageUrl
      finalImageUrl = uploadedImageUrl
    }

    if (Array.isArray(galleryFiles) && galleryFiles.length > 0) {
      const uploadedGalleryUrls = await uploadBusinessImages(galleryFiles)
      finalGallery = uploadedGalleryUrls
    }

    await updateBusinessAdmin(id, {
      title: form.title.trim(),
      slug: form.slug.trim(),
      description: form.description.trim(),
      country: form.country.trim(),
      city: form.city.trim(),
      region: form.region.trim(),
      address: form.address.trim(),
      phone: form.phone.trim(),
      whatsapp: form.whatsapp.trim(),
      email: form.email.trim(),
      website: form.website.trim(),
      cover_image: finalCoverImage,
      image_url: finalImageUrl,
      gallery: finalGallery,
      latitude: location?.lat || null,
      longitude: location?.lng || null,
      google_maps_url: previewMapUrl || '',
      is_approved: form.is_approved,
      is_featured: form.is_featured,
    })

    setForm((prev) => ({
      ...prev,
      cover_image: finalCoverImage,
      image_url: finalImageUrl,
      gallery: finalGallery,
      latitude: location?.lat || '',
      longitude: location?.lng || '',
      google_maps_url: previewMapUrl || '',
    }))

    setSelectedFile(null)
    setGalleryFiles([])
    setImagePreview(finalImageUrl || finalCoverImage || '')
    setGalleryPreviews(finalGallery)

    setSuccess('اطلاعات خدمت با موفقیت بروزرسانی شد')
  } catch (err) {
    setError(err.message || 'ویرایش خدمت انجام نشد')
  } finally {
    setSaving(false)
  }
}
  return (
    <Layout>
      <PageHero
        title="ویرایش خدمت"
        subtitle="در این بخش می‌توانی اطلاعات خدمت، تصاویر و موقعیت مکانی را بروزرسانی کنی"
      />

      <div className="bg-slate-100 p-4 md:p-6">
        <div className="mx-auto max-w-5xl">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-3xl font-bold text-gray-900">ویرایش خدمت</h1>

            <div className="flex flex-wrap gap-3">
              <Link
                to="/admin"
                className="rounded-2xl border border-gray-200 bg-white px-5 py-3 text-sm font-medium text-gray-700 shadow-sm"
              >
                بازگشت به داشبورد
              </Link>
            </div>
          </div>

          {loading ? (
            <div className="rounded-3xl border border-slate-300 bg-white p-6 shadow-sm">
              در حال بارگذاری اطلاعات خدمت...
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="rounded-3xl border border-slate-300 bg-white p-6 shadow-sm md:p-8"
            >
              {error && (
                <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
                  {error}
                </div>
              )}

              {success && (
                <div className="mb-6 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
                  {success}
                </div>
              )}

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <Field label="عنوان خدمت">
                  <input
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </Field>

                <Field label="اسلاگ">
                  <input
                    name="slug"
                    value={form.slug}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </Field>

                <div className="md:col-span-2">
                  <Field label="توضیحات">
                    <textarea
                      name="description"
                      value={form.description}
                      onChange={handleChange}
                      rows={6}
                      className={`${inputClass} resize-none`}
                    />
                  </Field>
                </div>

                <Field label="کشور">
                  <input
                    name="country"
                    value={form.country}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </Field>

                <Field label="شهر">
                  <input
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </Field>

                <Field label="منطقه">
                  <input
                    name="region"
                    value={form.region}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </Field>

                <Field label="آدرس">
                  <input
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </Field>

                <Field label="شماره تماس">
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </Field>

                <Field label="واتساپ">
                  <input
                    name="whatsapp"
                    value={form.whatsapp}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </Field>

                <Field label="ایمیل">
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </Field>

                <Field label="وبسایت">
                  <input
                    name="website"
                    value={form.website}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </Field>

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
                        alt="cover-preview"
                        className="h-64 w-full object-cover"
                      />
                    </div>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-gray-800">
                      گالری تصاویر
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
                            alt={`gallery-preview-${index}`}
                            className="h-32 w-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-gray-800">
                    انتخاب موقعیت روی نقشه
                  </label>

                  <div className="overflow-hidden rounded-2xl border">
                    <LocationPickerMap
                      value={location}
                      onChange={setLocation}
                    />
                  </div>

                  {location && (
                    <p className="mt-3 text-sm text-gray-600">
                      لوکیشن انتخاب شد: {location.lat}, {location.lng}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3 rounded-2xl border border-gray-200 p-4">
                  <input
                    id="is_approved"
                    name="is_approved"
                    type="checkbox"
                    checked={form.is_approved}
                    onChange={handleChange}
                    className="h-5 w-5"
                  />
                  <label
                    htmlFor="is_approved"
                    className="text-sm font-medium text-gray-800"
                  >
                    خدمت تاییدشده باشد
                  </label>
                </div>

                <div className="flex items-center gap-3 rounded-2xl border border-gray-200 p-4">
                  <input
                    id="is_featured"
                    name="is_featured"
                    type="checkbox"
                    checked={form.is_featured}
                    onChange={handleChange}
                    className="h-5 w-5"
                  />
                  <label
                    htmlFor="is_featured"
                    className="text-sm font-medium text-gray-800"
                  >
                    خدمت ویژه باشد
                  </label>
                </div>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-2xl bg-gray-900 px-6 py-3 font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
                </button>

                <button
                  type="button"
                  onClick={() => navigate('/admin')}
                  className="rounded-2xl bg-gray-100 px-6 py-3 font-medium text-gray-700 transition hover:bg-gray-200"
                >
                  انصراف
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </Layout>
  )
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-gray-800">
        {label}
      </span>
      {children}
    </label>
  )
}

const inputClass =
  'w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none transition focus:border-gray-400'

export default AdminEditBusiness