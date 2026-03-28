import { supabase } from './client'

const businessSelect = `
  id,
  title,
  slug,
  description,
  country,
  city,
  region,
  address,
  phone,
  whatsapp,
  email,
  website,
  cover_image,
  gallery,
  is_featured,
  is_approved,
  rating_avg,
  reviews_count,
  created_at,
  image_url,
  latitude,
  longitude,
  google_maps_url,
  category_id,
  subcategory_id,
  categories (
    id,
    name,
    slug,
    icon
  ),
  subcategories (
    id,
    name,
    slug
  )
`

export async function getBusinesses(categorySlug = null, city = null) {
  let categoryId = null

  if (categorySlug) {
    const { data: categoryData, error: categoryError } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', categorySlug)
      .single()

    if (categoryError) {
      throw new Error(categoryError.message)
    }

    categoryId = categoryData.id
  }

  let query = supabase
    .from('businesses')
    .select(businessSelect)
    .eq('is_approved', true)
    .order('created_at', { ascending: false })

  if (categoryId) {
    query = query.eq('category_id', categoryId)
  }

  if (city) {
    query = query.ilike('city', `%${city}%`)
  }

  const { data, error } = await query

  if (error) {
    throw new Error(error.message)
  }

  return data || []
}

export async function getFilteredBusinesses({
  country = '',
  city = '',
  categoryId = '',
  sortBy = 'newest',
} = {}) {
  let query = supabase
    .from('businesses')
    .select(businessSelect)
    .eq('is_approved', true)

  if (country) {
    query = query.eq('country', country)
  }

  if (city) {
    query = query.eq('city', city)
  }

  if (categoryId) {
    query = query.eq('category_id', Number(categoryId))
  }

  if (sortBy === 'featured') {
    query = query
      .eq('is_featured', true)
      .order('created_at', { ascending: false })
  } else if (sortBy === 'best-rated') {
    query = query.order('rating_avg', { ascending: false })
  } else if (sortBy === 'most-reviewed') {
    query = query.order('reviews_count', { ascending: false })
  } else if (sortBy === 'top') {
    query = query
      .order('rating_avg', { ascending: false })
      .order('reviews_count', { ascending: false })
  } else {
    query = query.order('created_at', { ascending: false })
  }

  const { data, error } = await query

  if (error) {
    throw new Error(error.message)
  }

  return data || []
}

export async function getAvailableCountries() {
  const { data, error } = await supabase
    .from('businesses')
    .select('country')
    .eq('is_approved', true)

  if (error) {
    throw new Error(error.message)
  }

  return [...new Set((data || []).map((item) => item.country).filter(Boolean))]
}

export async function getAvailableCities(country = '') {
  let query = supabase
    .from('businesses')
    .select('city')
    .eq('is_approved', true)

  if (country) {
    query = query.eq('country', country)
  }

  const { data, error } = await query

  if (error) {
    throw new Error(error.message)
  }

  return [...new Set((data || []).map((item) => item.city).filter(Boolean))]
}

export async function getBusinessBySlug(slug) {
  const { data, error } = await supabase
    .from('businesses')
    .select(businessSelect)
    .eq('slug', slug)
    .eq('is_approved', true)
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function createBusiness(payload) {
  const { data, error } = await supabase
    .from('businesses')
    .insert([payload])
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function getAllBusinessesAdmin() {
  const { data, error } = await supabase
    .from('businesses')
    .select(businessSelect)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return data || []
}

export async function approveBusiness(id) {
  const { data, error } = await supabase
    .from('businesses')
    .update({ is_approved: true })
    .eq('id', id)

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function unapproveBusiness(id) {
  const { data, error } = await supabase
    .from('businesses')
    .update({ is_approved: false })
    .eq('id', id)

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function toggleFeaturedBusiness(id, nextValue) {
  const { data, error } = await supabase
    .from('businesses')
    .update({ is_featured: nextValue })
    .eq('id', id)

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function deleteBusiness(id) {
  const { error } = await supabase
    .from('businesses')
    .delete()
    .eq('id', id)

  if (error) {
    throw new Error(error.message)
  }

  return true
}

export async function getLatestBusinesses(limit = 3) {
  const { data, error } = await supabase
    .from('businesses')
    .select(businessSelect)
    .eq('is_approved', true)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    throw new Error(error.message)
  }

  return data || []
}

export async function getFeaturedBusinesses(limit = 6) {
  const { data, error } = await supabase
    .from('businesses')
    .select(businessSelect)
    .eq('is_approved', true)
    .eq('is_featured', true)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    throw new Error(error.message)
  }

  return data || []
}
export async function getBusinessesGroupedByCity(limit = 4) {
  const { data, error } = await supabase
    .from('businesses')
    .select(businessSelect)
    .eq('is_approved', true)
    .not('city', 'is', null)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  const cityMap = new Map()

  for (const item of data || []) {
    const cityKey = item.city?.trim()
    if (!cityKey) continue

    if (!cityMap.has(cityKey)) {
      cityMap.set(cityKey, {
        city: cityKey,
        count: 1,
        image: item.image_url || item.cover_image || '',
      })
    } else {
      cityMap.get(cityKey).count += 1
    }
  }

  return Array.from(cityMap.values()).slice(0, limit)
}
export async function getBusinessByIdAdmin(id) {
  const { data, error } = await supabase
    .from('businesses')
    .select(businessSelect)
    .eq('id', id)
    .single()

  if (error) {
    throw new Error(error.message || 'دریافت خدمت انجام نشد')
  }

  return data
}

export async function updateBusinessAdmin(id, values) {
  const payload = {
    title: values.title,
    slug: values.slug,
    description: values.description,
    country: values.country,
    city: values.city,
    region: values.region,
    address: values.address,
    phone: values.phone,
    whatsapp: values.whatsapp,
    email: values.email,
    website: values.website,
    cover_image: values.cover_image,
    image_url: values.image_url,
    gallery: values.gallery,
    latitude: values.latitude,
    longitude: values.longitude,
    google_maps_url: values.google_maps_url,
    is_approved: values.is_approved,
    is_featured: values.is_featured,
  }

  const { data, error } = await supabase
    .from('businesses')
    .update(payload)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new Error(error.message || 'ویرایش خدمت انجام نشد')
  }

  return data
}