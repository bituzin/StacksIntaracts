// Usuwam stany showGM i showPostMsg, oba okna będą widoczne naraz

import React, { useEffect, useState } from 'react';
// Komponent okienka statystyk dla Send STX to Friend
function SendToFriendStats({ stxAddress, network }: { stxAddress: string, network?: any }) {
  const [sentCount, setSentCount] = React.useState<number | null>(null);
  const [lastTimestamp, setLastTimestamp] = React.useState<number | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    async function fetchStats() {
      setLoading(true);
      setError('');
      try {
        // Pobierz liczbę wysłanych transferów
        const idResult = await callReadOnlyFunction({
          contractAddress: 'SP2Z3M34KEKC79TMRMZB24YG30FE25JPN83TPZSZ2',
          contractName: 'sending-003',
          functionName: 'get-next-transfer-id',
          functionArgs: [],
          network: network || new StacksMainnet(),
          senderAddress: stxAddress,
        });
        let id = undefined;
        try {
          id = cvToJSON(idResult).value;
        } catch (err) {}
        setSentCount(typeof id === 'number' ? id : parseInt(id || '0', 10));

        // Pobierz timestamp ostatniego transferu
        const lastResult = await callReadOnlyFunction({
          contractAddress: 'SP2Z3M34KEKC79TMRMZB24YG30FE25JPN83TPZSZ2',
          contractName: 'sending-003',
          functionName: 'get-last-transfer-timestamp',
          functionArgs: [standardPrincipalCV(stxAddress)],
          network: network || new StacksMainnet(),
          senderAddress: stxAddress,
        });
        let last = undefined;
        try {
          last = cvToJSON(lastResult).value;
        } catch (err) {}
        setLastTimestamp(typeof last === 'number' ? last : parseInt(last || '0', 10));
      } catch (e: any) {
        setError(e.message || 'Failed to fetch Send STX stats');
      } finally {
        setLoading(false);
      }
    }
    if (stxAddress) fetchStats();
  }, [stxAddress, network]);

  return (
    <div style={{ maxWidth: 400, background: 'var(--bg-card)', border: '1px solid #b5d3f3', borderRadius: 10, padding: 24, boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
      <h3 style={{ marginTop: 0, color: 'var(--accent)', textAlign: 'center' }}>Send STX to Friend</h3>
      {loading && <div>Loading Send STX stats...</div>}
      {error && <div style={{ color: 'var(--error)' }}>{error}</div>}
      <ul style={{ listStyle: 'none', padding: 0, fontSize: 16 }}>
        <li><strong>Sent transfers:</strong> {sentCount !== null ? sentCount : '...'}</li>
        <li><strong>Last sent:</strong> {lastTimestamp && lastTimestamp > 0 ? ( () => {
          const now = Math.floor(Date.now() / 1000);
          const diff = now - lastTimestamp;
          if (diff < 60) return `${diff} seconds ago`;
          if (diff < 3600) return `${Math.floor(diff/60)} minutes ago`;
          if (diff < 86400) return `${Math.floor(diff/3600)} hours ago`;
          return `${Math.floor(diff/86400)} days ago`;
        })() : 'No transfers yet'}</li>
      </ul>
    </div>
  );
}
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

  // Vote stats
  const [voteStats, setVoteStats] = useState<any>(null);
  const [voteLoading, setVoteLoading] = useState(false);
  const [voteError, setVoteError] = useState('');
  useEffect(() => {
    async function fetchVoteStats() {
      setVoteLoading(true);
      setVoteError('');
      try {
        const result = await callReadOnlyFunction({
          contractAddress: 'SP2Z3M34KEKC79TMRMZB24YG30FE25JPN83TPZSZ2',
          contractName: 'voting-003',
          functionName: 'get-user-stats',
          functionArgs: [standardPrincipalCV(stxAddress)],
          network: network || new StacksMainnet(),
          senderAddress: stxAddress,
        });
        let parsed = undefined;
        try {
          parsed = cvToJSON(result).value;
        } catch (err) {}
        setVoteStats(parsed || result);
      } catch (e: any) {
        setVoteError(e.message || 'Failed to fetch Vote stats');
      } finally {
        setVoteLoading(false);
      }
    }
    if (stxAddress) fetchVoteStats();
  }, [stxAddress, network]);

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
    <div>
      {/* Okienka */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 32,
          margin: '32px auto',
          maxWidth: 1300
        }}>
        {/* GM stats */}
        <div style={{ maxWidth: 400, background: 'var(--bg-card)', border: '1px solid #b5d3f3', borderRadius: 10, padding: 24, boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
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
          {gmStats && typeof gmStats === 'object' && !gmStats.value && (
            <div style={{ color: 'var(--error)', marginTop: 12, textAlign: 'center' }}>No GM stats found for this address.<br/><pre style={{fontSize:12,background:'#222',color:'#fff',padding:8,borderRadius:6,marginTop:8}}>{JSON.stringify(gmStats,null,2)}</pre></div>
          )}
          {gmStats && typeof gmStats !== 'object' && (
            <div style={{ color: 'var(--error)', marginTop: 12, textAlign: 'center' }}>No GM stats found for this address.<br/><pre style={{fontSize:12,background:'#222',color:'#fff',padding:8,borderRadius:6,marginTop:8}}>{JSON.stringify(gmStats,null,2)}</pre></div>
          )}
        </div>
        {/* Post Message stats */}
        <div style={{ maxWidth: 400, background: 'var(--bg-card)', border: '1px solid #b5d3f3', borderRadius: 10, padding: 24, boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
          <h3 style={{ marginTop: 0, color: 'var(--accent)', textAlign: 'center' }}>Post Message</h3>
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
        </div>
        {/* Vote stats */}
        <div style={{ maxWidth: 400, background: 'var(--bg-card)', border: '1px solid #b5d3f3', borderRadius: 10, padding: 24, boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
          <h3 style={{ marginTop: 0, color: 'var(--accent)', textAlign: 'center' }}>Vote</h3>
          {voteLoading && <div>Loading Vote stats...</div>}
          {voteError && <div style={{ color: 'var(--error)' }}>{voteError}</div>}
          {voteStats && typeof voteStats === 'object' && voteStats.value && (
            <ul style={{ listStyle: 'none', padding: 0, fontSize: 16 }}>
              <li><strong>Polls voted:</strong> {voteStats.value['polls-voted']?.value}</li>
              <li><strong>Total votes cast:</strong> {voteStats.value['total-votes-cast']?.value}</li>
              <li><strong>Last activity:</strong> {(() => {
                const lastVoteTimestamp = parseInt(voteStats.value['last-activity-timestamp']?.value || '0', 10);
                if (lastVoteTimestamp > 0) {
                  const now = Math.floor(Date.now() / 1000);
                  const diff = now - lastVoteTimestamp;
                  if (diff < 60) return `${diff} seconds ago`;
                  if (diff < 3600) return `${Math.floor(diff/60)} minutes ago`;
                  if (diff < 86400) return `${Math.floor(diff/3600)} hours ago`;
                  return `${Math.floor(diff/86400)} days ago`;
                }
                return 'No activity yet';
              })()}</li>
            </ul>
          )}
          {voteStats && typeof voteStats === 'object' && !voteStats.value && (
            <div style={{ color: 'var(--error)', marginTop: 12, textAlign: 'center' }}>No Vote stats found for this address.<br/><pre style={{fontSize:12,background:'#222',color:'#fff',padding:8,borderRadius:6,marginTop:8}}>{JSON.stringify(voteStats,null,2)}</pre></div>
          )}
          {voteStats && typeof voteStats !== 'object' && (
            <div style={{ color: 'var(--error)', marginTop: 12, textAlign: 'center' }}>No Vote stats found for this address.<br/><pre style={{fontSize:12,background:'#222',color:'#fff',padding:8,borderRadius:6,marginTop:8}}>{JSON.stringify(voteStats,null,2)}</pre></div>
          )}
        </div>

        {/* Reserve Name stats */}
        <ReserveNameStats stxAddress={stxAddress} network={network} />
        {/* Send STX to Friend stats */}
        <SendToFriendStats stxAddress={stxAddress} network={network} />
        {/* Send STX to Many stats */}
        <SendToManyStats stxAddress={stxAddress} network={network} />
      </div>
      {/* Przycisk Back między okienkami a paskiem z adresem */}
      <div style={{ textAlign: 'center', marginTop: 32 }}>
        <button className="wallet-button" onClick={onBack}>Back</button>
      </div>
    </div>
  );
}

// Komponent okienka statystyk dla Reserve Name
function ReserveNameStats({ stxAddress, network }: { stxAddress: string, network?: any }) {
  const [totalUsernames, setTotalUsernames] = useState<number | null>(null);
  const [hasUsername, setHasUsername] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchStats() {
      setLoading(true);
      setError('');
      try {
        // Pobierz liczbę nazw
        const totalResult = await callReadOnlyFunction({
          contractAddress: 'SP2Z3M34KEKC79TMRMZB24YG30FE25JPN83TPZSZ2',
          contractName: 'get-name-003',
          functionName: 'get-total-usernames',
          functionArgs: [],
          network: network || new StacksMainnet(),
          senderAddress: stxAddress,
        });
        let total = undefined;
        try {
          total = cvToJSON(totalResult).value;
        } catch (err) {}
        setTotalUsernames(typeof total === 'number' ? total : parseInt(total || '0', 10));

        // Czy użytkownik ma nazwę
        const hasResult = await callReadOnlyFunction({
          contractAddress: 'SP2Z3M34KEKC79TMRMZB24YG30FE25JPN83TPZSZ2',
          contractName: 'get-name-003',
          functionName: 'has-username',
          functionArgs: [standardPrincipalCV(stxAddress)],
          network: network || new StacksMainnet(),
          senderAddress: stxAddress,
        });
        let has = undefined;
        try {
          has = cvToJSON(hasResult).value;
        } catch (err) {}
        setHasUsername(has === true || has === 'true');
      } catch (e: any) {
        setError(e.message || 'Failed to fetch Reserve Name stats');
      } finally {
        setLoading(false);
      }
    }
    if (stxAddress) fetchStats();
  }, [stxAddress, network]);

  return (
    <div style={{ maxWidth: 400, background: 'var(--bg-card)', border: '1px solid #b5d3f3', borderRadius: 10, padding: 24, boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
      <h3 style={{ marginTop: 0, color: 'var(--accent)', textAlign: 'center' }}>Reserve Name</h3>
      {loading && <div>Loading Reserve Name stats...</div>}
      {error && <div style={{ color: 'var(--error)' }}>{error}</div>}
      <ul style={{ listStyle: 'none', padding: 0, fontSize: 16 }}>
        <li><strong>Username:</strong> {totalUsernames !== null ? totalUsernames : '...'}</li>
        <li><strong>Has username:</strong> {hasUsername === null ? '...' : hasUsername ? 'Yes' : 'No'}</li>
      </ul>
    </div>
  );
}

// Komponent okienka statystyk dla Send STX to Many
function SendToManyStats({ stxAddress, network }: { stxAddress: string, network?: any }) {
  const [maxRecipients, setMaxRecipients] = React.useState<number | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    async function fetchMax() {
      setLoading(true);
      setError('');
      try {
        const result = await callReadOnlyFunction({
          contractAddress: 'SP2Z3M34KEKC79TMRMZB24YG30FE25JPN83TPZSZ2',
          contractName: 'multisending-003',
          functionName: 'get-max-recipients',
          functionArgs: [],
          network: network || new StacksMainnet(),
          senderAddress: stxAddress,
        });
        let value = undefined;
        try {
          value = cvToJSON(result).value;
        } catch (err) {}
        setMaxRecipients(typeof value === 'number' ? value : parseInt(value || '0', 10));
      } catch (e: any) {
        setError(e.message || 'Failed to fetch max recipients');
      } finally {
        setLoading(false);
      }
    }
    fetchMax();
  }, [stxAddress, network]);

  return (
    <div style={{ maxWidth: 400, background: 'var(--bg-card)', border: '1px solid #b5d3f3', borderRadius: 10, padding: 24, boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
      <h3 style={{ marginTop: 0, color: 'var(--accent)', textAlign: 'center' }}>Send STX to Many</h3>
      {loading && <div>Loading info...</div>}
      {error && <div style={{ color: 'var(--error)' }}>{error}</div>}
      <ul style={{ listStyle: 'none', padding: 0, fontSize: 16 }}>
        <li><strong>Max recipients per transaction:</strong> {maxRecipients !== null ? maxRecipients : '...'}</li>
        <li style={{marginTop:8, color:'#888'}}>Detailed statistics are not available for multisending.</li>
      </ul>
    </div>
  );
}
