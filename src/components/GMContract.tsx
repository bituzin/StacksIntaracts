import { useState } from 'react';
import { openContractCall } from '@stacks/connect';
import {
  AnchorMode,
  PostConditionMode,
  stringUtf8CV,
} from '@stacks/transactions';

interface GMContractProps {
  userSession: any;
  network: any;
  stxAddress: string;
}

export default function GMContract({ userSession, network, stxAddress }: GMContractProps) {
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const sendGM = async () => {
    setLoading(true);
    setStatus('');

    try {
      await openContractCall({
        network,
        anchorMode: AnchorMode.Any,
        contractAddress: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM', // Example address - zmień na właściwy
        contractName: 'gm-contract',
        functionName: 'say-gm',
        functionArgs: [stringUtf8CV('GM! 👋')],
        postConditionMode: PostConditionMode.Allow,
        onFinish: (data) => {
          setStatus(`Sukces! TX: ${data.txId}`);
          setLoading(false);
        },
        onCancel: () => {
          setStatus('Anulowano');
          setLoading(false);
        },
      });
    } catch (error: any) {
      setStatus(`Błąd: ${error.message}`);
      setLoading(false);
    }
  };

  return (
    <div className="contract-card">
      <h3>🌅 GM Contract</h3>
      <p>Say hello to the Stacks network! Send a "GM" message and earn activity.</p>
      
      <div className="contract-form">
        <button 
          className="contract-button" 
          onClick={sendGM}
          disabled={loading}
        >
          {loading ? '⏳ Sending...' : '👋 Send GM'}
        </button>

        {status && (
          <div className={`status-message ${status.includes('Sukces') || status.includes('Success') ? 'success' : status.includes('Błąd') || status.includes('Error') ? 'error' : 'info'}`}>
            {status.replace('Sukces', 'Success').replace('Błąd', 'Error').replace('Anulowano', 'Cancelled')}
          </div>
        )}
      </div>
    </div>
  );
}
