import React from 'react';
import { useStore } from '../lib/store.jsx';
import Zia from '../components/Zia.jsx';

export default function Rules() {
  const { config } = useStore();
  return (
    <div className="screen">
      <div className="hero">
        <Zia size={36} />
        <h1 className="hero-title">HOUSE RULES</h1>
      </div>
      <div className="card rules-text">{config.rules}</div>
      <div className="fine-print">Editable in Settings → Rules.</div>
    </div>
  );
}
