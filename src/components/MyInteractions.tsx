  const [msgStats, setMsgStats] = useState<any>(null);
  const [msgLoading, setMsgLoading] = useState(false);
  const [msgError, setMsgError] = useState('');

  useEffect(() => {
    async function fetchMsgStats() {
      setMsgLoading(true);
      setMsgError('');
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
        setMsgStats(parsed || result);
      } catch (e: any) {
        setMsgError(e.message || 'Failed to fetch Post Message stats');
      } finally {
        setMsgLoading(false);
      }
    }
    if (stxAddress) fetchMsgStats();
  }, [stxAddress, network]);
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
  const [msgStats, setMsgStats] = useState<any>(null);
  const [msgLoading, setMsgLoading] = useState(false);
  const [msgError, setMsgError] = useState('');

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

  useEffect(() => {
    async function fetchMsgStats() {
      setMsgLoading(true);
      setMsgError('');
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
        setMsgStats(parsed || result);
      } catch (e: any) {
        setMsgError(e.message || 'Failed to fetch Post Message stats');
      } finally {
        setMsgLoading(false);
      }
    }
    if (stxAddress) fetchMsgStats();
  }, [stxAddress, network]);

  return (
    <div style={{ maxWidth: 400, margin: '32px auto', background: 'var(--bg-card)', borderRadius: 10, padding: 24, boxShadow: '0 4px 24px rgba(0,0,0,0.2)' }}>
      <h3 style={{ marginTop: 0, color: 'var(--accent)', textAlign: 'center' }}>GM</h3>
      {loading && <div>Loading GM stats...</div>}
      {error && <div style={{ color: 'var(--error)' }}>{error}</div>}
      {gmStats && typeof gmStats === 'object' && gmStats.value && (
        <ul style={{ listStyle: 'none', padding: 0, fontSize: 16 }}>
          <li><strong>Total:</strong> {gmStats.value['total-gms']?.value}</li>
          <li><strong>Last:</strong> {(() => {
            const lastGmTimestamp = parseInt(gmStats.value['last-gm-timestamp']?.value || '0', 10);
            if (lastGmTimestamp > 0) {
              const now = Math.floor(Date.now() / 1000);
              const diff = now - lastGmTimestamp;
              if (diff < 60) return `${diff} seconds ago`;
              if (diff < 3600) return `${Math.floor(diff/60)} minutes ago`;
              if (diff < 86400) return `${Math.floor(diff/3600)} hours ago`;
              return `${Math.floor(diff/86400)} days ago`;
            }
            return 'No GM yet';
          })()}</li>
        </ul>
      )}
      <h3 style={{ marginTop: 24, color: 'var(--accent)', textAlign: 'center' }}>Post Message</h3>
      {msgLoading && <div>Loading Post Message stats...</div>}
      {msgError && <div style={{ color: 'var(--error)' }}>{msgError}</div>}
      {msgStats && typeof msgStats === 'object' && msgStats.value && (
        <ul style={{ listStyle: 'none', padding: 0, fontSize: 16 }}>
          <li><strong>Total:</strong> {msgStats.value['total-messages']?.value}</li>
          <li><strong>Last:</strong> {(() => {
            const lastMsgTimestamp = parseInt(msgStats.value['last-message-timestamp']?.value || '0', 10);
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
