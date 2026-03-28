import { supabase } from './client'

export async function getCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('id', { ascending: true })

  if (error) {
    throw new Error(error.message)
  }

  return data || []
}

export async function getSubcategoriesByCategoryId(categoryId) {
  if (!categoryId) return []

  const { data, error } = await supabase
    .from('subcategories')
    .select('*')
    .eq('category_id', Number(categoryId))
    .order('id', { ascending: true })

  if (error) {
    throw new Error(error.message)
  }

  return data || []
}

