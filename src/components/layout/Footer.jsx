import { Link } from 'react-router-dom'
import {
  Mail,
  MapPin,
  Phone,
  Globe,
  Twitter,
  Linkedin,
  Facebook,
  Instagram,
  UtensilsCrossed,
  GraduationCap,
  Wrench,
  Stethoscope,
  Car,
} from 'lucide-react'

const topIcons = [
  { icon: UtensilsCrossed, label: 'رستوران' },
  { icon: GraduationCap, label: 'تحصیل' },
  { icon: Wrench, label: 'آچار' },
  { icon: Stethoscope, label: 'پزشکی' },
  { icon: Car, label: 'خودرو' },
]

const handleScrollTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  })
}

function Footer() {
  return (
    <footer className="mt-20">
      <section className="border-t border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 py-10 sm:grid-cols-3 md:grid-cols-5 md:px-6">
          {topIcons.map((item) => {
            const Icon = item.icon

            return (
              <div
                key={item.label}
                className="flex items-center justify-center"
                aria-label={item.label}
                title={item.label}
              >
                <Icon className="h-10 w-10 text-blue-600 md:h-16 md:w-16" />
              </div>
            )
          })}
        </div>
      </section>

      <section className="bg-slate-100">
        <div className="mx-auto max-w-7xl px-4 py-14 md:px-6">
          <div className="grid grid-cols-1 items-start justify-items-center gap-10 text-center md:grid-cols-4 md:text-right">
            <div className="justify-self-center">
              <img
                src="/footer.png"
                alt="Nazdikoo"
                className="h-40 w-auto object-contain"
              />
            </div>

            <div className="justify-self-center">
              <h3 className="mb-5 text-lg font-bold text-slate-800">
                اطلاعات تماس
              </h3>

              <ul className="space-y-4 text-slate-600">
                <li className="flex items-start justify-center gap-3 md:justify-start">
                  <MapPin className="mt-1 h-5 w-5 shrink-0 text-slate-500" />
                  <span>استانبول، ترکیه</span>
                </li>

                <li className="flex items-center justify-center gap-3 md:justify-start">
                  <Phone className="h-5 w-5 shrink-0 text-slate-500" />
                  <span>05538659104</span>
                </li>

                <li className="flex items-center justify-center gap-3 md:justify-start">
                  <Mail className="h-5 w-5 shrink-0 text-slate-500" />
                  <span>info@nazdikoo.com</span>
                </li>

                <li className="flex items-center justify-center gap-3 md:justify-start">
                  <Globe className="h-5 w-5 shrink-0 text-slate-500" />
                  <span>www.nazdikoo.com</span>
                </li>
              </ul>
            </div>

            <div className="justify-self-center">
              <h3 className="mb-5 text-lg font-bold text-slate-800">
                لینک‌های کاربردی
              </h3>

              <ul className="space-y-3 text-slate-600">
                <li>
                  <Link
                    to="/faq"
                    onClick={handleScrollTop}
                    className="transition hover:text-blue-600"
                  >
                    سوالات متداول
                  </Link>
                </li>
                <li>
                  <Link
                    to="/privacy-policy"
                    onClick={handleScrollTop}
                    className="transition hover:text-blue-600"
                  >
                    حریم خصوصی
                  </Link>
                </li>
                <li>
                  <Link
                    to="/guide-submit-business"
                    onClick={handleScrollTop}
                    className="transition hover:text-blue-600"
                  >
                    راهنمای ثبت خدمات
                  </Link>
                </li>
                <li>
                  <Link
                    to="/listings"
                    onClick={handleScrollTop}
                    className="transition hover:text-blue-600"
                  >
                    مشاهده همه خدمات
                  </Link>
                </li>
              </ul>
            </div>

            <div className="justify-self-center">
              <h3 className="mb-5 text-lg font-bold text-slate-800">
                لینک‌های سریع
              </h3>

              <ul className="space-y-3 text-slate-600">
                <li>
                  <Link
                    to="/"
                    onClick={handleScrollTop}
                    className="transition hover:text-blue-600"
                  >
                    خانه
                  </Link>
                </li>
                <li>
                  <Link
                    to="/listings"
                    onClick={handleScrollTop}
                    className="transition hover:text-blue-600"
                  >
                    خدمات
                  </Link>
                </li>
                <li>
                  <Link
                    to="/submit-business"
                    onClick={handleScrollTop}
                    className="transition hover:text-blue-600"
                  >
                    افزودن خدمات
                  </Link>
                </li>
                <li>
                  <Link
                    to="/contact-us"
                    onClick={handleScrollTop}
                    className="transition hover:text-blue-600"
                  >
                    تماس با ما
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-slate-200 bg-slate-100">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-6 md:flex-row md:px-6">
          <p className="text-sm text-slate-500">
            Copyright © Nazdikoo 2026. All rights reserved.
          </p>

          <div className="flex items-center gap-4 text-slate-500">
            <a
              href="#"
              aria-label="Twitter"
              className="transition hover:text-blue-600"
            >
              <Twitter className="h-5 w-5" />
            </a>
            <a
              href="#"
              aria-label="Linkedin"
              className="transition hover:text-blue-600"
            >
              <Linkedin className="h-5 w-5" />
            </a>
            <a
              href="#"
              aria-label="Facebook"
              className="transition hover:text-blue-600"
            >
              <Facebook className="h-5 w-5" />
            </a>
            <a
              href="#"
              aria-label="Instagram"
              className="transition hover:text-blue-600"
            >
              <Instagram className="h-5 w-5" />
            </a>
          </div>
        </div>
      </section>
    </footer>
  )
}

export default Footer