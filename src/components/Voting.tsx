import { useState } from 'react';
import { createPortal } from 'react-dom';
import { openContractCall } from '@stacks/connect';
import { AnchorMode, PostConditionMode, stringUtf8CV, uintCV, noneCV, someCV, trueCV, falseCV } from '@stacks/transactions';

const MAX_OPTIONS = 10;
const BLOCK_TIME_MINUTES = 10;
const MIN_DURATION_BLOCKS = 10;

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

interface VotingProps {
  userSession: any;
  network: any;
  stxAddress: string;
}

export default function Voting({ userSession, network, stxAddress }: VotingProps) {
  const [showPopup, setShowPopup] = useState(false);
  const [pollTitle, setPollTitle] = useState('');
  const [description, setDescription] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [duration, setDuration] = useState(144);
  const [votesPerUser, setVotesPerUser] = useState(1);
  const [requiresStx, setRequiresStx] = useState(false);
  const [minStxAmount, setMinStxAmount] = useState(0);
  const [loading, setLoading] = useState(false);

  const canAddMoreOptions = options.length < MAX_OPTIONS;
  const hasMinimumOptions = options.filter(opt => opt.trim()).length >= 2;
  const canSubmit = Boolean(
    pollTitle.trim() &&
    hasMinimumOptions &&
    duration >= MIN_DURATION_BLOCKS &&
    votesPerUser > 0 &&
    (!requiresStx || minStxAmount >= 0)
  );

  const handleAddOption = () => {
    setOptions(prev => {
      if (prev.length >= MAX_OPTIONS) return prev;
      return [...prev, ''];
    });
  };

  const durationHint = formatApproxDuration(duration);

  const closePopup = () => {
    if (!loading) {
      setShowPopup(false);
    }
  };

  const resetPollForm = () => {
    setPollTitle('');
    setDescription('');
    setOptions(['', '']);
    setDuration(144);
    setVotesPerUser(1);
    setRequiresStx(false);
    setMinStxAmount(0);
  };

  const createPoll = async () => {
    if (!canSubmit) return;
    setLoading(true);
    try {
      const normalizedOptions = Array.from({ length: MAX_OPTIONS }, (_, idx) => (options[idx] || '').trim());
      const [firstOption, ...restOptions] = normalizedOptions;
      const optionalOptionArgs = restOptions.map(value => value ? someCV(stringUtf8CV(value)) : noneCV());
      await openContractCall({
        userSession,
        network,
        anchorMode: AnchorMode.Any,
        contractAddress: 'SP2Z3M34KEKC79TMRMZB24YG30FE25JPN83TPZSZ2',
        contractName: 'voting-003',
        functionName: 'create-poll',
        functionArgs: [
          stringUtf8CV(pollTitle),
          stringUtf8CV(description),
          stringUtf8CV(firstOption),
          ...optionalOptionArgs,
          uintCV(duration),
          uintCV(votesPerUser),
          requiresStx ? trueCV() : falseCV(),
          uintCV(minStxAmount),
        ],
        postConditionMode: PostConditionMode.Allow,
        onFinish: () => {
          resetPollForm();
          setShowPopup(false);
          setLoading(false);
        },
        onCancel: () => setLoading(false),
      });
    } catch (e) {
      setLoading(false);
    }
  };

  const pollPopup = showPopup
    ? createPortal(
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.6)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
          }}
          onClick={closePopup}
        >
          <div
            style={{
              position: 'relative',
              background: 'var(--bg-card)',
              border: '1px solid var(--accent)',
              borderRadius: 10,
              padding: '2rem 1.5rem 1.5rem 1.5rem',
              width: 'min(520px, 90vw)',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
              color: 'var(--text-primary)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem'
            }}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              onClick={closePopup}
              style={{
                position: 'absolute',
                top: 10,
                right: 10,
                background: 'none',
                border: 'none',
                color: 'var(--accent)',
                fontSize: 22,
                cursor: 'pointer',
                fontWeight: 700
              }}
              aria-label="Close"
            >
              ×
            </button>
            <h4 style={{ color: 'var(--accent)' }}>Create Poll</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: -10 }}>Creator: {stxAddress}</p>
            <div className="input-group" style={{ width: '100%' }}>
              <label htmlFor="pollTitle">Poll title:</label>
              <input
                id="pollTitle"
                type="text"
                value={pollTitle}
                onChange={(event) => setPollTitle(event.target.value)}
                placeholder="e.g. Should we upgrade?"
                style={{ width: '100%', marginBottom: 8 }}
                disabled={loading}
              />
              <label htmlFor="description">Description:</label>
              <textarea
                id="description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Describe the poll (optional)"
                style={{ width: '100%', marginBottom: 8 }}
                disabled={loading}
                rows={3}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <label>Options (start with 2, max 10):</label>
                <button
                  type="button"
                  onClick={handleAddOption}
                  disabled={!canAddMoreOptions || loading}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    border: '1px solid var(--accent)',
                    background: 'transparent',
                    color: 'var(--accent)',
                    fontSize: 20,
                    lineHeight: 1,
                    cursor: canAddMoreOptions && !loading ? 'pointer' : 'not-allowed'
                  }}
                  aria-label="Add option"
                >
                  ＋
                </button>
              </div>
              {options.map((opt, idx) => (
                <input
                  key={idx}
                  type="text"
                  value={opt}
                  onChange={e => {
                    const newOpts = [...options];
                    newOpts[idx] = e.target.value;
                    setOptions(newOpts);
                  }}
                  placeholder={`Option ${idx + 1}${idx < 2 ? ' (required)' : ''}`}
                  style={{ width: '100%', marginBottom: 4 }}
                  disabled={loading}
                />
              ))}
              <label htmlFor="duration">Duration (blocks):</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, width: '100%' }}>
                <input
                  type="number"
                  id="duration"
                  value={duration}
                  onChange={e => setDuration(Number(e.target.value))}
                  min={MIN_DURATION_BLOCKS}
                  style={{ flex: 1 }}
                  disabled={loading}
                />
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{durationHint}</span>
              </div>
              <label htmlFor="votesPerUser">Votes per user:</label>
              <input type="number" id="votesPerUser" value={votesPerUser} onChange={e => setVotesPerUser(Number(e.target.value))} min={1} style={{ width: '100%', marginBottom: 8 }} disabled={loading} />
              <label htmlFor="requiresStx" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  id="requiresStx"
                  checked={requiresStx}
                  onChange={e => setRequiresStx(e.target.checked)}
                  disabled={loading}
                />
                Require STX to vote?
              </label>
              <label htmlFor="minStxAmount">Min STX amount:</label>
              <input type="number" id="minStxAmount" value={minStxAmount} onChange={e => setMinStxAmount(Number(e.target.value))} min={0} style={{ width: '100%', marginBottom: 8 }} disabled={loading || !requiresStx} />
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <button
                type="button"
                className="contract-button"
                onClick={() => !loading && resetPollForm()}
                disabled={loading}
                style={{ flex: 1, background: '#2b2b2b' }}
              >
                🔄 Clear Fields
              </button>
              <button
                className="contract-button"
                onClick={createPoll}
                disabled={!canSubmit || loading}
                style={{ flex: 1 }}
              >
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
      <div className="contract-form">
        <button
          className="contract-button"
          onClick={() => setShowPopup(true)}
        >
          🗳️ Create vote
        </button>
      </div>

      {pollPopup}
    </div>
  );
}
