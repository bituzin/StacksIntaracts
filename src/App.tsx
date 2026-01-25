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
          <DayNightSwitch />
        // Day/Night switch component
        import { useState } from 'react';

        function DayNightSwitch() {
          const [day, setDay] = useState(false);
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
                height: 36,
                width: 64,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span style={{ fontSize: 22, marginRight: 8 }}>
                {day ? '🌞' : '🌙'}
              </span>
              <span
                style={{
                  display: 'inline-block',
                  width: 44,
                  height: 24,
                  borderRadius: 12,
                  background: day ? 'var(--accent)' : '#444',
                  position: 'relative',
                  transition: 'background 0.2s',
                }}
              >
                <span
                  style={{
                    position: 'absolute',
                    left: day ? 22 : 2,
                    top: 2,
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    background: '#fff',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
                    transition: 'left 0.2s',
                  }}
                />
              </span>
            </button>
          );
        }
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
