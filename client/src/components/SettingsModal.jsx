import React, { useState, useEffect } from 'react';
import { Settings, X, Save, MapPin, RefreshCw, Search, Navigation, Calendar } from 'lucide-react';
import { api } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, Circle, useMapEvents } from 'react-leaflet';

// Fix for default marker icon in react-leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconRetinaUrl: iconRetina,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

export default function SettingsModal({ isOpen, onClose }) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('borrowing');
  const [settings, setSettings] = useState({
    isLocationRequired: false,
    libraryLat: 11.5564,
    libraryLng: 104.9282,
    maxDistance: 500,
    maxBorrowDays: 10
  });

  const [customDays, setCustomDays] = useState('');
  const presetDays = [7, 14, 30];

  const MapClickHandler = () => {
    useMapEvents({
      click(e) {
        setSettings(prev => ({
          ...prev,
          libraryLat: e.latlng.lat,
          libraryLng: e.latlng.lng
        }));
      },
    });
    return null;
  };

  const MapUpdater = ({ lat, lng }) => {
    const map = useMapEvents({});
    useEffect(() => {
      if (lat && lng) {
        map.setView([lat, lng]);
      }
    }, [lat, lng, map]);
    return null;
  };

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const handleSearchLocation = async () => {
    if (!searchQuery.trim()) return;
    try {
      setIsSearching(true);
      setError('');
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      if (data && data.length > 0) {
        const result = data[0];
        setSettings(prev => ({
          ...prev,
          libraryLat: parseFloat(result.lat),
          libraryLng: parseFloat(result.lon)
        }));
      } else {
        setError('Location not found. Please try a different search term.');
      }
    } catch (err) {
      setError('Error searching location.');
    } finally {
      setIsSearching(false);
    }
  };

  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }
    
    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setSettings(prev => ({
          ...prev,
          libraryLat: position.coords.latitude,
          libraryLng: position.coords.longitude
        }));
        setIsGettingLocation(false);
        setError('');
      },
      (err) => {
        setIsGettingLocation(false);
        setError(`Unable to retrieve your location: ${err.message || 'Permission denied or timeout'}`);
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 0 }
    );
  };

  useEffect(() => {
    if (isOpen) {
      loadSettings();
    }
  }, [isOpen]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.getSettings();
      if (res.success && res.settings) {
        setSettings(res.settings);
      }
    } catch (err) {
      setError('Failed to load settings.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : Number(value)
    }));
  };

  const handleSetDuration = (days) => {
    setSettings(prev => ({ ...prev, maxBorrowDays: days }));
  };

  const handleCustomSubmit = () => {
    const val = parseInt(customDays, 10);
    if (!isNaN(val) && val > 0) {
      handleSetDuration(val);
      setCustomDays('');
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');
      const res = await api.updateSettings(settings);
      if (res.success) {
        setSuccess('Settings updated successfully!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(res.message || 'Failed to save settings.');
      }
    } catch (err) {
      setError('An error occurred while saving.');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#050505]/80 backdrop-blur-sm p-0 sm:p-6 animate-fade-in">
      <div className="bg-[#0B0E14] sm:border border-slate-800/80 sm:rounded-2xl w-full h-full sm:h-auto sm:max-h-[90vh] sm:max-w-5xl shadow-2xl flex flex-col relative overflow-hidden">
        
        {/* Header */}
        <div className="p-6 sm:px-8 border-b border-slate-800/60 shrink-0 bg-[#0B0E14]">
           <div className="flex justify-between items-start">
             <div>
               <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-3">
                 <div className="p-2 bg-indigo-500/20 rounded-xl">
                   <Settings className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-400" />
                 </div>
                 {t('settingsTitle', 'System Settings')}
               </h2>
               <p className="text-xs sm:text-sm text-slate-400 mt-2">Configure global variables, application limits, and system-wide behaviors.</p>
             </div>
             <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition">
               <X className="w-6 h-6" />
             </button>
           </div>
           
           {/* Mobile Tabs */}
           <div className="flex gap-2 mt-6 sm:hidden overflow-x-auto pb-2 scrollbar-hide">
              <button 
                onClick={() => setActiveTab('borrowing')}
                className={`whitespace-nowrap px-4 py-2 rounded-lg text-sm font-bold transition flex items-center gap-2 ${activeTab === 'borrowing' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'text-slate-400 bg-slate-800/30'}`}
              >
                 <Calendar className="w-4 h-4" />
                 Borrowing Rules
              </button>
              <button 
                onClick={() => setActiveTab('location')}
                className={`whitespace-nowrap px-4 py-2 rounded-lg text-sm font-bold transition flex items-center gap-2 ${activeTab === 'location' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'text-slate-400 bg-slate-800/30'}`}
              >
                 <MapPin className="w-4 h-4" />
                 Location Setup
              </button>
           </div>
        </div>

        <div className="flex flex-1 overflow-hidden bg-[#0F131A]">
           {/* Sidebar Desktop */}
           <div className="w-64 border-r border-slate-800/60 p-4 space-y-2 shrink-0 overflow-y-auto hidden sm:block bg-[#0B0E14]">
              <button 
                onClick={() => setActiveTab('borrowing')}
                className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 text-sm font-bold transition ${activeTab === 'borrowing' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 border border-transparent'}`}
              >
                 <Calendar className="w-4 h-4" />
                 Borrowing Rules
              </button>
              <button 
                onClick={() => setActiveTab('location')}
                className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 text-sm font-bold transition ${activeTab === 'location' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 border border-transparent'}`}
              >
                 <MapPin className="w-4 h-4" />
                 Location Setup
              </button>
           </div>

           {/* Content */}
           <div className="flex-1 overflow-y-auto p-6 sm:p-8">
             {loading ? (
               <div className="py-12 text-center text-slate-500 animate-pulse flex flex-col items-center justify-center h-full">
                 <RefreshCw className="w-8 h-8 animate-spin mb-4 text-indigo-500/50" />
                 Loading configurations...
               </div>
             ) : (
               <div className="max-w-2xl animate-fade-in space-y-6">
                 {error && <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-sm font-medium">{error}</div>}
                 {success && <div className="p-4 bg-teal-500/10 border border-teal-500/30 rounded-xl text-teal-400 text-sm font-medium">{success}</div>}

                 {activeTab === 'borrowing' && (
                    <div className="bg-[#12161F] border border-slate-800/80 rounded-2xl p-6 shadow-sm">
                       <h3 className="text-base font-bold text-slate-200 flex items-center gap-2 mb-1">
                         <Calendar className="w-5 h-5 text-indigo-400" />
                         Borrowing Durations
                       </h3>
                       <p className="text-sm text-slate-400 mb-8">Select the allowed time students can borrow physical books.</p>
                       
                       <div className="space-y-4">
                          <label className="text-xs font-bold tracking-widest text-slate-500 uppercase">Configured Options</label>
                          <div className="flex flex-wrap gap-3">
                            {presetDays.map(days => {
                              // If a custom day is currently selected that is not in the preset list, 
                              // we still want to show it. We'll handle that dynamically below.
                              const isSelected = settings.maxBorrowDays === days;
                              return (
                                <button
                                  key={days}
                                  onClick={() => handleSetDuration(days)}
                                  className={`px-4 py-2.5 rounded-xl text-sm font-bold transition border ${
                                    isSelected 
                                      ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20' 
                                      : 'bg-slate-800/40 border-slate-700/50 text-slate-300 hover:bg-slate-700 hover:border-slate-600'
                                  }`}
                                >
                                  {days} Days
                                </button>
                              );
                            })}
                            
                            {/* Render active custom day if not in presets */}
                            {!presetDays.includes(settings.maxBorrowDays) && settings.maxBorrowDays > 0 && (
                                <button
                                  className="px-4 py-2.5 rounded-xl text-sm font-bold transition border bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20"
                                >
                                  {settings.maxBorrowDays} Days
                                </button>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-800/60">
                             <input 
                               type="number"
                               min="1"
                               value={customDays}
                               onChange={(e) => setCustomDays(e.target.value)}
                               onKeyDown={(e) => e.key === 'Enter' && handleCustomSubmit()}
                               placeholder="e.g. 7"
                               className="w-24 bg-[#0B0E14] border border-slate-700 rounded-xl px-4 py-2.5 text-sm font-bold text-white focus:outline-none focus:border-indigo-500"
                             />
                             <div className="bg-[#0B0E14] border border-slate-700 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-400 select-none flex-1 max-w-[120px]">
                               Days
                             </div>
                             <button
                               onClick={handleCustomSubmit}
                               disabled={!customDays}
                               className="px-6 py-2.5 bg-indigo-500 hover:bg-indigo-400 disabled:bg-slate-800 disabled:text-slate-500 text-white text-sm font-bold rounded-xl transition"
                             >
                               Add
                             </button>
                          </div>
                       </div>
                    </div>
                 )}

                 {activeTab === 'location' && (
                   <div className="space-y-6">
                     <div className="bg-[#12161F] border border-slate-800/80 rounded-2xl p-6 shadow-sm flex items-start justify-between gap-4">
                       <div>
                         <h3 className="text-base font-bold text-slate-200">Require Geolocation</h3>
                         <p className="text-sm text-slate-400 mt-1">Users must be near the library coordinates to successfully check in.</p>
                       </div>
                       <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                         <input
                           type="checkbox"
                           name="isLocationRequired"
                           checked={settings.isLocationRequired}
                           onChange={handleChange}
                           className="sr-only peer"
                         />
                         <div className="w-12 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500"></div>
                       </label>
                     </div>

                     {settings.isLocationRequired && (
                       <div className="bg-[#12161F] border border-slate-800/80 rounded-2xl p-6 shadow-sm animate-fade-in space-y-6">
                          <h3 className="text-base font-bold text-slate-200 flex items-center gap-2">
                             <MapPin className="w-5 h-5 text-indigo-400" />
                             Library Geofence Settings
                          </h3>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Latitude</label>
                              <input
                                type="number"
                                name="libraryLat"
                                value={settings.libraryLat}
                                onChange={handleChange}
                                className="w-full bg-[#0B0E14] border border-slate-700 rounded-xl px-4 py-2.5 text-sm font-medium text-white focus:outline-none focus:border-indigo-500"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Longitude</label>
                              <input
                                type="number"
                                name="libraryLng"
                                value={settings.libraryLng}
                                onChange={handleChange}
                                className="w-full bg-[#0B0E14] border border-slate-700 rounded-xl px-4 py-2.5 text-sm font-medium text-white focus:outline-none focus:border-indigo-500"
                              />
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Max Allowed Distance (Meters)</label>
                            <input
                              type="number"
                              name="maxDistance"
                              value={settings.maxDistance}
                              onChange={handleChange}
                              className="w-full bg-[#0B0E14] border border-slate-700 rounded-xl px-4 py-2.5 text-sm font-medium text-white focus:outline-none focus:border-indigo-500 max-w-xs"
                            />
                          </div>

                          {/* Map Preview */}
                          <div className="pt-4 border-t border-slate-800/60">
                             <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Map Preview & Search</label>
                             <div className="flex gap-2 mb-3">
                                <input
                                  type="text"
                                  value={searchQuery}
                                  onChange={(e) => setSearchQuery(e.target.value)}
                                  onKeyDown={(e) => e.key === 'Enter' && handleSearchLocation()}
                                  placeholder="Search location..."
                                  className="flex-1 bg-[#0B0E14] border border-slate-700 rounded-xl px-4 py-2 text-sm font-medium text-white focus:outline-none focus:border-indigo-500"
                                />
                                <button
                                  onClick={handleSearchLocation}
                                  disabled={isSearching}
                                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-white transition disabled:opacity-50"
                                >
                                  {isSearching ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                                </button>
                                <button
                                  onClick={handleGetCurrentLocation}
                                  disabled={isGettingLocation}
                                  className="px-4 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 rounded-xl transition disabled:opacity-50"
                                >
                                  {isGettingLocation ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Navigation className="w-4 h-4" />}
                                </button>
                             </div>
                             
                             <div className="rounded-xl overflow-hidden border border-slate-700/80 h-[250px] relative z-0">
                                <MapContainer 
                                  center={[settings.libraryLat || 11.5564, settings.libraryLng || 104.9282]} 
                                  zoom={16} 
                                  style={{ height: '100%', width: '100%' }}
                                >
                                  <TileLayer
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    attribution='&copy; OpenStreetMap'
                                  />
                                  <MapUpdater lat={settings.libraryLat} lng={settings.libraryLng} />
                                  <MapClickHandler />
                                  <Marker position={[settings.libraryLat || 11.5564, settings.libraryLng || 104.9282]} />
                                  {settings.maxDistance > 0 && (
                                    <Circle
                                      center={[settings.libraryLat || 11.5564, settings.libraryLng || 104.9282]}
                                      pathOptions={{ fillColor: '#6366f1', color: '#4f46e5', fillOpacity: 0.2 }}
                                      radius={settings.maxDistance}
                                    />
                                  )}
                                </MapContainer>
                             </div>
                          </div>
                       </div>
                     )}
                   </div>
                 )}

               </div>
             )}
           </div>
        </div>
        
        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-800/60 bg-[#0B0E14] shrink-0 flex justify-end gap-3 z-10">
            <button 
              onClick={onClose} 
              className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-300 hover:bg-slate-800 transition"
            >
              {t('closeBtn', 'Cancel')}
            </button>
            <button 
              onClick={handleSave} 
              disabled={saving || loading}
              className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-600/20"
            >
               {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
               {t('saveChangesBtn', 'Save Changes')}
            </button>
        </div>

      </div>
    </div>
  );
}
