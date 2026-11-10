import { useState, useEffect, useCallback, useRef } from 'react';
import { Navbar } from './components/Navbar.tsx';
import { SurveyView } from './components/SurveyView.tsx';
import { DashboardView } from './components/DashboardView.tsx';
import { CodeGuideView } from './components/CodeGuideView.tsx';
import { QRCodeModal } from './components/QRCodeModal.tsx';
import { DashboardSummary } from './types.ts';

const CACHE_KEY = 'liveeval_summary_cache_v2';

export default function App() {
  const [currentTab, setCurrentTab] = useState<'survey' | 'dashboard' | 'guide'>('dashboard');
  
  // Initialize with cached summary if available to prevent flashing 0 during deployment wakeup
  const [summary, setSummary] = useState<DashboardSummary | null>(() => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch {}
    return null;
  });

  const [isConnected, setIsConnected] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [surveyUrl, setSurveyUrl] = useState('');
  const broadcastChannelRef = useRef<BroadcastChannel | null>(null);

  // Determine initial tab from query parameter (?view=survey or ?view=dashboard)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const viewParam = params.get('view');
      if (viewParam === 'survey') {
        setCurrentTab('survey');
      } else if (viewParam === 'guide') {
        setCurrentTab('guide');
      } else if (viewParam === 'dashboard') {
        setCurrentTab('dashboard');
      } else if (window.innerWidth < 768) {
        // If mobile screen and no param, default to survey
        setCurrentTab('survey');
      }

      // Generate direct survey link for attendees
      const base = window.location.origin + window.location.pathname;
      setSurveyUrl(`${base}?view=survey`);
    }
  }, []);

  // Update summary and cache
  const updateSummaryState = useCallback((newSummary: DashboardSummary) => {
    setSummary(newSummary);
    setIsConnected(true);
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(newSummary));
    } catch {}
  }, []);

  // Fetch summary from backend
  const fetchSummary = useCallback(async () => {
    try {
      const res = await fetch('/api/evaluations', {
        headers: { 'Cache-Control': 'no-cache' }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.summary) {
          updateSummaryState(data.summary);
        }
      }
    } catch (err) {
      console.warn('API polling fallback in progress:', err);
    }
  }, [updateSummaryState]);

  // Real-time synchronization: SSE + Cross-Tab BroadcastChannel + Polling
  useEffect(() => {
    // Initial fetch
    fetchSummary();

    // 1. Cross-tab BroadcastChannel for 0-latency instant updates between tabs/windows
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        const bc = new BroadcastChannel('liveeval_broadcast');
        broadcastChannelRef.current = bc;
        bc.onmessage = (event) => {
          if (event.data?.type === 'UPDATE' && event.data?.summary) {
            updateSummaryState(event.data.summary);
          } else if (event.data?.type === 'REFRESH') {
            fetchSummary();
          }
        };
      }
    } catch (err) {
      console.warn('BroadcastChannel not available:', err);
    }

    // 2. Server-Sent Events (SSE) listener
    let eventSource: EventSource | null = null;
    let reconnectTimeout: any = null;

    function connectSSE() {
      try {
        eventSource = new EventSource('/api/stream');

        eventSource.onopen = () => {
          setIsConnected(true);
        };

        const handleIncoming = (event: MessageEvent) => {
          try {
            const data = JSON.parse(event.data);
            if (data.summary) {
              updateSummaryState(data.summary);
            }
          } catch (e) {
            console.error('Error parsing SSE event:', e);
          }
        };

        eventSource.onmessage = handleIncoming;
        eventSource.addEventListener('message', handleIncoming);
        eventSource.addEventListener('init', handleIncoming);

        eventSource.onerror = () => {
          eventSource?.close();
          // Auto reconnect after 3 seconds
          reconnectTimeout = setTimeout(connectSSE, 3000);
        };
      } catch (err) {
        console.warn('SSE connection init error, active polling fallback:', err);
      }
    }

    connectSSE();

    // 3. Resilient periodic poll every 5 seconds (guarantees fresh data even if SSE is buffered by proxies)
    const pollInterval = setInterval(() => {
      fetchSummary();
    }, 5000);

    return () => {
      eventSource?.close();
      clearTimeout(reconnectTimeout);
      clearInterval(pollInterval);
      if (broadcastChannelRef.current) {
        broadcastChannelRef.current.close();
      }
    };
  }, [fetchSummary, updateSummaryState]);

  const handleSelectTab = (tab: 'survey' | 'dashboard' | 'guide') => {
    setCurrentTab(tab);
    if (typeof window !== 'undefined' && window.history?.pushState) {
      const url = new URL(window.location.href);
      url.searchParams.set('view', tab);
      window.history.pushState({}, '', url.toString());
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col selection:bg-indigo-100 selection:text-indigo-900">
      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={handleSelectTab}
        onOpenQR={() => setIsQRModalOpen(true)}
      />

      {/* Main View Area */}
      <main className="flex-1 pb-12">
        {currentTab === 'survey' && (
          <SurveyView
            onSubmittedSuccess={() => {
              fetchSummary();
              try {
                broadcastChannelRef.current?.postMessage({ type: 'REFRESH' });
              } catch {}
            }}
          />
        )}

        {currentTab === 'dashboard' && (
          <DashboardView
            summary={summary}
            isConnected={isConnected}
            onOpenQR={() => setIsQRModalOpen(true)}
            onRefresh={fetchSummary}
          />
        )}

        {currentTab === 'guide' && <CodeGuideView />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">LiveEval</span>
            <span>·</span>
            <span>ระบบเก็บและแสดงผลความพึงพอใจการอบรมแบบเรียลไทม์</span>
          </div>

          <div className="flex items-center gap-4 text-slate-500">
            <button
              onClick={() => handleSelectTab('survey')}
              className="hover:text-slate-800 transition-colors cursor-pointer"
            >
              หน้าแบบประเมิน
            </button>
            <span>·</span>
            <button
              onClick={() => handleSelectTab('dashboard')}
              className="hover:text-slate-800 transition-colors cursor-pointer"
            >
              แดชบอร์ดจอใหญ่
            </button>
            <span>·</span>
            <button
              onClick={() => handleSelectTab('guide')}
              className="hover:text-slate-800 transition-colors cursor-pointer"
            >
              โค้ด Firebase 2 ไฟล์
            </button>
          </div>
        </div>
      </footer>

      {/* QR Code Modal for attendees to scan */}
      <QRCodeModal
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
        surveyUrl={surveyUrl}
      />
    </div>
  );
}
