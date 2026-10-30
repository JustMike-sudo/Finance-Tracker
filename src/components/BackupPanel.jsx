import { useRef, useState } from 'react';
import useLedgerStore from '../store/useLedgerStore';
import { createBackup, parseBackup, transactionsToCsv } from '../utils/backup';

const count = (n, noun) => `${n} ${noun}${n === 1 ? '' : 's'}`;

function download(filename, text, type) {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

// All data lives in this browser, so this is the only way to move it to another
// device or to recover it if the browser's storage is cleared.
export default function BackupPanel() {
  const importData = useLedgerStore((s) => s.importData);
  const fileInput = useRef(null);
  const [pending, setPending] = useState(null); // a validated backup waiting for confirmation
  const [message, setMessage] = useState(null); // { kind: 'error' | 'ok', text }

  const today = new Date().toISOString().slice(0, 10);

  const exportBackup = () => {
    const backup = createBackup(useLedgerStore.getState());
    download(`fusion-ledger-backup-${today}.json`, JSON.stringify(backup, null, 2), 'application/json');
    setMessage({ kind: 'ok', text: 'Backup downloaded. Keep it somewhere safe.' });
  };

  const exportCsv = () => {
    const { transactions, archives } = useLedgerStore.getState();
    const all = [...transactions, ...Object.values(archives).flatMap((a) => a.transactions || [])];
    download(`fusion-ledger-transactions-${today}.csv`, transactionsToCsv(all), 'text/csv');
    setMessage({ kind: 'ok', text: `Exported ${all.length} transactions.` });
  };

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // lets the same file be chosen again
    if (!file) return;
    try {
      setPending(parseBackup(await file.text()));
      setMessage(null);
    } catch (err) {
      setPending(null);
      setMessage({ kind: 'error', text: err.message });
    }
  };

  const confirmRestore = () => {
    importData(pending);
    setPending(null);
    setMessage({ kind: 'ok', text: 'Backup restored.' });
  };

  return (
    <div className="vault-card backup-panel">
      <h3 className="card-title">Backup &amp; Export</h3>
      <p className="backup-note">
        Your data is stored only in this browser. Download a backup to keep it safe or move it to another device.
      </p>

      <div className="backup-actions">
        <button type="button" className="backup-btn" onClick={exportBackup}>⬇ Download backup</button>
        <button type="button" className="backup-btn" onClick={() => fileInput.current?.click()}>⬆ Restore backup</button>
        <button type="button" className="backup-btn" onClick={exportCsv}>📄 Export CSV</button>
      </div>
      <input ref={fileInput} type="file" accept="application/json,.json" onChange={handleFile} hidden />

      {pending && (
        <div className="lock-confirm" role="alert">
          <p className="lock-warning">
            Restoring replaces everything currently in the app with the backup's {count(pending.transactions.length, 'transaction')} and{' '}
            {count(Object.keys(pending.archives).length, 'archived month')}.
          </p>
          <div className="lock-actions">
            <button type="button" className="lock-cancel" onClick={() => setPending(null)}>Cancel</button>
            <button type="button" className="lock-confirm-btn" onClick={confirmRestore}>Replace my data</button>
          </div>
        </div>
      )}

      {message && (
        <p className={`backup-message backup-message--${message.kind}`} role="status">{message.text}</p>
      )}
    </div>
  );
}
