import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Listings from './pages/Listings'
import BusinessDetails from './pages/BusinessDetails'
import SubmitBusiness from './pages/SubmitBusiness'
import AdminDashboard from './pages/AdminDashboard'
import AdminLogin from './pages/AdminLogin'
import Blogs from './pages/Blogs'
import BlogDetails from './pages/BlogDetails'
import AdminBlogEdit from './pages/AdminBlogEdit'
import AdminBlogCreate from './pages/AdminBlogCreate'
import AdminEditBusiness from './pages/AdminEditBusiness'
import AdminSeoManager from './pages/AdminSeoManager'
import AdminRoute from './components/auth/AdminRoute'
import Faq from './pages/Faq'
import PrivacyPolicy from './pages/PrivacyPolicy'
import GuideSubmitBusiness from './pages/GuideSubmitBusiness'
import AdminCategoriesManager from './pages/AdminCategoriesManager'
import ScrollToTopButton from './components/ui/ScrollToTopButton'
import ContactUs from './pages/ContactUs'
import About from './pages/About'
import CategoryPage from './pages/CategoryPage'
import NearbyServices from './pages/NearbyServices'

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/listings" element={<Listings />} />
        <Route path="/business/:slug" element={<BusinessDetails />} />
        <Route path="/submit-business" element={<SubmitBusiness />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/blogs" element={<Blogs />} />
        <Route path="/blogs/:slug" element={<BlogDetails />} />
        <Route path="/faq" element={<Faq />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/category/:slug" element={<CategoryPage />} />
        <Route path="/guide-submit-business" element={<GuideSubmitBusiness />} />
        <Route path="/contact-us" element={<ContactUs />} />
        <Route path="/nearby-services" element={<NearbyServices />} />

        <Route
          path="/admin/categories"
          element={
            <AdminRoute>
              <AdminCategoriesManager />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/businesses/edit/:id"
          element={
            <AdminRoute>
              <AdminEditBusiness />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/seo"
          element={
            <AdminRoute>
              <AdminSeoManager />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/blogs/edit/:id"
          element={
            <AdminRoute>
              <AdminBlogEdit />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/blogs/create"
          element={
            <AdminRoute>
              <AdminBlogCreate />
            </AdminRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />
      </Routes>

      <ScrollToTopButton />
    </>
  )
}

export default App