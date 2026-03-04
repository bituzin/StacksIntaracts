import React, { useEffect, useState } from 'react';
import { StacksMainnet } from '@stacks/network';
import { callReadOnlyFunction, cvToJSON, standardPrincipalCV, uintCV } from '@stacks/transactions';

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

  const [voteStats, setVoteStats] = useState<any>(null);
  const [voteLoading, setVoteLoading] = useState(false);
  const [voteError, setVoteError] = useState('');

  const [createdPolls, setCreatedPolls] = useState<any[]>([]);
  const [createdPollsLoading, setCreatedPollsLoading] = useState(false);
  const [createdPollsError, setCreatedPollsError] = useState('');

  useEffect(() => {
    async function fetchGmStats() {
      setLoading(true); setError('');
      try {
        const result = await callReadOnlyFunction({ contractAddress: 'SP2Z3M34KEKC79TMRMZB24YG30FE25JPN83TPZSZ2', contractName: 'gm-unlimited-003', functionName: 'get-user-stats', functionArgs: [standardPrincipalCV(stxAddress)], network: network || new StacksMainnet(), senderAddress: stxAddress });
        let parsed: any; try { parsed = cvToJSON(result).value; } catch {}
        setGmStats(parsed || result);
      } catch (e: any) { setError(e.message || 'Failed to fetch GM stats'); }
      finally { setLoading(false); }
    }
    if (stxAddress) fetchGmStats();
  }, [stxAddress, network]);

  useEffect(() => {
    async function fetchMsgStats() {
      setMsgLoading(true); setMsgError('');
      try {
        const result = await callReadOnlyFunction({ contractAddress: 'SP2Z3M34KEKC79TMRMZB24YG30FE25JPN83TPZSZ2', contractName: 'postMessage-003', functionName: 'get-user-stats', functionArgs: [standardPrincipalCV(stxAddress)], network: network || new StacksMainnet(), senderAddress: stxAddress });
        let parsed: any; try { parsed = cvToJSON(result).value; } catch {}
        setMsgStats(parsed || result);
      } catch (e: any) { setMsgError(e.message || 'Failed to fetch Post Message stats'); }
      finally { setMsgLoading(false); }
    }
    if (stxAddress) fetchMsgStats();
  }, [stxAddress, network]);

  useEffect(() => {
    async function fetchVoteStats() {
      setVoteLoading(true); setVoteError('');
      try {
        const result = await callReadOnlyFunction({ contractAddress: 'SP2Z3M34KEKC79TMRMZB24YG30FE25JPN83TPZSZ2', contractName: 'voting-003', functionName: 'get-user-stats', functionArgs: [standardPrincipalCV(stxAddress)], network: network || new StacksMainnet(), senderAddress: stxAddress });
        let parsed: any; try { parsed = cvToJSON(result).value; } catch {}
        setVoteStats(parsed || result);
      } catch (e: any) { setVoteError(e.message || 'Failed to fetch Vote stats'); }
      finally { setVoteLoading(false); }
    }
    if (stxAddress) fetchVoteStats();
  }, [stxAddress, network]);

  useEffect(() => {
    async function fetchCreatedPolls() {
      setCreatedPollsLoading(true); setCreatedPollsError('');
      try {
        const countResult = await callReadOnlyFunction({ contractAddress: 'SP2Z3M34KEKC79TMRMZB24YG30FE25JPN83TPZSZ2', contractName: 'voting-003', functionName: 'get-creator-poll-count', functionArgs: [standardPrincipalCV(stxAddress)], network: network || new StacksMainnet(), senderAddress: stxAddress });
        let count = 0; try { count = Number(cvToJSON(countResult).value) || 0; } catch {}
        const polls: any[] = [];
        for (let i = 0; i < count; i++) {
          const idResult = await callReadOnlyFunction({ contractAddress: 'SP2Z3M34KEKC79TMRMZB24YG30FE25JPN83TPZSZ2', contractName: 'voting-003', functionName: 'get-creator-poll-at-index', functionArgs: [standardPrincipalCV(stxAddress), uintCV(i)], network: network || new StacksMainnet(), senderAddress: stxAddress });
          let pollId: any; try { pollId = cvToJSON(idResult).value; } catch {}
          if (pollId !== undefined && pollId !== null && pollId !== '') {
            const detailsResult = await callReadOnlyFunction({ contractAddress: 'SP2Z3M34KEKC79TMRMZB24YG30FE25JPN83TPZSZ2', contractName: 'voting-003', functionName: 'get-poll-full-details', functionArgs: [uintCV(Number(pollId))], network: network || new StacksMainnet(), senderAddress: stxAddress });
            let details: any; try { details = cvToJSON(detailsResult).value; } catch {}
            if (details) polls.push(details);
          }
        }
        setCreatedPolls(polls);
      } catch (e: any) { setCreatedPollsError(e.message || 'Failed to fetch created polls'); }
      finally { setCreatedPollsLoading(false); }
    }
    if (stxAddress) fetchCreatedPolls();
  }, [stxAddress, network]);

  const timeDiff = (ts: number) => {
    const now = Math.floor(Date.now() / 1000), diff = now - ts;
    if (diff < 60) return `${diff} seconds ago`;
    if (diff < 3600) return `${Math.floor(diff/60)} minutes ago`;
    if (diff < 86400) return `${Math.floor(diff/3600)} hours ago`;
    return `${Math.floor(diff/86400)} days ago`;
  };

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32, margin: '32px auto', maxWidth: 1300 }}>
        <div className="contract-card" style={{ borderRadius: 14, padding: 24 }}>
          <h3 style={{ marginTop: 0, color: 'var(--accent)', textAlign: 'center' }}>GM</h3>
          {loading && <div>Loading GM stats...</div>}
          {error && <div style={{ color: 'var(--error)' }}>{error}</div>}
          {gmStats?.value && (<ul style={{ listStyle: 'none', padding: 0, fontSize: 16 }}>
            <li><strong>Total:</strong> {gmStats.value['total-gms']?.value}</li>
            <li><strong>Last:</strong> {(() => { const ts = parseInt(gmStats.value['last-gm-timestamp']?.value || '0', 10); return ts > 0 ? timeDiff(ts) : 'No GM yet'; })()}</li>
          </ul>)}
        </div>

        <div className="contract-card" style={{ borderRadius: 14, padding: 24 }}>
          <h3 style={{ marginTop: 0, color: 'var(--accent)', textAlign: 'center' }}>Post Message</h3>
          {msgLoading && <div>Loading Post Message stats...</div>}
          {msgError && <div style={{ color: 'var(--error)' }}>{msgError}</div>}
          {msgStats?.value && (<ul style={{ listStyle: 'none', padding: 0, fontSize: 16 }}>
            <li><strong>Total:</strong> {msgStats.value['total-messages']?.value}</li>
            <li><strong>Last:</strong> {(() => { const ts = parseInt(msgStats.value['last-message-timestamp']?.value || '0', 10); return ts > 0 ? timeDiff(ts) : 'No messages yet'; })()}</li>
          </ul>)}
        </div>

        <div className="contract-card" style={{ borderRadius: 14, padding: 24 }}>
          <h3 style={{ marginTop: 0, color: 'var(--accent)', textAlign: 'center' }}>Vote</h3>
          {voteLoading && <div>Loading Vote stats...</div>}
          {voteError && <div style={{ color: 'var(--error)' }}>{voteError}</div>}
          {voteStats?.value && (<ul style={{ listStyle: 'none', padding: 0, fontSize: 16 }}>
            <li><strong>Polls voted:</strong> {voteStats.value['polls-voted']?.value}</li>
            <li><strong>Total votes cast:</strong> {voteStats.value['total-votes-cast']?.value}</li>
            <li><strong>Last activity:</strong> {(() => { const ts = parseInt(voteStats.value['last-activity-timestamp']?.value || '0', 10); return ts > 0 ? timeDiff(ts) : 'No activity yet'; })()}</li>
          </ul>)}
        </div>

        <div className="contract-card" style={{ borderRadius: 14, padding: 24 }}>
          <h3 style={{ marginTop: 0, color: 'var(--accent)', textAlign: 'center' }}>Your Created Polls</h3>
          {createdPollsLoading && <div>Loading your polls...</div>}
          {createdPollsError && <div style={{ color: 'var(--error)' }}>{createdPollsError}</div>}
          {!createdPollsLoading && createdPolls.length === 0 && <div>No polls created yet.</div>}
          {createdPolls.length > 0 && (<ul style={{ listStyle: 'none', padding: 0, fontSize: 15 }}>
            {createdPolls.map((poll: any, idx: number) => {
              const s = poll.status?.value;
              const statusLabel = (s === '1' || s === 1) ? 'Active' : (s === '2' || s === 2) ? 'Closed' : (s === '3' || s === 3) ? 'Cancelled' : 'Unknown';
              return (<li key={poll['poll-id']?.value || idx} style={{ marginBottom: 12 }}>
                <strong>{poll.title?.value}</strong>{' '}
                <span style={{ color: '#888', fontSize: 13 }}>({statusLabel})</span>
                <br /><span style={{ fontSize: 13, color: '#aaa' }}>Votes: {poll['total-votes']?.value ?? '?'}</span>
              </li>);
            })}
          </ul>)}
        </div>

        <ReserveNameStats stxAddress={stxAddress} network={network} />
        <SendToFriendStats stxAddress={stxAddress} network={network} />
        <SendToManyStats stxAddress={stxAddress} network={network} />
      </div>
      <div style={{ textAlign: 'center', marginTop: 32 }}>
        <button className="wallet-button" onClick={onBack}>Back</button>
      </div>
    </div>
  );
}

