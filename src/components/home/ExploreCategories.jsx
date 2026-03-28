import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Scissors,
  Hammer,
  Stethoscope,
  Scale,
  Wrench,
  Dumbbell,
  PawPrint,
  GraduationCap,
  Palette,
  Plane,
  Car,
  Truck,
  PartyPopper,
  House,
  Briefcase,
  ShoppingBag,
  Utensils,
  Laptop,
} from 'lucide-react'

const iconMap = {
  scissors: <Scissors className="h-8 w-8 text-blue-600" />,
  hammer: <Hammer className="h-8 w-8 text-blue-600" />,
  stethoscope: <Stethoscope className="h-8 w-8 text-blue-600" />,
  scale: <Scale className="h-8 w-8 text-blue-600" />,
  wrench: <Wrench className="h-8 w-8 text-blue-600" />,
  dumbbell: <Dumbbell className="h-8 w-8 text-blue-600" />,
  'paw-print': <PawPrint className="h-8 w-8 text-blue-600" />,
  'graduation-cap': <GraduationCap className="h-8 w-8 text-blue-600" />,
  palette: <Palette className="h-8 w-8 text-blue-600" />,
  plane: <Plane className="h-8 w-8 text-blue-600" />,
  car: <Car className="h-8 w-8 text-blue-600" />,
  truck: <Truck className="h-8 w-8 text-blue-600" />,
  'party-popper': <PartyPopper className="h-8 w-8 text-blue-600" />,
  home: <House className="h-8 w-8 text-blue-600" />,
  briefcase: <Briefcase className="h-8 w-8 text-blue-600" />,
  'shopping-bag': <ShoppingBag className="h-8 w-8 text-blue-600" />,
   utensils: <Utensils className="h-8 w-8 text-blue-600" />,
  monitor: <Laptop className="h-8 w-8 text-blue-600" />,
}

const INITIAL_COUNT = 6

function ExploreCategories({ categories = [] }) {
  const navigate = useNavigate()
  const [showAll, setShowAll] = useState(false)

  const visibleCategories = useMemo(() => {
    if (showAll) return categories
    return categories.slice(0, INITIAL_COUNT)
  }, [categories, showAll])

  const hasMoreThanInitial = categories.length > INITIAL_COUNT

  return (
    <section className="bg-slate-100/70 px-4 py-16 md:px-6 md:py-20">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h2 className="text-3xl font-bold text-slate-700 md:text-5xl">
              دسته‌بندی خدمات
            </h2>
            <p className="mt-3 text-base text-slate-500">
              مجموعه‌ای از خدمات تاییدشده و کاربردی
            </p>
          </div>

          <button
            onClick={() => navigate('/listings')}
            className="text-sm font-medium text-slate-600 hover:text-blue-600"
          >
            مشاهده همه ←
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {visibleCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => navigate(`/category/${category.slug}`)}
              className="flex items-center gap-5 rounded-3xl border border-slate-100 bg-white p-5 text-right shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl bg-slate-100">
                {iconMap[category.icon] || (
                  <span className="text-2xl font-bold text-slate-600">
                    {category.name?.charAt(0)}
                  </span>
                )}
              </div>

              <div className="flex-1">
                <h3 className="text-2xl font-bold text-slate-700">
                  {category.name}
                </h3>
                <p className="mt-2 text-base text-slate-500">
                  مشاهده خدمات مرتبط با {category.name}
                </p>
              
              </div>
            </button>
          ))}
        </div>

        {hasMoreThanInitial && (
          <div className="mt-10 flex justify-center">
            <button
              type="button"
              onClick={() => setShowAll((prev) => !prev)}
              className="rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-blue-600"
            >
              {showAll ? 'نمایش کمتر' : 'نمایش بیشتر'}
            </button>
          </div>
        )}
      </div>
    </section>
  )
}

export default ExploreCategories