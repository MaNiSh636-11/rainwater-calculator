import React from 'react';
import { Droplets, Globe, CheckCircle2, CloudRain } from 'lucide-react';

export default function Navbar({ backendConnected }) {
  return (
    <header className="navbar">
      <div className="brand-wrapper">
        <div className="brand-icon">
          <Droplets size={26} strokeWidth={2.4} />
        </div>
        <div>
          <h1 className="brand-title">AquaHarvest Pro</h1>
          <p className="brand-subtitle">Rainwater Harvesting Potential & Storage Calculator</p>
        </div>
      </div>

      <div className="nav-actions">
        <span className="badge-tag badge-sdg">
          <Globe size={14} />
          UN SDGs 6, 11, 12
        </span>
        <span className={`badge-tag ${backendConnected ? 'badge-api' : 'badge-sdg'}`}>
          <CheckCircle2 size={14} color={backendConnected ? '#0284c7' : '#166534'} />
          {backendConnected ? 'API Connected' : 'Ready'}
        </span>
      </div>
    </header>
  );
}
