import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'
import Layout from '../components/layout/Layout'
import PageHero from '../components/common/PageHero'
import { sendContactReplyEmail } from '../services/supabase/contactReply.api'
import { signOutAdmin } from '../services/supabase/auth.api'

import {
  approveBusiness,
  deleteBusiness,
  getAllBusinessesAdmin,
  toggleFeaturedBusiness,
  unapproveBusiness,
} from '../services/supabase/businesses.api'

import {
  deleteReview,
  getAllReviewsAdmin,
} from '../services/supabase/reviews.api'

import {
  deleteBlog,
  getAllBlogsAdmin,
  publishBlog,
  unpublishBlog,
} from '../services/supabase/blogs.api'

import {
  deleteBlogComment,
  getAllBlogCommentsAdmin,
} from '../services/supabase/blogComments.api'

import {
  deleteContactMessage,
  getAllContactMessagesAdmin,
  markContactMessageAsRead,
} from '../services/supabase/contactMessages.api'

import { deleteFileFromServer } from '../services/supabase/storage.api'

function AdminDashboard() {
  const navigate = useNavigate()

  const [businesses, setBusinesses] = useState([])
  const [reviews, setReviews] = useState([])
  const [blogs, setBlogs] = useState([])
  const [blogComments, setBlogComments] = useState([])
  const [contactMessages, setContactMessages] = useState([])

  const [replyText, setReplyText] = useState({})

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [activeTab, setActiveTab] = useState('businesses')
  const [actionLoadingId, setActionLoadingId] = useState(null)

  async function handleLogout() {
    try {
      await signOutAdmin()
      navigate('/admin-login')
    } catch (err) {
      setError(err.message || 'خروج انجام نشد')
    }
  }

  async function loadDashboardData() {
    try {
      setLoading(true)
      setError('')

      const [
        businessesData,
        reviewsData,
        blogsData,
        blogCommentsData,
        contactMessagesData,
      ] = await Promise.all([
        getAllBusinessesAdmin(),
        getAllReviewsAdmin(),
        getAllBlogsAdmin(),
        getAllBlogCommentsAdmin(),
        getAllContactMessagesAdmin(),
      ])

      setBusinesses(businessesData || [])
      setReviews(reviewsData || [])
      setBlogs(blogsData || [])
      setBlogComments(blogCommentsData || [])
      setContactMessages(contactMessagesData || [])
    } catch (err) {
      setError(err.message || 'خطا در دریافت اطلاعات داشبورد')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDashboardData()
  }, [])

  const filteredBusinesses = useMemo(() => {
    if (statusFilter === 'approved') {
      return businesses.filter((item) => item.is_approved)
    }

    if (statusFilter === 'pending') {
      return businesses.filter((item) => !item.is_approved)
    }

    return businesses
  }, [businesses, statusFilter])

  async function handlePublishBlog(id) {
    try {
      setActionLoadingId(id)
      await publishBlog(id)
      await loadDashboardData()
    } catch (err) {
      setError(err.message || 'انتشار بلاگ انجام نشد')
    } finally {
      setActionLoadingId(null)
    }
  }

  async function handleUnpublishBlog(id) {
    try {
      setActionLoadingId(id)
      await unpublishBlog(id)
      await loadDashboardData()
    } catch (err) {
      setError(err.message || 'لغو انتشار بلاگ انجام نشد')
    } finally {
      setActionLoadingId(null)
    }
  }

  async function handleDeleteBlog(id) {
    const confirmed = window.confirm('این بلاگ حذف شود؟')
    if (!confirmed) return

    try {
      setActionLoadingId(id)
      await deleteBlog(id)
      await loadDashboardData()
    } catch (err) {
      setError(err.message || 'حذف بلاگ انجام نشد')
    } finally {
      setActionLoadingId(null)
    }
  }

  async function handleDeleteBlogComment(id) {
    const confirmed = window.confirm('این نظر بلاگ حذف شود؟')
    if (!confirmed) return

    try {
      setActionLoadingId(id)
      await deleteBlogComment(id)
      await loadDashboardData()
    } catch (err) {
      setError(err.message || 'حذف نظر بلاگ انجام نشد')
    } finally {
      setActionLoadingId(null)
    }
  }

  async function handleApprove(id) {
    try {
      setActionLoadingId(id)
      await approveBusiness(id)
      await loadDashboardData()
    } catch (err) {
      setError(err.message || 'تایید خدمت انجام نشد')
    } finally {
      setActionLoadingId(null)
    }
  }

  async function handleUnapprove(id) {
    try {
      setActionLoadingId(id)
      await unapproveBusiness(id)
      await loadDashboardData()
    } catch (err) {
      setError(err.message || 'رد یا لغو تایید انجام نشد')
    } finally {
      setActionLoadingId(null)
    }
  }

  async function handleToggleFeatured(id, currentValue) {
    try {
      setActionLoadingId(id)
      await toggleFeaturedBusiness(id, !currentValue)
      await loadDashboardData()
    } catch (err) {
      setError(err.message || 'تغییر وضعیت ویژه انجام نشد')
    } finally {
      setActionLoadingId(null)
    }
  }

  async function handleDeleteBusiness(id) {
    const confirmed = window.confirm('این خدمت حذف شود؟')
    if (!confirmed) return

    try {
      setActionLoadingId(id)
      setError('')

      const business = businesses.find((item) => item.id === id)

      if (!business) {
        throw new Error('اطلاعات خدمت پیدا نشد')
      }

      const filesToDelete = [
        business.cover_image,
        business.image_url,
        ...(Array.isArray(business.gallery) ? business.gallery : []),
      ]
        .filter(Boolean)
        .filter((url, index, array) => array.indexOf(url) === index)

      if (filesToDelete.length > 0) {
        const deleteResults = await Promise.allSettled(
          filesToDelete.map((url) => deleteFileFromServer(url))
        )

        const failedDeletes = deleteResults.filter(
          (result) => result.status === 'rejected'
        )

        if (failedDeletes.length > 0) {
          throw new Error('بعضی از عکس‌ها از هاست حذف نشدند، بنابراین خدمت حذف نشد')
        }
      }

      await deleteBusiness(id)
      await loadDashboardData()
    } catch (err) {
      setError(err.message || 'حذف خدمت انجام نشد')
    } finally {
      setActionLoadingId(null)
    }
  }

  async function handleDeleteReview(id) {
    const confirmed = window.confirm('این نظر حذف شود؟')
    if (!confirmed) return

    try {
      setActionLoadingId(id)
      await deleteReview(id)
      await loadDashboardData()
    } catch (err) {
      setError(err.message || 'حذف نظر انجام نشد')
    } finally {
      setActionLoadingId(null)
    }
  }

  async function handleMarkContactMessageAsRead(id) {
    try {
      setActionLoadingId(id)
      await markContactMessageAsRead(id)
      await loadDashboardData()
    } catch (err) {
      setError(err.message || 'علامت‌گذاری پیام انجام نشد')
    } finally {
      setActionLoadingId(null)
    }
  }

  async function handleReplyContactMessage(id) {
    try {
      const message = replyText[id]?.trim()

      if (!message) {
        setError('متن پاسخ را وارد کن')
        return
      }

      setActionLoadingId(id)
      setError('')

      await sendContactReplyEmail(id, message)

      setReplyText((prev) => ({
        ...prev,
        [id]: '',
      }))

      await loadDashboardData()
    } catch (err) {
      setError(err.message || 'ارسال پاسخ انجام نشد')
    } finally {
      setActionLoadingId(null)
    }
  }

  async function handleDeleteContactMessage(id) {
    const confirmed = window.confirm('این پیام حذف شود؟')
    if (!confirmed) return

    try {
      setActionLoadingId(id)
      await deleteContactMessage(id)
      await loadDashboardData()
    } catch (err) {
      setError(err.message || 'حذف پیام انجام نشد')
    } finally {
      setActionLoadingId(null)
    }
  }

  return (
    <Layout>
      <PageHero
        title="داشبورد ادمین"
        subtitle="مدیریت خدمات، بررسی درخواست‌ها، کنترل نظرات و پیام‌های تماس"
      />

      <div className="p-4 md:p-6">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 rounded-3xl bg-white p-6 shadow-sm md:p-8">
            <h1 className="mb-3 text-3xl font-bold">داشبورد ادمین</h1>
            <p className="text-gray-600">
              مدیریت خدمات ثبت‌شده، تایید یا رد، ویژه کردن، مدیریت نظرات و بررسی پیام‌های تماس
            </p>
          </div>

          <div className="mb-6 flex flex-wrap gap-3">
            <button
              onClick={() => setActiveTab('businesses')}
              className={`rounded-2xl px-5 py-3 text-sm font-medium transition ${
                activeTab === 'businesses'
                  ? 'bg-gray-900 text-white'
                  : 'bg-white text-gray-700 shadow'
              }`}
            >
              مدیریت خدمات
            </button>

            <button
              onClick={() => setActiveTab('reviews')}
              className={`rounded-2xl px-5 py-3 text-sm font-medium transition ${
                activeTab === 'reviews'
                  ? 'bg-gray-900 text-white'
                  : 'bg-white text-gray-700 shadow'
              }`}
            >
              مدیریت نظرات
            </button>

            <button
              onClick={() => setActiveTab('blogs')}
              className={`rounded-2xl px-5 py-3 text-sm font-medium transition ${
                activeTab === 'blogs'
                  ? 'bg-gray-900 text-white'
                  : 'bg-white text-gray-700 shadow'
              }`}
            >
              مدیریت بلاگ‌ها
            </button>

            <button
              onClick={() => setActiveTab('blog-comments')}
              className={`rounded-2xl px-5 py-3 text-sm font-medium transition ${
                activeTab === 'blog-comments'
                  ? 'bg-gray-900 text-white'
                  : 'bg-white text-gray-700 shadow'
              }`}
            >
              نظرات بلاگ
            </button>

            <button
              onClick={() => setActiveTab('contact-messages')}
              className={`rounded-2xl px-5 py-3 text-sm font-medium transition ${
                activeTab === 'contact-messages'
                  ? 'bg-gray-900 text-white'
                  : 'bg-white text-gray-700 shadow'
              }`}
            >
              پیام‌های تماس
            </button>

            <Link
              to="/admin/blogs/create"
              className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-blue-700"
            >
              ثبت بلاگ
            </Link>

            <Link
              to="/admin/categories"
              className="rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-emerald-700"
            >
              مدیریت دسته‌بندی‌ها
            </Link>

            <Link
              to="/admin/seo"
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 shadow-sm hover:border-slate-300"
            >
              <Search className="h-4 w-4" />
              <span>SEO Manager</span>
            </Link>

            <button
              onClick={handleLogout}
              className="rounded-2xl bg-red-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-red-700"
            >
              خروج
            </button>
          </div>

          {error && (
            <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
              {error}
            </div>
          )}

          {loading ? (
            <div className="rounded-2xl bg-white p-6 shadow">
              در حال بارگذاری...
            </div>
          ) : (
            <>
              {activeTab === 'businesses' && (
                <section>
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <h2 className="text-2xl font-bold">خدمات</h2>

                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none"
                    >
                      <option value="all">همه</option>
                      <option value="approved">تاییدشده</option>
                      <option value="pending">در انتظار تایید</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-1 gap-5">
                    {filteredBusinesses.map((business) => (
                      <div
                        key={business.id}
                        className="rounded-3xl bg-white p-5 shadow-sm"
                      >
                        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[220px_1fr]">
                          <img
                            src={business.image_url || business.cover_image}
                            alt={business.title}
                            className="h-52 w-full rounded-2xl object-cover"
                          />

                          <div>
                            <div className="mb-3 flex flex-wrap items-center gap-2">
                              <h3 className="text-2xl font-bold text-gray-900">
                                {business.title}
                              </h3>

                              <span
                                className={`rounded-full px-3 py-1 text-xs font-medium ${
                                  business.is_approved
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-yellow-100 text-yellow-700'
                                }`}
                              >
                                {business.is_approved ? 'تاییدشده' : 'در انتظار تایید'}
                              </span>

                              {business.is_featured && (
                                <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                                  ویژه
                                </span>
                              )}
                            </div>

                            <p className="mb-4 text-sm leading-7 text-gray-600">
                              {business.description}
                            </p>

                            <div className="mb-5 grid grid-cols-1 gap-2 text-sm text-gray-700 md:grid-cols-2">
                              <p>دسته‌بندی: {business.categories?.name || '---'}</p>
                              <p>زیرشاخه: {business.subcategories?.name || '---'}</p>
                              <p>کشور: {business.country}</p>
                              <p>شهر: {business.city}</p>
                              <p>منطقه: {business.region || '---'}</p>
                              <p>آدرس: {business.address}</p>
                              <p>تلفن: {business.phone}</p>
                              <p>واتساپ: {business.whatsapp}</p>
                              <p>ایمیل: {business.email || '---'}</p>
                              <p>اسلاگ: {business.slug}</p>
                            </div>

                            <div className="flex flex-wrap gap-3">
                              {!business.is_approved ? (
                                <button
                                  onClick={() => handleApprove(business.id)}
                                  disabled={actionLoadingId === business.id}
                                  className="rounded-2xl bg-green-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-700 disabled:opacity-60"
                                >
                                  تایید
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleUnapprove(business.id)}
                                  disabled={actionLoadingId === business.id}
                                  className="rounded-2xl bg-yellow-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-yellow-600 disabled:opacity-60"
                                >
                                  لغو تایید
                                </button>
                              )}

                              <button
                                onClick={() =>
                                  handleToggleFeatured(
                                    business.id,
                                    business.is_featured
                                  )
                                }
                                disabled={actionLoadingId === business.id}
                                className="rounded-2xl bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-60"
                              >
                                {business.is_featured
                                  ? 'برداشتن از ویژه'
                                  : 'ویژه کردن'}
                              </button>

                              <Link
                                to={`/admin/businesses/edit/${business.id}`}
                                className="rounded-2xl bg-slate-800 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-900"
                              >
                                ویرایش
                              </Link>

                              <button
                                onClick={() => handleDeleteBusiness(business.id)}
                                disabled={actionLoadingId === business.id}
                                className="rounded-2xl bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:opacity-60"
                              >
                                حذف
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                    {filteredBusinesses.length === 0 && (
                      <div className="rounded-2xl bg-white p-6 shadow">
                        موردی پیدا نشد
                      </div>
                    )}
                  </div>
                </section>
              )}

              {activeTab === 'reviews' && (
                <section>
                  <h2 className="mb-4 text-2xl font-bold">نظرات</h2>

                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <div
                        key={review.id}
                        className="rounded-3xl bg-white p-5 shadow-sm"
                      >
                        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <h3 className="text-lg font-bold text-gray-900">
                              {review.reviewer_name}
                            </h3>
                            <p className="text-sm text-gray-500">
                              مربوط به: {review.businesses?.title || '---'}
                            </p>
                          </div>

                          <span className="rounded-full bg-yellow-100 px-3 py-1 text-sm font-medium text-yellow-700">
                            امتیاز: {review.rating}
                          </span>
                        </div>

                        <p className="mb-4 text-sm leading-7 text-gray-700">
                          {review.comment}
                        </p>

                        <button
                          onClick={() => handleDeleteReview(review.id)}
                          disabled={actionLoadingId === review.id}
                          className="rounded-2xl bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:opacity-60"
                        >
                          حذف نظر
                        </button>
                      </div>
                    ))}

                    {reviews.length === 0 && (
                      <div className="rounded-2xl bg-white p-6 shadow">
                        هنوز نظری ثبت نشده
                      </div>
                    )}
                  </div>
                </section>
              )}

              {activeTab === 'blogs' && (
                <section>
                  <div className="mb-6 flex items-center justify-between gap-4">
                    <h2 className="text-2xl font-bold">بلاگ‌ها</h2>

                    <Link
                      to="/admin/blogs/create"
                      className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-blue-700"
                    >
                      ثبت بلاگ
                    </Link>
                  </div>

                  <div className="grid grid-cols-1 gap-5">
                    {blogs.map((blog) => (
                      <div
                        key={blog.id}
                        className="rounded-3xl bg-white p-5 shadow-sm"
                      >
                        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[220px_1fr]">
                          <img
                            src={blog.thumbnail_url}
                            alt={blog.title}
                            className="h-52 w-full rounded-2xl object-cover"
                          />

                          <div>
                            <div className="mb-3 flex flex-wrap items-center gap-2">
                              <h3 className="text-2xl font-bold text-gray-900">
                                {blog.title}
                              </h3>

                              <span
                                className={`rounded-full px-3 py-1 text-xs font-medium ${
                                  blog.is_published
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-yellow-100 text-yellow-700'
                                }`}
                              >
                                {blog.is_published ? 'منتشرشده' : 'منتشر نشده'}
                              </span>
                            </div>

                            <p className="mb-4 line-clamp-3 text-sm text-gray-600">
                              {blog.excerpt}
                            </p>

                            <div className="flex flex-wrap gap-3">
                              {!blog.is_published ? (
                                <button
                                  onClick={() => handlePublishBlog(blog.id)}
                                  disabled={actionLoadingId === blog.id}
                                  className="rounded-2xl bg-green-600 px-4 py-2 text-white disabled:opacity-60"
                                >
                                  انتشار
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleUnpublishBlog(blog.id)}
                                  disabled={actionLoadingId === blog.id}
                                  className="rounded-2xl bg-yellow-500 px-4 py-2 text-white disabled:opacity-60"
                                >
                                  لغو انتشار
                                </button>
                              )}

                              <Link
                                to={`/admin/blogs/edit/${blog.id}`}
                                className="rounded-2xl bg-blue-600 px-4 py-2 text-white"
                              >
                                ویرایش
                              </Link>

                              <button
                                onClick={() => handleDeleteBlog(blog.id)}
                                disabled={actionLoadingId === blog.id}
                                className="rounded-2xl bg-red-600 px-4 py-2 text-white disabled:opacity-60"
                              >
                                حذف
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                    {blogs.length === 0 && (
                      <div className="rounded-2xl bg-white p-6 shadow">
                        هنوز بلاگی ثبت نشده
                      </div>
                    )}
                  </div>
                </section>
              )}

              {activeTab === 'blog-comments' && (
                <section>
                  <h2 className="mb-4 text-2xl font-bold">نظرات بلاگ</h2>

                  <div className="space-y-4">
                    {blogComments.map((comment) => (
                      <div
                        key={comment.id}
                        className="rounded-3xl bg-white p-5 shadow-sm"
                      >
                        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <h3 className="text-lg font-bold text-gray-900">
                              {comment.name}
                            </h3>
                            <p className="text-sm text-gray-500">
                              مربوط به بلاگ: {comment.blogs?.title || '---'}
                            </p>
                            {comment.email && (
                              <p className="text-sm text-gray-400">
                                ایمیل: {comment.email}
                              </p>
                            )}
                          </div>

                          <span className="text-sm text-gray-400">
                            {new Date(comment.created_at).toLocaleDateString('fa-IR')}
                          </span>
                        </div>

                        <p className="mb-4 text-sm leading-7 text-gray-700">
                          {comment.comment}
                        </p>

                        <button
                          onClick={() => handleDeleteBlogComment(comment.id)}
                          disabled={actionLoadingId === comment.id}
                          className="rounded-2xl bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:opacity-60"
                        >
                          حذف نظر
                        </button>
                      </div>
                    ))}

                    {blogComments.length === 0 && (
                      <div className="rounded-2xl bg-white p-6 shadow">
                        هنوز نظری برای بلاگ ثبت نشده
                      </div>
                    )}
                  </div>
                </section>
              )}

              {activeTab === 'contact-messages' && (
                <section>
                  <h2 className="mb-6 text-2xl font-bold">پیام‌های تماس با ما</h2>

                  <div className="space-y-5">
                    {contactMessages.map((item) => (
                      <div
                        key={item.id}
                        className="rounded-3xl bg-white p-5 shadow-sm"
                      >
                        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <h3 className="text-xl font-bold text-gray-900">
                              {item.name}
                            </h3>
                            <p className="text-sm text-gray-500">{item.email}</p>
                            <p className="mt-1 text-sm text-gray-500">
                              موضوع: {item.subject || '---'}
                            </p>
                          </div>

                          <div className="flex flex-col items-end gap-2">
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-medium ${
                                item.is_read
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-yellow-100 text-yellow-700'
                              }`}
                            >
                              {item.is_read ? 'خوانده شده' : 'خوانده نشده'}
                            </span>

                            <span className="text-xs text-gray-400">
                              {new Date(item.created_at).toLocaleDateString('fa-IR')}
                            </span>
                          </div>
                        </div>

                        <div className="mb-4 rounded-2xl bg-slate-50 p-4 text-sm leading-7 text-gray-700">
                          {item.message}
                        </div>

                        {item.admin_reply && (
                          <div className="mb-4 rounded-2xl border border-blue-200 bg-blue-50 p-4">
                            <div className="mb-2 text-sm font-bold text-blue-700">
                              پاسخ ادمین
                            </div>
                            <div className="text-sm leading-7 text-blue-800">
                              {item.admin_reply}
                            </div>
                          </div>
                        )}

                        <div className="mb-4">
                          <label className="mb-2 block text-sm font-medium text-gray-800">
                            پاسخ ادمین
                          </label>
                          <textarea
                            rows={4}
                            value={replyText[item.id] || ''}
                            onChange={(e) =>
                              setReplyText((prev) => ({
                                ...prev,
                                [item.id]: e.target.value,
                              }))
                            }
                            className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none transition focus:border-gray-400"
                            placeholder="پاسخ خودت را اینجا بنویس..."
                          />
                        </div>

                        <div className="flex flex-wrap gap-3">
                          {!item.is_read && (
                            <button
                              onClick={() => handleMarkContactMessageAsRead(item.id)}
                              disabled={actionLoadingId === item.id}
                              className="rounded-2xl bg-green-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-700 disabled:opacity-60"
                            >
                              خوانده شد
                            </button>
                          )}

                          <button
                            onClick={() => handleReplyContactMessage(item.id)}
                            disabled={actionLoadingId === item.id}
                            className="rounded-2xl bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-60"
                          >
                            ثبت پاسخ
                          </button>

                          <button
                            onClick={() => handleDeleteContactMessage(item.id)}
                            disabled={actionLoadingId === item.id}
                            className="rounded-2xl bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:opacity-60"
                          >
                            حذف
                          </button>
                        </div>
                      </div>
                    ))}

                    {contactMessages.length === 0 && (
                      <div className="rounded-2xl bg-white p-6 shadow">
                        هنوز هیچ پیامی ثبت نشده
                      </div>
                    )}
                  </div>
                </section>
              )}
            </>
          )}
        </div>
      </div>
    </Layout>
  )
}

export default AdminDashboard