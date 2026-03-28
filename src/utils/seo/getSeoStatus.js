export function getSeoStatus(seoEntry) {
  if (!seoEntry) {
    return {
      label: 'بدون تنظیمات',
      tone: 'gray',
    }
  }

  const hasTitle = Boolean(seoEntry.meta_title?.trim())
  const hasDescription = Boolean(seoEntry.meta_description?.trim())

  if (hasTitle && hasDescription) {
    return {
      label: 'SEO تنظیم شده',
      tone: 'green',
    }
  }

  return {
    label: 'SEO ناقص',
    tone: 'yellow',
  }
}