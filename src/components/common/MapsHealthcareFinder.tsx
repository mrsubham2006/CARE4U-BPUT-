import React, { useState } from 'react';
import {
  MapPin,
  Search,
  Navigation,
  Hospital,
  Pill,
  Activity,
  Phone,
  ExternalLink,
  RefreshCw,
  Sparkles,
  Compass,
  AlertCircle
} from 'lucide-react';
import { callGeminiMapsGrounding } from '../../services/geminiService';

interface MapsHealthcareFinderProps {
  className?: string;
  defaultLocation?: string;
}

export const MapsHealthcareFinder: React.FC<MapsHealthcareFinderProps> = ({
  className = '',
  defaultLocation = 'Pune, Maharashtra'
}) => {
  const [locationInput, setLocationInput] = useState(defaultLocation);
  const [facilityType, setFacilityType] = useState('Hospital');
  const [specialty, setSpecialty] = useState('Emergency / General');
  const [searchQuery, setSearchQuery] = useState('Nearest 24x7 Emergency Hospitals and ICUs');
  const [isLoading, setIsLoading] = useState(false);
  const [resultText, setResultText] = useState<string | null>(null);
  const [groundingData, setGroundingData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await callGeminiMapsGrounding(
        searchQuery,
        locationInput,
        facilityType,
        specialty
      );

      setResultText(res.text);
      setGroundingData(res.groundingMetadata);
    } catch (err: any) {
      setError(err.message || 'Failed to retrieve grounded facility locations.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setLocationInput(`GPS (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`);
      },
      (err) => {
        setError(`Unable to retrieve GPS coordinates: ${err.message}`);
      }
    );
  };

  return (
    <div className={`p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center">
            <Compass className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white font-display">Healthcare Facility Locator</h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-mono">
                Google Maps Grounding
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Grounded real-world verified health centres & emergency facilities</p>
          </div>
        </div>

        <button
          onClick={handleUseCurrentLocation}
          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-medium flex items-center gap-1.5 transition cursor-pointer"
        >
          <Navigation className="w-3.5 h-3.5" />
          <span>Use My GPS Location</span>
        </button>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="text-[11px] text-slate-400 font-medium">Location / City</label>
          <div className="relative mt-1">
            <MapPin className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              value={locationInput}
              onChange={(e) => setLocationInput(e.target.value)}
              placeholder="e.g. Pune, Mumbai, Sangli"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
            />
          </div>
        </div>

        <div>
          <label className="text-[11px] text-slate-400 font-medium">Facility Type</label>
          <select
            value={facilityType}
            onChange={(e) => setFacilityType(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-400 mt-1 cursor-pointer"
          >
            <option value="Hospital">Hospital / Trauma Center</option>
            <option value="Primary Health Centre">Primary Health Centre (PHC)</option>
            <option value="Pharmacy">24/7 Pharmacy / Jan Aushadhi</option>
            <option value="Diagnostic Lab">Pathology & Radiology Lab</option>
            <option value="Blood Bank">Blood Bank</option>
          </select>
        </div>

        <div>
          <label className="text-[11px] text-slate-400 font-medium">Specialty / Emergency Need</label>
          <select
            value={specialty}
            onChange={(e) => setSpecialty(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-400 mt-1 cursor-pointer"
          >
            <option value="Emergency / General">Emergency / General Ward</option>
            <option value="Cardiology">Cardiology / Cath Lab</option>
            <option value="Pediatrics">Pediatrics & Neonatal ICU</option>
            <option value="Orthopedics">Orthopedics & Trauma</option>
            <option value="Maternity">Maternity & Gynecology</option>
          </select>
        </div>
      </div>

      {/* Query Bar & Action */}
      <div className="flex flex-col sm:flex-row items-center gap-2">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search specific medical requirements (e.g. ICU bed with ventilator, anti-venom supply)..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
          />
        </div>

        <button
          onClick={handleSearch}
          disabled={isLoading}
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition cursor-pointer disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Grounding with Maps...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" />
              <span>Find Grounded Facilities</span>
            </>
          )}
        </button>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-500/40 text-xs text-rose-200 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Result Display */}
      {resultText && (
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
            <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider font-mono">
              📍 Grounded Healthcare Intelligence
            </span>
            <span className="text-[10px] text-slate-400 font-mono">gemini-3.5-flash + Google Maps Tool</span>
          </div>

          <div className="text-xs sm:text-sm text-slate-200 whitespace-pre-wrap leading-relaxed">
            {resultText}
          </div>

          {groundingData && (
            <div className="pt-2 border-t border-slate-800/60 flex items-center gap-2 text-[11px] text-slate-400">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Information grounded against verified Google Maps geographical places.</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
