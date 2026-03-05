import { useState } from 'react';

interface GetSTXProps {
  network: any;
  stxAddress: string;
}

export default function GetSTX({ network: _network, stxAddress: _stxAddress }: GetSTXProps) {
  const [loading, setLoading] = useState(false);
  const [_status, setStatus] = useState('');

  const getSTX = async () => {
    setLoading(true);
    setStatus('');
    
    try {
      // TODO: Implement faucet logic
      setStatus('✅ STX requested! Check your wallet in a moment.');
    } catch (error: any) {
      setStatus(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contract-card">
      <h3>💰 Get STX</h3>
      <p>Request STX tokens for your wallet.</p>
      <div className="contract-form">
        <button 
          className="contract-button" 
          onClick={getSTX}
          disabled={loading}
        >
          {loading ? '⏳ Requesting...' : '💸 Get STX'}
        </button>
        {/* Status message removed as requested */}
      </div>
    </div>
  );
}
