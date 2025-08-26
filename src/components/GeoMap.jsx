import React, { useEffect, useMemo, useState, useCallback } from 'react';
import Plot from 'react-plotly.js';

const GeoMap = () => {
  const [geojson, setGeojson] = useState(null);
  const [points, setPoints] = useState(null);
  const [error, setError] = useState(null);

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
    const base = [
      { Name: 'ABC INDUSTRIES', Type: 'Customer', Value: 16707000, LocationStr: 'DELHI' },
      { Name: 'OMEGA SUPPLIERS', Type: 'Supplier', Value: 8450000, LocationStr: 'MUMBAI' },
      { Name: 'PHOENIX PROJECT', Type: 'Project', Value: 3920000, LocationStr: 'BANGALORE' },
      { Name: 'DELTA FOODS', Type: 'Customer', Value: 2560000, LocationStr: 'PUNE' },
      { Name: 'NOVA STEEL', Type: 'Supplier', Value: 4780000, LocationStr: 'AHMEDABAD' },
      { Name: 'SKYLINE TOWERS', Type: 'Project', Value: 5200000, LocationStr: 'NOIDA' },
      { Name: 'EASTERN TRADERS', Type: 'Customer', Value: 2100000, LocationStr: 'KOLKATA' },
      { Name: 'COASTAL BUILD', Type: 'Project', Value: 3100000, LocationStr: 'CHENNAI' },
      { Name: 'RIVER SUPPLY', Type: 'Supplier', Value: 1450000, LocationStr: 'VAPI' },
      { Name: 'HIGHLAND SERVICES', Type: 'Supplier', Value: 1950000, LocationStr: 'JAMMU' },
      { Name: 'SUNSHINE POWER', Type: 'Project', Value: 2750000, LocationStr: 'RAIPUR' },
      { Name: 'URBAN LIVIN', Type: 'Customer', Value: 2300000, LocationStr: 'GURUGRAM' },
    ];
    setPoints(base.map(r => ({ ...r, ...geocodeRecord(r) })));
  }, [geocodeRecord]);

  useEffect(() => {
    fetch('/india_states.json')
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(setGeojson)
      .catch(() => setError('India states GeoJSON not found in /public'));
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
    const grouped = points.reduce((acc, p) => {
      if (!acc[p.Type]) acc[p.Type] = { lat: [], lon: [], text: [], size: [] };
      acc[p.Type].lat.push(p.lat);
      acc[p.Type].lon.push(p.lon);
      acc[p.Type].text.push(`${p.Name} — ₹${p.Value.toLocaleString('en-IN')}`);
      acc[p.Type].size.push(Math.max(6, Math.min(40, Math.sqrt(p.Value) * 0.6)));
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
        marker: { size: g.size, color: typeToColor[key], line: { width: 1, color: '#fff' } }
      });
    });
  }

  const layout = {
    margin: { l: 0, r: 0, t: 0, b: 0 },
    autosize: true,
    paper_bgcolor: '#fff',
plot_bgcolor: '#fff',
    geo: {
      projection: { type: 'mercator' },
      fitbounds: 'locations',
      showcountries: true,
      countrycolor: '#ccc',
      showland: true,
      landcolor: '#f9fafb',
      showframe: false,
      showcoastlines: false,
      // domain slightly beyond to eliminate leftover gaps:
      domain: { x: [-0.01, 1.01], y: [0, 1] }
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

  return (
    <div className="w-full h-[350px] md:h-[420px] rounded-2xl overflow-hidden">
      <Plot
        data={layers}
        layout={layout}
        style={{ width: '100%', height: '100%', padding: 0, margin: 0 }}
        config={{ responsive: true, displayModeBar: false }}
        useResizeHandler
      />
    </div>
  );
};

export default GeoMap;
