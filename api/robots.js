const SITE_URL = (process.env.SITE_URL || 'https://nazdikoo-project.vercel.app').replace(/\/$/, '')

export default function handler(req, res) {
  const robots = `User-agent: *
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml
Host: ${SITE_URL}
`

  res.setHeader('Content-Type', 'text/plain; charset=utf-8')
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400')
  return res.status(200).send(robots)
}