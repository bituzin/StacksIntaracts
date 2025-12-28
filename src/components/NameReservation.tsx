import { useState } from 'react';
import { createPortal } from 'react-dom';
import { openContractCall } from '@stacks/connect';
import { checkNameAvailable } from '../utils/getNameStatus';
import {
  AnchorMode,
  PostConditionMode,
  stringUtf8CV,
} from '@stacks/transactions';


interface NameReservationProps {
  userSession: any;
  network: any;
  stxAddress: string;
}

export default function NameReservation({ userSession, network, stxAddress }: NameReservationProps) {

  const [showPopup, setShowPopup] = useState(false);
  const [name, setName] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const checkName = async () => {
    if (!name.trim()) {
      setStatus('Enter a name!');
      return;
    }
    if (name.length < 3) {
      setStatus('Name must be at least 3 characters!');
      return;
    }
    if (!/^[a-zA-Z0-9-]+$/.test(name)) {
      setStatus('Name can only contain letters, numbers, and hyphens!');
      return;
    }
    setLoading(true);
    setStatus('');
    try {
      const available = await checkNameAvailable(name);
      if (available) {
        setStatus('✅ Name is available!');
      } else {
        setStatus('❌ Name is already taken.');
      }
    } catch (error: any) {
      setStatus(`❌ Error: ${error.message}`);
    }
    setLoading(false);
  };

  return (
    <div className="contract-card">
      <h3>🏷️ Get Name</h3>
      <p>Reserve a unique name on the Stacks network. Your on-chain identity!</p>
      <div className="contract-form">
        <button className="contract-button" onClick={() => setShowPopup(true)}>
          🏷️ Get Name
        </button>
      </div>

      {showPopup && createPortal(
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.6)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onClick={() => { setShowPopup(false); setStatus(''); setName(''); }}
        >
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 10,
              padding: 24,
              minWidth: 320,
              maxWidth: '90vw',
              boxShadow: '0 8px 32px rgba(0,0,0,0.5)'
            }}
            onClick={(event) => event.stopPropagation()}
          >
            <h3 style={{marginBottom: 8}}>Reserve your name</h3>
            <p style={{marginBottom: 16, color: '#aaa', fontSize: 14}}>
              Enter a unique name (min. 3 characters, only letters, numbers and hyphens).<br/>
              You can release your name and choose a new one at any time if available.
            </p>
            <div className="input-group">
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. my-name"
                maxLength={50}
                style={{marginBottom: 8}}
              />
            </div>
            <div className="contract-form" style={{marginTop: 12}}>
              <button
                className="contract-button"
                onClick={checkName}
                disabled={loading || !name.trim() || name.length < 3}
                style={{width: '100%'}}
              >
                {loading ? '⏳ Checking...' : '🔍 Check'}
              </button>
              <button
                className="contract-button"
                style={{background: '#333', color: '#fff', width: '100%'}}
                onClick={() => { setShowPopup(false); setStatus(''); setName(''); }}
              >
                Cancel
              </button>
            </div>
            {status && (
              <div className={`status-message ${status.includes('✅') ? 'success' : status.includes('❌') ? 'error' : 'info'}`} style={{marginTop: 10}}>
                {status}
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
