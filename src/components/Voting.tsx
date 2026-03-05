import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { openContractCall } from '@stacks/connect';
import {
  AnchorMode,
  PostConditionMode,
  stringUtf8CV,
  uintCV,
  noneCV,
  someCV,
  trueCV,
  falseCV,
  callReadOnlyFunction,
  cvToJSON,
} from '@stacks/transactions';
import { StacksMainnet } from '@stacks/network';

const MAX_OPTIONS = 10;
const BLOCK_TIME_MINUTES = 10;
const MIN_DURATION_BLOCKS = 1;
const CONTRACT_ADDRESS = 'SP2Z3M34KEKC79TMRMZB24YG30FE25JPN83TPZSZ2';
const CONTRACT_NAME = 'voting-003';

const formatApproxDuration = (blocks: number) => {
  const normalizedBlocks = Number.isFinite(blocks) ? Math.max(blocks, 0) : 0;
  const totalMinutes = normalizedBlocks * BLOCK_TIME_MINUTES;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = Math.round(totalMinutes % 60);
  const parts = [] as string[];
  if (hours) parts.push(`${hours}h`);
  if (minutes || parts.length === 0) parts.push(`${minutes}m`);
  return `≈ ${parts.join(' ')}`;
};

function extractOptions(details: any): { text: string; votes: number }[] {
  const opts: { text: string; votes: number }[] = [];
  const optionsData = details?.options?.value ?? details?.options;
  if (!optionsData) return opts;
  const count = Number(optionsData['options-count']?.value ?? optionsData['options-count'] ?? 0);
  for (let i = 0; i < count; i++) {
    const key = `option-${i}`;
    const optRaw = optionsData[key];
    const optVal = optRaw?.value ?? optRaw;
    if (optVal && optVal.text !== undefined) {
      opts.push({
        text: optVal.text?.value ?? optVal.text ?? '',
        votes: Number(optVal.votes?.value ?? optVal.votes ?? 0),
      });
    } else if (optVal?.value) {
      opts.push({
        text: optVal.value?.text?.value ?? '',
        votes: Number(optVal.value?.votes?.value ?? 0),
      });
    }
  }
  return opts;
}

function getStatusLabel(statusRaw: any): { label: string; color: string } {
  const s = Number(statusRaw?.value ?? statusRaw ?? 0);
  if (s === 1) return { label: 'Active', color: '#4caf50' };
  if (s === 2) return { label: 'Closed', color: '#888' };
  if (s === 3) return { label: 'Cancelled', color: '#e57373' };
  return { label: 'Unknown', color: '#888' };
}

interface VotingProps {
  userSession: any;
  network: any;
  stxAddress: string;
}

