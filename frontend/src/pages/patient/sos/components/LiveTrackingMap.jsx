import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { IconMap } from '@/components/icons';

// Fix default Leaflet marker icon paths for Vite/Webpack bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom animated pulse marker icon
const createPatientIcon = () => {
  return L.divIcon({
    className: 'smriti-patient-marker',
    html: `
      <div style="position: relative; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">
        <div style="position: absolute; width: 32px; height: 32px; border-radius: 50%; background: rgba(0, 94, 83, 0.3); animation: pulse-ring 1.8s infinite ease-out;"></div>
        <div style="position: absolute; width: 18px; height: 18px; border-radius: 50%; background: var(--primary, #005e53); border: 3px solid #ffffff; box-shadow: 0 2px 6px rgba(0,0,0,0.3);"></div>
      </div>
      <style>
        @keyframes pulse-ring {
          0% { transform: scale(0.6); opacity: 0.9; }
          100% { transform: scale(1.6); opacity: 0; }
        }
      </style>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });
};

export default function LiveTrackingMap({
  latitude,
  longitude,
  accuracy,
  lastUpdated,
  title = 'Patient Live Location',
  showGeofence = true,
  geofenceRadius = 500, // in meters
  height = '100%',
  showGoogleMapsBtn = true,
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const accuracyCircleRef = useRef(null);
  const geofenceCircleRef = useRef(null);
  const [showSafeZone, setShowSafeZone] = useState(showGeofence);

  const hasCoords =
    latitude != null &&
    longitude != null &&
    !isNaN(latitude) &&
    !isNaN(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180;

  // Initialize and Update Map
  useEffect(() => {
    if (!hasCoords || !mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [latitude, longitude],
        zoom: 16,
        zoomControl: true,
        scrollWheelZoom: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Update or Create Patient Marker
    const popupContent = `<b>${title}</b><br/>Lat: ${latitude.toFixed(5)}, Lng: ${longitude.toFixed(5)}`;
    if (markerRef.current) {
      markerRef.current.setLatLng([latitude, longitude]);
      markerRef.current.setPopupContent(popupContent);
    } else {
      const marker = L.marker([latitude, longitude], { icon: createPatientIcon() }).addTo(map);
      marker.bindPopup(popupContent);
      markerRef.current = marker;
    }

    // Update or Create Accuracy Circle
    if (accuracy && accuracy > 0) {
      if (accuracyCircleRef.current) {
        accuracyCircleRef.current.setLatLng([latitude, longitude]);
        accuracyCircleRef.current.setRadius(accuracy);
      } else {
        const accCircle = L.circle([latitude, longitude], {
          radius: accuracy,
          color: '#00796b',
          fillColor: '#00796b',
          fillOpacity: 0.12,
          weight: 1.5,
          dashArray: '4 4',
        }).addTo(map);
        accuracyCircleRef.current = accCircle;
      }
    } else if (accuracyCircleRef.current) {
      map.removeLayer(accuracyCircleRef.current);
      accuracyCircleRef.current = null;
    }

    // Update or Create Safe Zone Geofence
    if (showSafeZone) {
      if (geofenceCircleRef.current) {
        geofenceCircleRef.current.setLatLng([latitude, longitude]);
      } else {
        const geoCircle = L.circle([latitude, longitude], {
          radius: geofenceRadius,
          color: '#2e7d32',
          fillColor: '#2e7d32',
          fillOpacity: 0.08,
          weight: 2,
        }).addTo(map);
        geoCircle.bindPopup(`<b>Safe Zone Perimeter</b><br/>Radius: ${geofenceRadius}m`);
        geofenceCircleRef.current = geoCircle;
      }
    } else if (geofenceCircleRef.current) {
      map.removeLayer(geofenceCircleRef.current);
      geofenceCircleRef.current = null;
    }

    // Pan map smoothly to new coordinates
    map.panTo([latitude, longitude], { animate: true, duration: 0.8 });

    // Ensure proper sizing
    setTimeout(() => {
      map.invalidateSize();
    }, 200);
  }, [latitude, longitude, accuracy, title, showSafeZone, geofenceRadius, hasCoords]);

  // Clean up map on unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
        accuracyCircleRef.current = null;
        geofenceCircleRef.current = null;
      }
    };
  }, []);

  // Handle Recenter
  const handleRecenter = () => {
    if (mapInstanceRef.current && hasCoords) {
      mapInstanceRef.current.setView([latitude, longitude], 16, { animate: true });
      mapInstanceRef.current.invalidateSize();
    }
  };

  const googleMapsUrl = hasCoords ? `https://www.google.com/maps?q=${latitude},${longitude}` : null;

  if (!hasCoords) {
    return (
      <div
        style={{
          width: '100%',
          minHeight: 280,
          borderRadius: 'var(--radius-lg)',
          backgroundColor: 'var(--surface-container-low)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1.5px dashed var(--outline-variant)',
          color: 'var(--outline)',
          padding: 28,
          textAlign: 'center',
        }}
      >
        <div style={{ padding: 14, borderRadius: '50%', backgroundColor: 'var(--surface-container)', marginBottom: 12 }}>
          <IconMap size={40} style={{ color: 'var(--outline)' }} />
        </div>
        <p className="headline-sm" style={{ fontSize: 17, color: 'var(--on-surface)', marginBottom: 4 }}>
          Location Telemetry Waiting
        </p>
        <p className="body-md" style={{ color: 'var(--outline)', fontSize: 14, maxWidth: 340 }}>
          Live satellite coordinates have not been received yet. Start &ldquo;Live Location Sharing&rdquo; on the patient device to begin stream.
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        width: '100%',
        borderRadius: 'var(--radius-xl)',
        overflow: 'hidden',
        border: '1px solid var(--surface-container-high)',
        backgroundColor: 'var(--white)',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Map Header Controls */}
      <div
        style={{
          padding: '12px 18px',
          backgroundColor: 'var(--mint-soft)',
          borderBottom: '1px solid rgba(0, 94, 83, 0.1)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 8,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              backgroundColor: '#2e7d32',
              display: 'inline-block',
              boxShadow: '0 0 0 3px rgba(46, 125, 50, 0.2)',
            }}
          />
          <span className="label-lg" style={{ color: 'var(--primary)', fontSize: 14, margin: 0 }}>
            {title}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setShowSafeZone(!showSafeZone)}
            className="btn btn-sm"
            style={{
              backgroundColor: showSafeZone ? '#e8f5e9' : 'var(--surface-container)',
              color: showSafeZone ? '#2e7d32' : 'var(--outline)',
              border: 'none',
              padding: '4px 10px',
              fontSize: '12px',
              fontWeight: 700,
            }}
          >
            {showSafeZone ? '✓ Geofence' : '+ Safe Zone'}
          </button>

          <button
            type="button"
            onClick={handleRecenter}
            className="btn btn-sm btn-outline"
            style={{ padding: '4px 10px', fontSize: '12px' }}
          >
            🎯 Recenter
          </button>

          {showGoogleMapsBtn && googleMapsUrl && (
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-sm btn-outline"
              style={{
                padding: '4px 10px',
                fontSize: '12px',
                color: 'var(--primary)',
                borderColor: 'var(--primary)',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              🗺️ Google Maps ↗
            </a>
          )}
        </div>
      </div>

      {/* Interactive Map Container */}
      <div
        ref={mapContainerRef}
        style={{
          width: '100%',
          minHeight: 280,
          height: height === '100%' ? '360px' : height,
          position: 'relative',
          zIndex: 10,
        }}
      />

      {/* Map Footer Telemetry Info */}
      <div
        style={{
          padding: '10px 16px',
          backgroundColor: 'var(--surface-container-lowest)',
          borderTop: '1px solid var(--surface-container-high)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 6,
          fontSize: '13px',
        }}
      >
        <span style={{ fontFamily: 'monospace', color: 'var(--ink)', fontWeight: 600 }}>
          📍 {latitude.toFixed(5)}, {longitude.toFixed(5)}
          {accuracy ? ` (±${Math.round(accuracy)}m)` : ''}
        </span>

        {lastUpdated && (
          <span style={{ color: 'var(--outline)', fontSize: '12px', fontWeight: 500 }}>
            Fix: {new Date(lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>
        )}
      </div>
    </div>
  );
}
