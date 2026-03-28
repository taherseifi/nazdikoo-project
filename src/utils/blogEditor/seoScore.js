function stripHtml(html = '') {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
}

function countWords(text = '') {
  if (!text.trim()) return 0
  return text.trim().split(/\s+/).length
}

function includesKeyword(text = '', keyword = '') {
  if (!keyword.trim()) return false
  return text.toLowerCase().includes(keyword.toLowerCase())
}

export function calculateSeoScore({
  title = '',
  slug = '',
  excerpt = '',
  metaTitle = '',
  metaDescription = '',
  focusKeyword = '',
  contentHtml = '',
}) {
  const contentText = stripHtml(contentHtml)
  const wordCount = countWords(contentText)

  const checks = [
    {
      key: 'titleLength',
      label: 'طول عنوان مناسب است',
      passed: title.trim().length >= 20 && title.trim().length <= 70,
      points: 12,
    },
    {
      key: 'metaTitle',
      label: 'Meta title تنظیم شده',
      passed: metaTitle.trim().length >= 20 && metaTitle.trim().length <= 70,
      points: 12,
    },
    {
      key: 'metaDescription',
      label: 'Meta description مناسب است',
      passed:
        metaDescription.trim().length >= 120 &&
        metaDescription.trim().length <= 170,
      points: 14,
    },
    {
      key: 'slug',
      label: 'Slug تنظیم شده',
      passed: slug.trim().length > 0,
      points: 8,
    },
    {
      key: 'keywordInTitle',
      label: 'کلمه کلیدی در عنوان هست',
      passed: includesKeyword(title, focusKeyword),
      points: 12,
    },
    {
      key: 'keywordInMeta',
      label: 'کلمه کلیدی در meta description هست',
      passed: includesKeyword(metaDescription, focusKeyword),
      points: 10,
    },
    {
      key: 'keywordInExcerpt',
      label: 'کلمه کلیدی در خلاصه هست',
      passed: includesKeyword(excerpt, focusKeyword),
      points: 8,
    },
    {
      key: 'keywordInContent',
      label: 'کلمه کلیدی در متن مقاله هست',
      passed: includesKeyword(contentText, focusKeyword),
      points: 12,
    },
    {
      key: 'contentLength',
      label: 'طول مقاله مناسب است',
      passed: wordCount >= 300,
      points: 12,
    },
  ]

  const score = checks.reduce(
    (sum, item) => sum + (item.passed ? item.points : 0),
    0
  )

  let level = 'ضعیف'
  if (score >= 80) level = 'عالی'
  else if (score >= 60) level = 'خوب'
  else if (score >= 40) level = 'متوسط'

  return {
    score,
    level,
    checks,
    wordCount,
  }
}