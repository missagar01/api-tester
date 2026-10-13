import React from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Terminal,
  Activity
} from 'lucide-react';

export const ApiResponseConsole = ({ responseState }) => {
  if (!responseState) {
    return (
      <div className="glass-panel" style={{ padding: '24px', textAlign: 'center', background: '#ffffff' }}>
        <div style={{
          width: '44px',
          height: '44px',
          borderRadius: '12px',
          background: '#f1f5f9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 12px',
          color: '#64748b'
        }}>
          <Activity size={22} />
        </div>
        <h3 style={{ fontSize: '0.95rem', color: '#0f172a', marginBottom: '4px' }}>
          Dispatch Status: Ready
        </h3>
        <p style={{ fontSize: '0.8rem', color: '#64748b', maxWidth: '380px', margin: '0 auto' }}>
          Click <strong style={{ color: '#059669' }}>"Submit Purchase Order"</strong> above to dispatch the order data.
        </p>
      </div>
    );
  }

  const { status, statusText, data, latency, error, isSuccess, timestamp } = responseState;

  return (
    <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#ffffff' }}>
      
      {/* Console Header */}
      <div style={{
        padding: '12px 18px',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '10px',
        background: '#ffffff'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Terminal size={17} color="#4f46e5" />
          <span style={{ fontWeight: 600, fontSize: '0.875rem', color: '#0f172a' }}>Server Response</span>
          
          {/* Status Badge */}
          <span className={`badge ${isSuccess ? 'badge-emerald' : 'badge-rose'}`}>
            {isSuccess ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
            <span>{status ? `${status} ${statusText}` : (isSuccess ? 'Success' : 'Error')}</span>
          </span>

          {/* Latency */}
          {latency !== undefined && (
            <span className="badge badge-gray" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Clock size={12} />
              <span>{latency} ms</span>
            </span>
          )}
        </div>

        {timestamp && (
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
            {timestamp}
          </span>
        )}
      </div>

      {/* Main Response Area */}
      <div style={{ padding: '16px', background: '#f8fafc', maxHeight: '300px', overflowY: 'auto' }}>
        <pre style={{
          margin: 0,
          fontSize: '0.8rem',
          fontFamily: 'var(--font-mono)',
          lineHeight: '1.5',
          color: isSuccess ? '#059669' : '#dc2626',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-all'
        }}>
          {typeof data === 'object' 
            ? JSON.stringify(data, null, 2) 
            : (data || (isSuccess ? '{"status": 200, "message": "Order processed successfully"}' : (error || 'Request failed')))}
        </pre>
      </div>

    </div>
  );
};
