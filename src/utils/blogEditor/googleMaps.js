const GOOGLE_HOSTS = [
  'google.com',
  'www.google.com',
  'maps.google.com',
]

function isAllowedGoogleHost(hostname) {
  return GOOGLE_HOSTS.some(
    (host) => hostname === host || hostname.endsWith(`.${host}`)
  )
}

function normalizeIframeSrc(iframeCode) {
  const srcMatch = iframeCode.match(/src="([^"]+)"/i)
  if (!srcMatch?.[1]) {
    throw new Error('iframe معتبر نیست')
  }

  const src = srcMatch[1]
  const url = new URL(src)

  if (!isAllowedGoogleHost(url.hostname) || !url.pathname.includes('/maps')) {
    throw new Error('فقط iframe مربوط به Google Maps مجاز است')
  }

  return src
}

function tryExtractCoordsFromUrl(input) {
  const match = input.match(/@(-?\d+(\.\d+)?),(-?\d+(\.\d+)?)/)
  if (!match) return null

  return {
    lat: match[1],
    lng: match[3],
  }
}

function tryExtractPlaceFromUrl(input) {
  try {
    const url = new URL(input)

    if (!isAllowedGoogleHost(url.hostname)) return null

    const q = url.searchParams.get('q') || url.searchParams.get('query')
    if (q) return q

    const coords = tryExtractCoordsFromUrl(input)
    if (coords) return `${coords.lat},${coords.lng}`

    const placeMatch = decodeURIComponent(url.pathname).match(/\/place\/([^/]+)/)
    if (placeMatch?.[1]) {
      return placeMatch[1].replace(/\+/g, ' ')
    }

    return null
  } catch {
    return null
  }
}

export function buildGoogleMapEmbedSrc({
  googleMapsUrl = '',
  iframeCode = '',
  latitude = '',
  longitude = '',
}) {
  const lat = String(latitude || '').trim()
  const lng = String(longitude || '').trim()
  const urlInput = String(googleMapsUrl || '').trim()
  const iframeInput = String(iframeCode || '').trim()

  if (iframeInput) {
    return normalizeIframeSrc(iframeInput)
  }

  if (lat && lng) {
    return `https://www.google.com/maps?q=${encodeURIComponent(
      `${lat},${lng}`
    )}&z=15&output=embed`
  }

  if (urlInput) {
    if (urlInput.includes('<iframe')) {
      return normalizeIframeSrc(urlInput)
    }

    let parsed
    try {
      parsed = new URL(urlInput)
    } catch {
      throw new Error('لینک گوگل مپ معتبر نیست')
    }

    if (!isAllowedGoogleHost(parsed.hostname)) {
      throw new Error('فقط لینک Google Maps مجاز است')
    }

    if (parsed.pathname.includes('/maps/embed')) {
      return urlInput
    }

    const query = tryExtractPlaceFromUrl(urlInput)
    if (!query) {
      throw new Error('از لینک embed یا مختصات استفاده کن')
    }

    return `https://www.google.com/maps?q=${encodeURIComponent(
      query
    )}&output=embed`
  }

  throw new Error('یکی از روش‌های درج نقشه را وارد کن')
}