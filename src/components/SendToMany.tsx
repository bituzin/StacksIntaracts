import { useState } from 'react';
import { createPortal } from 'react-dom';
import { openContractCall } from '@stacks/connect';
import { AnchorMode, PostConditionMode, stringUtf8CV, uintCV } from '@stacks/transactions';

interface SendToManyProps {
  userSession: any;
  network: any;
  stxAddress: string;
}

export default function SendToMany({ userSession, network, stxAddress }: SendToManyProps) {
  const [showPopup, setShowPopup] = useState(false);
  const [addresses, setAddresses] = useState('');
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const sendToMany = async () => {
    let addressList: string[] = [];
    try {
      addressList = addresses.split(/\s|,|;/).map(a => a.trim()).filter(Boolean);
    } catch (e) {
      setStatus('Enter a valid Stacks address!');
      return;
    }
    if (!addressList || typeof addressList.length === 'undefined' || addressList.length === 0) {
      setStatus('Enter a valid Stacks address!');
      return;
    }
    if (!amount.trim() || isNaN(Number(amount)) || Number(amount) <= 0) {
      setStatus('Enter a valid amount!');
      return;
    }
    setLoading(true);
    setStatus('');
    try {
      // Prepare recipients list for contract: (list 50 {to: principal, ustx: uint})
      const recipients = addressList.map(addr => ({
        to: addr,
        ustx: Math.round(Number(amount) * 1e6)
      }));
      await openContractCall({
        network,
        anchorMode: AnchorMode.Any,
        contractAddress: 'SP2Z3M34KEKC79TMRMZB24YG30FE25JPN83TPZSZ2',
        contractName: 'multisending-003',
        functionName: 'send-many-stx',
        functionArgs: [
          // encode as list of tuples
          {
            type: 'list',
            list: recipients.map(r => ({
              type: 'tuple',
              data: [
                { name: 'to', type: 'principal', value: r.to },
                { name: 'ustx', type: 'uint', value: r.ustx }
              ]
            }))
          }
        ],
        postConditionMode: PostConditionMode.Allow,
        onFinish: () => {},
        onCancel: () => {},
      });
      setStatus(`✅ Sent ${amount} STX to ${addressList.length} address(es)!`);
      setAddresses('');
      setAmount('');
    } catch (error: any) {
      setStatus(`❌ Error: ${error.message}`);
    }
    setLoading(false);
  };

  return (
    <div className="contract-card">
      <h3>📤 Send STX to Many</h3>
      <p>Send the same amount of STX to multiple Stacks addresses at once.</p>
      <div className="contract-form">
        <button className="contract-button" onClick={() => setShowPopup(true)}>
          📤 Send STX to Many
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
          onClick={() => { setShowPopup(false); setStatus(''); }}
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
            <h3 style={{marginBottom: 8}}>Send STX to many</h3>
            <p style={{marginBottom: 16, color: '#aaa', fontSize: 14}}>
              Enter Stacks addresses separated by space, comma or semicolon.<br/>
              Each will receive the same amount of STX.
            </p>
            <div className="input-group">
              <textarea
                id="addresses"
                value={addresses}
                onChange={(e) => setAddresses(e.target.value)}
                placeholder="e.g. SP2... SP3... SP4..."
                rows={3}
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
                onClick={sendToMany}
                disabled={loading || !addresses.trim() || !amount.trim()}
                style={{width: '100%'}}
              >
                {loading ? '⏳ Sending...' : '📤 Send to Many'}
              </button>
              <button
                className="contract-button"
                style={{background: '#333', color: '#fff', width: '100%'}}
                onClick={() => { setShowPopup(false); setStatus(''); setAddresses(''); setAmount(''); }}
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
