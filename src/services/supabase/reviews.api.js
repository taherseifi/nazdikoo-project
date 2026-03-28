import { supabase } from './client'

export async function getReviewsByBusinessId(businessId) {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('business_id', businessId)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function createReview(payload) {
  const { data, error } = await supabase
    .from('reviews')
    .insert([payload])
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function getAllReviewsAdmin() {
  const { data, error } = await supabase
    .from('reviews')
    .select(`
      id,
      business_id,
      reviewer_name,
      rating,
      comment,
      created_at,
      businesses (
        id,
        title,
        slug
      )
    `)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function deleteReview(id) {
  const { error } = await supabase
    .from('reviews')
    .delete()
    .eq('id', id)

  if (error) {
    throw new Error(error.message)
  }

  return true
}