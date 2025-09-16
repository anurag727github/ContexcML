'use client'

import { useEffect, useRef } from 'react'

interface Layer {
  id: string
  name: string
  type: 'marker' | 'polygon' | 'polyline' | 'heatmap'
  visible: boolean
  data: any[]
  color: string
  opacity: number
}

interface MapComponentProps {
  center: [number, number]
  zoom: number
  layers: Layer[]
  selectedTool: string
  onAddMeasurement: (type: string, value: number, unit: string) => void
  onFeatureSelect: (features: any[]) => void
}

export default function MapComponent({
  center,
  zoom,
  layers,
  selectedTool,
  onAddMeasurement,
  onFeatureSelect
}: MapComponentProps) {
  const mapRef = useRef<any>(null)
  const mapInstanceRef = useRef<any>(null)
  const layerGroupsRef = useRef<Map<string, any>>(new Map())

  useEffect(() => {
    if (typeof window === 'undefined') return

    // Dynamically import Leaflet
    import('leaflet').then((L) => {
      // Fix for default markers
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      })

      if (!mapInstanceRef.current && mapRef.current) {
        // Initialize map
        mapInstanceRef.current = L.map(mapRef.current).setView(center, zoom)

        // Add tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors'
        }).addTo(mapInstanceRef.current)

        // Add drawing controls
        const drawnItems = new L.FeatureGroup()
        mapInstanceRef.current.addLayer(drawnItems)

        // Handle map clicks for different tools
        mapInstanceRef.current.on('click', (e: any) => {
          if (selectedTool === 'marker') {
            const marker = L.marker([e.latlng.lat, e.latlng.lng])
              .bindPopup(`New marker at ${e.latlng.lat.toFixed(4)}, ${e.latlng.lng.toFixed(4)}`)
            drawnItems.addLayer(marker)
          }
        })
      }

      // Update map view
      if (mapInstanceRef.current) {
        mapInstanceRef.current.setView(center, zoom)
      }
    })

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    if (!mapInstanceRef.current || typeof window === 'undefined') return

    import('leaflet').then((L) => {
      // Clear existing layer groups
      layerGroupsRef.current.forEach((layerGroup) => {
        mapInstanceRef.current.removeLayer(layerGroup)
      })
      layerGroupsRef.current.clear()

      // Add layers
      layers.forEach((layer) => {
        if (!layer.visible) return

        const layerGroup = L.layerGroup()

        layer.data.forEach((item) => {
          if (layer.type === 'marker') {
            const marker = L.marker([item.lat, item.lng])
              .bindPopup(`
                <div>
                  <h3 class="font-bold">${item.popup}</h3>
                  ${Object.entries(item.properties || {}).map(([key, value]) => 
                    `<div><strong>${key}:</strong> ${value}</div>`
                  ).join('')}
                </div>
              `)
            layerGroup.addLayer(marker)
          } else if (layer.type === 'polygon' && item.coordinates) {
            const polygon = L.polygon(item.coordinates, {
              color: layer.color,
              fillOpacity: layer.opacity
            }).bindPopup(`
              <div>
                <h3 class="font-bold">${item.popup}</h3>
                ${Object.entries(item.properties || {}).map(([key, value]) => 
                  `<div><strong>${key}:</strong> ${value}</div>`
                ).join('')}
              </div>
            `)
            layerGroup.addLayer(polygon)
          }
        })

        layerGroupsRef.current.set(layer.id, layerGroup)
        mapInstanceRef.current.addLayer(layerGroup)
      })
    })
  }, [layers])

  useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView(center, zoom)
    }
  }, [center, zoom])

  return (
    <>
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css"
        integrity="sha512-xodZBNTC5n17Xt2atTPuE1HxjVMSvLVW9ocqUKLsCC5CXdbqCmblAshOMAS6/keqq/sMZMZ19scR4PsZChSR7A=="
        crossOrigin=""
      />
      <div ref={mapRef} className="w-full h-full" />
    </>
  )
}