export default function Voting({ userSession, network, stxAddress }: VotingProps) {
  // ── Create poll state ──────────────────────────────────────────────────────
  const [showPopup, setShowPopup] = useState(false);
  const [pollTitle, setPollTitle] = useState('');
  const [description, setDescription] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [duration, setDuration] = useState(144);
  const [votesPerUser, setVotesPerUser] = useState(1);
  const [requiresStx, setRequiresStx] = useState(false);
  const [minStxAmount, setMinStxAmount] = useState('');
  const [loading, setLoading] = useState(false);

  // ── All polls state ────────────────────────────────────────────────────────
  const [allPolls, setAllPolls] = useState<any[]>([]);
  const [pollsLoading, setPollsLoading] = useState(false);
  const [pollsError, setPollsError] = useState('');
  const [votingState, setVotingState] = useState<Record<number, boolean>>({});
  const [voteError, setVoteError] = useState<Record<number, string>>({});
  const [voteSuccess, setVoteSuccess] = useState<Record<number, boolean>>({});
  const [expandedPolls, setExpandedPolls] = useState<Record<number, boolean>>({});

  const net = network || new StacksMainnet();


  // Memoize fetchAllPolls so the reference is stable for useEffect and button
  const fetchAllPolls = React.useCallback(async () => {
    setPollsLoading(true);
    setPollsError('');
    try {
      const statsResult = await callReadOnlyFunction({
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'get-global-stats',
        functionArgs: [],
        network: net,
        senderAddress: stxAddress || CONTRACT_ADDRESS,
      });
      let parsed: any;
      try { parsed = cvToJSON(statsResult).value; } catch { parsed = cvToJSON(statsResult); }
      const totalPolls = Number(parsed?.['total-polls']?.value ?? parsed?.['total-polls'] ?? 0);

      const polls: any[] = [];
      for (let id = 1; id <= totalPolls; id++) {
        try {
          const detailsResult = await callReadOnlyFunction({
            contractAddress: CONTRACT_ADDRESS,
            contractName: CONTRACT_NAME,
            functionName: 'get-poll-full-details',
            functionArgs: [uintCV(id)],
            network: net,
            senderAddress: stxAddress || CONTRACT_ADDRESS,
          });
          let details: any;
          try { details = cvToJSON(detailsResult).value; } catch { details = cvToJSON(detailsResult); }
          if (details) polls.push({ ...details, _id: id });
        } catch {
          // skip missing poll IDs
        }
      }
      // Sort: active first, then by ID descending
      polls.sort((a, b) => {
        const sa = Number(a.status?.value ?? a.status ?? 0);
        const sb = Number(b.status?.value ?? b.status ?? 0);
        if (sa === 1 && sb !== 1) return -1;
        if (sb === 1 && sa !== 1) return 1;
        return (b._id ?? 0) - (a._id ?? 0);
      });
      setAllPolls(polls);
    } catch (e: any) {
      setPollsError(e.message || 'Failed to fetch polls');
    } finally {
      setPollsLoading(false);
    }
  }, [stxAddress, net]);

  useEffect(() => {
    fetchAllPolls();
  }, [fetchAllPolls]);

  async function fetchAllPolls() {
    setPollsLoading(true);
    setPollsError('');
    try {
      const statsResult = await callReadOnlyFunction({
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'get-global-stats',
        functionArgs: [],
        network: net,
        senderAddress: stxAddress || CONTRACT_ADDRESS,
      });
      let parsed: any;
      try { parsed = cvToJSON(statsResult).value; } catch { parsed = cvToJSON(statsResult); }
      const totalPolls = Number(parsed?.['total-polls']?.value ?? parsed?.['total-polls'] ?? 0);

      const polls: any[] = [];
      for (let id = 1; id <= totalPolls; id++) {
        try {
          const detailsResult = await callReadOnlyFunction({
            contractAddress: CONTRACT_ADDRESS,
            contractName: CONTRACT_NAME,
            functionName: 'get-poll-full-details',
            functionArgs: [uintCV(id)],
            network: net,
            senderAddress: stxAddress || CONTRACT_ADDRESS,
          });
          let details: any;
          try { details = cvToJSON(detailsResult).value; } catch { details = cvToJSON(detailsResult); }
          if (details) polls.push({ ...details, _id: id });
        } catch {
          // skip missing poll IDs
        }
      }
      // Sort: active first, then by ID descending
      polls.sort((a, b) => {
        const sa = Number(a.status?.value ?? a.status ?? 0);
        const sb = Number(b.status?.value ?? b.status ?? 0);
        if (sa === 1 && sb !== 1) return -1;
        if (sb === 1 && sa !== 1) return 1;
        return (b._id ?? 0) - (a._id ?? 0);
      });
      setAllPolls(polls);
    } catch (e: any) {
      setPollsError(e.message || 'Failed to fetch polls');
    } finally {
      setPollsLoading(false);
    }
  }

  async function handleVote(pollId: number, optionIndex: number) {
    setVotingState(prev => ({ ...prev, [pollId]: true }));
    setVoteError(prev => ({ ...prev, [pollId]: '' }));
    setVoteSuccess(prev => ({ ...prev, [pollId]: false }));
    try {
      await openContractCall({
        userSession,
        network: net,
        anchorMode: AnchorMode.Any,
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'vote',
        functionArgs: [uintCV(pollId), uintCV(optionIndex)],
        postConditionMode: PostConditionMode.Deny,
        onFinish: () => {
          setVotingState(prev => ({ ...prev, [pollId]: false }));
          setVoteSuccess(prev => ({ ...prev, [pollId]: true }));
          setTimeout(() => fetchAllPolls(), 3000);
        },
        onCancel: () => {
          setVotingState(prev => ({ ...prev, [pollId]: false }));
        },
      });
    } catch (e: any) {
      setVotingState(prev => ({ ...prev, [pollId]: false }));
      setVoteError(prev => ({ ...prev, [pollId]: e.message || 'Vote failed' }));
    }
  }

  // ── Create poll helpers ────────────────────────────────────────────────────
  const canAddMoreOptions = options.length < MAX_OPTIONS;
  const hasMinimumOptions = options.filter(opt => opt.trim()).length >= 2;
  const parsedMinStx = Number(minStxAmount);
  const hasValidStxRequirement = requiresStx ? minStxAmount.trim() !== '' && !Number.isNaN(parsedMinStx) && parsedMinStx >= 0 : true;
  const canSubmit = Boolean(
    pollTitle.trim() &&
    hasMinimumOptions &&
    duration >= MIN_DURATION_BLOCKS &&
    votesPerUser > 0 &&
    hasValidStxRequirement
  );

  const handleAddOption = () => {
    setOptions(prev => {
      if (prev.length >= MAX_OPTIONS) return prev;
      return [...prev, ''];
    });
  };

  const durationHint = formatApproxDuration(duration);

  const closePopup = () => {
    if (!loading) setShowPopup(false);
  };

  const resetPollForm = () => {
    setPollTitle('');
    setDescription('');
    setOptions(['', '']);
    setDuration(144);
    setVotesPerUser(1);
    setRequiresStx(false);
    setMinStxAmount('');
  };

  const createPoll = async () => {
    if (!canSubmit) return;
    setLoading(true);
    try {
      const normalizedOptions = Array.from({ length: MAX_OPTIONS }, (_, idx) => (options[idx] || '').trim());
      const [firstOption, ...restOptions] = normalizedOptions;
      const optionalOptionArgs = restOptions.map(value => value ? someCV(stringUtf8CV(value)) : noneCV());
      const numericMinStx = requiresStx ? Number(minStxAmount) : 0;
      const sanitizedMinStx = Number.isFinite(numericMinStx) && numericMinStx >= 0 ? Math.floor(numericMinStx) : 0;
      await openContractCall({
        userSession,
        network: net,
        anchorMode: AnchorMode.Any,
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'create-poll',
        functionArgs: [
          stringUtf8CV(pollTitle),
          stringUtf8CV(description),
          stringUtf8CV(firstOption),
          ...optionalOptionArgs,
          uintCV(duration),
          uintCV(votesPerUser),
          requiresStx ? trueCV() : falseCV(),
          uintCV(sanitizedMinStx),
        ],
        postConditionMode: PostConditionMode.Allow,
        onFinish: () => {
          resetPollForm();
          setShowPopup(false);
          setLoading(false);
          setTimeout(() => fetchAllPolls(), 3000);
        },
        onCancel: () => setLoading(false),
      });
    } catch {
      setLoading(false);
    }
  };

  const pollPopup = showPopup
    ? createPortal(
        <div
          style={{
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
            background: 'rgba(0,0,0,0.6)', zIndex: 1000,
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
          }}
          onClick={closePopup}
        >
          <div
            style={{
              position: 'relative', background: 'var(--bg-card)', border: '1px solid var(--accent)',
              borderRadius: 10, padding: '2rem 1.5rem 1.5rem 1.5rem',
              width: 'min(520px, 90vw)', maxHeight: '90vh', overflowY: 'auto',
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)', color: 'var(--text-primary)',
              display: 'flex', flexDirection: 'column', gap: '0.5rem',
            }}
            onClick={(event) => event.stopPropagation()}
          >
            <button onClick={closePopup}
              style={{ position: 'absolute', top: 10, right: 10, background: 'none', border: 'none', color: 'var(--accent)', fontSize: 22, cursor: 'pointer', fontWeight: 700 }}
              aria-label="Close">×</button>
            <h4 style={{ color: 'var(--accent)' }}>Create Poll</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: -10 }}>Creator: {stxAddress}</p>
            <div className="input-group" style={{ width: '100%' }}>
              <label htmlFor="pollTitle">Poll title:</label>
              <input id="pollTitle" type="text" value={pollTitle} onChange={(event) => setPollTitle(event.target.value)} placeholder="e.g. Should we upgrade?" style={{ width: '100%', marginBottom: 8 }} disabled={loading} />
              <label htmlFor="description">Description:</label>
              <textarea id="description" value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Describe the poll (optional)" style={{ width: '100%', marginBottom: 8 }} disabled={loading} rows={3} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <label>Options (start with 2, max 10):</label>
                <button type="button" onClick={handleAddOption} disabled={!canAddMoreOptions || loading}
                  style={{ width: 32, height: 32, borderRadius: '50%', border: '1px solid var(--accent)', background: 'transparent', color: 'var(--accent)', fontSize: 20, lineHeight: 1, cursor: canAddMoreOptions && !loading ? 'pointer' : 'not-allowed' }}
                  aria-label="Add option">＋</button>
              </div>
              {options.map((opt, idx) => (
                <input key={idx} type="text" value={opt}
                  onChange={e => { const newOpts = [...options]; newOpts[idx] = e.target.value; setOptions(newOpts); }}
                  placeholder={`Option ${idx + 1}${idx < 2 ? ' (required)' : ''}`}
                  style={{ width: '100%', marginBottom: 4 }} disabled={loading} />
              ))}
              <label htmlFor="duration">Duration (blocks):</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, width: '100%' }}>
                <input type="number" id="duration" value={duration} onChange={e => setDuration(Number(e.target.value))} min={MIN_DURATION_BLOCKS} style={{ flex: 1 }} disabled={loading} />
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{durationHint}</span>
              </div>
              <label htmlFor="votesPerUser">Votes per user:</label>
              <input type="number" id="votesPerUser" value={votesPerUser} onChange={e => setVotesPerUser(Number(e.target.value))} min={1} style={{ width: '100%', marginBottom: 8 }} disabled={loading} />
              <label htmlFor="requiresStx" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, cursor: 'pointer' }}>
                <input type="checkbox" id="requiresStx" checked={requiresStx}
                  onChange={e => { const next = e.target.checked; setRequiresStx(next); if (!next) setMinStxAmount(''); }}
                  disabled={loading} />
                Require STX to vote?
              </label>
              <label htmlFor="minStxAmount">Min STX amount:</label>
              <input type="number" id="minStxAmount" value={minStxAmount} onChange={e => setMinStxAmount(e.target.value)}
                min={0} style={{ width: '100%', marginBottom: 8 }} disabled={loading || !requiresStx}
                placeholder={requiresStx ? 'Enter minimum STX' : ''} />
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <button type="button" className="contract-button" onClick={() => !loading && resetPollForm()} disabled={loading} style={{ flex: 1, background: '#2b2b2b' }}>
                🔄 Clear Fields
              </button>
              <button className="contract-button" onClick={createPoll} disabled={!canSubmit || loading} style={{ flex: 1 }}>
                {loading ? '⏳ Creating...' : '🗳️ Create Poll'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )
    : null;

  return (
    <div className="contract-card">
      <h3>🗳️ Voting</h3>
      <p>Create or participate in a poll on the Stacks blockchain.</p>

      <div className="contract-form" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
        <button className="contract-button" onClick={() => setShowPopup(true)}>
          🗳️ Create vote
        </button>
        <button className="contract-button" onClick={fetchAllPolls} disabled={pollsLoading} style={{ background: '#2b2b2b' }}>
          {pollsLoading ? '⏳ Loading...' : '🔄 Refresh polls'}
        </button>
      </div>

      {/* ── All polls list ─────────────────────────────────────────────── */}
      <div>
        {pollsError && <div style={{ color: 'var(--error)', marginBottom: 8 }}>{pollsError}</div>}
        {pollsLoading && <div style={{ color: 'var(--text-secondary)' }}>Loading polls...</div>}
        {!pollsLoading && allPolls.length === 0 && !pollsError && (
          <div style={{ color: 'var(--text-secondary)', fontSize: 14 }}>No polls found.</div>
        )}
        {allPolls.map((poll) => {
          const pollId: number = poll._id;
          const title: string = poll.title?.value ?? poll.title ?? `Poll #${pollId}`;
          const desc: string = poll.description?.value ?? poll.description ?? '';
          const { label: statusLabel, color: statusColor } = getStatusLabel(poll.status);
          const isActiveVal = poll['is-active']?.value ?? poll['is-active'];
          const isActive = isActiveVal === true || isActiveVal === 'true';
          const totalVotes = Number(poll['total-votes']?.value ?? poll['total-votes'] ?? 0);
          const totalVoters = Number(poll['total-voters']?.value ?? poll['total-voters'] ?? 0);
          const blocksRemaining = Number(poll['blocks-remaining']?.value ?? poll['blocks-remaining'] ?? 0);
          const opts = extractOptions(poll);
          const isExpanded = expandedPolls[pollId] ?? isActive;

          return (
            <div key={pollId} style={{
              border: `1px solid ${isActive ? 'var(--accent)' : '#333'}`,
              borderRadius: 10, padding: '12px 16px', marginBottom: 12, background: 'rgba(0,0,0,0.2)',
            }}>
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
                onClick={() => setExpandedPolls(prev => ({ ...prev, [pollId]: !isExpanded }))}>
                <div>
                  <span style={{ fontWeight: 600, fontSize: 15 }}>#{pollId} {title}</span>
                  <span style={{
                    marginLeft: 8, fontSize: 11, fontWeight: 600, padding: '2px 7px', borderRadius: 20,
                    background: statusColor + '22', color: statusColor, border: `1px solid ${statusColor}`,
                  }}>{statusLabel}</span>
                </div>
                <span style={{ color: 'var(--text-secondary)', fontSize: 13, userSelect: 'none' }}>{isExpanded ? '▲' : '▼'}</span>
              </div>

              {/* Body */}
              {isExpanded && (
                <div style={{ marginTop: 10 }}>
                  {desc && <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '0 0 8px' }}>{desc}</p>}

                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 10 }}>
                    {isActive && blocksRemaining > 0 && (
                      <span style={{ marginRight: 12 }}>⏱ {blocksRemaining} blocks left {formatApproxDuration(blocksRemaining)}</span>
                    )}
                    <span>👥 {totalVoters} voter{totalVoters !== 1 ? 's' : ''}</span>
                    <span style={{ marginLeft: 12 }}>🗳️ {totalVotes} vote{totalVotes !== 1 ? 's' : ''}</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {opts.map((opt, idx) => {
                      const pct = totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0;
                      return (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 3 }}>
                              <span>{opt.text}</span>
                              <span style={{ color: 'var(--text-secondary)' }}>{opt.votes} ({pct}%)</span>
                            </div>
                            <div style={{ height: 6, borderRadius: 3, background: '#2a2a2a', overflow: 'hidden' }}>
                              <div style={{ width: `${pct}%`, height: '100%', background: 'var(--accent)', borderRadius: 3, transition: 'width 0.4s' }} />
                            </div>
                          </div>
                          {isActive && stxAddress && (
                            <button onClick={() => handleVote(pollId, idx)} disabled={votingState[pollId]}
                              className="contract-button"
                              style={{ padding: '4px 14px', fontSize: 12, minWidth: 64, flexShrink: 0 }}>
                              {votingState[pollId] ? '⏳' : 'Vote'}
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {voteSuccess[pollId] && (
                    <div style={{ color: '#4caf50', fontSize: 13, marginTop: 8 }}>✅ Vote submitted! Refreshing in a few seconds...</div>
                  )}
                  {voteError[pollId] && (
                    <div style={{ color: 'var(--error)', fontSize: 13, marginTop: 8 }}>❌ {voteError[pollId]}</div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {pollPopup}
    </div>
  );
}
