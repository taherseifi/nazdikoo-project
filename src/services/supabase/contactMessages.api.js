import { supabase } from './client'

export async function createContactMessage(payload) {
  const { data, error } = await supabase
    .from('contact_messages')
    .insert([payload])
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function getAllContactMessagesAdmin() {
  const { data, error } = await supabase
    .from('contact_messages')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data || []
}

export async function markContactMessageAsRead(id) {
  const { error } = await supabase
    .from('contact_messages')
    .update({ is_read: true })
    .eq('id', id)

  if (error) throw new Error(error.message)
  return true
}

export async function replyToContactMessage(id, adminReply) {
  const { data, error } = await supabase
    .from('contact_messages')
    .update({
      admin_reply: adminReply,
      is_read: true,
      replied_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function deleteContactMessage(id) {
  const { error } = await supabase
    .from('contact_messages')
    .delete()
    .eq('id', id)

  if (error) throw new Error(error.message)
  return true
}