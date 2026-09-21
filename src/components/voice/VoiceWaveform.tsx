import React from 'react';

interface VoiceWaveformProps {
  data: number[]; // Array of normalized amplitudes (0 to 1)
  isActive: boolean;
  className?: string;
}

export const VoiceWaveform: React.FC<VoiceWaveformProps> = ({
  data,
  isActive,
  className = ''
}) => {
  return (
    <div
      className={`flex items-center justify-center gap-1 h-7 px-2 ${className}`}
      aria-hidden="true"
    >
      {data.map((val, idx) => {
        // Compute height percentage
        const heightPercent = isActive ? Math.max(15, Math.min(100, Math.round(val * 100))) : 20;
        return (
          <span
            key={idx}
            className={`w-1 rounded-full transition-all duration-75 ${
              isActive
                ? 'bg-gradient-to-t from-teal-500 to-cyan-300 shadow-sm shadow-teal-500/50'
                : 'bg-slate-700'
            }`}
            style={{
              height: `${heightPercent}%`,
              transition: 'height 80ms ease-out'
            }}
          />
        );
      })}
    </div>
  );
};
