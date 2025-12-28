
import { useState } from 'react';
import { createPortal } from 'react-dom';
import { openContractCall } from '@stacks/connect';
import { AnchorMode, PostConditionMode, stringAsciiCV } from '@stacks/transactions';

interface VotingProps {
  userSession: any;
  network: any;
  stxAddress: string;
}

export default function Voting({ userSession, network, stxAddress }: VotingProps) {
  const [showPopup, setShowPopup] = useState(false);
  const [pollTitle, setPollTitle] = useState('');
  const [loading, setLoading] = useState(false);

  const createVote = async () => {
    if (!pollTitle.trim()) return;
    setLoading(true);
    try {
      await openContractCall({
        network,
        anchorMode: AnchorMode.Any,
        contractAddress: 'SP2Z3M34KEKC79TMRMZB24YG30FE25JPN83TPZSZ2',
        contractName: 'votingv1',
        functionName: 'create-vote',
        functionArgs: [stringAsciiCV(pollTitle)],
        postConditionMode: PostConditionMode.Allow,
        onFinish: () => {
          setPollTitle('');
          setShowPopup(false);
          setLoading(false);
        },
        onCancel: () => setLoading(false),
      });
    } catch (e) {
      setLoading(false);
    }
  };

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

      {showPopup && createPortal(
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.6)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onClick={() => setShowPopup(false)}
        >
          <div
            style={{
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
              justifyContent: 'center'
            }}
            onClick={(event) => event.stopPropagation()}
          >
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
            <div className="input-group" style={{ width: '100%' }}>
              <label htmlFor="pollTitle">Poll title:</label>
              <input
                id="pollTitle"
                type="text"
                value={pollTitle}
                onChange={(event) => setPollTitle(event.target.value)}
                placeholder="e.g. Should we upgrade?"
                style={{ width: '100%', marginBottom: 8 }}
                disabled={loading}
              />
            </div>
            <button
              className="contract-button"
              onClick={createVote}
              disabled={loading || !pollTitle.trim()}
              style={{ width: '100%', marginTop: 10 }}
            >
              {loading ? '⏳ Creating...' : 'Create vote'}
            </button>
            <button
              className="contract-button"
              onClick={() => setShowPopup(false)}
              style={{ width: '100%', marginTop: 10 }}
              disabled={loading}
            >
              Close
            </button>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
