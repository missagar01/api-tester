import React from 'react';
import { Send, RotateCcw, Download } from 'lucide-react';

export const Header = ({
  onResetToSample,
  onSendPost,
  isSending,
  onExportJson
}) => {
  return (
    <header style={{
      borderBottom: '1px solid var(--border-subtle)',
      background: 'rgba(255, 255, 255, 0.9)',
      backdropFilter: 'blur(20px)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      padding: '14px 24px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)'
    }}>
      <div style={{
        maxWidth: '1600px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        {/* Brand & Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #4f46e5 0%, #0891b2 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(79, 70, 229, 0.3)'
          }}>
            <Send size={22} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1 style={{ fontSize: '1.25rem', margin: 0, fontWeight: 700, letterSpacing: '-0.02em', color: '#0f172a' }}>
                Purchase Order Portal
              </h1>
              <span className="badge badge-emerald">
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#059669' }} />
                Ready
              </span>
            </div>
            <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0 }}>
              ERP Purchase Order Management & Dispatch System
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={onResetToSample}
            className="btn btn-secondary btn-sm"
            title="Reset to default sample data"
          >
            <RotateCcw size={14} />
            <span>Load Sample</span>
          </button>

          <button
            onClick={onExportJson}
            className="btn btn-secondary btn-sm"
            title="Download payload as JSON file"
          >
            <Download size={14} />
            <span>Export JSON</span>
          </button>

          {/* Primary Submit Button */}
          <button
            onClick={onSendPost}
            disabled={isSending}
            className="btn btn-success"
            style={{
              padding: '9px 20px',
              fontWeight: 600,
              letterSpacing: '0.02em',
              boxShadow: '0 2px 10px rgba(5, 150, 105, 0.3)'
            }}
          >
            {isSending ? (
              <>
                <div
                  className="animate-spin"
                  style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTopColor: '#fff',
                    borderRadius: '50%'
                  }}
                />
                <span>Submitting...</span>
              </>
            ) : (
              <>
                <Send size={15} />
                <span>Submit Purchase Order</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
