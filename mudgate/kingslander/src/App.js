/*  App.js  */
/*  src/App.js  */
import React, { useEffect, useState } from 'react';
import { keycloak, initKeycloak } from './auth';
import logo from './logo.svg';
import './App.css';

/* ────────── PKCE helpers ────────── */
function base64url(bytes) {
  return btoa(String.fromCharCode(...bytes))
           .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function genVerifier() {
  const bytes = new Uint8Array(32);     // 32 bytes → 43 chars
  crypto.getRandomValues(bytes);
  return base64url(bytes);
}
async function genChallenge(verifier) {
  const digest = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(verifier)
  );
  return base64url(new Uint8Array(digest));
}
/* ─────────────────────────────────── */

function handleLogout() {
  const authUrl  = process.env.REACT_APP_AUTH_URL;
  const clientId = process.env.REACT_APP_AUTH_CLIENT_ID;

  // replace …/auth with …/logout and add redirect back to kings‑lander
  const logoutUrl =
    authUrl.replace(/\/auth$/, '/logout') +
    `?client_id=${clientId}` +
    `&post_logout_redirect_uri=${encodeURIComponent(window.location.origin)}`;

  window.location.href = logoutUrl;
}

export default function App() {
  const [ready, setReady] = useState(false);       // adapter finished
  const [loggedIn, setLoggedIn] = useState(false);
  const [username, setUsername] = useState(null);

  useEffect(() => {
    initKeycloak().then(authenticated => {
      if (authenticated) {
        setLoggedIn(true);
        setUsername(keycloak.tokenParsed.given_name || keycloak.tokenParsed.preferred_username);
      }
      setReady(true);
    });
  }, []);

  /* 1️⃣  Handle the /callback?code=… return */
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    if (p.has('code')) {
      window.history.replaceState({}, '', '/');   // tidy address bar
      setLoggedIn(true);
    }
    if (p.has('error')) {
      window.history.replaceState({}, '', '/');   // clear stray errors
    }
  }, []);

  /* 2️⃣  Click‑anywhere → Keycloak (only if not already logged in) */
  useEffect(() => {
    if (ready && !loggedIn) {                         // only in pre‑login view
      const handleClick = () => keycloak.login();     // starts OAuth2
      window.addEventListener('click', handleClick);
      return () => window.removeEventListener('click', handleClick);
    }
  }, [ready, loggedIn]);

  if (!ready) {
    return (
      <header className="App-header-loading">
        <p className="headline">(sizing you up...)</p>
      </header>
    );
  }

  /* 3️⃣  UI */
  return (
    <div className="App">
      {loggedIn ? (
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <p className="headline">Bernard VIP Lounge</p>
          <p className="tagline">welcome, {username || 'insider'}.</p>

          {/* NEW logout control */}
          <button className="logout-btn" onClick={handleLogout}>
            way out
          </button>
        </header>
      ) : (
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <p className="headline">Welcome to Bernard Labs.</p>
          <p className="tagline">We build creative, elegant software solutions for systematic and
            quantitative investment strategies.</p>
          <p className="paren">(airspace is restricted beyond this point)</p>
        </header>
      )}
    </div>
  );
}


/* npm install            */
/* npm run build          */
/* npm install -g serve   */
/* serve -s build -l 3000 */

/* ---- IN GIT BASH ---- */
/* scp -r build/. root@mudgate:/opt/mudgate/kingslander/ */
