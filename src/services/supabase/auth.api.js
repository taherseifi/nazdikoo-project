import { supabase } from './client'

const ADMIN_EMAIL = 'taherseifi152@gmail.com'

export async function signInAdmin(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    throw new Error(error.message)
  }

  if (data.user?.email !== ADMIN_EMAIL) {
    await supabase.auth.signOut()
    throw new Error('شما دسترسی ادمین ندارید')
  }

  return data
}

export async function signOutAdmin() {
  const { error } = await supabase.auth.signOut()

  if (error) {
    throw new Error(error.message)
  }

  return true
}

export async function getCurrentAdmin() {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession()

  if (error) {
    throw new Error(error.message)
  }

  if (!session?.user) return null
  if (session.user.email !== ADMIN_EMAIL) return null

  return session.user
}