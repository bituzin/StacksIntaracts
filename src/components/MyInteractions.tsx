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
  const [blockHeight, setBlockHeight] = useState<number | null>(null);
  const [blockDebug, setBlockDebug] = useState<any>(null);

  useEffect(() => {
    async function fetchBlockHeight() {
      try {
        const resp = await fetch('https://api.stacks.co/extended/v1/block/latest');
        const data = await resp.json();
        setBlockDebug(data);
        if (data && typeof data.height === 'number') {
          setBlockHeight(data.height);
        }
      } catch (err) {
        setBlockDebug({ error: err?.message || 'fetch error' });
      }
    }
    fetchBlockHeight();
  }, []);
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
      {gmStats && typeof gmStats === 'object' && gmStats.value && (
        <ul style={{ listStyle: 'none', padding: 0, fontSize: 16 }}>
          <li><strong>Total GMs:</strong> {gmStats.value['total-gms']?.value}</li>
          <li><strong>Last GM:</strong> {(() => {
            const lastBlock = parseInt(gmStats.value['last-gm-block']?.value || '0', 10);
            if (typeof blockHeight === 'number' && lastBlock > 0) {
              const blocksAgo = blockHeight - lastBlock;
              return blocksAgo >= 0 ? `${blocksAgo} blocks ago` : 'Block info error';
            } else if (lastBlock > 0) {
              return 'Waiting for block info...';
            } else {
              return 'No GM yet';
            }
          })()}</li>
          <li><strong>Last GM Timestamp:</strong> {gmStats.value['last-gm-timestamp']?.value}</li>
        </ul>
        <div style={{marginTop:16, fontSize:13, color:'#888'}}>
          <strong>Debug info:</strong><br/>
          blockHeight: {blockHeight !== null ? blockHeight : 'null'}<br/>
          blockDebug: <pre style={{background:'#222',color:'#fff',padding:8,borderRadius:6}}>{JSON.stringify(blockDebug,null,2)}</pre>
        </div>
      )}
      {gmStats && typeof gmStats === 'object' && !gmStats.value && (
        <div style={{ color: 'var(--error)', marginTop: 12, textAlign: 'center' }}>No GM stats found for this address.<br/><pre style={{fontSize:12,background:'#222',color:'#fff',padding:8,borderRadius:6,marginTop:8}}>{JSON.stringify(gmStats,null,2)}</pre></div>
      )}
      {gmStats && typeof gmStats !== 'object' && (
        <div style={{ color: 'var(--error)', marginTop: 12, textAlign: 'center' }}>No GM stats found for this address.<br/><pre style={{fontSize:12,background:'#222',color:'#fff',padding:8,borderRadius:6,marginTop:8}}>{JSON.stringify(gmStats,null,2)}</pre></div>
      )}
      <div style={{ textAlign: 'center', marginTop: 24 }}>
        <button className="wallet-button" onClick={onBack}>Back</button>
      </div>
    </div>
  );
}
