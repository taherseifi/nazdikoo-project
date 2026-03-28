import {
  uploadBlogFeaturedImageToHost,
  uploadBlogImageToHost,
  uploadInlineBlogImageToHost,
  uploadInlineBlogImagesToHost,
} from '../uploads/hostedUploads.api'

export async function uploadBlogImage(file) {
  return uploadBlogImageToHost(file)
}

export async function uploadBlogFeaturedImage(file) {
  return uploadBlogFeaturedImageToHost(file)
}

export async function uploadInlineBlogImage(file) {
  return uploadInlineBlogImageToHost(file)
}

export async function uploadInlineBlogImages(files = []) {
  return uploadInlineBlogImagesToHost(files)
}