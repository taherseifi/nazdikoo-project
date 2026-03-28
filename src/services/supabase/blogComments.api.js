import { supabase } from './client'

export async function getBlogComments(blogId) {
  const { data, error } = await supabase
    .from('blog_comments')
    .select('*')
    .eq('blog_id', blogId)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data
}

export async function createBlogComment(payload) {
  const { data, error } = await supabase
    .from('blog_comments')
    .insert([payload])
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function getAllBlogCommentsAdmin() {
  const { data, error } = await supabase
    .from('blog_comments')
    .select(`
      id,
      blog_id,
      name,
      email,
      comment,
      created_at,
      blogs (
        id,
        title,
        slug
      )
    `)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data
}

export async function deleteBlogComment(id) {
  const { error } = await supabase
    .from('blog_comments')
    .delete()
    .eq('id', id)

  if (error) throw new Error(error.message)
  return true
}