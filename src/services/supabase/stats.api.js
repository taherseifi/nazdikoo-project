import { supabase } from './client'

export async function getSiteStats() {
  const [
    { count: approvedBusinessesCount, error: businessesError },
    { count: categoriesCount, error: categoriesError },
    { count: reviewsCount, error: reviewsError },
    { data: citiesData, error: citiesError },
  ] = await Promise.all([
    supabase
      .from('businesses')
      .select('*', { count: 'exact', head: true })
      .eq('is_approved', true),

    supabase
      .from('categories')
      .select('*', { count: 'exact', head: true }),

    supabase
      .from('reviews')
      .select('*', { count: 'exact', head: true }),

    supabase
      .from('businesses')
      .select('city')
      .eq('is_approved', true)
      .not('city', 'is', null),
  ])

  if (businessesError) throw new Error(businessesError.message)
  if (categoriesError) throw new Error(categoriesError.message)
  if (reviewsError) throw new Error(reviewsError.message)
  if (citiesError) throw new Error(citiesError.message)

  const uniqueCities = new Set(
    (citiesData || [])
      .map((item) => item.city?.trim()?.toLowerCase())
      .filter(Boolean)
  )

  return {
    approvedBusinessesCount: approvedBusinessesCount || 0,
    categoriesCount: categoriesCount || 0,
    reviewsCount: reviewsCount || 0,
    citiesCount: uniqueCities.size,
  }
}