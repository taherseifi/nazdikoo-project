import { calculateSeoScore } from '../../utils/blogEditor/seoScore'

export default function SeoScorePanel({
  title,
  slug,
  excerpt,
  metaTitle,
  metaDescription,
  focusKeyword,
  contentHtml,
}) {
  const result = calculateSeoScore({
    title,
    slug,
    excerpt,
    metaTitle,
    metaDescription,
    focusKeyword,
    contentHtml,
  })

  const toneClass =
    result.score >= 80
      ? 'bg-green-50 text-green-700 border-green-200'
      : result.score >= 60
      ? 'bg-blue-50 text-blue-700 border-blue-200'
      : result.score >= 40
      ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
      : 'bg-red-50 text-red-700 border-red-200'

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="text-lg font-bold text-slate-800">SEO Score</h3>
        <div className={`rounded-full border px-4 py-2 text-sm font-bold ${toneClass}`}>
          {result.score}/100 - {result.level}
        </div>
      </div>

      <div className="mb-4 text-sm text-slate-500">
        تعداد کلمات مقاله: {result.wordCount}
      </div>

      <div className="space-y-3">
        {result.checks.map((check) => (
          <div
            key={check.key}
            className={`rounded-2xl px-4 py-3 text-sm ${
              check.passed
                ? 'bg-green-50 text-green-700'
                : 'bg-slate-50 text-slate-500'
            }`}
          >
            {check.label}
          </div>
        ))}
      </div>
    </div>
  )
}