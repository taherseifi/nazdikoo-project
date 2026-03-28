import { supabase } from './client'

export async function sendContactReplyEmail(messageId, replyText) {
  const { data, error } = await supabase.functions.invoke(
    'send-contact-reply',
    {
      body: {
        messageId,
        replyText,
      },
    }
  )

  if (error) {
    throw new Error(error.message || 'ارسال پاسخ انجام نشد')
  }

  if (data?.error) {
    throw new Error(data.error)
  }

  return data
}