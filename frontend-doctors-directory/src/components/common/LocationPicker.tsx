import { useEffect, useRef, useState } from 'react'
import { importLibrary, setOptions } from '@googlemaps/js-api-loader'
import { env } from '@/lib/env'
import clsx from 'clsx'
import { useTranslation } from 'react-i18next'

interface LocationValue {
  lat?: number
  lng?: number
  address?: string
  city?: string
}

interface LocationPickerProps {
  value?: LocationValue
  onChange: (value: LocationValue) => void
}

const defaultCenter = { lat: 24.7136, lng: 46.6753 }

export const LocationPicker = ({ value, onChange }: LocationPickerProps) => {
  const mapRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const mapInstance = useRef<google.maps.Map | null>(null)
  const markerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(null)
  const loaderConfigured = useRef(false)
  const { t } = useTranslation()
  const [mapUnavailable, setMapUnavailable] = useState(!env.mapsKey)

  useEffect(() => {
    if (!env.mapsKey || !mapRef.current) {
      setMapUnavailable(true)
      return
    }
    let listeners: google.maps.MapsEventListener[] = []
    let autocompleteListener: google.maps.MapsEventListener | null = null
    let isMounted = true

    const init = async () => {
      try {
        if (!loaderConfigured.current) {
          setOptions({ key: env.mapsKey, libraries: ['places'] })
          loaderConfigured.current = true
        }

        const [{ Map }, { AdvancedMarkerElement }, { Autocomplete }] = await Promise.all([
          importLibrary('maps') as Promise<{ Map: typeof google.maps.Map }>,
          importLibrary('marker') as Promise<{ AdvancedMarkerElement: typeof google.maps.marker.AdvancedMarkerElement }>,
          importLibrary('places') as Promise<{ Autocomplete: typeof google.maps.places.Autocomplete }>,
        ])

        if (!isMounted || !mapRef.current) return

        const center =
          value?.lat && value?.lng
            ? { lat: value.lat, lng: value.lng }
            : defaultCenter

        const map = new Map(mapRef.current, {
          center,
          zoom: value?.lat ? 14 : 6,
          mapId: env.mapsMapId || undefined,
          disableDefaultUI: false,
        })
        mapInstance.current = map
        setMapUnavailable(false)

        const marker = new AdvancedMarkerElement({
          map,
          position: value?.lat && value.lng ? { lat: value.lat, lng: value.lng } : undefined,
        })
        markerRef.current = marker

        const handleSelect = (lat: number, lng: number, formattedAddress?: string, cityName?: string) => {
          marker.position = { lat, lng }
          onChange({
            lat,
            lng,
            address: formattedAddress ?? value?.address,
            city: cityName ?? value?.city,
          })
        }

        listeners.push(
          map.addListener('click', (event: google.maps.MapMouseEvent) => {
            if (!event.latLng) return
            const lat = event.latLng.lat()
            const lng = event.latLng.lng()
            handleSelect(lat, lng)
          }),
        )

        if (inputRef.current) {
          const autocomplete = new Autocomplete(inputRef.current, {
            fields: ['geometry', 'formatted_address', 'address_components'],
          })

          autocompleteListener = autocomplete.addListener('place_changed', () => {
            const place = autocomplete.getPlace()
            const geometry = place.geometry?.location
            if (!geometry) return
            const lat = geometry.lat()
            const lng = geometry.lng()
            map.panTo({ lat, lng })
            const cityComponent = place.address_components?.find((component) =>
              component.types.includes('locality'),
            )
            handleSelect(lat, lng, place.formatted_address ?? undefined, cityComponent?.long_name)
          })
        }
      } catch (error) {
        console.error(t('locationPicker.error'), error)
        setMapUnavailable(true)
      }
    }

    init()

    return () => {
      isMounted = false
      listeners.forEach((listener) => listener.remove())
      autocompleteListener?.remove()
    }
  }, [value?.lat, value?.lng, value?.address, value?.city, onChange])

  const handleManualChange = (field: 'address' | 'city', nextValue: string) => {
    onChange({
      ...value,
      [field]: nextValue,
    })
  }

  if (mapUnavailable) {
    return (
      <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
        <p>{env.mapsKey ? t('locationPicker.errorFallback') : t('locationPicker.missingKeyMessage')}</p>
        <div>
          <label className="text-xs text-slate-500">{t('locationPicker.manualAddressLabel')}</label>
          <input
            type="text"
            value={value?.address ?? ''}
            onChange={(event) => handleManualChange('address', event.target.value)}
            placeholder={t('locationPicker.placeholder')}
            className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400"
          />
        </div>
        <div>
          <label className="text-xs text-slate-500">{t('locationPicker.manualCityLabel')}</label>
          <input
            type="text"
            value={value?.city ?? ''}
            onChange={(event) => handleManualChange('city', event.target.value)}
            className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400"
          />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="text"
        placeholder={t('locationPicker.placeholder')}
        className={clsx(
          'w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400',
        )}
        defaultValue={value?.address}
      />
      <div ref={mapRef} className="h-48 w-full rounded-2xl border border-slate-100" />
    </div>
  )
}
