import { Link } from 'react-router-dom'

export default function SidebarInfoBlocks({
  featuredServices = [],
  latestServices = [],
  showLatestOnMobile = false,
}) {
  return (
    <div className="space-y-6">
      <SidebarSection
        title="خدمات ویژه"
        items={featuredServices}
      />

      <div className={showLatestOnMobile ? 'block' : 'hidden xl:block'}>
        <SidebarSection
          title="آخرین خدمات"
          items={latestServices}
        />
      </div>
    </div>
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
                <div className="line-clamp-1 font-medium text-slate-700">
                  {item.title}
                </div>
                <div className="mt-1 text-sm text-slate-500">{item.city}</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}