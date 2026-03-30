import React from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import CritiqueSubmit from '../components/CritiqueSubmit';

export default function CritiquePage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-void">
      <Navbar minimal />
      <Sidebar />
      
      {/* Background Atmosphere */}
      <div className="mesh-glow" />
      <div className="grain-overlay" />
      
      <main className="relative z-10 ml-[220px] pt-[76px] pb-24 px-6 md:px-8">
        <div className="max-w-[800px] mx-auto">
          <CritiqueSubmit />
        </div>
      </main>
    </div>
  );
}
