
import { useState } from 'react';

interface VotingProps {
  userSession: any;
  network: any;
  stxAddress: string;
}

export default function Voting({ userSession, network, stxAddress }: VotingProps) {
  const [showPopup, setShowPopup] = useState(false);

  return (
    <div className="contract-card">
      <h3>🗳️ Voting</h3>
      <p>Create or participate in a poll on the Stacks blockchain.</p>
      <div className="contract-form">
        <button
          className="contract-button"
          onClick={() => setShowPopup(true)}
        >
          🗳️ Create vote
        </button>
      </div>

      {showPopup && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.6)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <div style={{
            position: 'relative',
            background: 'var(--bg-card)',
            border: '1px solid var(--accent)',
            borderRadius: 10,
            padding: '2rem 1.5rem 1.5rem 1.5rem',
            minWidth: 320,
            maxWidth: 400,
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            color: 'var(--text-primary)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <button
              onClick={() => setShowPopup(false)}
              style={{
                position: 'absolute',
                top: 10,
                right: 10,
                background: 'none',
                border: 'none',
                color: 'var(--accent)',
                fontSize: 22,
                cursor: 'pointer',
                fontWeight: 700
              }}
              aria-label="Close"
            >
              ×
            </button>
            <h4 style={{ color: 'var(--accent)', marginBottom: 10 }}>Voting details</h4>
            {/* Add voting details form here */}
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: 10 }}>
              Here you will be able to set poll details and vote.
            </div>
            <button
              className="contract-button"
              onClick={() => setShowPopup(false)}
              style={{ width: '100%', marginTop: 10 }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
