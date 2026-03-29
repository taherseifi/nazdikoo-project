const SITE_URL = import.meta.env.VITE_SITE_URL || 'https://nazdikoo-project.vercel.app'

function cleanValue(value) {
  return value ?? undefined
}

function absoluteUrl(path = '') {
  if (!path) return undefined
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`
}

export function buildBreadcrumbSchema(items = []) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.url),
    })),
  }
}

export function buildBusinessSchema(business) {
  if (!business) return null

  const businessUrl = absoluteUrl(`/business/${business.slug}`)

  const baseSchema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: cleanValue(business.title),
    description: cleanValue(business.description),
    url: businessUrl,
    image: cleanValue(
      Array.isArray(business.gallery) && business.gallery.length
        ? business.gallery.map((img) => absoluteUrl(img))
        : business.cover_image || business.image_url
          ? [absoluteUrl(business.cover_image || business.image_url)]
          : undefined
    ),
    telephone: cleanValue(business.phone),
    email: cleanValue(business.email),
    sameAs: business.website ? [business.website] : undefined,
    address: business.address
      ? {
          '@type': 'PostalAddress',
          streetAddress: cleanValue(business.address),
          addressLocality: cleanValue(business.city),
          addressRegion: cleanValue(business.region),
          addressCountry: cleanValue(business.country),
        }
      : undefined,
    geo:
      business.latitude && business.longitude
        ? {
            '@type': 'GeoCoordinates',
            latitude: Number(business.latitude),
            longitude: Number(business.longitude),
          }
        : undefined,
    areaServed: cleanValue(business.city || business.region || business.country),
    aggregateRating:
      business.rating_avg && business.reviews_count
        ? {
            '@type': 'AggregateRating',
            ratingValue: Number(business.rating_avg),
            reviewCount: Number(business.reviews_count),
            bestRating: 5,
            worstRating: 1,
          }
        : undefined,
  }

  return JSON.parse(JSON.stringify(baseSchema))
}

export function buildReviewsSchema(reviews = []) {
  if (!Array.isArray(reviews) || !reviews.length) return null

  return reviews
    .filter((review) => review?.reviewer_name && review?.rating)
    .slice(0, 5)
    .map((review) => ({
      '@context': 'https://schema.org',
      '@type': 'Review',
      author: {
        '@type': 'Person',
        name: review.reviewer_name,
      },
      reviewRating: {
        '@type': 'Rating',
        ratingValue: Number(review.rating),
        bestRating: 5,
        worstRating: 1,
      },
      reviewBody: review.comment || undefined,
      datePublished: review.created_at || undefined,
    }))
}

export function buildFaqSchema(faqs = []) {
  if (!Array.isArray(faqs) || !faqs.length) return null

  const mainEntity = faqs
    .filter((item) => item?.question && item?.answer)
    .map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    }))

  if (!mainEntity.length) return null

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity,
  }
}

export function buildBlogSchema(blog) {
  if (!blog) return null

  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: cleanValue(blog.meta_title || blog.title),
    description: cleanValue(blog.meta_description || blog.excerpt),
    articleBody: cleanValue(blog.content),
    datePublished: cleanValue(blog.created_at),
    dateModified: cleanValue(blog.updated_at || blog.created_at),
    author: {
      '@type': 'Person',
      name: cleanValue(blog.author_name || 'Admin'),
    },
    image: cleanValue(
      blog.thumbnail_url
        ? [absoluteUrl(blog.thumbnail_url)]
        : Array.isArray(blog.gallery) && blog.gallery.length
          ? blog.gallery.map((img) => absoluteUrl(img))
          : undefined
    ),
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': absoluteUrl(`/blogs/${blog.slug}`),
    },
    publisher: {
      '@type': 'Organization',
      name: 'Nazdikoo',
      url: SITE_URL,
    },
  }
}