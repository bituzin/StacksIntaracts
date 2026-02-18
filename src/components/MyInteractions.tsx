import { useEffect, useState } from 'react';
import { StacksMainnet } from '@stacks/network';
import { callReadOnlyFunction, cvToJSON, standardPrincipalCV } from '@stacks/transactions';

interface MyInteractionsProps {
  stxAddress: string;
  network?: any;
  onBack?: () => void;
}

export default function MyInteractions({ stxAddress, network, onBack }: MyInteractionsProps) {
  const [gmStats, setGmStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchGmStats() {
      setLoading(true);
      setError('');
      try {
        const result = await callReadOnlyFunction({
          contractAddress: 'SP2Z3M34KEKC79TMRMZB24YG30FE25JPN83TPZSZ2',
          contractName: 'gm-unlimited-003',
          functionName: 'get-user-stats',
          functionArgs: [standardPrincipalCV(stxAddress)],
          network: network || new StacksMainnet(),
          senderAddress: stxAddress,
        });
        let parsed = undefined;
        try {
          parsed = cvToJSON(result).value;
        } catch (err) {}
        setGmStats(parsed || result);
      } catch (e: any) {
        setError(e.message || 'Failed to fetch GM stats');
      } finally {
        setLoading(false);
      }
    }
    if (stxAddress) fetchGmStats();
  }, [stxAddress, network]);

  return (
    <div style={{ maxWidth: 400, margin: '32px auto', background: 'var(--bg-card)', borderRadius: 10, padding: 24, boxShadow: '0 4px 24px rgba(0,0,0,0.2)' }}>
      <h2 style={{ textAlign: 'center', marginBottom: 16 }}>My Interactions</h2>
      <div style={{ marginBottom: 16, textAlign: 'center', color: 'var(--accent)' }}>
        <strong>Address:</strong> <span style={{ fontFamily: 'monospace' }}>{stxAddress}</span>
      </div>
      <h3 style={{ marginTop: 0, color: 'var(--accent)' }}>GM Stats</h3>
      {loading && <div>Loading GM stats...</div>}
      {error && <div style={{ color: 'var(--error)' }}>{error}</div>}
      {gmStats && typeof gmStats === 'object' && (
        <>
          {('total-gms' in gmStats || 'last-gm-block' in gmStats || 'last-gm-timestamp' in gmStats) ? (
            <ul style={{ listStyle: 'none', padding: 0, fontSize: 16 }}>
              {'total-gms' in gmStats && <li><strong>Total GMs:</strong> {gmStats['total-gms']}</li>}
              {'last-gm-block' in gmStats && <li><strong>Last GM Block:</strong> {gmStats['last-gm-block']}</li>}
              {'last-gm-timestamp' in gmStats && <li><strong>Last GM Timestamp:</strong> {gmStats['last-gm-timestamp']}</li>}
            </ul>
          ) : (
            <div style={{ color: 'var(--error)', marginTop: 12, textAlign: 'center' }}>No GM stats found for this address.</div>
          )}
        </>
      )}
      {gmStats && typeof gmStats !== 'object' && (
        <div style={{ color: 'var(--error)', marginTop: 12, textAlign: 'center' }}>No GM stats found for this address.</div>
      )}
      <div style={{ textAlign: 'center', marginTop: 24 }}>
        <button className="wallet-button" onClick={onBack}>Back</button>
      </div>
    </div>
  );
}
