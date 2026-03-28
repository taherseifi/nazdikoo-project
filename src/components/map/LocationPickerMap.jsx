import { useEffect } from 'react'
import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
} from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

delete L.Icon.Default.prototype._getIconUrl

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

function ChangeView({ center, zoom = 15 }) {
  const map = useMap()

  useEffect(() => {
    if (center?.lat && center?.lng) {
      map.flyTo([center.lat, center.lng], zoom, {
        animate: true,
        duration: 1.2,
      })
    }
  }, [center, zoom, map])

  return null
}

function ResizeMap() {
  const map = useMap()

  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize()
    }, 200)

    return () => clearTimeout(timer)
  }, [map])

  return null
}

function ClickHandler({ onChange }) {
  useMapEvents({
    click(event) {
      onChange({
        lat: event.latlng.lat,
        lng: event.latlng.lng,
      })
    },
  })

  return null
}

function LocationPickerMap({
  value,
  onChange,
  height = '500px',
  defaultCenter = { lat: 41.0082, lng: 28.9784 },
}) {
  const hasValue = Boolean(value?.lat && value?.lng)

  const center = hasValue
    ? [value.lat, value.lng]
    : [defaultCenter.lat, defaultCenter.lng]

  return (
    <div
      className="w-full overflow-hidden rounded-2xl"
      style={{ height, minHeight: height }}
    >
      <MapContainer
        center={center}
        zoom={hasValue ? 15 : 11}
        scrollWheelZoom={true}
        className="h-full w-full"
        style={{ height: '100%', width: '100%' }}
      >
        <ResizeMap />

        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <ClickHandler onChange={onChange} />

        {hasValue && (
          <>
            <Marker position={[value.lat, value.lng]} />
            <ChangeView center={value} zoom={15} />
          </>
        )}
      </MapContainer>
    </div>
  )
}

export default LocationPickerMap