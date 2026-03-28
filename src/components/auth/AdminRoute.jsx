import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { getCurrentAdmin } from '../../services/supabase/auth.api'

function AdminRoute({ children }) {
  const [loading, setLoading] = useState(true)
  const [admin, setAdmin] = useState(null)

  useEffect(() => {
    async function checkAdmin() {
      try {
        const user = await getCurrentAdmin()
        setAdmin(user)
      } finally {
        setLoading(false)
      }
    }

    checkAdmin()
  }, [])

  if (loading) {
    return <div className="p-6">در حال بررسی دسترسی...</div>
  }

  if (!admin) {
    return <Navigate to="/admin-login" replace />
  }

  return children
}

export default AdminRoute