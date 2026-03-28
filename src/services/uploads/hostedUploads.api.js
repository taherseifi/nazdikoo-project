const UPLOAD_ENDPOINT = import.meta.env.VITE_UPLOAD_API_URL

function ensureUploadEndpoint() {
  if (!UPLOAD_ENDPOINT) {
    throw new Error('VITE_UPLOAD_API_URL در فایل env تنظیم نشده است.')
  }
}

async function parseJsonSafe(response) {
  try {
    return await response.json()
  } catch {
    return null
  }
}

export async function uploadImageToHost(file, type = 'general') {
  ensureUploadEndpoint()

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

  const result = await parseJsonSafe(response)

  if (!response.ok || !result?.url) {
    throw new Error(result?.error || 'آپلود فایل انجام نشد.')
  }

  return result.url
}

export async function uploadManyImagesToHost(files = [], type = 'general') {
  if (!Array.isArray(files) || files.length === 0) {
    throw new Error('فایلی برای آپلود ارسال نشده است.')
  }

  const uploadedUrls = await Promise.all(
    files.map((file) => uploadImageToHost(file, type))
  )

  return uploadedUrls
}

export async function uploadBlogFeaturedImageToHost(file) {
  return uploadImageToHost(file, 'blogs')
}

export async function uploadBlogImageToHost(file) {
  return uploadImageToHost(file, 'blogs')
}

export async function uploadEditorImageToHost(file) {
  return uploadImageToHost(file, 'editor')
}

export async function uploadInlineBlogImageToHost(file) {
  return uploadImageToHost(file, 'editor')
}

export async function uploadInlineBlogImagesToHost(files = []) {
  return uploadManyImagesToHost(files, 'editor')
}

export async function uploadBusinessImageToHost(file) {
  return uploadImageToHost(file, 'businesses')
}

export async function uploadBusinessImagesToHost(files = []) {
  return uploadManyImagesToHost(files, 'businesses')
}

export async function uploadGeneralImageToHost(file) {
  return uploadImageToHost(file, 'general')
}

export async function uploadGeneralImagesToHost(files = []) {
  return uploadManyImagesToHost(files, 'general')
}