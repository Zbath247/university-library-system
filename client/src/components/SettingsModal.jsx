import React, { useState, useEffect } from 'react';
import { Settings, X, Save, MapPin, RefreshCw } from 'lucide-react';
import { api } from '../services/api';

export default function SettingsModal({ isOpen, onClose }) {
  const [settings, setSettings] = useState({
    isLocationRequired: false,
    libraryLat: 11.5564,
    libraryLng: 104.9282,
    maxDistance: 500
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-md shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-800/40 rounded-t-2xl">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-teal-400" />
            System Settings
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-6 flex-1">
          {loading ? (
            <div className="py-8 text-center text-slate-400 animate-pulse">Loading settings...</div>
          ) : (
            <>
              {error && <div className="p-3 bg-rose-500/20 border border-rose-500/50 rounded-xl text-rose-400 text-sm">{error}</div>}
              {success && <div className="p-3 bg-teal-500/20 border border-teal-500/50 rounded-xl text-teal-400 text-sm">{success}</div>}

              {/* Toggle Location Requirement */}
              <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-xl flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-200">Require Geolocation</h3>
                  <p className="text-xs text-slate-400 mt-1">Users must be near the library to check in.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="isLocationRequired"
                    checked={settings.isLocationRequired}
                    onChange={handleChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-500"></div>
                </label>
              </div>

              {/* Coordinates Settings */}
              {settings.isLocationRequired && (
                <div className="space-y-4 p-4 bg-slate-800/30 border border-slate-700/50 rounded-xl animate-fade-in">
                  <h3 className="text-sm font-bold text-slate-300 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-sky-400" />
                    Library Location
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs text-slate-400 font-medium">Latitude</label>
                      <input
                        type="number"
                        name="libraryLat"
                        value={settings.libraryLat}
                        onChange={handleChange}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-slate-400 font-medium">Longitude</label>
                      <input
                        type="number"
                        name="libraryLng"
                        value={settings.libraryLng}
                        onChange={handleChange}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-slate-400 font-medium">Max Distance (meters)</label>
                    <input
                      type="number"
                      name="maxDistance"
                      value={settings.maxDistance}
                      onChange={handleChange}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-500"
                    />
                    <p className="text-[10px] text-slate-500">How close the user needs to be to check in.</p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 flex justify-end gap-3 bg-slate-800/40 rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-medium text-slate-300 bg-slate-700/50 hover:bg-slate-700 transition"
          >
            Close
          </button>
          <button
            onClick={handleSave}
            disabled={saving || loading}
            className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold text-slate-950 bg-teal-500 hover:bg-teal-400 transition disabled:opacity-50"
          >
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Changes
          </button>
        </div>

      </div>
    </div>
  );
}
