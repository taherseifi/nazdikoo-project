import { useState } from 'react'
import Layout from '../components/layout/Layout'
import PageHero from '../components/common/PageHero'
import Seo from '../components/common/Seo'
import { Mail, MapPin, Phone, MessageCircle } from 'lucide-react'
import { createContactMessage } from '../services/supabase/contactMessages.api'

function ContactUs() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })

  const [loading, setLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  function handleChange(e) {
    const { name, value } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  async function handleSubmit(e) {
    e.preventDefault()

    try {
      setLoading(true)
      setSuccessMessage('')
      setErrorMessage('')

      if (!form.name.trim()) throw new Error('نام را وارد کن')
      if (!form.email.trim()) throw new Error('ایمیل را وارد کن')
      if (!form.message.trim()) throw new Error('متن پیام را وارد کن')

      await createContactMessage(form)

      setSuccessMessage('پیام شما با موفقیت ارسال شد.')
      setForm({
        name: '',
        email: '',
        subject: '',
        message: '',
      })
    } catch (err) {
      setErrorMessage(err.message || 'ارسال پیام انجام نشد')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <Seo
        title="تماس با ما | نزدیکو"
        description="برای ارتباط با تیم نزدیکو، ارسال سوالات، پیشنهادها، همکاری، تبلیغات و ویرایش اطلاعات کسب‌وکار از صفحه تماس با ما استفاده کنید."
        canonical="https://nazdikoo.com/contact"
      />

      <PageHero
        title="تماس با ما"
        subtitle="برای سوالات، پیشنهادها و همکاری با ما در ارتباط باش."
      />

      <section className="bg-slate-10 px-4 py-12 md:px-6">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 md:grid-cols-2">
          <div className="rounded-[32px] bg-white p-6 shadow-sm md:p-8 border border-slate-300">
            <span className="inline-flex rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-700">
              Contact
            </span>

            <h1 className="mt-5 text-3xl font-bold text-slate-800 md:text-5xl">
              با تیم نزدیکو در تماس باش
            </h1>

            <p className="mt-4 text-base leading-8 text-slate-600">
              اگر درباره ثبت خدمات، همکاری، تبلیغات، ویرایش اطلاعات یا هر موضوع
              دیگری سوالی داری، از طریق راه‌های ارتباطی زیر با ما تماس بگیر.
            </p>

            <div className="mt-8 space-y-5">
              <InfoRow
                icon={<Phone className="h-5 w-5" />}
                title="شماره تماس"
                value="0553,865,91,04"

              />
              <InfoRow
                icon={<MessageCircle className="h-5 w-5" />}
                title="واتساپ"
                value="0553,865,91,04"
              />
              <InfoRow
                icon={<Mail className="h-5 w-5" />}
                title="ایمیل"
                value="info@nazdikoo.com"
              />
              <InfoRow
                icon={<MapPin className="h-5 w-5" />}
                title="آدرس"
                value="استانبول، ترکیه"
              />
            </div>
          </div>

          <div className="rounded-[32px] bg-white p-6 shadow-sm md:p-8 border border-slate-300">
            <h2 className="text-2xl font-bold text-slate-800">ارسال پیام</h2>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="نام"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
              />
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="ایمیل"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
              />
              <input
                type="text"
                name="subject"
                value={form.subject}
                onChange={handleChange}
                placeholder="موضوع"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
              />
              <textarea
                rows={6}
                name="message"
                value={form.message}
                onChange={handleChange}
                placeholder="متن پیام"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
              />

              {errorMessage && (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
                  {errorMessage}
                </div>
              )}

              {successMessage && (
                <div className="rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
                  {successMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="rounded-2xl bg-slate-900 px-6 py-3 font-medium text-white transition hover:bg-slate-800 disabled:opacity-60"
              >
                {loading ? 'در حال ارسال...' : 'ارسال پیام'}
              </button>
            </form>
          </div>
        </div>
      </section>
    </Layout>
  )
}

function InfoRow({ icon, title, value }) {
  return (
    <div className="flex items-start gap-4 rounded-2xl bg-slate-50 p-4">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-slate-700 shadow-sm">
        {icon}
      </div>

      <div>
        <div className="font-bold text-slate-800">{title}</div>
        <div className="mt-1 text-sm text-slate-600">{value}</div>
      </div>
    </div>
  )
}

export default ContactUs