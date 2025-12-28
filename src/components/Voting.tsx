import { useState } from 'react';
import { openContractCall } from '@stacks/connect';
import {
  AnchorMode,
  PostConditionMode,
  stringUtf8CV,
  uintCV,
  boolCV,
} from '@stacks/transactions';

interface VotingProps {
  userSession: any;
  network: any;
  stxAddress: string;
}

export default function Voting({ userSession, network, stxAddress }: VotingProps) {
  const [pollTitle, setPollTitle] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'create' | 'vote'>('create');
  const [pollId, setPollId] = useState('');

  const createPoll = async () => {
    if (!pollTitle.trim()) {
      setStatus('Wpisz tytuł głosowania!');
      return;
    }

    setLoading(true);
    setStatus('');

    try {
      await openContractCall({
        network,
        anchorMode: AnchorMode.Any,
        contractAddress: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM', // Example address - zmień na właściwy
        contractName: 'voting-contract',
        functionName: 'create-poll',
        functionArgs: [stringUtf8CV(pollTitle)],
        postConditionMode: PostConditionMode.Allow,
        onFinish: (data) => {
          setStatus(`✅ Głosowanie utworzone! TX: ${data.txId}`);
          setPollTitle('');
          setLoading(false);
        },
        onCancel: () => {
          setStatus('Anulowano');
          setLoading(false);
        },
      });
    } catch (error: any) {
      setStatus(`❌ Błąd: ${error.message}`);
      setLoading(false);
    }
  };

  const vote = async (voteFor: boolean) => {
    if (!pollId.trim()) {
      setStatus('Wpisz ID głosowania!');
      return;
    }

    setLoading(true);
    setStatus('');

    try {
      await openContractCall({
        network,
        anchorMode: AnchorMode.Any,
        contractAddress: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM', // Example address - zmień na właściwy
        contractName: 'voting-contract',
        functionName: 'cast-vote',
        functionArgs: [uintCV(parseInt(pollId)), boolCV(voteFor)],
        postConditionMode: PostConditionMode.Allow,
        onFinish: (data) => {
          setStatus(`✅ Głos oddany! TX: ${data.txId}`);
          setPollId('');
          setLoading(false);
        },
        onCancel: () => {
          setStatus('Anulowano');
          setLoading(false);
        },
      });
    } catch (error: any) {
      setStatus(`❌ Błąd: ${error.message}`);
      setLoading(false);
    }
  };

  return (
    <div className="contract-card">
      <h3>🗳️ Voting</h3>
      <p>Create a poll or vote in an existing one. Democratize the Stacks network!</p>
      
      <div className="contract-form">
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
          <button 
            className={`vote-button ${mode === 'create' ? 'active' : ''}`}
            onClick={() => setMode('create')}
            style={{ flex: 1, background: mode === 'create' ? '#4a9eff' : '' }}
          >
            Create
          </button>
          <button 
            className={`vote-button ${mode === 'vote' ? 'active' : ''}`}
            onClick={() => setMode('vote')}
            style={{ flex: 1, background: mode === 'vote' ? '#4a9eff' : '' }}
          >
            Vote
          </button>
        </div>

        {mode === 'create' ? (
          <>
            <div className="input-group">
              <label htmlFor="pollTitle">Poll title:</label>
              <input
                id="pollTitle"
                type="text"
                value={pollTitle}
                onChange={(e) => setPollTitle(e.target.value)}
                placeholder="e.g. Do you support this proposal?"
              />
            </div>
            <button 
              className="contract-button" 
              onClick={createPoll}
              disabled={loading || !pollTitle.trim()}
            >
              {loading ? '⏳ Creating...' : '📊 Create Poll'}
            </button>
          </>
        ) : (
          <>
            <div className="input-group">
              <label htmlFor="pollId">Poll ID:</label>
              <input
                id="pollId"
                type="number"
                value={pollId}
                onChange={(e) => setPollId(e.target.value)}
                placeholder="e.g. 1"
              />
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button 
                className="contract-button" 
                onClick={() => vote(true)}
                disabled={loading || !pollId.trim()}
                style={{ flex: 1, background: 'linear-gradient(135deg, #4caf50 0%, #45a047 100%)' }}
              >
                {loading ? '⏳' : '👍 YES'}
              </button>
              <button 
                className="contract-button" 
                onClick={() => vote(false)}
                disabled={loading || !pollId.trim()}
                style={{ flex: 1, background: 'linear-gradient(135deg, #f44336 0%, #e53935 100%)' }}
              >
                {loading ? '⏳' : '👎 NO'}
              </button>
            </div>
          </>
        )}

        {/* status message removed */}
      </div>
    </div>
  );
}
