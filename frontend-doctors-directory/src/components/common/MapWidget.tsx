import { useEffect, useRef, useState } from 'react'
import { importLibrary, setOptions } from '@googlemaps/js-api-loader'
import { env } from '@/lib/env'
import { useTranslation } from 'react-i18next'

export interface Marker {
  lat: number
  lng: number
  title?: string
}

interface MapWidgetProps {
  markers: Marker[]
  zoom?: number
  className?: string
  fitToMarkers?: boolean
}

export const MapWidget = ({ markers, zoom = 12, className, fitToMarkers = false }: MapWidgetProps) => {
  const mapRef = useRef<HTMLDivElement | null>(null)
  const loaderConfigured = useRef(false)
  const [hasError, setHasError] = useState(false)
  const { t } = useTranslation()

  useEffect(() => {
    if (!env.mapsKey || !mapRef.current) {
      setHasError(true)
      return
    }
    let isMounted = true

    const initMap = async () => {
      try {
        if (!loaderConfigured.current) {
          setOptions({
            key: env.mapsKey,
          })
          loaderConfigured.current = true
        }

        const [{ Map }, { AdvancedMarkerElement }, { LatLngBounds }] = await Promise.all([
          importLibrary('maps') as Promise<{ Map: typeof google.maps.Map }>,
          importLibrary('marker') as Promise<{ AdvancedMarkerElement: typeof google.maps.marker.AdvancedMarkerElement }>,
          importLibrary('core') as Promise<{ LatLngBounds: typeof google.maps.LatLngBounds }>,
        ])

        if (!isMounted || !mapRef.current) return

        const center = markers[0] ?? { lat: 24.7136, lng: 46.6753 }
        const map = new Map(mapRef.current, {
          center,
          zoom,
          disableDefaultUI: true,
          mapId: env.mapsMapId || undefined,
        })

        markers.forEach((marker) => {
          new AdvancedMarkerElement({
            position: { lat: marker.lat, lng: marker.lng },
            map,
            title: marker.title,
          })
        })

        if (fitToMarkers && markers.length > 1) {
          const bounds = new LatLngBounds()
          markers.forEach((marker) => bounds.extend({ lat: marker.lat, lng: marker.lng }))
          map.fitBounds(bounds, 48)
        }
      } catch (error) {
        console.error('تعذّر تحميل خريطة Google', error)
        if (isMounted) {
          setHasError(true)
        }
      }
    }

    initMap()

    return () => {
      isMounted = false
    }
  }, [markers, zoom, fitToMarkers])

  if (!env.mapsKey || hasError) {
    const baseFallback =
      'flex items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white px-4 text-center text-sm text-slate-500'
    const fallbackClassName = className ? `${className} ${baseFallback}` : `${baseFallback} h-72 w-full`
    return <div className={fallbackClassName}>{env.mapsKey ? t('mapWidget.error') : t('mapWidget.missingKey')}</div>
  }

  return <div ref={mapRef} className={className ?? 'h-72 w-full rounded-3xl border border-slate-100'} />
}
