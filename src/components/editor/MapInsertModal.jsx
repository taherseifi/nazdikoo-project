import { useState } from 'react'
import { buildGoogleMapEmbedSrc } from '../../utils/blogEditor/googleMaps'

export default function MapInsertModal({
  initialValues,
  onClose,
  onSubmit,
}) {
  const [title, setTitle] = useState(initialValues?.title || '')
  const [googleMapsUrl, setGoogleMapsUrl] = useState(
    initialValues?.googleMapsUrl || ''
  )
  const [iframeCode, setIframeCode] = useState(initialValues?.iframeCode || '')
  const [latitude, setLatitude] = useState(initialValues?.latitude || '')
  const [longitude, setLongitude] = useState(initialValues?.longitude || '')
  const [error, setError] = useState('')

  function handleConfirm() {
    try {
      const src = buildGoogleMapEmbedSrc({
        googleMapsUrl,
        iframeCode,
        latitude,
        longitude,
      })

      onSubmit({
        src,
        title,
        googleMapsUrl,
        latitude,
        longitude,
      })
    } catch (err) {
      setError(err.message || 'اطلاعات نقشه معتبر نیست')
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl">
        <h3 className="mb-4 text-xl font-bold text-slate-800">افزودن / ویرایش نقشه</h3>

        <div className="grid grid-cols-1 gap-4">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="عنوان نقشه (اختیاری)"
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
          />

          <input
            value={googleMapsUrl}
            onChange={(e) => setGoogleMapsUrl(e.target.value)}
            placeholder="Google Maps URL"
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
          />

          <textarea
            value={iframeCode}
            onChange={(e) => setIframeCode(e.target.value)}
            rows={4}
            placeholder="یا iframe code"
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
          />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <input
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
              placeholder="Latitude"
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
            />

            <input
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
              placeholder="Longitude"
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
            />
          </div>

          {error && (
            <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-medium text-slate-700"
          >
            لغو
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-medium text-white"
          >
            درج نقشه
          </button>
        </div>
      </div>
    </div>
  )
}