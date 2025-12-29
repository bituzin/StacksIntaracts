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
        contractAddress: 'SP2Z3M34KEKC79TMRMZB24YG30FE25JPN83TPZSZ2',
        contractName: 'gm-unlimited-003',
        // To use get-name-003, add a similar contract call where needed:
        // contractAddress: 'SP2Z3M34KEKC79TMRMZB24YG30FE25JPN83TPZSZ2',
        // contractName: 'get-name-003',
        functionName: 'say-gm',
        functionArgs: [],
        postConditionMode: PostConditionMode.Allow,
        onFinish: (data) => {
          setStatus(`Success! TX: ${data.txId}`);
          setLoading(false);
        },
        onCancel: () => {
          setStatus('Cancelled');
          setLoading(false);
        },
      });
    } catch (error: any) {
      setStatus(`Error: ${error.message}`);
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
      </div>
    </div>
  );
}
