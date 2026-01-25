import { useState } from 'react';
import { createPortal } from 'react-dom';
import { openContractCall } from '@stacks/connect';
import { AnchorMode, PostConditionMode, stringUtf8CV, uintCV } from '@stacks/transactions';

interface SendToFriendProps {
  userSession: any;
  network: any;
  stxAddress: string;
}

export default function SendToFriend({ userSession, network, stxAddress }: SendToFriendProps) {
  const [showPopup, setShowPopup] = useState(false);
  const [friendAddress, setFriendAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [dayMode, setDayMode] = useState(false); // day mode switch

  const sendToFriend = async () => {
    if (!friendAddress.trim()) {
      setStatus('Enter a Stacks address!');
      return;
    }
    if (!/^S[0-9A-Z]{38}$/.test(friendAddress)) {
      setStatus('Invalid Stacks address!');
      return;
    }
    if (!amount.trim() || isNaN(Number(amount)) || Number(amount) <= 0) {
      setStatus('Enter a valid amount!');
      return;
    }
    setLoading(true);
    setStatus('');
    try {
      await openContractCall({
        network,
        anchorMode: AnchorMode.Any,
        contractAddress: 'SP2Z3M34KEKC79TMRMZB24YG30FE25JPN83TPZSZ2',
        contractName: 'sending-003',
        functionName: 'send-stx',
        functionArgs: [stringUtf8CV(friendAddress), uintCV(Math.round(Number(amount) * 1e6))],
        postConditionMode: PostConditionMode.Allow,
        onFinish: (data) => {
          setStatus(`✅ STX sent! TX: ${data.txId}`);
          setAmount('');
          setFriendAddress('');
          setLoading(false);
        },
        onCancel: () => {
          setStatus('Cancelled');
          setLoading(false);
        },
      });
    } catch (error: any) {
      setStatus(`❌ Error: ${error.message}`);
      setLoading(false);
    }
  };

  return (
    <div className="contract-card">
      <h3>🤝 Send STX to Friend</h3>
      <p>Send STX tokens to any Stacks address. Easily transfer funds to your friends on-chain.</p>
      <div className="contract-form">
        <button className="contract-button" onClick={() => setShowPopup(true)}>
          🤝 Send STX
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
          onClick={() => { setShowPopup(false); setStatus(''); setFriendAddress(''); setAmount(''); }}
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
            <h3 style={{marginBottom: 8}}>Send STX to a friend</h3>
            <p style={{marginBottom: 16, color: '#aaa', fontSize: 14}}>
              Enter your friend's Stacks address and the amount of STX you want to send.
            </p>
            <div className="input-group">
              <input
                id="friendAddress"
                type="text"
                value={friendAddress}
                onChange={(e) => setFriendAddress(e.target.value)}
                placeholder="e.g. SP2Z3M34KEKC79TMRMZB24YG30FE25JPN83TPZSZ2"
                maxLength={40}
                style={{marginBottom: 8}}
              />
              <input
                id="amount"
                type="number"
                min="0"
                step="0.000001"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Amount in STX"
                style={{marginBottom: 8}}
              />
            </div>
            <div className="contract-form" style={{marginTop: 12}}>
              <button
                className="contract-button"
                onClick={sendToFriend}
                disabled={loading || !friendAddress.trim() || !amount.trim()}
                style={{width: '100%'}}
              >
                {loading ? '⏳ Sending...' : '🤝 Send to Friend'}
              </button>
              <button
                className="contract-button"
                style={{background: '#333', color: '#fff', width: '100%'}}
                onClick={() => { setShowPopup(false); setStatus(''); setFriendAddress(''); setAmount(''); }}
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
