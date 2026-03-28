import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../components/layout/Layout'
import { Helmet } from 'react-helmet-async'
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { supabase } from '../services/supabase/client'

// حل مشکل آیکون پیش‌فرض Leaflet
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const radiuses = [1, 5, 10, 20, 50]

function haversineDistance(lat1, lng1, lat2, lng2) {
  const toRad = (value) => (value * Math.PI) / 180
  const R = 6371

  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function ChangeMapView({ center, zoom = 13 }) {
  const map = useMap()

  useEffect(() => {
    map.setView(center, zoom, { animate: true })
  }, [center, zoom, map])

  return null
}

export default function NearbyServices() {
  const [userLocation, setUserLocation] = useState([41.0082, 28.9784]) // fallback: Istanbul
  const [locationError, setLocationError] = useState('')
  const [searchText, setSearchText] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('همه')
  const [selectedRadius, setSelectedRadius] = useState(10)
  const [selectedBusinessId, setSelectedBusinessId] = useState(null)

  const [businesses, setBusinesses] = useState([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState('')

  // گرفتن لوکیشن کاربر
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError('مرورگر شما از لوکیشن پشتیبانی نمی‌کند.')
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation([
          position.coords.latitude,
          position.coords.longitude,
        ])
        setLocationError('')
      },
      () => {
        setLocationError('دسترسی به موقعیت مکانی داده نشد. نقشه با موقعیت پیش‌فرض نمایش داده شد.')
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000,
      }
    )
  }, [])

  // گرفتن داده از Supabase
  useEffect(() => {
    async function fetchBusinesses() {
      setLoading(true)
      setFetchError('')

      const { data, error } = await supabase
  .from('businesses')
  .select(`
    id,
    title,
    slug,
    address,
    city,
    latitude,
    longitude,
    is_approved,
    category_id
  `)
  .eq('is_approved', true)
  .not('latitude', 'is', null)
  .not('longitude', 'is', null)

      if (error) {
        setFetchError('دریافت خدمات از دیتابیس با مشکل مواجه شد.')
        setBusinesses([])
        setLoading(false)
        return
      }

      const normalized = (data || []).map((item) => ({
        id: item.id,
        name: item.name || 'بدون نام',
        slug: item.slug || '',
        address: item.address || '',
        city: item.city || '',
        category: item.category || 'بدون دسته‌بندی',
        lat: Number(item.latitude),
        lng: Number(item.longitude),
      }))

      setBusinesses(
        normalized.filter(
          (item) =>
            Number.isFinite(item.lat) &&
            Number.isFinite(item.lng)
        )
      )
      setLoading(false)
    }

    fetchBusinesses()
  }, [])

  const categories = useMemo(() => {
    const uniqueCategories = Array.from(
      new Set(
        businesses
          .map((item) => item.category)
          .filter(Boolean)
      )
    )

    return ['همه', ...uniqueCategories]
  }, [businesses])

  const businessesWithDistance = useMemo(() => {
    return businesses.map((business) => {
      const distance = haversineDistance(
        userLocation[0],
        userLocation[1],
        business.lat,
        business.lng
      )

      return {
        ...business,
        distance,
      }
    })
  }, [businesses, userLocation])

  const filteredBusinesses = useMemo(() => {
    return businessesWithDistance
      .filter((business) => {
        const categoryMatch =
          selectedCategory === 'همه' ||
          business.category === selectedCategory

        const radiusMatch = business.distance <= selectedRadius

        const text = searchText.trim().toLowerCase()
        const textMatch =
          !text ||
          business.name.toLowerCase().includes(text) ||
          business.category.toLowerCase().includes(text) ||
          business.city.toLowerCase().includes(text) ||
          business.address.toLowerCase().includes(text)

        return categoryMatch && radiusMatch && textMatch
      })
      .sort((a, b) => a.distance - b.distance)
  }, [businessesWithDistance, selectedCategory, selectedRadius, searchText])

  const selectedBusiness = filteredBusinesses.find(
    (item) => item.id === selectedBusinessId
  )

  return (
    
     <Layout>
        <Helmet>
  <title>خدمات نزدیک شما | نزدیکو</title>
  <meta
    name="description"
    content="خدمات نزدیک شما را روی نقشه پیدا کنید، کسب‌وکارهای اطراف را ببینید و با فیلترهای مختلف نزدیک‌ترین خدمات را در نزدیکو پیدا کنید."
  />
  <meta
    name="keywords"
    content="خدمات نزدیک شما, خدمات روی نقشه, کسب و کارهای نزدیک, جستجوی خدمات, نزدیکو"
  />
  <link rel="canonical" href="https://nazdikoo.com/nearby-services" />

  <meta property="og:title" content="خدمات نزدیک شما | نزدیکو" />
  <meta
    property="og:description"
    content="نزدیک‌ترین خدمات را روی نقشه پیدا کنید و با فیلترهای مختلف جستجو را دقیق‌تر انجام دهید."
  />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://nazdikoo.com/nearby-services" />
  <meta property="og:site_name" content="Nazdikoo" />
  <meta name="robots" content="index, follow" />
</Helmet>
    <main className="min-h-screen bg-slate-50 pt-28 pb-12">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="mb-6 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">
                خدمات نزدیک شما
              </h1>
              <p className="mt-2 text-sm text-slate-500 md:text-base">
                نزدیک‌ترین خدمات را روی نقشه پیدا کن و با فیلترهای مختلف جستجو را دقیق‌تر کن.
              </p>
            </div>

            <button
              onClick={() => {
                if (!navigator.geolocation) return

                navigator.geolocation.getCurrentPosition(
                  (position) => {
                    setUserLocation([
                      position.coords.latitude,
                      position.coords.longitude,
                    ])
                    setLocationError('')
                  },
                  () => {
                    setLocationError('امکان دریافت موقعیت فعلی شما وجود نداشت.')
                  }
                )
              }}
              className="rounded-2xl bg-blue-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-blue-700"
            >
              استفاده از موقعیت فعلی من
            </button>
          </div>

          {locationError && (
            <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
              {locationError}
            </div>
          )}

          {fetchError && (
            <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {fetchError}
            </div>
          )}

          <div className="grid gap-3 md:grid-cols-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                جستجو
              </label>
              <input
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="نام، دسته‌بندی یا آدرس..."
                className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-slate-700 outline-none transition focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                دسته‌بندی
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-slate-700 outline-none transition focus:border-blue-500"
              >
                {categories.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                شعاع جستجو
              </label>
              <select
                value={selectedRadius}
                onChange={(e) => setSelectedRadius(Number(e.target.value))}
                className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-slate-700 outline-none transition focus:border-blue-500"
              >
                {radiuses.map((km) => (
                  <option key={km} value={km}>
                    تا {km} کیلومتر
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <div className="flex h-12 w-full items-center rounded-2xl bg-slate-100 px-4 text-sm text-slate-600">
                {loading ? 'در حال بارگذاری...' : `${filteredBusinesses.length} نتیجه پیدا شد`}
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[380px_minmax(0,1fr)]">
          <aside className="order-2 lg:order-1">
            <div className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900">
                  لیست خدمات
                </h2>
                <span className="text-sm text-slate-500">
                  نزدیک‌ترین‌ها اول
                </span>
              </div>

              <div className="max-h-[70vh] space-y-3 overflow-y-auto pr-1">
                {loading ? (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
                    در حال دریافت اطلاعات...
                  </div>
                ) : filteredBusinesses.length > 0 ? (
                  filteredBusinesses.map((business) => (
                    <button
                      key={business.id}
                      type="button"
                      onClick={() => setSelectedBusinessId(business.id)}
                      className={`w-full rounded-2xl border p-4 text-right transition ${
                        selectedBusinessId === business.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="mb-2 flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-bold text-slate-900">
                            {business.name}
                          </h3>
                          <p className="mt-1 text-sm text-slate-500">
                            {business.category}
                          </p>
                        </div>

                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                          {business.distance.toFixed(1)} km
                        </span>
                      </div>

                      <p className="text-sm text-slate-600">{business.address}</p>

                      <div className="mt-3 flex flex-wrap gap-2">
                        <Link
                          to={`/business/${business.slug}`}
                          onClick={(e) => e.stopPropagation()}
                          className="rounded-xl bg-slate-900 px-3 py-2 text-xs font-medium text-white transition hover:bg-slate-800"
                        >
                          مشاهده جزئیات
                        </Link>

                        <a
                          href={`https://www.google.com/maps/dir/?api=1&destination=${business.lat},${business.lng}`}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="rounded-xl border border-slate-300 px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
                        >
                          مسیریابی
                        </a>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
                    نتیجه‌ای با این فیلترها پیدا نشد.
                  </div>
                )}
              </div>
            </div>
          </aside>

          <section className="order-1 lg:order-2">
            <div className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200">
              <div className="h-[60vh] min-h-[420px] w-full z-0">
                <MapContainer
                  center={userLocation}
                  zoom={13}
                  scrollWheelZoom={true}
                  className="h-full w-full z-0"
                >
                  <ChangeMapView
                    center={
                      selectedBusiness
                        ? [selectedBusiness.lat, selectedBusiness.lng]
                        : userLocation
                    }
                    zoom={selectedBusiness ? 15 : 13}
                  />

                  <TileLayer
                    attribution='&copy; OpenStreetMap contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />

                  <Marker position={userLocation}>
                    <Popup>موقعیت شما</Popup>
                  </Marker>

                  {filteredBusinesses.map((business) => (
                    <Marker
                      key={business.id}
                      position={[business.lat, business.lng]}
                      eventHandlers={{
                        click: () => setSelectedBusinessId(business.id),
                      }}
                    >
                      <Popup>
                        <div className="min-w-[200px] text-right">
                          <h3 className="mb-1 font-bold text-slate-900">
                            {business.name}
                          </h3>
                          <p className="mb-1 text-sm text-slate-600">
                            {business.category}
                          </p>
                          <p className="mb-2 text-sm text-slate-500">
                            {business.address}
                          </p>
                          <p className="mb-3 text-xs text-slate-500">
                            فاصله تا شما: {business.distance.toFixed(1)} کیلومتر
                          </p>

                          <div className="flex flex-wrap gap-2">
                            <Link
                              to={`/business/${business.slug}`}
                              className="rounded-lg bg-slate-900 px-3 py-2 text-xs text-white"
                            >
                              جزئیات
                            </Link>

                            <a
                              href={`https://www.google.com/maps/dir/?api=1&destination=${business.lat},${business.lng}`}
                              target="_blank"
                              rel="noreferrer"
                              className="rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-700"
                            >
                              مسیریابی
                            </a>
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
    </Layout>
  )
}