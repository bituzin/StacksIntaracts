import { useState } from 'react';
import { openContractCall } from '@stacks/connect';
import {
  AnchorMode,
  PostConditionMode,
} from '@stacks/transactions';

interface GMContractProps {
  userSession: any;
  network: any;
  stxAddress: string;
}

export default function GMContract({ userSession, network, stxAddress }: GMContractProps) {
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [transactionHistory, setTransactionHistory] = useState<string[]>([]);

  const sendGM = async () => {
    setLoading(true);
    setStatus('');

    try {
      await openContractCall({
        network,
        anchorMode: AnchorMode.Any,
        contractAddress: 'SP2Z3M34KEKC79TMRMZB24YG30FE25JPN83TPZSZ2',
        contractName: 'gm-unlimited-003',
        functionName: 'say-gm',
        functionArgs: [],
        postConditionMode: PostConditionMode.Allow,
        onFinish: (data) => {
          setStatus(`Success! TX: ${data.txId}`);
          setLoading(false);
          setTransactionHistory(prev => [...prev, data.txId]);
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
        
        {status && (
          <div className={`status-message mt-2 ${
            status.includes('Error') ? 'text-red-600' : 
            status.includes('Cancelled') ? 'text-yellow-600' : 'text-green-600'
          }`}>
            {status}
          </div>
        )}
      </div>
      
      {/* Transaction History Section */}
      {transactionHistory.length > 0 && (
        <div className="tx-history mt-4 p-3 border rounded">
          <h4 className="font-semibold mb-2">Recent Transactions:</h4>
          <div className="space-y-1">
            {transactionHistory.slice(-3).map((txId) => (
              <a 
                key={txId}
                href={`https://explorer.stacks.co/txid/${txId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-sm text-blue-600 hover:text-blue-800 hover:underline"
              >
                {txId.slice(0, 10)}...{txId.slice(-8)}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
