import React, { useState } from 'react';
import { ToastProvider, useToast } from './components/Toast';
import { Header } from './components/Header';
import { PoForm } from './components/PoForm';
import { JsonViewer } from './components/JsonViewer';
import { ApiResponseConsole } from './components/ApiResponseConsole';
import { RequestHistory } from './components/RequestHistory';
import { INITIAL_PO_DATA } from './data/sampleData';

function PoApp() {
  const { addToast } = useToast();

  const [poList, setPoList] = useState(INITIAL_PO_DATA);
  const [activePoIndex, setActivePoIndex] = useState(0);

  // API Call state
  const [isSending, setIsSending] = useState(false);
  const [responseState, setResponseState] = useState(null);
  const [history, setHistory] = useState([]);

  // Reset to initial sample
  const handleResetToSample = () => {
    setPoList(JSON.parse(JSON.stringify(INITIAL_PO_DATA)));
    setActivePoIndex(0);
    addToast('Restored default Purchase Order data', 'info');
  };

  // POST Dispatch logic (Uses backend proxy / silent env in background)
  const handleSendPost = async () => {
    setIsSending(true);
    const startTime = performance.now();
    const payload = JSON.parse(JSON.stringify(poList));

    try {
      // Dispatch via serverless backend proxy (/api/dispatch-po)
      let response = await fetch('/api/dispatch-po', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      // If serverless proxy is not reachable, fallback to direct fetch
      if (response.status === 404) {
        const fallbackUrl = import.meta.env.VITE_API_URL || '';
        const apiKey = import.meta.env.VITE_API_KEY || '';
        const headerName = import.meta.env.VITE_API_KEY_HEADER || 'x-api-key';
        
        if (fallbackUrl) {
          const fallbackHeaders = { 'Content-Type': 'application/json' };
          if (apiKey) fallbackHeaders[headerName] = apiKey;

          try {
            const directRes = await fetch(fallbackUrl, {
              method: 'POST',
              headers: fallbackHeaders,
              body: JSON.stringify(payload)
            });
            response = directRes;
          } catch {
            // Keep original response if direct fetch fails (e.g. CORS)
          }
        }
      }

      const endTime = performance.now();
      const latency = Math.round(endTime - startTime);

      let responseBody;
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        responseBody = await response.json();
      } else {
        responseBody = await response.text();
      }

      const isSuccess = response.ok;
      const resResult = {
        status: response.status,
        statusText: response.statusText,
        data: responseBody,
        latency,
        isSuccess,
        timestamp: new Date().toLocaleTimeString(),
        error: isSuccess ? null : `Server returned error (${response.status} ${response.statusText})`
      };

      setResponseState(resResult);

      // Add to history
      const historyItem = {
        id: Date.now(),
        timestamp: resResult.timestamp,
        status: `${response.status} ${response.statusText}`,
        isSuccess,
        latency,
        poNumber: payload[0]?.po_number || 'Batch PO',
        variantsCount: payload.reduce((acc, curr) => acc + (curr.order_variants?.length || 0), 0),
        result: resResult
      };
      setHistory(prev => [historyItem, ...prev]);

      if (isSuccess) {
        addToast(`Success! Purchase Order processed in ${latency}ms`, 'success');
      } else {
        addToast(`Submission failed (${response.status})`, 'error');
      }

    } catch (err) {
      const endTime = performance.now();
      const latency = Math.round(endTime - startTime);

      const resResult = {
        status: 0,
        statusText: 'Transmission Failed',
        data: null,
        latency,
        isSuccess: false,
        timestamp: new Date().toLocaleTimeString(),
        error: err.message || 'Network request failed'
      };

      setResponseState(resResult);

      const historyItem = {
        id: Date.now(),
        timestamp: resResult.timestamp,
        status: 'Error',
        isSuccess: false,
        latency,
        poNumber: payload[0]?.po_number || 'Batch PO',
        variantsCount: payload.reduce((acc, curr) => acc + (curr.order_variants?.length || 0), 0),
        result: resResult
      };
      setHistory(prev => [historyItem, ...prev]);

      addToast('Could not complete request', 'error');
    } finally {
      setIsSending(false);
    }
  };

  // Export JSON file
  const handleExportJson = () => {
    const blob = new Blob([JSON.stringify(poList, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `purchase_order_${poList[0]?.po_number || 'export'}.json`;
    a.click();
    URL.revokeObjectURL(url);
    addToast('Downloaded JSON file', 'success');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Top Header */}
      <Header
        onResetToSample={handleResetToSample}
        onSendPost={handleSendPost}
        isSending={isSending}
        onExportJson={handleExportJson}
      />

      {/* Main Container */}
      <main style={{
        maxWidth: '1600px',
        width: '100%',
        margin: '0 auto',
        padding: '24px',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: '24px'
      }}>
        
        {/* Two-Column Responsive Split */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.25fr) minmax(0, 1fr)',
          gap: '24px',
          alignItems: 'start'
        }}
        className="responsive-grid"
        >
          {/* Left Column: Interactive PO Form */}
          <div>
            <PoForm
              poList={poList}
              setPoList={setPoList}
              activePoIndex={activePoIndex}
              setActivePoIndex={setActivePoIndex}
            />
          </div>

          {/* Right Column: Live JSON Inspector & Response Console */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', position: 'sticky', top: '80px' }}>
            
            {/* JSON Payload Inspector & Editor */}
            <JsonViewer
              poList={poList}
              onSyncJsonToForm={(newPoList) => {
                setPoList(newPoList);
                setActivePoIndex(0);
              }}
            />

            {/* Live API Response Console */}
            <ApiResponseConsole
              responseState={responseState}
            />

            {/* Audit History */}
            <RequestHistory
              history={history}
              onSelectHistoryItem={(item) => {
                setResponseState(item.result);
                addToast(`Loaded history for ${item.poNumber}`, 'info');
              }}
              onClearHistory={() => setHistory([])}
            />

          </div>
        </div>

      </main>

      {/* Footer */}
      <footer style={{
        marginTop: 'auto',
        borderTop: '1px solid var(--border-subtle)',
        padding: '16px 24px',
        textAlign: 'center',
        fontSize: '0.75rem',
        color: 'var(--text-muted)'
      }}>
        Purchase Order Portal • Built with React & Vite
      </footer>

    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <PoApp />
    </ToastProvider>
  );
}