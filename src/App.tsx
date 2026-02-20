import React, { useState } from 'react';
// Day/Night switch component
function DayNightSwitch() {
  const [day, setDay] = useState(false);
  // Add/remove .day-mode class on <body>
  React.useEffect(() => {
    if (day) {
      document.body.classList.add('day-mode');
    } else {
      document.body.classList.remove('day-mode');
    }
  }, [day]);
  return (
    <button
      onClick={() => setDay(d => !d)}
      aria-label="Toggle day/night mode"
      style={{
        position: 'absolute',
        right: 0,
        top: '50%',
        transform: 'translateY(-50%)',
        background: 'none',
        border: 'none',
        outline: 'none',
        cursor: 'pointer',
        padding: 0,
        margin: 0,
        height: 40,
        width: 90,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <span
        style={{
          display: 'inline-block',
          width: 48,
          height: 28,
          borderRadius: 14,
          background: day ? 'var(--accent)' : '#444',
          position: 'relative',
          transition: 'background 0.2s',
          marginRight: 8,
        }}
      >
        <span
          style={{
            position: 'absolute',
            left: day ? 24 : 4,
            top: 4,
            width: 20,
            height: 20,
            borderRadius: '50%',
            background: '#fff',
            boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
            transition: 'left 0.2s',
          }}
        />
      </span>
      <span style={{ display: 'flex', alignItems: 'center' }}>
        {day ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
        )}
      </span>
    </button>
  );
}
import { AppConfig, UserSession, showConnect } from '@stacks/connect';
import { StacksMainnet } from '@stacks/network';

import GMContract from './components/GMContract';
import PostMessage from './components/PostMessage';
import Voting from './components/Voting';
import NameReservation from './components/NameReservation';
import SendToFriend from './components/SendToFriend';
import SendToMany from './components/SendToMany';
import MyInteractions from './components/MyInteractions';
import PostMessageStats from './components/PostMessageStats';
import './App.css';

const appConfig = new AppConfig(['store_write', 'publish_data']);
const userSession = new UserSession({ appConfig });


  const [userData, setUserData] = useState<any>(() => {
    if (userSession.isUserSignedIn()) {
      return userSession.loadUserData();
    }
    return null;
  });
  const [showContracts, setShowContracts] = useState(() => {
    const v = localStorage.getItem('showContracts');
    return v === 'true';
  });
  const [showMyInteractions, setShowMyInteractions] = useState(() => {
    const v = localStorage.getItem('showMyInteractions');
    return v === 'true';
  });
  const [showPostMessageStats, setShowPostMessageStats] = useState(false);

  React.useEffect(() => {
    localStorage.setItem('showContracts', showContracts ? 'true' : 'false');
  }, [showContracts]);
  React.useEffect(() => {
    localStorage.setItem('showMyInteractions', showMyInteractions ? 'true' : 'false');
  }, [showMyInteractions]);

  const connectWallet = () => {
    showConnect({
      appDetails: {
        name: 'Stack Interacts',
        icon: window.location.origin + '/logo.png',
      },
      redirectTo: '/',
      onFinish: () => {
        const data = userSession.loadUserData();
        setUserData(data);
      },
      userSession,
    });
  };

  const disconnectWallet = () => {
    userSession.signUserOut();
    setUserData(null);
    setShowContracts(false);
    setShowMyInteractions(false);
    localStorage.removeItem('showContracts');
    localStorage.removeItem('showMyInteractions');
  };

  const network = new StacksMainnet();

  return (
    <div className="app">
      <header className="header">
        <div style={{ position: 'relative', marginBottom: 8 }}>
          <h1 style={{ margin: 0, textAlign: 'center', width: '100%' }}>⚡ Stack Interacts</h1>
          <DayNightSwitch />
        </div>
        <p>Earn activity on the Stacks network by interacting with smart contracts</p>
      </header>

      <div className="wallet-section">
        {!userData ? (
          <button className="wallet-button" onClick={connectWallet}>
            Connect Wallet
          </button>
        ) : (
          <div className="wallet-info">
            <span>Connected:</span>
            <a
              className="wallet-address"
              href={`https://explorer.stacks.co/address/${userData.profile.stxAddress.mainnet || userData.profile.stxAddress.testnet}?chain=mainnet`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: 'none', color: 'inherit', cursor: 'pointer' }}
            >
              {userData.profile.stxAddress.mainnet || userData.profile.stxAddress.testnet}
            </a>
            <button className="disconnect-button" onClick={disconnectWallet}>
              Disconnect
            </button>
          </div>
        )}
      </div>


      {userData && !showContracts && !showMyInteractions && !showPostMessageStats && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, marginTop: 32 }}>
          <button className="wallet-button" style={{ minWidth: 200, marginBottom: 12 }} onClick={() => { setShowContracts(true); setShowMyInteractions(false); setShowPostMessageStats(false); }}>
            Do something
          </button>
          <button className="wallet-button" style={{ minWidth: 200 }} onClick={() => { setShowMyInteractions(true); setShowContracts(false); setShowPostMessageStats(false); }}>
            My interactions
          </button>
          <button className="wallet-button" style={{ minWidth: 200 }} onClick={() => { setShowPostMessageStats(true); setShowContracts(false); setShowMyInteractions(false); }}>
            Post Message stats
          </button>
        </div>
      )

      {userData && showMyInteractions && (
        <MyInteractions
          stxAddress={userData.profile.stxAddress.mainnet || userData.profile.stxAddress.testnet}
          network={network}
          onBack={() => { setShowMyInteractions(false); setShowContracts(false); setShowPostMessageStats(false); }}
        />
      )}

      {userData && showPostMessageStats && (
        <PostMessageStats
          stxAddress={userData.profile.stxAddress.mainnet || userData.profile.stxAddress.testnet}
          network={network}
          onBack={() => { setShowPostMessageStats(false); setShowContracts(false); setShowMyInteractions(false); }}
        />
      )}


      {userData && showContracts && !showMyInteractions && (
        <>
          <div style={{ display: 'flex', justifyContent: 'center', margin: '16px 0' }}>
            <button className="wallet-button" style={{ minWidth: 200 }} onClick={() => { setShowMyInteractions(true); setShowContracts(false); }}>
              My interactions
            </button>
          </div>
          <div className="contracts-grid">
            <GMContract 
              userSession={userSession} 
              network={network}
              stxAddress={userData.profile.stxAddress.mainnet || userData.profile.stxAddress.testnet}
            />
            <PostMessage 
              userSession={userSession} 
              network={network}
              stxAddress={userData.profile.stxAddress.mainnet || userData.profile.stxAddress.testnet}
            />
            <Voting 
              userSession={userSession} 
              network={network}
              stxAddress={userData.profile.stxAddress.mainnet || userData.profile.stxAddress.testnet}
            />
            <NameReservation 
              userSession={userSession} 
              network={network}
              stxAddress={userData.profile.stxAddress.mainnet || userData.profile.stxAddress.testnet}
            />
            <SendToFriend
              userSession={userSession}
              network={network}
              stxAddress={userData.profile.stxAddress.mainnet || userData.profile.stxAddress.testnet}
            />
            <SendToMany
              userSession={userSession}
              network={network}
              stxAddress={userData.profile.stxAddress.mainnet || userData.profile.stxAddress.testnet}
            />
          </div>
        </>
      )}

      {!userData && (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#999' }}>
          <p style={{ fontSize: '1.2rem' }}>
            👆 Connect your wallet to start interacting with contracts
          </p>
        </div>
      )}

      <footer className="footer">
        <p>Stack Interacts - Your activity on Stacks | 2025</p>
      </footer>
    </div>
  );
}

export default App;
