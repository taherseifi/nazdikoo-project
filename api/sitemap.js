const SITE_URL = (process.env.SITE_URL || 'https://nazdikoo-project.vercel.app').replace(/\/$/, '')
const SUPABASE_URL = (process.env.SUPABASE_URL || '').replace(/\/$/, '')
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || ''

function escapeXml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function normalizeDate(value) {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return date.toISOString()
}

function buildUrl(loc, options = {}) {
  const lastmod = normalizeDate(options.lastmod)
  const changefreq = options.changefreq || 'weekly'
  const priority = typeof options.priority === 'number' ? options.priority.toFixed(1) : '0.7'

  return `
  <url>
    <loc>${escapeXml(loc)}</loc>
    ${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`
}

async function fetchSupabase(path) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      Accept: 'application/json',
    },
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Supabase error: ${response.status} - ${text}`)
  }

  return response.json()
}

export default async function handler(req, res) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return res.status(500).send('Missing SUPABASE_URL or SUPABASE_ANON_KEY')
  }

  try {
    const [
      businesses,
      blogs,
      categories,
      subcategories,
    ] = await Promise.all([
      fetchSupabase(
        'businesses?select=slug,updated_at,is_approved&slug=not.is.null&is_approved=eq.true'
      ),
      fetchSupabase(
        'blogs?select=slug,updated_at,is_published&slug=not.is.null&is_published=eq.true'
      ),
      fetchSupabase(
        'categories?select=slug,created_at&slug=not.is.null'
      ),
      fetchSupabase(
        'subcategories?select=slug,created_at&slug=not.is.null'
      ),
    ])

    const urls = []

    // صفحات ثابت
    const staticPages = [
      { path: '/', priority: 1.0, changefreq: 'daily' },
      { path: '/about', priority: 0.7, changefreq: 'monthly' },
      { path: '/blogs', priority: 0.8, changefreq: 'weekly' },
      { path: '/faq', priority: 0.6, changefreq: 'monthly' },
      { path: '/contact-us', priority: 0.6, changefreq: 'monthly' },
      { path: '/listings', priority: 0.8, changefreq: 'weekly' },
      { path: '/submit-business', priority: 0.6, changefreq: 'monthly' },
      { path: '/guide-submit-business', priority: 0.5, changefreq: 'monthly' },
      { path: '/nearby-services', priority: 0.6, changefreq: 'weekly' },
      { path: '/privacy-policy', priority: 0.3, changefreq: 'yearly' },
    ]

    for (const page of staticPages) {
      urls.push(
        buildUrl(`${SITE_URL}${page.path}`, {
          priority: page.priority,
          changefreq: page.changefreq,
        })
      )
    }

    // دسته‌بندی‌ها
    for (const item of categories) {
      urls.push(
        buildUrl(`${SITE_URL}/category/${item.slug}`, {
          lastmod: item.created_at,
          priority: 0.8,
          changefreq: 'weekly',
        })
      )
    }

    // زیردسته‌ها
    for (const item of subcategories) {
      urls.push(
        buildUrl(`${SITE_URL}/subcategory/${item.slug}`, {
          lastmod: item.created_at,
          priority: 0.7,
          changefreq: 'weekly',
        })
      )
    }

    // خدمات / کسب‌وکارها
  
    for (const item of businesses) {
      urls.push(
        buildUrl(`${SITE_URL}/business/${item.slug}`, {
          lastmod: item.updated_at,
          priority: 0.8,
          changefreq: 'weekly',
        })
      )
    }

    // بلاگ‌ها

    for (const item of blogs) {
      urls.push(
        buildUrl(`${SITE_URL}/blogs/${item.slug}`, {
          lastmod: item.updated_at,
          priority: 0.7,
          changefreq: 'monthly',
        })
      )
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
>
  ${urls.join('\n')}
</urlset>`

    res.setHeader('Content-Type', 'application/xml; charset=utf-8')
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400')
    return res.status(200).send(xml)
  } catch (error) {
    console.error('Sitemap generation failed:', error)
    return res.status(500).send('Failed to generate sitemap')
  }
}