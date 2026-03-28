import {
  uploadBusinessImageToHost,
  uploadBusinessImagesToHost,
} from '../uploads/hostedUploads.api'

export async function uploadBusinessImage(file) {
  return uploadBusinessImageToHost(file)
}

export async function uploadBusinessImages(files = []) {
  return uploadBusinessImagesToHost(files)
}

export async function uploadBusinessCoverImage(file) {
  return uploadBusinessImageToHost(file)
}

export async function uploadBusinessGalleryImage(file) {
  return uploadBusinessImageToHost(file)
}