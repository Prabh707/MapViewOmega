import React from 'react';
import L from 'leaflet';
import { TransitStop, RouteCandidate } from '../types/transit';

interface MapViewProps {
  stops: TransitStop[];
  selectedRoute: RouteCandidate | null;
  onSetOrigin: (stopId: string) => void;
  onSetDest: (stopId: string) => void;
  onReportStop?: (stopId: string) => void;
}

export const MapView: React.FC<MapViewProps> = ({
  stops,
  selectedRoute,
  onSetOrigin,
  onSetDest,
  onReportStop,
}) => {
  const mapContainerRef = React.useRef<HTMLDivElement>(null);
  const mapInstanceRef = React.useRef<any>(null);
  const routeLayersRef = React.useRef<any[]>([]);
  const markersRef = React.useRef<{ [id: string]: any }>({});

  // 1. Initialize Map
  React.useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    if (typeof L === 'undefined') {
      console.warn('Leaflet L is not loaded yet');
      return;
    }

    const map = L.map(mapContainerRef.current, {
      center: [42.365, -71.095],
      zoom: 14,
      zoomControl: false,
    });

    // High legibility accessible tiles (CartoDB Voyager)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    mapInstanceRef.current = map;

    // Render stops markers
    renderStops(map, stops);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // 2. Render / Update Stop Markers
  const renderStops = (map: any, stopList: TransitStop[]) => {
    // Clear previous markers
    Object.values(markersRef.current).forEach(m => m.remove());
    markersRef.current = {};

    stopList.forEach(stop => {
      const isBarrier = stop.elevatorStatus === 'broken' || !stop.stepFree;
      const isHighSafe = stop.lightingScore >= 9.2;

      let markerBg = '#10b981'; // Green
      let iconSymbol = '🦼';

      if (isBarrier) {
        markerBg = '#ef4444'; // Red
        iconSymbol = '⚠️';
      } else if (isHighSafe) {
        markerBg = '#059669'; // Emerald
        iconSymbol = '🛡️';
      }

      const customIcon = L.divIcon({
        className: 'custom-leaflet-marker',
        html: `
          <div class="custom-marker-pin" style="background-color: ${markerBg};" title="${stop.name}">
            <span class="custom-marker-icon">${iconSymbol}</span>
          </div>
        `,
        iconSize: [34, 34],
        iconAnchor: [17, 17],
        popupAnchor: [0, -17],
      });

      const marker = L.marker([stop.lat, stop.lng], { icon: customIcon }).addTo(map);

      // Interactive popup
      const popupHtml = `
        <div class="p-3 text-slate-900 font-sans" style="min-width: 220px; font-family: 'Inter', sans-serif;">
          <div class="flex items-center justify-between mb-1">
            <span style="font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase;">${stop.zone}</span>
            <span style="font-size: 11px; font-weight: 800; background: #e2e8f0; padding: 2px 6px; border-radius: 4px;">${stop.code}</span>
          </div>
          <h4 style="font-size: 13px; font-weight: 800; margin: 0 0 6px 0; color: #0f172a;">${stop.name}</h4>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; font-size: 11px; margin-bottom: 8px;">
            <div style="padding: 2px 6px; border-radius: 4px; background: ${stop.stepFree ? '#dcfce7' : '#fee2e2'}; color: ${stop.stepFree ? '#166534' : '#991b1b'}; font-weight: 700;">
              ${stop.stepFree ? '✓ Step-Free' : '⚠️ Has Stairs'}
            </div>
            <div style="padding: 2px 6px; border-radius: 4px; background: #f1f5f9; color: #334155; font-weight: 600;">
              💡 ${stop.lightingScore}/10 Light
            </div>
            <div style="padding: 2px 6px; border-radius: 4px; background: ${stop.elevatorStatus === 'broken' ? '#fee2e2' : '#f1f5f9'}; color: ${stop.elevatorStatus === 'broken' ? '#991b1b' : '#334155'}; font-weight: 600;">
              🛗 Elev: ${stop.elevatorStatus}
            </div>
            <div style="padding: 2px 6px; border-radius: 4px; background: #f1f5f9; color: #334155; font-weight: 600;">
              👥 ${stop.crowdLevel}
            </div>
          </div>

          <div style="display: flex; gap: 6px; border-top: 1px solid #e2e8f0; padding-top: 6px;">
            <button id="popup-origin-${stop.id}" style="flex: 1; padding: 4px 8px; font-size: 11px; font-weight: 700; background: #10b981; color: white; border: none; border-radius: 6px; cursor: pointer;">
              Set Origin
            </button>
            <button id="popup-dest-${stop.id}" style="flex: 1; padding: 4px 8px; font-size: 11px; font-weight: 700; background: #3b82f6; color: white; border: none; border-radius: 6px; cursor: pointer;">
              Set Dest
            </button>
          </div>

          <div style="margin-top: 4px;">
            <button id="popup-report-${stop.id}" style="width: 100%; padding: 4px 8px; font-size: 10px; font-weight: 700; background: #fef3c7; color: #92400e; border: 1px solid #fde68a; border-radius: 6px; cursor: pointer;">
              ⚠️ Report Barrier or Delay at this Stop
            </button>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);

      marker.on('popupopen', () => {
        const originBtn = document.getElementById(`popup-origin-${stop.id}`);
        const destBtn = document.getElementById(`popup-dest-${stop.id}`);
        const reportBtn = document.getElementById(`popup-report-${stop.id}`);

        if (originBtn) {
          originBtn.onclick = () => {
            onSetOrigin(stop.id);
            marker.closePopup();
          };
        }
        if (destBtn) {
          destBtn.onclick = () => {
            onSetDest(stop.id);
            marker.closePopup();
          };
        }
        if (reportBtn && onReportStop) {
          reportBtn.onclick = () => {
            onReportStop(stop.id);
            marker.closePopup();
          };
        }
      });

      markersRef.current[stop.id] = marker;
    });
  };

  // 3. Render Route Polylines & Auto-Fit Bounds
  React.useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || typeof L === 'undefined') return;

    // Clear previous route polylines
    routeLayersRef.current.forEach(layer => layer.remove());
    routeLayersRef.current = [];

    if (!selectedRoute) return;

    const allPositions: [number, number][] = [];

    selectedRoute.polylines.forEach(poly => {
      const lineLayer = L.polyline(poly.positions, {
        color: poly.color,
        weight: poly.weight,
        dashArray: poly.dashArray || undefined,
        opacity: 0.9,
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(map);

      routeLayersRef.current.push(lineLayer);
      poly.positions.forEach(p => allPositions.push(p));
    });

    // Auto fit bounds to show the entire route
    if (allPositions.length > 0) {
      const bounds = L.latLngBounds(allPositions);
      map.fitBounds(bounds, {
        padding: [50, 50],
        maxZoom: 16,
        animate: true,
      });
    }
  }, [selectedRoute]);

  return (
    <div className="relative w-full h-full min-h-[450px] rounded-2xl overflow-hidden border border-slate-800 shadow-xl bg-slate-950">
      {/* Map DOM Element */}
      <div ref={mapContainerRef} className="w-full h-full min-h-[450px]" />

      {/* Map Legend Overlay */}
      <div className="absolute top-4 right-4 z-10 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-xl p-3 shadow-xl text-xs space-y-1.5 pointer-events-auto max-w-[200px]">
        <div className="font-bold text-white text-[11px] uppercase tracking-wider mb-1 flex items-center justify-between">
          <span>Map Legend</span>
          <span className="text-[10px] text-emerald-400">Live</span>
        </div>
        <div className="flex items-center space-x-2 text-slate-300 text-[11px]">
          <span className="w-3 h-3 rounded-full bg-emerald-500 flex-shrink-0"></span>
          <span>100% Step-Free Hub</span>
        </div>
        <div className="flex items-center space-x-2 text-slate-300 text-[11px]">
          <span className="w-3 h-3 rounded-full bg-emerald-700 flex-shrink-0"></span>
          <span>Safe Lit Corridor</span>
        </div>
        <div className="flex items-center space-x-2 text-slate-300 text-[11px]">
          <span className="w-3 h-3 rounded-full bg-red-500 flex-shrink-0"></span>
          <span>Barrier / Broken Elev</span>
        </div>
        <div className="flex items-center space-x-2 text-slate-300 text-[11px]">
          <span className="w-4 h-0.5 border-t-2 border-dashed border-emerald-400 flex-shrink-0"></span>
          <span>Walking Path</span>
        </div>
      </div>

      {/* Active Route Status Badge on Map */}
      {selectedRoute && (
        <div className="absolute bottom-4 left-4 z-10 bg-slate-900/95 backdrop-blur-md border border-emerald-500/80 rounded-xl p-3 shadow-xl max-w-sm">
          <div className="flex items-center space-x-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-xs font-bold text-white">Visualizing: {selectedRoute.title}</span>
          </div>
          <p className="text-[11px] text-slate-300 line-clamp-1">{selectedRoute.summary}</p>
        </div>
      )}
    </div>
  );
};