function ReserveNameStats({ stxAddress, network }: { stxAddress: string; network?: any }) {
  const [totalUsernames, setTotalUsernames] = useState<number | null>(null);
  const [hasUsername, setHasUsername] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    async function fetchStats() {
      setLoading(true); setError('');
      try {
        const totalResult = await callReadOnlyFunction({ contractAddress: 'SP2Z3M34KEKC79TMRMZB24YG30FE25JPN83TPZSZ2', contractName: 'get-name-003', functionName: 'get-total-usernames', functionArgs: [], network: network || new StacksMainnet(), senderAddress: stxAddress });
        let total: any; try { total = cvToJSON(totalResult).value; } catch {}
        setTotalUsernames(typeof total === 'number' ? total : parseInt(total || '0', 10));
        const hasResult = await callReadOnlyFunction({ contractAddress: 'SP2Z3M34KEKC79TMRMZB24YG30FE25JPN83TPZSZ2', contractName: 'get-name-003', functionName: 'has-username', functionArgs: [standardPrincipalCV(stxAddress)], network: network || new StacksMainnet(), senderAddress: stxAddress });
        let has: any; try { has = cvToJSON(hasResult).value; } catch {}
        setHasUsername(has === true || has === 'true');
      } catch (e: any) { setError(e.message || 'Failed to fetch Reserve Name stats'); }
      finally { setLoading(false); }
    }
    if (stxAddress) fetchStats();
  }, [stxAddress, network]);
  return (
    <div className="contract-card" style={{ borderRadius: 14, padding: 24 }}>
      <h3 style={{ marginTop: 0, color: 'var(--accent)', textAlign: 'center' }}>Reserve Name</h3>
      {loading && <div>Loading Reserve Name stats...</div>}
      {error && <div style={{ color: 'var(--error)' }}>{error}</div>}
      <ul style={{ listStyle: 'none', padding: 0, fontSize: 16 }}>
        <li><strong>Total usernames:</strong> {totalUsernames !== null ? totalUsernames : '...'}</li>
        <li><strong>Has username:</strong> {hasUsername === null ? '...' : hasUsername ? 'Yes' : 'No'}</li>
      </ul>
    </div>
  );
}

