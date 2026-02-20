import { useEffect, useState } from 'react';
import { StacksMainnet } from '@stacks/network';
import { callReadOnlyFunction, cvToJSON, standardPrincipalCV } from '@stacks/transactions';

interface PostMessageStatsProps {
  stxAddress: string;
  network?: any;
  onBack?: () => void;
}

export default function PostMessageStats({ stxAddress, network, onBack }: PostMessageStatsProps) {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchStats() {
      setLoading(true);
      setError('');
      try {
        const result = await callReadOnlyFunction({
          contractAddress: 'SP2Z3M34KEKC79TMRMZB24YG30FE25JPN83TPZSZ2',
          contractName: 'postMessage-003',
          functionName: 'get-user-stats',
          functionArgs: [standardPrincipalCV(stxAddress)],
          network: network || new StacksMainnet(),
          senderAddress: stxAddress,
        });
        let parsed = undefined;
        try {
          parsed = cvToJSON(result).value;
        } catch (err) {}
        setStats(parsed || result);
      } catch (e: any) {
        setError(e.message || 'Failed to fetch stats');
      } finally {
        setLoading(false);
      }
    }
    if (stxAddress) fetchStats();
  }, [stxAddress, network]);

  return (
    <div style={{ maxWidth: 400, margin: '32px auto', background: 'var(--bg-card)', borderRadius: 10, padding: 24, boxShadow: '0 4px 24px rgba(0,0,0,0.2)' }}>
      <h3 style={{ marginTop: 0, color: 'var(--accent)', textAlign: 'center' }}>Post Message Stats</h3>
      {loading && <div>Loading stats...</div>}
      {error && <div style={{ color: 'var(--error)' }}>{error}</div>}
      {stats && typeof stats === 'object' && stats.value && (
        <ul style={{ listStyle: 'none', padding: 0, fontSize: 16 }}>
          <li><strong>Total:</strong> {stats.value['total-messages']?.value}</li>
          <li><strong>Last:</strong> {(() => {
            const lastMsgTimestamp = parseInt(stats.value['last-message-timestamp']?.value || '0', 10);
            if (lastMsgTimestamp > 0) {
              const now = Math.floor(Date.now() / 1000);
              const diff = now - lastMsgTimestamp;
              if (diff < 60) return `${diff} seconds ago`;
              if (diff < 3600) return `${Math.floor(diff/60)} minutes ago`;
              if (diff < 86400) return `${Math.floor(diff/3600)} hours ago`;
              return `${Math.floor(diff/86400)} days ago`;
            }
            return 'No messages yet';
          })()}</li>
        </ul>
      )}
      {stats && typeof stats === 'object' && !stats.value && (
        <div style={{ color: 'var(--error)', marginTop: 12, textAlign: 'center' }}>No stats found for this address.<br/><pre style={{fontSize:12,background:'#222',color:'#fff',padding:8,borderRadius:6,marginTop:8}}>{JSON.stringify(stats,null,2)}</pre></div>
      )}
      {stats && typeof stats !== 'object' && (
        <div style={{ color: 'var(--error)', marginTop: 12, textAlign: 'center' }}>No stats found for this address.<br/><pre style={{fontSize:12,background:'#222',color:'#fff',padding:8,borderRadius:6,marginTop:8}}>{JSON.stringify(stats,null,2)}</pre></div>
      )}
      <div style={{ textAlign: 'center', marginTop: 24 }}>
        <button className="wallet-button" onClick={onBack}>Back</button>
      </div>
    </div>
  );
}
