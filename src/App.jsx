import React, { useState } from 'react';
import { StoreProvider, useStore, useIdentity, supabaseConfigured } from './lib/store.jsx';
import Zia from './components/Zia.jsx';
import Home from './screens/Home.jsx';
import MyCard from './screens/MyCard.jsx';
import Rounds from './screens/Rounds.jsx';
import Scoring from './screens/Scoring.jsx';
import Rules from './screens/Rules.jsx';
import Settings from './screens/Settings.jsx';

export default function App() {
  if (!supabaseConfigured) return <SetupNeeded />;
  return (
    <StoreProvider>
      <Shell />
    </StoreProvider>
  );
}

function Shell() {
  const { config, status } = useStore();
  const [me, setMe] = useIdentity();
  const [tab, setTab] = useState('home');

  if (status === 'error') {
    return (
      <Center>
        <Zia size={56} />
        <h2>Can't reach the database</h2>
        <p className="fine-print">
          Check your connection, then pull to refresh. If this is a fresh deploy, make sure the
          schema.sql was run in Supabase and the env vars are set.
        </p>
      </Center>
    );
  }
  if (!config) {
    return (
      <Center>
        <Zia size={64} spin />
        <p className="fine-print">Loading the Zia Cup…</p>
      </Center>
    );
  }
  if (!me) return <PickPlayer setMe={setMe} />;

  return (
    <div className="app">
      <header className="topbar">
        <Zia size={22} />
        <span className="topbar-title">{(config.eventName || 'Cuck Cup').toUpperCase()}</span>
        <span className="topbar-sub">NM · JULY '26</span>
      </header>
      <main className="content">
        {tab === 'home' && <Home />}
        {tab === 'card' && <MyCard me={me} />}
        {tab === 'rounds' && <Rounds />}
        {tab === 'scoring' && <Scoring />}
        {tab === 'rules' && <Rules />}
        {tab === 'settings' && <Settings me={me} setMe={setMe} />}
      </main>
      <nav className="bottomnav">
        <NavBtn id="home" tab={tab} setTab={setTab} label="Live" icon="◉" />
        <NavBtn id="card" tab={tab} setTab={setTab} label="Card" icon="✎" />
        <NavBtn id="rounds" tab={tab} setTab={setTab} label="Rounds" icon="⛳" />
        <NavBtn id="scoring" tab={tab} setTab={setTab} label="Scoring" icon="∑" />
        <NavBtn id="rules" tab={tab} setTab={setTab} label="Rules" icon="§" />
        <NavBtn id="settings" tab={tab} setTab={setTab} label="Setup" icon="⚙" />
      </nav>
    </div>
  );
}

function NavBtn({ id, tab, setTab, label, icon }) {
  return (
    <button className={`nav-btn ${tab === id ? 'on' : ''}`} onClick={() => setTab(id)}>
      <span className="nav-icon">
        {icon}
        {id === 'home' && <span className="nav-live-dot" />}
      </span>
      <span className="nav-label">{label}</span>
    </button>
  );
}

function PickPlayer({ setMe }) {
  const { config } = useStore();
  return (
    <Center>
      <Zia size={64} />
      <h1 className="hero-title">WHO ARE YOU?</h1>
      <p className="fine-print">Pick your name — this phone will edit your scorecard.</p>
      <div className="pick-grid">
        {config.players.map((p) => (
          <button key={p.id} className="pick-btn" onClick={() => setMe(p.id)}>
            {p.name}
            <span className="hcp">HCP {p.handicap}</span>
          </button>
        ))}
      </div>
    </Center>
  );
}

function SetupNeeded() {
  return (
    <Center>
      <Zia size={64} />
      <h1 className="hero-title">ALMOST THERE</h1>
      <p style={{ maxWidth: 420 }}>
        Supabase isn't connected yet. Set <code>VITE_SUPABASE_URL</code> and{' '}
        <code>VITE_SUPABASE_ANON_KEY</code> (in a local <code>.env</code> or in Vercel →
        Settings → Environment Variables), run <code>supabase/schema.sql</code> in the Supabase
        SQL editor, then redeploy. Full steps are in the README.
      </p>
    </Center>
  );
}

function Center({ children }) {
  return <div className="center-screen">{children}</div>;
}
