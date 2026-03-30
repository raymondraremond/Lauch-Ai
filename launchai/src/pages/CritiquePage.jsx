import React from 'react';
import CritiqueSubmit from '../components/CritiqueSubmit';

export default function CritiquePage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-void">
      {/* Background Atmosphere */}
      <div className="mesh-glow" />
      <div className="grain-overlay" />
      
      <div className="relative z-10 max-w-[800px] mx-auto pt-24 pb-24 px-6 md:px-8">
        <CritiqueSubmit />
      </div>
    </div>
  );
}
