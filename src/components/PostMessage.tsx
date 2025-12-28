import { useState } from 'react';
import { openContractCall } from '@stacks/connect';
import {
  AnchorMode,
  PostConditionMode,
  stringUtf8CV,
} from '@stacks/transactions';

interface PostMessageProps {
  userSession: any;
  network: any;
  stxAddress: string;
}

export default function PostMessage({ userSession, network, stxAddress }: PostMessageProps) {
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const postMessage = async () => {
    if (!message.trim()) {
      setStatus('Wpisz wiadomość!');
      return;
    }

    setLoading(true);
    setStatus('');

    try {
      await openContractCall({
        network,
        anchorMode: AnchorMode.Any,
        contractAddress: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM', // Example address - zmień na właściwy
        contractName: 'post-message',
        functionName: 'post',
        functionArgs: [stringUtf8CV(message)],
        postConditionMode: PostConditionMode.Allow,
        onFinish: (data) => {
          setStatus(`✅ Wiadomość wysłana! TX: ${data.txId}`);
          setMessage('');
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
      <h3>💬 Post Message</h3>
      <p>Send your message to the Stacks blockchain. It will be saved forever!</p>
      
      <div className="contract-form">
        <div className="input-group">
          <label htmlFor="message">Your message:</label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type something interesting..."
            maxLength={280}
          />
          <span style={{ fontSize: '0.8rem', color: '#666', textAlign: 'right' }}>
            {message.length}/280
          </span>
        </div>

        <button 
          className="contract-button" 
          onClick={postMessage}
          disabled={loading || !message.trim()}
        >
          {loading ? '⏳ Sending...' : '📤 Send Message'}
        </button>

        {status && (
          <div className={`status-message ${status.includes('✅') ? 'success' : status.includes('❌') ? 'error' : 'info'}`}>
            {status.replace('Wiadomość wysłana', 'Message sent').replace('Błąd', 'Error').replace('Anulowano', 'Cancelled')}
          </div>
        )}
      </div>
    </div>
  );
}
