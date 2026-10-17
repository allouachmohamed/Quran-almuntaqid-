import React, { useState, useEffect } from 'react';
import { Compass, MapPin, Info, ArrowUp, Navigation } from 'lucide-react';
import { CityLocation } from '../types/quran';
import { calculateQibla } from '../services/prayerService';

interface QiblaCompassProps {
  location: CityLocation;
}

export const QiblaCompass: React.FC<QiblaCompassProps> = ({ location }) => {
  const [deviceHeading, setDeviceHeading] = useState<number | null>(null);
  const [manualOffset, setManualOffset] = useState<number>(0);

  const qiblaData = calculateQibla(location.latitude, location.longitude);

  useEffect(() => {
    const handleOrientation = (e: DeviceOrientationEvent) => {
      // webkitCompassHeading for iOS Safari, alpha for standard Android
      let heading: number | null = null;
      const webkitEvent = e as unknown as { webkitCompassHeading?: number };

      if (typeof webkitEvent.webkitCompassHeading !== 'undefined') {
        heading = webkitEvent.webkitCompassHeading;
      } else if (e.alpha !== null) {
        heading = (360 - e.alpha) % 360;
      }

      if (heading !== null) {
        setDeviceHeading(Math.round(heading));
      }
    };

    window.addEventListener('deviceorientation', handleOrientation, true);
    return () => {
      window.removeEventListener('deviceorientation', handleOrientation, true);
    };
  }, []);

  // Needle angle relative to current phone orientation (or manual offset if stationary)
  const currentHeading = deviceHeading !== null ? deviceHeading : manualOffset;
  const needleRotation = (qiblaData.directionDegrees - currentHeading + 360) % 360;

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-24 text-center">
      {/* Header Info */}
      <div className="p-6 sm:p-8 rounded-3xl bg-emerald-950 border border-emerald-900 shadow-md">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 mb-2">
          <Compass className="w-6 h-6" />
        </div>

        <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Qibla Direction
        </h2>

        <p className="mt-1 text-sm text-emerald-300">
          Bearing towards the Holy Kaaba in Makkah al-Mukarramah
        </p>

        <div className="mt-4 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-900/60 border border-emerald-800 text-xs text-emerald-200">
          <MapPin className="w-3.5 h-3.5 text-amber-400" />
          <span>From {location.name}, {location.country}</span>
        </div>
      </div>

      {/* Main Interactive Compass Dial Card */}
      <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-emerald-950 via-emerald-950/90 to-emerald-900/60 border border-emerald-900 shadow-2xl relative overflow-hidden flex flex-col items-center">
        {/* Degrees and Distance readout */}
        <div className="grid grid-cols-2 gap-4 w-full max-w-sm mb-8 text-center">
          <div className="p-3.5 rounded-2xl bg-emerald-900/50 border border-emerald-800">
            <span className="text-xs text-emerald-400 block font-mono">Qibla Angle</span>
            <span className="text-2xl font-bold text-amber-400 font-mono tracking-tight">
              {qiblaData.directionDegrees}°
            </span>
            <span className="text-[11px] text-emerald-300 block font-mono mt-0.5">
              {qiblaData.compassDirection}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-emerald-900/50 border border-emerald-800">
            <span className="text-xs text-emerald-400 block font-mono">Distance to Kaaba</span>
            <span className="text-2xl font-bold text-white font-mono tracking-tight">
              {qiblaData.distanceKm.toLocaleString()}
            </span>
            <span className="text-[11px] text-emerald-300 block font-mono mt-0.5">
              Kilometers
            </span>
          </div>
        </div>

        {/* Visual Dial Container */}
        <div className="relative w-64 h-64 sm:w-72 sm:h-72 my-2">
          {/* Compass outer ring with cardinal markers */}
          <div className="absolute inset-0 rounded-full border-4 border-emerald-800/80 bg-emerald-950/80 shadow-inner flex items-center justify-center">
            {/* Cardinal marks */}
            <span className="absolute top-2.5 text-xs font-mono font-bold text-amber-400">N</span>
            <span className="absolute right-3.5 text-xs font-mono font-bold text-emerald-400">E</span>
            <span className="absolute bottom-2.5 text-xs font-mono font-bold text-emerald-400">S</span>
            <span className="absolute left-3.5 text-xs font-mono font-bold text-emerald-400">W</span>

            {/* Inner concentric ring */}
            <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-full border border-emerald-800/60 flex items-center justify-center">
              <div className="w-32 h-32 rounded-full border border-dashed border-emerald-800/40 flex items-center justify-center">
                <span className="font-serif text-lg text-emerald-700/60 select-none">
                  القبلة
                </span>
              </div>
            </div>
          </div>

          {/* Rotating Qibla Needle */}
          <div
            className="absolute inset-0 flex items-center justify-center transition-transform duration-500 ease-out"
            style={{ transform: `rotate(${needleRotation}deg)` }}
          >
            {/* Qibla Indicator Arm */}
            <div className="w-1.5 h-28 bg-gradient-to-t from-transparent via-amber-400 to-amber-300 rounded-full -translate-y-14 shadow-lg shadow-amber-400/30 flex flex-col items-center justify-start">
              {/* Kaaba emblem at tip */}
              <div className="w-7 h-7 -mt-4 bg-emerald-950 border-2 border-amber-400 rounded-lg flex items-center justify-center shadow-md">
                <span className="text-amber-400 text-xs font-bold leading-none">🕋</span>
              </div>
            </div>
          </div>

          {/* Compass Center Pivot */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-4 h-4 rounded-full bg-amber-400 border-2 border-emerald-950 shadow-md" />
          </div>
        </div>

        {/* Heading Alignment Indicator */}
        <div className="mt-6 flex items-center gap-2 text-xs text-emerald-300">
          <Navigation className="w-4 h-4 text-amber-400" />
          <span>
            {deviceHeading !== null
              ? `Live compass sensor active (Heading: ${deviceHeading}°)`
              : `Point your device top towards ${qiblaData.directionDegrees}° ${qiblaData.compassDirection}`}
          </span>
        </div>

        {/* Manual heading calibrator for laptops / stationary devices */}
        {deviceHeading === null && (
          <div className="mt-4 w-full max-w-xs space-y-1">
            <div className="flex justify-between text-[11px] text-emerald-400 font-mono">
              <span>Orient Compass:</span>
              <span>{manualOffset}°</span>
            </div>
            <input
              type="range"
              min="0"
              max="359"
              value={manualOffset}
              onChange={(e) => setManualOffset(parseInt(e.target.value, 10))}
              className="w-full h-1 bg-emerald-900 rounded-lg appearance-none cursor-pointer accent-amber-400"
            />
          </div>
        )}
      </div>

      {/* Instructions Card */}
      <div className="p-4 sm:p-5 rounded-2xl bg-emerald-950/60 border border-emerald-900 text-left text-xs text-emerald-300/90 space-y-2">
        <div className="flex items-center gap-2 text-amber-400 font-medium">
          <Info className="w-4 h-4" />
          <span>How to align accurately</span>
        </div>
        <p className="leading-relaxed">
          Hold your device flat on a level surface away from magnetic interference (e.g. laptop chargers, metallic objects). Turn the device until the needle with the Kaaba symbol points directly upward. You are now facing the Qibla.
        </p>
      </div>
    </div>
  );
};
