import { useState } from 'react';
import { openContractCall } from '@stacks/connect';
import {
  AnchorMode,
  PostConditionMode,
  stringAsciiCV,
} from '@stacks/transactions';

interface PostMessageProps {
  userSession: any;
  network: any;
  stxAddress: string;
}

export default function PostMessage({ userSession, network, stxAddress }: PostMessageProps) {
  const [message, setMessage] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const postMessage = async () => {
    if (!message.trim()) {
      setStatus('Enter a message!');
      return;
    }

    setLoading(true);
    setStatus('');

    try {
      await openContractCall({
        network,
        anchorMode: AnchorMode.Any,
        contractAddress: 'SP2Z3M34KEKC79TMRMZB24YG30FE25JPN83TPZSZ2',
        contractName: 'postMessage-cl4',
        functionName: 'post-message',
        functionArgs: [stringAsciiCV(message)],
        postConditionMode: PostConditionMode.Allow,
        onFinish: (data) => {
          setStatus(`✅ Message sent! TX: ${data.txId}`);
          setMessage('');
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
      <h3>💬 Post Message</h3>
      <p>Send your message to the Stacks blockchain. It will be saved forever!</p>
      <div className="contract-form">
        <button
          className="contract-button"
          onClick={() => setShowPopup(true)}
        >
          📤 Write a message
        </button>
        {/* status message removed */}
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
            <h4 style={{ color: 'var(--accent)', marginBottom: 10 }}>Write your message</h4>
            <div className="input-group">
              <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type something interesting..."
                maxLength={280}
                style={{
                  background: 'var(--bg-hover)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 5,
                  padding: '0.5rem',
                  width: '100%',
                  minHeight: 60,
                  fontSize: '1rem',
                  marginBottom: 8
                }}
              />
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textAlign: 'right' }}>
                {message.length}/280
              </span>
            </div>
            <button
              className="contract-button"
              onClick={async () => {
                await postMessage();
                if (message.trim()) setShowPopup(false);
              }}
              disabled={loading || !message.trim()}
              style={{ width: '100%', marginTop: 10 }}
            >
              {loading ? '⏳ Sending...' : '📤 Send'}
            </button>
          </div>
        </div>
      )}
	</div>
  );
}