function SendToFriendStats({ stxAddress, network }: { stxAddress: string; network?: any }) {
  const [sentCount, setSentCount] = React.useState<number | null>(null);
  const [lastTimestamp, setLastTimestamp] = React.useState<number | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  React.useEffect(() => {
    async function fetchStats() {
      setLoading(true); setError('');
      try {
        const idResult = await callReadOnlyFunction({ contractAddress: 'SP2Z3M34KEKC79TMRMZB24YG30FE25JPN83TPZSZ2', contractName: 'sending-003', functionName: 'get-next-transfer-id', functionArgs: [], network: network || new StacksMainnet(), senderAddress: stxAddress });
        let id: any; try { id = cvToJSON(idResult).value; } catch {}
        setSentCount(typeof id === 'number' ? id : parseInt(id || '0', 10));
        const lastResult = await callReadOnlyFunction({ contractAddress: 'SP2Z3M34KEKC79TMRMZB24YG30FE25JPN83TPZSZ2', contractName: 'sending-003', functionName: 'get-last-transfer-timestamp', functionArgs: [standardPrincipalCV(stxAddress)], network: network || new StacksMainnet(), senderAddress: stxAddress });
        let last: any; try { last = cvToJSON(lastResult).value; } catch {}
        setLastTimestamp(typeof last === 'number' ? last : parseInt(last || '0', 10));
      } catch (e: any) { setError(e.message || 'Failed to fetch Send STX stats'); }
      finally { setLoading(false); }
    }
    if (stxAddress) fetchStats();
  }, [stxAddress, network]);
  const timeDiff = (ts: number) => {
    const now = Math.floor(Date.now() / 1000), diff = now - ts;
    if (diff < 60) return `${diff} seconds ago`;
    if (diff < 3600) return `${Math.floor(diff/60)} minutes ago`;
    if (diff < 86400) return `${Math.floor(diff/3600)} hours ago`;
    return `${Math.floor(diff/86400)} days ago`;
  };
  return (
    <div className="contract-card" style={{ borderRadius: 14, padding: 24 }}>
      <h3 style={{ marginTop: 0, color: 'var(--accent)', textAlign: 'center' }}>Send STX to Friend</h3>
      {loading && <div>Loading Send STX stats...</div>}
      {error && <div style={{ color: 'var(--error)' }}>{error}</div>}
      <ul style={{ listStyle: 'none', padding: 0, fontSize: 16 }}>
        <li><strong>Sent transfers:</strong> {sentCount !== null ? sentCount : '...'}</li>
        <li><strong>Last sent:</strong> {lastTimestamp && lastTimestamp > 0 ? timeDiff(lastTimestamp) : 'No transfers yet'}</li>
      </ul>
    </div>
  );
}

