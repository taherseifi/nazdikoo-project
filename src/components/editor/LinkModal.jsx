import { useState } from 'react'

export default function LinkModal({
  initialValues,
  onClose,
  onSubmit,
}) {
  const [url, setUrl] = useState(initialValues?.href || '')
  const [openInNewTab, setOpenInNewTab] = useState(
    initialValues?.target === '_blank'
  )
  const [nofollow, setNofollow] = useState(
    initialValues?.rel?.includes('nofollow') || false
  )
  const [sponsored, setSponsored] = useState(
    initialValues?.rel?.includes('sponsored') || false
  )
  const [ugc, setUgc] = useState(initialValues?.rel?.includes('ugc') || false)
  const [error, setError] = useState('')

  function handleConfirm() {
    try {
      const parsed = new URL(url)

      const relParts = []
      if (nofollow) relParts.push('nofollow')
      if (sponsored) relParts.push('sponsored')
      if (ugc) relParts.push('ugc')
      if (openInNewTab) relParts.push('noopener', 'noreferrer')

      onSubmit({
        href: parsed.toString(),
        target: openInNewTab ? '_blank' : null,
        rel: relParts.length > 0 ? Array.from(new Set(relParts)).join(' ') : null,
      })
    } catch {
      setError('لینک معتبر نیست')
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
        <h3 className="mb-4 text-xl font-bold text-slate-800">افزودن / ویرایش لینک</h3>

        <div className="space-y-4">
          <input
            value={url}
            onChange={(e) => {
              setUrl(e.target.value)
              setError('')
            }}
            placeholder="https://example.com"
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
          />

          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={openInNewTab}
              onChange={(e) => setOpenInNewTab(e.target.checked)}
            />
            <span>باز شدن در تب جدید</span>
          </label>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={nofollow}
                onChange={(e) => setNofollow(e.target.checked)}
              />
              <span>nofollow</span>
            </label>

            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={sponsored}
                onChange={(e) => setSponsored(e.target.checked)}
              />
              <span>sponsored</span>
            </label>

            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={ugc}
                onChange={(e) => setUgc(e.target.checked)}
              />
              <span>ugc</span>
            </label>
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
            تایید
          </button>
        </div>
      </div>
    </div>
  )
}