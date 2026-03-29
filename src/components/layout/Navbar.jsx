import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'

function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolledPastHero, setScrolledPastHero] = useState(false)
  const location = useLocation()

  const isHomePage = location.pathname === '/'

  useEffect(() => {
    function handleScroll() {
      if (!isHomePage) {
        setScrolledPastHero(true)
        return
      }

      const heroHeight = window.innerHeight * 0.7
      setScrolledPastHero(window.scrollY > heroHeight)
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [isHomePage])

  const isSolidNavbar = !isHomePage || scrolledPastHero

  const navLinkClass = ({ isActive }) =>
    `transition ${
      isActive
        ? isSolidNavbar
          ? 'font-semibold text-blue-600'
          : 'font-semibold text-blue-300'
        : isSolidNavbar
          ? 'text-gray-700 hover:text-blue-600'
          : 'text-white hover:text-blue-300'
    }`

  const mobileNavLinkClass = ({ isActive }) =>
    `block rounded-xl px-4 py-3 transition ${
      isActive
        ? 'bg-gray-900 text-white'
        : 'text-gray-700 hover:bg-gray-100'
    }`

  return (
<header
  className={`fixed inset-x-0 z-50 transition-all duration-300 ${
    isSolidNavbar ? 'top-0' : 'top-5'
  } ${
    isSolidNavbar
      ? 'border-b border-gray-200 bg-white/95 shadow-sm backdrop-blur-md'
      : 'bg-transparent'
  }`}
>
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div  className={`flex h-20 items-center justify-between rounded-2xl px-4 md:px-6 transition ${
        !isSolidNavbar
          ? 'bg-white/10 backdrop-blur-md border border-white/20'
          : ''
      }`}>
          <Link
            to="/"
            className={`text-2xl font-bold transition ${
              isSolidNavbar ? 'text-gray-900' : 'text-white'
            }`}
          >
            <img
    src="/logo.png"
    alt="Nazdikoo"
     className="h-7 w-auto sm:h-8 md:h-11 lg:h-13 transition-all duration-300"
  />
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            <NavLink to="/" className={navLinkClass}>
              خانه
            </NavLink>

            <NavLink to="/listings" className={navLinkClass}>
              خدمات
            </NavLink>

           
            <NavLink
            to="/blogs" className={navLinkClass}>
            بلاگ
          </NavLink>
          
          <NavLink to="/faq" className={navLinkClass}>سوالات متداول</NavLink>
          <NavLink to="/guide-submit-business" className={navLinkClass}>راهنمای ثبت</NavLink>
           <NavLink to="/about" className={navLinkClass}>
              درباره ما
            </NavLink>
          <NavLink to="/contact-us" className={navLinkClass}>تماس با ما</NavLink>
          
         
          </nav>

          <div className="hidden md:block">
            <Link
              to="/submit-business"
              className={`rounded-xl px-5 py-3 text-sm font-medium transition ${
                isSolidNavbar
                  ? 'border border-gray-300 text-gray-900 hover:bg-gray-900 hover:text-white'
                  : 'border border-white/40 text-white hover:bg-white hover:text-gray-900'
              }`}
            >
              افزودن خدمات
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            className={`inline-flex h-11 w-11 items-center justify-center rounded-xl border md:hidden ${
              isSolidNavbar
                ? 'border-gray-300 text-gray-900'
                : 'border-white/30 text-white'
            }`}
            aria-label="menu"
          >
            <span className="relative block h-5 w-5">
              <span
                className={`absolute left-0 top-1 block h-0.5 w-5 transition ${
                  isSolidNavbar ? 'bg-gray-900' : 'bg-white'
                } ${mobileOpen ? 'translate-y-2 rotate-45' : ''}`}
              />
              <span
                className={`absolute left-0 top-2.5 block h-0.5 w-5 transition ${
                  isSolidNavbar ? 'bg-gray-900' : 'bg-white'
                } ${mobileOpen ? 'opacity-0' : ''}`}
              />
              <span
                className={`absolute left-0 top-4 block h-0.5 w-5 transition ${
                  isSolidNavbar ? 'bg-gray-900' : 'bg-white'
                } ${mobileOpen ? '-translate-y-2 -rotate-45' : ''}`}
              />
            </span>
          </button>
        </div>

       {mobileOpen && (
  <div className="pb-4 md:hidden">
    <div className="rounded-2xl bg-white p-3 shadow-xl">
      
      {/* لینک‌ها */}
      <nav className="space-y-2">

        <NavLink
          to="/"
          className={mobileNavLinkClass}
          onClick={() => setMobileOpen(false)}
        >
          خانه
        </NavLink>

        <NavLink
          to="/listings"
          className={mobileNavLinkClass}
          onClick={() => setMobileOpen(false)}
        >
          خدمات
        </NavLink>

      
        <NavLink
          to="/blogs"
          className={mobileNavLinkClass}
          onClick={() => setMobileOpen(false)}
        >
          بلاگ
        </NavLink>

        {/* Divider */}
        <div className="my-2 border-t border-gray-200" />

        <NavLink
          to="/faq"
          className={mobileNavLinkClass}
          onClick={() => setMobileOpen(false)}
        >
          سوالات متداول
        </NavLink>

        <NavLink
          to="/guide-submit-business"
          className={mobileNavLinkClass}
          onClick={() => setMobileOpen(false)}
        >
          راهنمای ثبت
        </NavLink>
        <NavLink to="/nearby-services" className={navLinkClass}>
          خدمات نزدیک شما
        </NavLink>
        
          <NavLink
          to="/about"
          className={mobileNavLinkClass}
          onClick={() => setMobileOpen(false)}
        >
          درباره ما
        </NavLink>

        <NavLink
          to="/contact-us"
          className={mobileNavLinkClass}
          onClick={() => setMobileOpen(false)}
        >
          تماس با ما
        </NavLink>
        
      </nav>

      {/* CTA دکمه اصلی */}
      <div className="mt-3">
        <Link
          to="/submit-business"
          onClick={() => setMobileOpen(false)}
          className="block w-full rounded-xl bg-blue-600 py-3 text-center text-white font-medium shadow-md hover:bg-blue-700 transition"
        >
          افزودن خدمات
        </Link>
      </div>

    </div>
  </div>
)}
      </div>
    </header>
  )
}

export default Navbar