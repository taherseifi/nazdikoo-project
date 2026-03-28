import { supabase } from './client'

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-آ-ی]/g, '')
}

export async function getPublishedBlogs(limit = 6) {
  let query = supabase
    .from('blogs')
    .select('*')
    .eq('is_published', true)
    .order('created_at', { ascending: false })

  if (limit) query = query.limit(limit)

  const { data, error } = await query
  if (error) throw new Error(error.message)
  return data
}

export async function getAllBlogsAdmin() {
  const { data, error } = await supabase
    .from('blogs')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data
}

export async function getBlogBySlug(slug) {
  const { data, error } = await supabase
    .from('blogs')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .limit(2)

  if (error) throw error

  if (!data || data.length === 0) {
    throw new Error('بلاگی با این آدرس پیدا نشد.')
  }

  if (data.length > 1) {
    throw new Error('برای این slug بیش از یک بلاگ وجود دارد. slug باید یکتا باشد.')
  }

  return data[0]
}
export async function getBlogByIdAdmin(id) {
  const { data, error } = await supabase
    .from('blogs')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function createBlog(payload) {
  const { data, error } = await supabase
    .from('blogs')
    .insert(payload)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateBlog(id, payload) {
  const { data, error } = await supabase
    .from('blogs')
    .update(payload)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function publishBlog(id) {
  const { error } = await supabase
    .from('blogs')
    .update({ is_published: true, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) throw new Error(error.message)
  return true
}

export async function unpublishBlog(id) {
  const { error } = await supabase
    .from('blogs')
    .update({ is_published: false, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) throw new Error(error.message)
  return true
}

export async function deleteBlog(id) {
  const { error } = await supabase.from('blogs').delete().eq('id', id)

  if (error) throw new Error(error.message)
  return true
}

export async function getBlogById(id) {
  const { data, error } = await supabase
    .from('blogs')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function checkBlogSlugExists(slug, excludeId = null) {
  let query = supabase
    .from('blogs')
    .select('id, slug')
    .eq('slug', slug)
    .limit(1)

  if (excludeId) {
    query = query.neq('id', excludeId)
  }

  const { data, error } = await query

  if (error) throw error
  return Boolean(data && data.length > 0)
}
