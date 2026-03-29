import { useEffect, useState } from 'react'
import { Briefcase, FolderKanban, MessageSquareText, MapPin } from 'lucide-react'
import { getSiteStats } from '../../services/supabase/stats.api'

function StatsSection() {
  const [stats, setStats] = useState({
    approvedBusinessesCount: 0,
    categoriesCount: 0,
    reviewsCount: 0,
    citiesCount: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadStats() {
      try {
        setLoading(true)
        setError('')
        const data = await getSiteStats()
        setStats(data)
      } catch (err) {
        setError(err.message || 'خطا در دریافت آمار')
      } finally {
        setLoading(false)
      }
    }

    loadStats()
  }, [])

  const items = [
    {
      id: 1,
      value: stats.approvedBusinessesCount,
      label: 'خدمات تاییدشده',
      icon: <Briefcase className="h-8 w-8 text-blue-500" />,
      bg: 'bg-blue-100',
    },
    {
      id: 2,
      value: stats.categoriesCount,
      label: 'دسته‌بندی فعال',
      icon: <FolderKanban className="h-8 w-8 text-green-500" />,
      bg: 'bg-green-100',
    },
    {
      id: 3,
      value: stats.reviewsCount,
      label: 'نظر ثبت‌شده',
      icon: <MessageSquareText className="h-8 w-8 text-purple-500" />,
      bg: 'bg-purple-100',
    },
    {
      id: 4,
      value: stats.citiesCount,
      label: 'شهر تحت پوشش',
      icon: <MapPin className="h-8 w-8 text-slate-800" />,
      bg: 'bg-slate-200',
    },
  ]

  return (
    <section className="bg-slate-100/70 px-4 py-14 md:px-6">
      <div className="mx-auto max-w-7xl">
        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-5 rounded-3xl bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md border border-slate-300"
            >
              <div
                className={`flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl ${item.bg}`}
              >
                {item.icon}
              </div>

              <div>
                <h3 className="text-4xl font-bold text-slate-700">
                  {loading ? '...' : item.value}
                </h3>
                <p className="mt-1 text-sm text-slate-500">{item.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default StatsSection