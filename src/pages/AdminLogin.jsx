import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/layout/Layout'
import { signInAdmin } from '../services/supabase/auth.api'
import PageHero from '../components/common/PageHero'

function AdminLogin() {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    email: '',
    password: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function handleChange(event) {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()

    try {
      setLoading(true)
      setError('')

      await signInAdmin(form.email, form.password)
      navigate('/admin')
    } catch (err) {
      setError(err.message || 'ورود انجام نشد')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <PageHero
  title="ورود مدیریت"
  subtitle="ورود امن به پنل مدیریت نزدیکو"
/>
      <div className="flex min-h-screen items-center justify-center px-4 py-24">
        <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-lg md:p-8">
          <h1 className="mb-3 text-3xl font-bold text-gray-900">ورود ادمین</h1>
          <p className="mb-6 text-sm text-gray-600">
            فقط ادمین سایت می‌تواند وارد داشبورد شود.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-800">
                ایمیل
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-800">
                پسورد
              </label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                className={inputClass}
              />
            </div>

            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-gray-900 px-6 py-3 font-medium text-white transition hover:bg-gray-800 disabled:opacity-60"
            >
              {loading ? 'در حال ورود...' : 'ورود به پنل'}
            </button>
          </form>
        </div>
      </div>
    </Layout>
  )
}

const inputClass =
  'w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none transition focus:border-gray-400'

export default AdminLogin