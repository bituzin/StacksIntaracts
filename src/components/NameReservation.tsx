import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { openContractCall } from '@stacks/connect';
import { AnchorMode, PostConditionMode, stringAsciiCV } from '@stacks/transactions';
import { NAME_CONTRACT_ADDRESS, NAME_CONTRACT_NAME, checkNameAvailable, fetchOwnedName } from '../utils/getNameStatus';


interface NameReservationProps {
  userSession: any;
  network: any;
  stxAddress: string;
}

export default function NameReservation({ userSession, network, stxAddress }: NameReservationProps) {

  const [showPopup, setShowPopup] = useState(false);
  const [name, setName] = useState('');
  const [status, setStatus] = useState('');
  const [checking, setChecking] = useState(false);
  const [reserving, setReserving] = useState(false);
  const [ownedName, setOwnedName] = useState<string | null>(null);
  const [ownershipLoading, setOwnershipLoading] = useState(false);
  const [ownershipError, setOwnershipError] = useState('');
  const [nameAvailable, setNameAvailable] = useState(false);
  const [checkedName, setCheckedName] = useState<string | null>(null);
  const [releaseLoading, setReleaseLoading] = useState(false);

  const isNameLocked = Boolean(ownedName);
  const trimmedInput = name.trim();
  const normalizedCandidate = trimmedInput.toLowerCase();
  const isNameFormatValid = trimmedInput.length >= 3 && /^[a-zA-Z0-9-]+$/.test(trimmedInput);
  const isReserveReady = nameAvailable && checkedName === normalizedCandidate && isNameFormatValid;

  const handleClosePopup = () => {
    setShowPopup(false);
    setStatus('');
    setName('');
    setOwnershipError('');
    setOwnedName(null);
    setOwnershipLoading(false);
    setNameAvailable(false);
    setCheckedName(null);
    setChecking(false);
    setReserving(false);
    setReleaseLoading(false);
  };

  const refreshOwnership = useCallback(async () => {
    setOwnershipError('');
    setOwnershipLoading(true);
    try {
      const current = await fetchOwnedName(stxAddress, network);
      setOwnedName(current);
    } catch (error: any) {
      setOwnershipError(error.message || 'Unable to verify current name');
      setOwnedName(null);
    } finally {
      setOwnershipLoading(false);
    }
  }, [network, stxAddress]);

  useEffect(() => {
    if (!showPopup) return;
    refreshOwnership();
  }, [showPopup, refreshOwnership]);

  useEffect(() => {
    setNameAvailable(false);
    setCheckedName(null);
  }, [name]);

  const checkName = async () => {
    if (isNameLocked) {
      setStatus(`ℹ️ You already own "${ownedName}". Release it before reserving another name.`);
      return;
    }
    if (!trimmedInput) {
      setStatus('Enter a name!');
      return;
    }
    if (!isNameFormatValid) {
      setStatus('Name must be at least 3 characters and only use letters, numbers, or hyphens.');
      return;
    }
    setChecking(true);
    setStatus('');
    setNameAvailable(false);
    setCheckedName(null);
    try {
      const available = await checkNameAvailable(normalizedCandidate, network);
      setNameAvailable(available);
      setCheckedName(normalizedCandidate);
      if (available) {
        setStatus(`✅ "${normalizedCandidate}" is available! Click "Get Name" to reserve it.`);
      } else {
        setStatus(`❌ "${normalizedCandidate}" is already taken.`);
      }
    } catch (error: any) {
      setStatus(`❌ Error: ${error.message}`);
    } finally {
      setChecking(false);
    }
  };

  const handleReserve = async () => {
    if (!isReserveReady || !checkedName) {
      return;
    }
    setReserving(true);
    setStatus('');
    try {
      await openContractCall({
        userSession,
        network,
        anchorMode: AnchorMode.Any,
        contractAddress: NAME_CONTRACT_ADDRESS,
        contractName: NAME_CONTRACT_NAME,
        functionName: 'register-username',
        functionArgs: [stringAsciiCV(checkedName)],
        postConditionMode: PostConditionMode.Allow,
        onFinish: () => {
          setStatus(`✅ Reserved "${checkedName}" successfully!`);
          setReserving(false);
          setName('');
          setNameAvailable(false);
          setCheckedName(null);
          refreshOwnership();
        },
        onCancel: () => {
          setStatus('Reservation cancelled.');
          setReserving(false);
        },
      });
    } catch (error: any) {
      setStatus(`❌ Error: ${error.message}`);
      setReserving(false);
    }
  };

  const handleRelease = async () => {
    if (!ownedName) {
      return;
    }
    const target = ownedName;
    setReleaseLoading(true);
    setStatus('');
    try {
      await openContractCall({
        userSession,
        network,
        anchorMode: AnchorMode.Any,
        contractAddress: NAME_CONTRACT_ADDRESS,
        contractName: NAME_CONTRACT_NAME,
        functionName: 'release-username',
        functionArgs: [stringAsciiCV(target)],
        postConditionMode: PostConditionMode.Allow,
        onFinish: () => {
          setStatus(`ℹ️ Released "${target}".`);
          setReleaseLoading(false);
          setName('');
          setNameAvailable(false);
          setCheckedName(null);
          refreshOwnership();
        },
        onCancel: () => {
          setStatus('Release cancelled.');
          setReleaseLoading(false);
        },
      });
    } catch (error: any) {
      setStatus(`❌ Error: ${error.message}`);
      setReleaseLoading(false);
    }
  };

  const primaryLabel = checking ? '⏳ Checking...' : reserving ? '⏳ Reserving...' : isReserveReady ? '🪪 Get Name' : '🔍 Check';
  const primaryDisabled = checking || reserving || (!isReserveReady && isNameLocked);
  const primaryAction = isReserveReady ? handleReserve : checkName;

  return (
    <div className="contract-card">
      <h3>🏷️ Reserve Name</h3>
      <p>Reserve a unique name on the Stacks network. Your on-chain identity!</p>
      <div className="contract-form">
        <button className="contract-button" onClick={() => setShowPopup(true)}>
          🏷️ Reserve Name
        </button>
      </div>

      {showPopup && createPortal(
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.6)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onClick={handleClosePopup}
        >
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 10,
              padding: 24,
              minWidth: 320,
              maxWidth: '90vw',
              boxShadow: '0 8px 32px rgba(0,0,0,0.5)'
            }}
            onClick={(event) => event.stopPropagation()}
          >
            <h3 style={{marginBottom: 8}}>Reserve your name</h3>
            <p style={{marginBottom: 16, color: '#aaa', fontSize: 14}}>
              Enter a unique name (min. 3 characters, only letters, numbers and hyphens).<br/>
              You can release your name and choose a new one at any time if available.
            </p>
            <div className="input-group">
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. my-name"
                maxLength={50}
                style={{marginBottom: 8}}
                disabled={isNameLocked || reserving}
              />
              {ownershipLoading && (
                <p style={{ fontSize: 13, color: '#aaa', margin: '4px 0 0' }}>Checking your current name…</p>
              )}
              {ownershipError && (
                <div style={{ fontSize: 13, color: '#f88', marginTop: 4 }}>{ownershipError}</div>
              )}
              {ownedName && !ownershipLoading && !ownershipError && (
                <div style={{ fontSize: 13, color: '#f3c46f', marginTop: 4 }}>
                  You already reserved <strong>{ownedName}</strong>. Release it before choosing another.
                </div>
              )}
            </div>
            <div className="contract-form" style={{marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8}}>
              <button
                className="contract-button"
                onClick={primaryAction}
                disabled={primaryDisabled}
                style={{width: '100%'}}
                title={isNameLocked ? 'Release your current name before reserving another' : undefined}
              >
                {primaryLabel}
              </button>
              {ownedName && !ownershipLoading && (
                <button
                  className="contract-button"
                  style={{background: '#512c2c', color: '#fff', width: '100%'}}
                  onClick={handleRelease}
                  disabled={releaseLoading}
                >
                  {releaseLoading ? '⏳ Releasing...' : '♻️ Release Name'}
                </button>
              )}
              <button
                className="contract-button"
                style={{background: '#333', color: '#fff', width: '100%'}}
                onClick={handleClosePopup}
              >
                Cancel
              </button>
            </div>
            {status && (
              <div className={`status-message ${status.includes('✅') ? 'success' : status.includes('❌') ? 'error' : 'info'}`} style={{marginTop: 10}}>
                {status}
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