function SendToManyStats({ stxAddress, network }: { stxAddress: string; network?: any }) {
  const [maxRecipients, setMaxRecipients] = React.useState<number | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  React.useEffect(() => {
    async function fetchMax() {
      setLoading(true); setError('');
      try {
        const result = await callReadOnlyFunction({ contractAddress: 'SP2Z3M34KEKC79TMRMZB24YG30FE25JPN83TPZSZ2', contractName: 'multisending-003', functionName: 'get-max-recipients', functionArgs: [], network: network || new StacksMainnet(), senderAddress: stxAddress });
        let value: any; try { value = cvToJSON(result).value; } catch {}
        setMaxRecipients(typeof value === 'number' ? value : parseInt(value || '0', 10));
      } catch (e: any) { setError(e.message || 'Failed to fetch max recipients'); }
      finally { setLoading(false); }
    }
    fetchMax();
  }, [stxAddress, network]);
  return (
    <div className="contract-card" style={{ borderRadius: 14, padding: 24 }}>
      <h3 style={{ marginTop: 0, color: 'var(--accent)', textAlign: 'center' }}>Send STX to Many</h3>
      {loading && <div>Loading info...</div>}
      {error && <div style={{ color: 'var(--error)' }}>{error}</div>}
      <ul style={{ listStyle: 'none', padding: 0, fontSize: 16 }}>
        <li><strong>Max recipients per transaction:</strong> {maxRecipients !== null ? maxRecipients : '...'}</li>
        <li style={{ marginTop: 8, color: '#888' }}>Detailed statistics are not available for multisending.</li>
      </ul>
    </div>
  );
}
