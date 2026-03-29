export default function SeoFieldsForm({
  values,
  errors = {},
  onChange,
  onJsonChange,
  schemaText = '',
}) {
  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-500 bg-white p-5">
        <h3 className="mb-4 text-lg font-semibold text-slate-800">
          تنظیمات اصلی سئو
        </h3>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Meta Title
            </label>
            <input
              type="text"
              name="meta_title"
              value={values.meta_title || ''}
              onChange={onChange}
              className="w-full rounded-xl border border-slate-500 px-4 py-3 outline-none focus:border-blue-500"
            />
            {errors.meta_title ? (
              <p className="mt-1 text-sm text-red-600">{errors.meta_title}</p>
            ) : null}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Slug
            </label>
            <input
              type="text"
              name="slug"
              value={values.slug || ''}
              onChange={onChange}
              className="w-full rounded-xl border border-slate-500 px-4 py-3 outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Canonical URL
            </label>
            <input
              type="text"
              name="canonical_url"
              value={values.canonical_url || ''}
              onChange={onChange}
              className="w-full rounded-xl border border-slate-500 px-4 py-3 outline-none focus:border-blue-500"
            />
            {errors.canonical_url ? (
              <p className="mt-1 text-sm text-red-600">
                {errors.canonical_url}
              </p>
            ) : null}
          </div>

          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Meta Description
            </label>
            <textarea
              name="meta_description"
              rows={4}
              value={values.meta_description || ''}
              onChange={onChange}
              className="w-full rounded-xl border border-slate-500 px-4 py-3 outline-none focus:border-blue-500"
            />
            {errors.meta_description ? (
              <p className="mt-1 text-sm text-red-600">
                {errors.meta_description}
              </p>
            ) : null}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-500 bg-white p-5">
        <h3 className="mb-4 text-lg font-semibold text-slate-800">
          Open Graph
        </h3>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              OG Title
            </label>
            <input
              type="text"
              name="og_title"
              value={values.og_title || ''}
              onChange={onChange}
              className="w-full rounded-xl border border-slate-500 px-4 py-3 outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              OG Image
            </label>
            <input
              type="text"
              name="og_image"
              value={values.og_image || ''}
              onChange={onChange}
              className="w-full rounded-xl border border-slate-500 px-4 py-3 outline-none focus:border-blue-500"
            />
            {errors.og_image ? (
              <p className="mt-1 text-sm text-red-600">{errors.og_image}</p>
            ) : null}
          </div>

          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-slate-700">
              OG Description
            </label>
            <textarea
              name="og_description"
              rows={4}
              value={values.og_description || ''}
              onChange={onChange}
              className="w-full rounded-xl border border-slate-500 px-4 py-3 outline-none focus:border-blue-500"
            />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-500 bg-white p-5">
        <h3 className="mb-4 text-lg font-semibold text-slate-800">Robots</h3>

        <div className="flex flex-wrap gap-6">
          <label className="inline-flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              name="robots_index"
              checked={Boolean(values.robots_index)}
              onChange={onChange}
            />
            <span>Index</span>
          </label>

          <label className="inline-flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              name="robots_follow"
              checked={Boolean(values.robots_follow)}
              onChange={onChange}
            />
            <span>Follow</span>
          </label>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-500 bg-white p-5">
        <h3 className="mb-4 text-lg font-semibold text-slate-800">
          تنظیمات تکمیلی
        </h3>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Focus Keyword
            </label>
            <input
              type="text"
              name="focus_keyword"
              value={values.focus_keyword || ''}
              onChange={onChange}
              className="w-full rounded-xl border border-slate-500 px-4 py-3 outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Schema Type
            </label>
            <select
              name="schema_type"
              value={values.schema_type || ''}
              onChange={onChange}
              className="w-full rounded-xl border border-slate-500 px-4 py-3 outline-none focus:border-blue-500"
            >
              <option value="">انتخاب کنید</option>
              <option value="WebPage">WebPage</option>
              <option value="Article">Article</option>
              <option value="BlogPosting">BlogPosting</option>
              <option value="LocalBusiness">LocalBusiness</option>
              <option value="CollectionPage">CollectionPage</option>
            </select>
          </div>
        </div>

        <div className="mt-4">
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Custom Schema JSON
          </label>
          <textarea
            rows={10}
            value={schemaText}
            onChange={onJsonChange}
            className="w-full rounded-xl border border-slate-500 px-4 py-3 font-mono text-sm outline-none focus:border-blue-500"
          />
          {errors.custom_schema_json ? (
            <p className="mt-1 text-sm text-red-600">
              {errors.custom_schema_json}
            </p>
          ) : null}
        </div>
      </section>
    </div>
  )
}