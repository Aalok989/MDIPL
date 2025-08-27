import React, { useEffect, useMemo, useState, useCallback } from 'react';
import Plot from 'react-plotly.js';
import { getApiUrl } from '../config/api';

const GeoMap = () => {
  const [geojson, setGeojson] = useState(null);
  const [points, setPoints] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mapConfig, setMapConfig] = useState({ center: { lat: 22.5937, lon: 78.9629 }, zoom: 4 });

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
        const res = await fetch(getApiUrl('GEOSPATIAL_ANALYSIS'));
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
  }, [geocodeRecord]);

  useEffect(() => {
    fetch('/india_states.json')
      .then(res => res.ok ? res.json() : Promise.reject(new Error('GeoJSON not found')))
      .then(setGeojson)
      .catch((e) => {
        console.warn('India states GeoJSON not found in /public. The map will render without state boundaries.', e)
        setGeojson(null)
      });
  }, []);

  const layers = [];
  if (geojson) {
    const featureKey = geojson.features?.[0]?.properties?.st_nm ? 'properties.st_nm' : 'properties.ST_NM';
    const locs = geojson.features.map(f => f.properties?.st_nm || f.properties?.ST_NM);
    layers.push({
      type: 'choropleth',
      geojson,
      locations: locs,
      featureidkey: featureKey,
      z: locs.map((_, i) => 10 + (i * 7) % 90),
      showscale: false,
      colorscale: [[0, '#e0f2fe'], [1, '#1d4ed8']],
      marker: { line: { color: '#fff', width: 0.5 } }
    });
  }

  if (points) {
    const typeToColor = { Customer: 'dodgerblue', Supplier: 'gold', Project: 'magenta' };
    const typeToSymbol = { Customer: 'square', Supplier: 'circle', Project: 'star' };
    const grouped = points.reduce((acc, p) => {
      if (!acc[p.Type]) acc[p.Type] = { lat: [], lon: [], text: [], size: [] };
      acc[p.Type].lat.push(p.lat);
      acc[p.Type].lon.push(p.lon);
      acc[p.Type].text.push(`${p.Name} — ₹${p.Value.toLocaleString('en-IN')}`);
      acc[p.Type].size.push(Math.max(2, Math.min(12, Math.sqrt(p.Value) * 0.2)));
      return acc;
    }, {});
    Object.entries(grouped).forEach(([key, g]) => {
      layers.push({
        type: 'scattergeo',
        mode: 'markers',
        name: key,
        lat: g.lat,
        lon: g.lon,
        text: g.text,
        hovertemplate: '<b>%{text}</b><extra></extra>',
        marker: { size: g.size, color: typeToColor[key], symbol: typeToSymbol[key] || 'circle', line: { width: 1, color: '#fff' } }
      });
    });
  }

  // Compute tight bounds from points to minimize empty top/bottom space
  const bounds = useMemo(() => {
    if (!points || !points.length) return null;
    const lats = points.map(p => p.lat).filter(v => typeof v === 'number');
    const lons = points.map(p => p.lon).filter(v => typeof v === 'number');
    if (!lats.length || !lons.length) return null;
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLon = Math.min(...lons);
    const maxLon = Math.max(...lons);
    const latPad = (maxLat - minLat) * 0.1 || 2;
    const lonPad = (maxLon - minLon) * 0.1 || 2;
    return {
      latRange: [minLat - latPad, maxLat + latPad],
      lonRange: [minLon - lonPad, maxLon + lonPad],
    };
  }, [points]);

  const layout = {
    margin: { l: 0, r: 0, t: 0, b: 0 },
    autosize: true,
    paper_bgcolor: 'rgba(255,255,255,0)',
    plot_bgcolor: 'rgba(255,255,255,0)',
    geo: {
      projection: { type: 'mercator' },
      fitbounds: bounds ? false : 'locations',
      showcountries: true,
      countrycolor: '#ccc',
      showland: true,
      landcolor: '#f9fafb',
      showframe: false,
      showcoastlines: false,
      center: mapConfig.center,
      domain: { x: [0, 1], y: [0, 1] },
      lonaxis: bounds ? { range: bounds.lonRange } : undefined,
      lataxis: bounds ? { range: bounds.latRange } : undefined,
    },
    legend: {
      orientation: 'h',
      x: 0.02,
      y: 0.98,
      xanchor: 'left',
      yanchor: 'top',
      bgcolor: 'rgba(255,255,255,0.7)',
      bordercolor: 'rgba(0,0,0,0.1)',
      borderwidth: 1,
      font: { size: 10 }
    }
  };

  if (loading) {
    return (
      <div className="w-full h-full rounded-2xl overflow-hidden flex items-center justify-center bg-white">
        <div className="text-lg text-gray-600">Loading geospatial data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full rounded-2xl overflow-hidden flex items-center justify-center bg-white">
        <div className="text-lg text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="relative h-full -m-4">
      <div className="absolute inset-0">
        <Plot
          data={layers}
          layout={layout}
          style={{ width: '100%', height: '100%', padding: 0, margin: 0 }}
          config={{ responsive: true, displayModeBar: false }}
          useResizeHandler
        />
      </div>
    </div>
  );
};

export default GeoMap;
