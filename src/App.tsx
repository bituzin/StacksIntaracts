import { useState } from 'react';
import { AppConfig, UserSession, showConnect } from '@stacks/connect';
import { StacksMainnet } from '@stacks/network';
import GMContract from './components/GMContract';
import PostMessage from './components/PostMessage';
import Voting from './components/Voting';
import NameReservation from './components/NameReservation';
import SendToFriend from './components/SendToFriend';
import SendToMany from './components/SendToMany';
import './App.css';

const appConfig = new AppConfig(['store_write', 'publish_data']);
const userSession = new UserSession({ appConfig });

function App() {
  const [userData, setUserData] = useState<any>(() => {
    if (userSession.isUserSignedIn()) {
      return userSession.loadUserData();
    }
    return null;
  });

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
  };

  const network = new StacksMainnet();

  return (
    <div className="app">
      <header className="header">
        <div style={{ position: 'relative', marginBottom: 8 }}>
          <h1 style={{ margin: 0, textAlign: 'center', width: '100%' }}>⚡ Stack Interacts</h1>
          <button
            style={{
              position: 'absolute',
              right: 0,
              top: '50%',
              transform: 'translateY(-50%)',
              padding: '6px 16px',
              fontSize: 16,
              borderRadius: 6,
              border: '1px solid var(--accent)',
              background: 'var(--bg-card)',
              color: 'var(--accent)',
              fontWeight: 600,
              boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
              cursor: 'pointer',
              transition: 'background 0.2s, color 0.2s',
            }}
            // TODO: podłącz logikę dayMode globalnie jeśli potrzebujesz
            onClick={() => {}}
            onMouseOver={e => {
              (e.currentTarget as HTMLButtonElement).style.background = 'var(--accent)';
              (e.currentTarget as HTMLButtonElement).style.color = 'var(--bg-card)';
            }}
            onMouseOut={e => {
              (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-card)';
              (e.currentTarget as HTMLButtonElement).style.color = 'var(--accent)';
            }}
          >
            Day mode
          </button>
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

      {userData && (
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
