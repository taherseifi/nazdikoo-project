const UPLOAD_ENDPOINT = import.meta.env.VITE_UPLOAD_API_URL

async function uploadImageToHost(file, type = 'general') {
  if (!file) {
    throw new Error('فایلی انتخاب نشده است.')
  }

  const formData = new FormData()
  formData.append('file', file)
  formData.append('type', type)

  const response = await fetch(UPLOAD_ENDPOINT, {
    method: 'POST',
    body: formData,
  })

  let result = null

  try {
    result = await response.json()
  } catch {
    throw new Error('پاسخ سرور معتبر نیست.')
  }

  if (!response.ok || !result?.url) {
    throw new Error(result?.error || 'آپلود فایل انجام نشد.')
  }

  return result.url
}

export async function uploadBlogFeaturedImage(file) {
  return uploadImageToHost(file, 'blogs')
}

export async function uploadEditorImage(file) {
  return uploadImageToHost(file, 'editor')
}

export async function uploadInlineBlogImage(file) {
  return uploadImageToHost(file, 'editor')
}

export async function uploadInlineBlogImages(files = []) {
  if (!Array.isArray(files) || files.length === 0) {
    throw new Error('فایلی برای آپلود ارسال نشده است.')
  }

  const uploadedUrls = await Promise.all(
    files.map((file) => uploadImageToHost(file, 'editor'))
  )

  return uploadedUrls
}