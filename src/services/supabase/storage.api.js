import {
  uploadGeneralImageToHost,
  uploadGeneralImagesToHost,
  uploadBlogFeaturedImageToHost,
  uploadEditorImageToHost,
  uploadBusinessImageToHost,
  uploadBusinessImagesToHost,
} from '../uploads/hostedUploads.api'

const UPLOAD_API_URL = 'https://nazdikoo.com/api/upload.php'

export async function uploadFile(file, type = 'general') {
  if (type === 'blogs') {
    return uploadBlogFeaturedImageToHost(file)
  }

  if (type === 'editor') {
    return uploadEditorImageToHost(file)
  }

  if (type === 'businesses') {
    return uploadBusinessImageToHost(file)
  }

  return uploadGeneralImageToHost(file)
}

export async function uploadFiles(files = [], type = 'general') {
  if (!Array.isArray(files) || files.length === 0) {
    throw new Error('فایلی برای آپلود ارسال نشده است.')
  }

  if (type === 'blogs') {
    return Promise.all(files.map((file) => uploadBlogFeaturedImageToHost(file)))
  }

  if (type === 'editor') {
    return Promise.all(files.map((file) => uploadEditorImageToHost(file)))
  }

  if (type === 'businesses') {
    return uploadBusinessImagesToHost(files)
  }

  return uploadGeneralImagesToHost(files)
}

export async function uploadBusinessImage(file, title, options = {}) {
  if (!file) {
    throw new Error('فایلی برای آپلود انتخاب نشده است.')
  }

  const formData = new FormData()
  formData.append('file', file)
  formData.append('type', 'businesses')
  formData.append('title', title || 'business-image')
  formData.append('image_type', options.imageType || 'image')

  if (options.oldUrl) {
    formData.append('old_url', options.oldUrl)
  }

  const response = await fetch(UPLOAD_API_URL, {
    method: 'POST',
    body: formData,
  })

  let data = null

  try {
    data = await response.json()
  } catch {
    throw new Error('پاسخ سرور معتبر نیست.')
  }

  if (!response.ok || !data?.success) {
    throw new Error(data?.error || 'آپلود عکس انجام نشد')
  }

  return data.url
}

export async function uploadBusinessImages(files = [], title) {
  if (!Array.isArray(files) || files.length === 0) {
    throw new Error('فایلی برای آپلود گالری ارسال نشده است.')
  }

  const uploadedUrls = []

  for (let index = 0; index < files.length; index += 1) {
    const file = files[index]

    const url = await uploadBusinessImage(file, title, {
      imageType: `gallery-${index + 1}`,
    })

    uploadedUrls.push(url)
  }

  return uploadedUrls
}

export async function uploadBlogImage(file) {
  return uploadBlogFeaturedImageToHost(file)
}

export async function uploadEditorImage(file) {
  return uploadEditorImageToHost(file)
}

export async function uploadGeneralImage(file) {
  return uploadGeneralImageToHost(file)
}

export async function deleteFileFromServer(url) {
  if (!url) {
    throw new Error('آدرس فایل برای حذف ارسال نشده است.')
  }

  const formData = new FormData()
  formData.append('action', 'delete')
  formData.append('url', url)

  const response = await fetch(UPLOAD_API_URL, {
    method: 'POST',
    body: formData,
  })

  let data = null

  try {
    data = await response.json()
  } catch {
    throw new Error('پاسخ سرور معتبر نیست.')
  }

  if (!response.ok || !data?.success) {
    throw new Error(data?.error || 'حذف فایل انجام نشد')
  }

  return true
}