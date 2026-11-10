import { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar.tsx';
import { SurveyView } from './components/SurveyView.tsx';
import { DashboardView } from './components/DashboardView.tsx';
import { CodeGuideView } from './components/CodeGuideView.tsx';
import { QRCodeModal } from './components/QRCodeModal.tsx';
import { DashboardSummary } from './types.ts';

export default function App() {
  const [currentTab, setCurrentTab] = useState<'survey' | 'dashboard' | 'guide'>('dashboard');
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [surveyUrl, setSurveyUrl] = useState('');

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

  // Fetch initial summary
  const fetchSummary = useCallback(async () => {
    try {
      const res = await fetch('/api/evaluations');
      if (res.ok) {
        const data = await res.json();
        if (data.summary) {
          setSummary(data.summary);
        }
      }
    } catch (err) {
      console.warn('Could not fetch evaluations:', err);
    }
  }, []);

  // Real-time Server-Sent Events (SSE) connection
  useEffect(() => {
    fetchSummary();

    let eventSource: EventSource | null = null;
    let reconnectTimeout: any = null;

    function connectSSE() {
      try {
        eventSource = new EventSource('/api/stream');

        eventSource.onopen = () => {
          setIsConnected(true);
        };

        eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.summary) {
              setSummary(data.summary);
            }
          } catch (e) {
            console.error('Error parsing SSE event:', e);
          }
        };

        eventSource.addEventListener('init', (event: any) => {
          try {
            const data = JSON.parse(event.data);
            if (data.summary) {
              setSummary(data.summary);
            }
          } catch (e) {
            console.error('Error parsing SSE init:', e);
          }
        });

        eventSource.onerror = () => {
          setIsConnected(false);
          eventSource?.close();
          // Auto reconnect after 3 seconds
          reconnectTimeout = setTimeout(connectSSE, 3000);
        };
      } catch (err) {
        console.warn('SSE connection failed, falling back to polling:', err);
      }
    }

    connectSSE();

    // Fallback periodic poll every 10 seconds just in case SSE drops
    const pollInterval = setInterval(() => {
      fetchSummary();
    }, 10000);

    return () => {
      eventSource?.close();
      clearTimeout(reconnectTimeout);
      clearInterval(pollInterval);
    };
  }, [fetchSummary]);

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
              className="hover:text-slate-800 transition-colors"
            >
              หน้าแบบประเมิน
            </button>
            <span>·</span>
            <button
              onClick={() => handleSelectTab('dashboard')}
              className="hover:text-slate-800 transition-colors"
            >
              แดชบอร์ดจอใหญ่
            </button>
            <span>·</span>
            <button
              onClick={() => handleSelectTab('guide')}
              className="hover:text-slate-800 transition-colors"
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
