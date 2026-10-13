import React from 'react';
import { History, CheckCircle2, XCircle, Trash2, Clock } from 'lucide-react';

export const RequestHistory = ({ history, onSelectHistoryItem, onClearHistory }) => {
  if (!history || history.length === 0) {
    return null;
  }

  return (
    <div className="glass-panel" style={{ padding: '16px', marginTop: '16px', background: '#ffffff' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <History size={16} color="#4f46e5" />
          <h3 style={{ fontSize: '0.875rem', fontWeight: 600, margin: 0, color: '#0f172a' }}>
            Recent Dispatches Audit Log ({history.length})
          </h3>
        </div>
        <button
          onClick={onClearHistory}
          className="btn btn-ghost btn-sm"
          style={{ fontSize: '0.725rem', padding: '2px 8px' }}
        >
          <Trash2 size={12} />
          <span>Clear History</span>
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto' }}>
        {history.map((item, idx) => (
          <div
            key={item.id || idx}
            onClick={() => onSelectHistoryItem(item)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 12px',
              borderRadius: 'var(--radius-md)',
              background: '#f8fafc',
              border: '1px solid var(--border-subtle)',
              cursor: 'pointer',
              fontSize: '0.785rem',
              transition: 'background 0.2s ease, border-color 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#f1f5f9';
              e.currentTarget.style.borderColor = 'var(--border-medium)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#f8fafc';
              e.currentTarget.style.borderColor = 'var(--border-subtle)';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span className={`badge ${item.isSuccess ? 'badge-emerald' : 'badge-rose'}`} style={{ padding: '2px 6px', fontSize: '0.7rem' }}>
                {item.isSuccess ? <CheckCircle2 size={11} /> : <XCircle size={11} />}
                <span>{item.status || 'Failed'}</span>
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', color: '#334155', fontWeight: 500 }}>
                {item.poNumber || 'PO Array'}
              </span>
              <span style={{ color: '#94a3b8' }}>•</span>
              <span style={{ color: '#64748b' }}>{item.variantsCount} item(s)</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#64748b' }}>
              <span>{item.latency}ms</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Clock size={12} />
                <span>{item.timestamp}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
