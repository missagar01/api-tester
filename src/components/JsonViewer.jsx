import React, { useState, useEffect } from 'react';
import { Copy, Check, Download, Edit3, Eye, AlertTriangle, RefreshCw } from 'lucide-react';
import { useToast } from './Toast';

export const JsonViewer = ({ poList, onSyncJsonToForm }) => {
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState('preview'); // 'preview' | 'editor'
  const [rawText, setRawText] = useState('');
  const [parseError, setParseError] = useState(null);
  const [copied, setCopied] = useState(false);

  // Keep rawText synced when poList changes in preview tab
  useEffect(() => {
    if (activeTab === 'preview') {
      setRawText(JSON.stringify(poList, null, 2));
      setParseError(null);
    }
  }, [poList, activeTab]);

  // Syntax highlighting helper for preview mode
  const highlightJson = (jsonString) => {
    if (!jsonString) return '';
    const escaped = jsonString
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    return escaped.replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
      (match) => {
        let cls = 'json-number';
        if (/^"/.test(match)) {
          if (/:$/.test(match)) {
            cls = 'json-key';
          } else {
            cls = 'json-string';
          }
        } else if (/true|false/.test(match)) {
          cls = 'json-boolean';
        } else if (/null/.test(match)) {
          cls = 'json-null';
        }
        return `<span class="${cls}">${match}</span>`;
      }
    );
  };

  const handleCopy = () => {
    const textToCopy = JSON.stringify(poList, null, 2);
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    addToast('Payload JSON copied to clipboard', 'info');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([JSON.stringify(poList, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `purchase_order_payload_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    addToast('JSON file downloaded successfully', 'success');
  };

  const handleRawChange = (e) => {
    const value = e.target.value;
    setRawText(value);
    try {
      const parsed = JSON.parse(value);
      if (!Array.isArray(parsed)) {
        setParseError('Root element must be a JSON array: [ { ... } ]');
      } else {
        setParseError(null);
      }
    } catch (err) {
      setParseError(err.message);
    }
  };

  const handleApplyEditor = () => {
    try {
      const parsed = JSON.parse(rawText);
      if (!Array.isArray(parsed)) {
        throw new Error('Root element must be a JSON array ([ { ... } ])');
      }
      onSyncJsonToForm(parsed);
      setActiveTab('preview');
      addToast('Raw JSON synced to Form', 'success');
    } catch (err) {
      setParseError(err.message);
      addToast(`Cannot apply invalid JSON: ${err.message}`, 'error');
    }
  };

  // Stats calculation
  const totalOrders = poList.length;
  const totalVariants = poList.reduce((acc, curr) => acc + (curr.order_variants?.length || 0), 0);
  const payloadBytes = new TextEncoder().encode(JSON.stringify(poList)).length;

  return (
    <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: '560px', overflow: 'hidden' }}>
      
      {/* Top Controls Header */}
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
        {/* Tab switchers */}
        <div style={{ display: 'flex', gap: '4px', background: '#f1f5f9', padding: '3px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
          <button
            type="button"
            className="btn btn-sm"
            style={{
              background: activeTab === 'preview' ? '#ffffff' : 'transparent',
              color: activeTab === 'preview' ? '#0f172a' : '#64748b',
              border: activeTab === 'preview' ? '1px solid var(--border-medium)' : '1px solid transparent',
              boxShadow: activeTab === 'preview' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
              fontWeight: 600
            }}
            onClick={() => setActiveTab('preview')}
          >
            <Eye size={13} />
            <span>Payload Preview</span>
          </button>

          <button
            type="button"
            className="btn btn-sm"
            style={{
              background: activeTab === 'editor' ? '#ffffff' : 'transparent',
              color: activeTab === 'editor' ? '#0f172a' : '#64748b',
              border: activeTab === 'editor' ? '1px solid var(--border-medium)' : '1px solid transparent',
              boxShadow: activeTab === 'editor' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
              fontWeight: 600
            }}
            onClick={() => {
              setRawText(JSON.stringify(poList, null, 2));
              setActiveTab('editor');
            }}
          >
            <Edit3 size={13} />
            <span>Raw JSON Editor</span>
          </button>
        </div>

        {/* Action icons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {activeTab === 'editor' && (
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={handleApplyEditor}
              disabled={!!parseError}
            >
              <RefreshCw size={13} />
              <span>Apply to Form</span>
            </button>
          )}

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={handleCopy}
            title="Copy formatted JSON"
          >
            {copied ? <Check size={13} color="#059669" /> : <Copy size={13} />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={handleDownload}
            title="Download payload JSON"
          >
            <Download size={13} />
            <span>Save</span>
          </button>
        </div>
      </div>

      {/* Metadata / Stats Bar */}
      <div style={{
        padding: '6px 18px',
        background: '#f8fafc',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '0.725rem',
        color: '#64748b'
      }}>
        <div style={{ display: 'flex', gap: '14px' }}>
          <span>Orders: <strong style={{ color: '#0f172a' }}>{totalOrders}</strong></span>
          <span>Variants: <strong style={{ color: '#0f172a' }}>{totalVariants}</strong></span>
          <span>Size: <strong style={{ color: '#0f172a' }}>{(payloadBytes / 1024).toFixed(2)} KB</strong></span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: parseError ? '#e11d48' : '#059669' }} />
          <span>{parseError ? 'JSON Invalid' : 'JSON Valid [Array]'}</span>
        </div>
      </div>

      {/* Content Area */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {activeTab === 'preview' ? (
          <div
            style={{
              padding: '16px',
              overflowY: 'auto',
              flex: 1,
              background: '#f8fafc',
              fontSize: '0.8rem',
              lineHeight: '1.6',
              fontFamily: 'var(--font-mono)'
            }}
          >
            <style>{`
              .json-key { color: #0284c7; font-weight: 600; }
              .json-string { color: #059669; }
              .json-number { color: #d97706; }
              .json-boolean { color: #7c3aed; font-weight: 600; }
              .json-null { color: #e11d48; font-style: italic; }
            `}</style>
            <pre
              style={{ margin: 0, color: '#334155' }}
              dangerouslySetInnerHTML={{ __html: highlightJson(JSON.stringify(poList, null, 2)) }}
            />
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, height: '100%' }}>
            {parseError && (
              <div style={{
                padding: '8px 14px',
                background: '#fff1f2',
                borderBottom: '1px solid #fecdd3',
                color: '#e11d48',
                fontSize: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <AlertTriangle size={14} />
                <span>{parseError}</span>
              </div>
            )}
            <textarea
              value={rawText}
              onChange={handleRawChange}
              spellCheck={false}
              style={{
                flex: 1,
                width: '100%',
                height: '100%',
                background: '#ffffff',
                color: '#0f172a',
                border: 'none',
                outline: 'none',
                padding: '16px',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.825rem',
                lineHeight: '1.5',
                resize: 'none'
              }}
            />
          </div>
        )}
      </div>

    </div>
  );
};
