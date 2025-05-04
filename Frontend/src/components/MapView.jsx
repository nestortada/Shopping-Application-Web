// src/components/MapView.jsx
import React, { useState, useEffect, useRef } from 'react'
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api'

const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

export default function MapView() {
  const [currentPosition, setCurrentPosition] = useState(null)
  const [mapCenter, setMapCenter] = useState({ lat: 4.8610, lng: -74.0500 }) // fallback
  const [markers, setMarkers] = useState([])
  const mapRef = useRef(null)

  const containerStyle = { width: '100%', height: '280px' }

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
          setCurrentPosition({ lat: coords.latitude, lng: coords.longitude })
        },
        () => {},
        { enableHighAccuracy: true }
      )
    }
  }, [])

  function onLoad(map) {
    mapRef.current = map

    // Geocode de la universidad
    const geocoder = new window.google.maps.Geocoder()
    geocoder.geocode(
      { address: 'Universidad de La Sabana, Chía, Colombia' },
      (results, status) => {
        if (status === 'OK' && results[0]) {
          const loc = results[0].geometry.location
          const center = { lat: loc.lat(), lng: loc.lng() }
          setMapCenter(center)

          // PlacesService para restaurantes y cafés
          const service = new window.google.maps.places.PlacesService(map)
          service.nearbySearch(
            { location: center, radius: 500, type: ['restaurant', 'cafe'] },
            (places, status2) => {
              if (status2 === window.google.maps.places.PlacesServiceStatus.OK) {
                const mks = places.map(p => ({
                  id: p.place_id,
                  position: {
                    lat: p.geometry.location.lat(),
                    lng: p.geometry.location.lng(),
                  },
                }))
                setMarkers(mks)
              }
            }
          )
        }
      }
    )
  }

  return (
    <LoadScript
      googleMapsApiKey={googleMapsApiKey}
      libraries={['places']}
    >
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={mapCenter}
        zoom={16}
        onLoad={onLoad}
        options={{ streetViewControl: false, fullscreenControl: false }}
      >
        {currentPosition && <Marker position={currentPosition} label="Tú" />}
        {markers.map(m => (
          <Marker key={m.id} position={m.position} />
        ))}
      </GoogleMap>
    </LoadScript>
  )
}
