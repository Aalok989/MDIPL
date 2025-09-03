import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { MapContainer, TileLayer, GeoJSON, Marker, Popup, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import { getApiUrl } from '../config/api';
import LoadingScreen from './LoadingScreen';
import { useDateFilter } from '../contexts/DateFilterContext';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Component to fit map bounds to data
const FitBounds = ({ points }) => {
  const map = useMap();
  
  useEffect(() => {
    if (points && points.length > 0) {
      const lats = points.map(p => p.lat).filter(v => typeof v === 'number');
      const lons = points.map(p => p.lon).filter(v => typeof v === 'number');
      
      if (lats.length > 0 && lons.length > 0) {
        const minLat = Math.min(...lats);
        const maxLat = Math.max(...lats);
        const minLon = Math.min(...lons);
        const maxLon = Math.max(...lons);
        
        const latPad = (maxLat - minLat) * 0.1 || 2;
        const lonPad = (maxLon - minLon) * 0.1 || 2;
        
        const bounds = [
          [minLat - latPad, minLon - lonPad],
          [maxLat + latPad, maxLon + lonPad]
        ];
        
        map.fitBounds(bounds, { padding: [20, 20] });
      }
    }
  }, [map, points]);
  
  return null;
};

// Create custom icons for different entity types (matching original symbols)
const createCustomIcon = (type, size) => {
  const typeToColor = { Customer: 'dodgerblue', Vendor: 'orange', Project: 'magenta' };
  const typeToSymbol = { Customer: 'square', Vendor: 'circle', Project: 'star' };
  
  const color = typeToColor[type] || 'dodgerblue';
  const symbol = typeToSymbol[type] || 'circle';
  
  // Create SVG icon based on symbol type
  let svgIcon;
  switch (symbol) {
    case 'square':
      svgIcon = `
        <svg width="${size}" height="${size}" viewBox="0 0 24 24">
          <rect x="4" y="4" width="16" height="16" fill="${color}" stroke="white" stroke-width="2"/>
        </svg>
      `;
      break;
    case 'star':
      svgIcon = `
        <svg width="${size}" height="${size}" viewBox="0 0 24 24">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="${color}" stroke="white" stroke-width="1"/>
        </svg>
      `;
      break;
    default: // circle
      svgIcon = `
        <svg width="${size}" height="${size}" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" fill="${color}" stroke="white" stroke-width="2"/>
        </svg>
      `;
  }
  
  return L.divIcon({
    html: svgIcon,
    className: 'custom-div-icon',
    iconSize: [size, size],
    iconAnchor: [size/2, size/2]
  });
};

// Custom marker component for different entity types
const CustomMarker = ({ point, type, visible }) => {
  const size = Math.max(8, Math.min(20, Math.sqrt(point.Value) * 0.2));
  const icon = createCustomIcon(type, size);
  
  return (
    <Marker
      position={[point.lat, point.lon]}
      icon={icon}
      opacity={visible ? 1 : 0}
    >
      <Tooltip direction="top" offset={[0, -10]} opacity={1}>
        <div className="text-sm">
          <div className="font-bold text-gray-800">{point.Name}</div>
          <div className="text-green-600 font-semibold">₹{point.Value.toLocaleString('en-IN')}</div>
          {point.LocationStr && (
            <div className="text-gray-600 text-xs">{point.LocationStr}</div>
          )}
        </div>
      </Tooltip>
      <Popup>
        <div className="text-sm p-2 min-w-[200px]">
          <div className="font-bold text-base mb-2 text-gray-800">{point.Name}</div>
          <div className="space-y-1">
            <div><span className="font-semibold text-gray-700">Type:</span> <span className="text-blue-600">{type}</span></div>
            <div><span className="font-semibold text-gray-700">Value:</span> <span className="text-green-600 font-bold">₹{point.Value.toLocaleString('en-IN')}</span></div>
            {point.LocationStr && (
              <div><span className="font-semibold text-gray-700">Location:</span> {point.LocationStr}</div>
            )}
            {point.Description && (
              <div><span className="font-semibold text-gray-700">Description:</span> {point.Description}</div>
            )}
            {point.Status && (
              <div><span className="font-semibold text-gray-700">Status:</span> {point.Status}</div>
            )}
            {point.Category && (
              <div><span className="font-semibold text-gray-700">Category:</span> {point.Category}</div>
            )}
            {point.lat && point.lon && (
              <div className="text-xs text-gray-500 mt-2 pt-1 border-t border-gray-200">
                <span className="font-semibold">Coordinates:</span> {point.lat.toFixed(4)}, {point.lon.toFixed(4)}
              </div>
            )}
          </div>
        </div>
      </Popup>
    </Marker>
  );
};

const GeoMap = () => {
  const [geojson, setGeojson] = useState(null);
  const [points, setPoints] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mapConfig, setMapConfig] = useState({ center: { lat: 22.5937, lon: 78.9629 }, zoom: 4 });
  const [legendFilters, setLegendFilters] = useState({ Customer: true, Vendor: true, Project: true });
  const { dateRange } = useDateFilter();

  const CITY_COORDS = useMemo(() => ({
    'FARIDABAD': { lat: 28.4089, lon: 77.3178 },
    'GHAZIABAD': { lat: 28.6692, lon: 77.4538 },
    'KOTPUTLI': { lat: 27.70, lon: 76.20 },
    'VAPI': { lat: 20.3701, lon: 72.9041 },
    'MUMBAI': { lat: 19.0760, lon: 72.8777 },
    'NAGAUR': { lat: 27.2023, lon: 73.7423 },
    'JAMMU': { lat: 32.7266, lon: 74.8570 },
    'BANGALORE': { lat: 12.9716, lon: 77.5946 },
    'HYDERABAD': { lat: 17.3850, lon: 78.4867 },
    'CHENNAI': { lat: 13.0827, lon: 80.2707 },
    'KOLKATA': { lat: 22.5726, lon: 88.3639 },
    'CUTTACK': { lat: 20.4625, lon: 85.8830 },
    'DELHI': { lat: 28.7041, lon: 77.1025 },
    'NOIDA': { lat: 28.5355, lon: 77.3910 },
    'GURUGRAM': { lat: 28.4595, lon: 77.0266 },
    'PUNE': { lat: 18.5204, lon: 73.8567 },
    'AHMEDABAD': { lat: 23.0225, lon: 72.5714 },
    'RAIPUR': { lat: 21.2514, lon: 81.6296 },
    'INDIRAPURAM': { lat: 28.6369, lon: 77.3719 },
    'JEWAR': { lat: 28.1278, lon: 77.5539 }
  }), []);

  const geocodeRecord = useCallback((rec) => {
    const searchString = `${rec.LocationStr || ''} ${rec.Name || ''}`.toUpperCase();
    for (const city in CITY_COORDS) {
      const re = new RegExp(`\\b${city}\\b`);
      if (re.test(searchString)) return CITY_COORDS[city];
    }
    return { lat: rec.lat, lon: rec.lon };
  }, [CITY_COORDS]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const startDate = dateRange.startDate.toISOString().split('T')[0];
        const endDate = dateRange.endDate.toISOString().split('T')[0];
        const baseUrl = getApiUrl('GEOSPATIAL_ANALYSIS');
        const url = `${baseUrl}?start_date=${startDate}&end_date=${endDate}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const response = await res.json();

        if (response.center && response.zoom) {
          setMapConfig({ center: response.center, zoom: response.zoom });
        }

                 if (response.points && Array.isArray(response.points)) {
           const processedPoints = response.points.map(point => ({
             ...point,
             ...geocodeRecord(point)
           }));
           console.log('Processed points:', processedPoints);
           console.log('Point types found:', [...new Set(processedPoints.map(p => p.Type))]);
           console.log('Sample point structure:', processedPoints[0]);
           console.log('All available fields in first point:', Object.keys(processedPoints[0] || {}));
           setPoints(processedPoints);
         } else {
          throw new Error('Unexpected API response shape');
        }
      } catch (err) {
        console.error('Failed to fetch geospatial data:', err);
        setError(err?.message || 'Failed to load');
        setPoints(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [geocodeRecord, dateRange]);

  useEffect(() => {
    fetch('/india_states.json')
      .then(res => res.ok ? res.json() : Promise.reject(new Error('GeoJSON not found')))
      .then(setGeojson)
      .catch((e) => {
        console.warn('India states GeoJSON not found in /public. The map will render without state boundaries.', e)
        setGeojson(null)
      });
  }, []);

  // Group points by type for rendering
  const groupedPoints = useMemo(() => {
    if (!points) return {};
    const grouped = points.reduce((acc, point) => {
      // Map "Supplier" to "Vendor" for consistency
      const displayType = point.Type === 'Supplier' ? 'Vendor' : point.Type;
      if (!acc[displayType]) acc[displayType] = [];
      acc[displayType].push(point);
      return acc;
    }, {});
    console.log('Grouped points:', grouped);
    console.log('Grouped keys:', Object.keys(grouped));
    return grouped;
  }, [points]);

  // Style function for GeoJSON states
  const geoJsonStyle = (feature) => {
    return {
      fillColor: '#1d4ed8',
      weight: 0.5,
      opacity: 1,
      color: '#fff',
      fillOpacity: 0.1
    };
  };

  if (loading) {
    return (
      <div className="w-full h-full rounded-2xl overflow-hidden relative bg-gray-100">
        {/* Map placeholder background */}
        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
          <div className="text-gray-400 text-sm">Map Loading...</div>
        </div>
        
        {/* Horizontal loading bar overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20">
          <div className="bg-white rounded-lg p-6 shadow-lg">
            <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-blue-600 rounded-full animate-pulse"></div>
            </div>
            <p className="text-sm text-gray-600 mt-2 text-center">Loading geospatial data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full rounded-2xl overflow-hidden bg-white flex items-center justify-center">
        <div className="text-center p-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to Load Map</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full rounded-2xl overflow-hidden">
             <MapContainer
         center={[mapConfig.center.lat, mapConfig.center.lon]}
         zoom={mapConfig.zoom}
         style={{ height: '100%', width: '100%' }}
         zoomControl={false}
         scrollWheelZoom={true}
         doubleClickZoom={true}
         dragging={true}
       >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {/* India states GeoJSON layer */}
        {geojson && (
          <GeoJSON
            data={geojson}
            style={geoJsonStyle}
          />
        )}
        
        {/* Data points markers */}
        {Object.entries(groupedPoints).map(([type, typePoints]) =>
          typePoints.map((point, index) => (
            <CustomMarker
              key={`${type}-${index}`}
              point={point}
              type={type}
              visible={legendFilters[type]}
            />
          ))
        )}
        
        {/* Fit bounds to data */}
        <FitBounds points={points} />
        
        {/* Custom Legend with Filters - Exact match to original */}
        <div 
          className="absolute top-2 left-2 z-[1000]"
          style={{
            backgroundColor: 'rgba(255,255,255,0.7)',
            border: '1px solid rgba(0,0,0,0.1)',
            borderRadius: '4px',
            padding: '8px',
            fontSize: '10px',
            fontFamily: 'Arial, sans-serif'
          }}
        >
                     <div className="space-y-1">
             {Object.entries({ Customer: 'dodgerblue', Vendor: 'orange', Project: 'magenta' }).map(([type, color]) => {
              const getIcon = () => {
                switch (type) {
                  case 'Customer':
                    return (
                      <svg width="12" height="12" viewBox="0 0 12 12">
                        <rect x="2" y="2" width="8" height="8" fill={legendFilters[type] ? color : 'transparent'} stroke={color} strokeWidth="1"/>
                      </svg>
                    );
                                     case 'Vendor':
                     return (
                       <svg width="12" height="12" viewBox="0 0 12 12">
                         <circle cx="6" cy="6" r="4" fill={legendFilters[type] ? color : 'transparent'} stroke={color} strokeWidth="1"/>
                       </svg>
                     );
                  case 'Project':
                    return (
                      <svg width="12" height="12" viewBox="0 0 12 12">
                        <path d="M6 1l1.5 3.5L12 4.5L9 7L9.5 12L6 10L2.5 12L3 7L0 4.5L4.5 4.5L6 1z" fill={legendFilters[type] ? color : 'transparent'} stroke={color} strokeWidth="0.5"/>
                      </svg>
                    );
                  default:
                    return null;
                }
              };
              
              return (
                <div key={type} className="flex items-center space-x-2 cursor-pointer" onClick={() => setLegendFilters(prev => ({ ...prev, [type]: !prev[type] }))}>
                  {getIcon()}
                  <span 
                    style={{ 
                      color: legendFilters[type] ? '#333' : '#999',
                      textDecoration: legendFilters[type] ? 'none' : 'line-through'
                    }}
                  >
                    {type}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </MapContainer>
    </div>
  );
};

export default GeoMap;

