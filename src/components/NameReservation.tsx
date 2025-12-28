import { useState } from 'react';
import { openContractCall } from '@stacks/connect';
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
  const [name, setName] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const reserveName = async () => {
    if (!name.trim()) {
      setStatus('Wpisz nazwę!');
      return;
    }

    if (name.length < 3) {
      setStatus('Nazwa musi mieć minimum 3 znaki!');
      return;
    }

    if (!/^[a-zA-Z0-9-]+$/.test(name)) {
      setStatus('Nazwa może zawierać tylko litery, cyfry i myślniki!');
      return;
    }

    setLoading(true);
    setStatus('');

    try {
      await openContractCall({
        network,
        anchorMode: AnchorMode.Any,
        contractAddress: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM', // Example address - zmień na właściwy
        contractName: 'name-reservation',
        functionName: 'reserve-name',
        functionArgs: [stringUtf8CV(name.toLowerCase())],
        postConditionMode: PostConditionMode.Allow,
        onFinish: (data) => {
          setStatus(`✅ Nazwa "${name}" zarezerwowana! TX: ${data.txId}`);
          setName('');
          setLoading(false);
        },
        onCancel: () => {
          setStatus('Anulowano');
          setLoading(false);
        },
      });
    } catch (error: any) {
      setStatus(`❌ Błąd: ${error.message}`);
      setLoading(false);
    }
  };

  return (
    <div className="contract-card">
      <h3>🏷️ Name Reservation</h3>
      <p>Reserve a unique name on the Stacks network. Your on-chain identity!</p>
      
      <div className="contract-form">
        <div className="input-group">
          <label htmlFor="name">Your name:</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. my-name"
            maxLength={50}
          />
          <span style={{ fontSize: '0.8rem', color: '#666' }}>
            Min. 3 characters, only letters, numbers and hyphens
          </span>
        </div>

        <button 
          className="contract-button" 
          onClick={reserveName}
          disabled={loading || !name.trim() || name.length < 3}
        >
          {loading ? '⏳ Reserving...' : '🎯 Reserve Name'}
        </button>

        {status && (
          <div className={`status-message ${status.includes('✅') ? 'success' : status.includes('❌') ? 'error' : 'info'}`}>
            {status.replace('Nazwa', 'Name').replace('zarezerwowana', 'reserved').replace('Błąd', 'Error').replace('Anulowano', 'Cancelled')}
          </div>
        )}

        <div style={{ 
          marginTop: '1rem', 
          padding: '0.75rem', 
          background: 'rgba(74, 158, 255, 0.05)', 
          borderRadius: '6px',
          fontSize: '0.85rem',
          color: '#999'
        }}>
          💡 <strong>Tip:</strong> You can release your name and choose a new one at any time if available.
        </div>
      </div>
    </div>
  );
}
