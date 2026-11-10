import React, { useState } from 'react';
import {
  Download,
  Maximize2,
  Minimize2,
  QrCode,
  RotateCcw,
  Sparkles,
  Users,
  Award,
  TrendingUp,
  MessageSquareQuote,
  Radio,
  PieChart as PieChartIcon,
  SlidersHorizontal
} from 'lucide-react';
import { DashboardSummary, LIKERT_LEVELS, QUESTION_DEFINITIONS, PASTEL_STAR_COLORS } from '../types.ts';
import { PastelPieChart, PieSliceData } from './PastelPieChart.tsx';

interface DashboardViewProps {
  summary: DashboardSummary | null;
  isConnected: boolean;
  onOpenQR: () => void;
  onRefresh: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  summary,
  isConnected,
  onOpenQR,
  onRefresh
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [pieMode, setPieMode] = useState<'questions' | 'ratings' | string>('questions');

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const handleDownloadCSV = () => {
    window.location.href = '/api/export-csv';
  };

  const handleSeedDemo = async () => {
    setIsSeeding(true);
    try {
      await fetch('/api/seed-sample', { method: 'POST' });
      onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSeeding(false);
    }
  };

  const handleReset = async () => {
    if (!window.confirm('คุณแน่ใจหรือไม่ว่าต้องการล้างข้อมูลการประเมินทั้งหมดสำหรับการจัดอบรมรอบใหม่?')) {
      return;
    }
    setIsResetting(true);
    try {
      await fetch('/api/reset', { method: 'POST' });
      onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setIsResetting(false);
    }
  };

  const totalCount = summary?.totalCount || 0;
  const overallAvg = summary?.overallAvg || 0;
  const likert = summary?.likert || { label: 'รอข้อมูลการประเมิน', level: 0, color: '#94a3b8' };
  const questions = summary?.questions || [];
  const recentSuggestions = summary?.recentSuggestions || [];

  // Find best question
  const bestQuestion = questions.length > 0
    ? [...questions].sort((a, b) => b.avg - a.avg)[0]
    : null;

  // Prepare Pie Chart Data
  let pieSlices: PieSliceData[] = [];
  let pieCenterLabel = 'คะแนนเฉลี่ยรวม';
  let pieCenterValue = overallAvg.toFixed(2);
  let pieCenterSubtext = likert.label.split(' ')[0];

  if (pieMode === 'questions') {
    pieSlices = questions.map((q) => {
      const def = QUESTION_DEFINITIONS.find(d => d.id === q.id);
      return {
        id: q.id,
        label: q.title,
        shortLabel: def?.shortTitle || q.title,
        value: q.avg,
        formattedValue: `${q.avg.toFixed(2)} คะแนน`,
        pastelColor: def?.pastelColor || '#86efac',
        pastelHoverColor: def?.pastelHoverColor || '#a7f3d0',
        textColor: '#0f172a',
        subtext: `เกณฑ์: ${q.likert.label.split(' ')[0]}`
      };
    });
    pieCenterLabel = 'คะแนนเฉลี่ยรวม';
    pieCenterValue = `${overallAvg.toFixed(2)}`;
    pieCenterSubtext = `ระดับ: ${likert.label.split(' ')[0]}`;
  } else if (pieMode === 'ratings') {
    const totalVotes = Object.values(summary?.scoreDistribution || {}).reduce((a, b) => a + b, 0);
    pieSlices = [5, 4, 3, 2, 1].map((star) => {
      const count = summary?.scoreDistribution?.[star] || 0;
      const conf = PASTEL_STAR_COLORS[star];
      return {
        id: `star-${star}`,
        label: conf.label,
        shortLabel: `${star} ดาว`,
        value: count,
        formattedValue: `${count} คะแนน`,
        pastelColor: conf.color,
        pastelHoverColor: conf.hover,
        textColor: '#0f172a',
        subtext: totalVotes > 0 ? `${((count / totalVotes) * 100).toFixed(1)}% ของทั้งหมด` : '0%'
      };
    });
    pieCenterLabel = 'ผู้ตอบทั้งหมด';
    pieCenterValue = `${totalCount} คน`;
    pieCenterSubtext = `${totalVotes} คะแนนที่ได้รับ`;
  } else {
    // Specific question distribution
    const targetQ = questions.find(q => q.id === pieMode);
    const def = QUESTION_DEFINITIONS.find(d => d.id === pieMode);
    if (targetQ) {
      pieSlices = [5, 4, 3, 2, 1].map((star) => {
        const count = targetQ.distribution?.[star] || 0;
        const conf = PASTEL_STAR_COLORS[star];
        return {
          id: `${targetQ.id}-star-${star}`,
          label: conf.label,
          shortLabel: `${star} ดาว`,
          value: count,
          formattedValue: `${count} คน`,
          pastelColor: conf.color,
          pastelHoverColor: conf.hover,
          textColor: '#0f172a',
          subtext: totalCount > 0 ? `${((count / totalCount) * 100).toFixed(1)}% ของผู้ตอบ` : '0%'
        };
      });
      pieCenterLabel = def?.shortTitle || 'คะแนนเฉลี่ย';
      pieCenterValue = targetQ.avg.toFixed(2);
      pieCenterSubtext = targetQ.likert.label.split(' ')[0];
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">

      {/* Top Bar for Projector Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Radio className={`w-3.5 h-3.5 ${isConnected ? 'text-emerald-600 animate-pulse' : 'text-slate-400'}`} />
              <span>{isConnected ? 'LIVE SYNC (อัปเดตอัตโนมัติ)' : 'กำลังเชื่อมต่อ'}</span>
            </span>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900">
              แดชบอร์ดสรุปผลการประเมินการอบรม
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            ผลคะแนนประมวลผลทันทีเมื่อผู้เข้าอบรมกดส่ง พร้อมคำนวณค่าเฉลี่ยและแปลผลตามเกณฑ์มาตรฐาน
          </p>
        </div>

        {/* Action Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={toggleFullscreen}
            className="px-3 py-2 text-xs font-medium bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            title="สลับโหมดเต็มจอสำหรับขึ้นโปรเจกเตอร์"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            <span>{isFullscreen ? 'ย่อหน้าจอ' : 'โหมดเต็มจอ'}</span>
          </button>

          <button
            onClick={onOpenQR}
            className="px-3.5 py-2 text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <QrCode className="w-4 h-4" />
            <span>แสดง QR Code บนจอ</span>
          </button>

          <button
            onClick={handleDownloadCSV}
            className="px-3.5 py-2 text-xs font-medium bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>ดาวน์โหลด CSV (Excel)</span>
          </button>

          <button
            onClick={handleSeedDemo}
            disabled={isSeeding}
            className="px-3 py-2 text-xs font-medium bg-white hover:bg-slate-50 text-slate-700 rounded-xl transition-all border border-slate-200 shadow-xs flex items-center gap-1.5 cursor-pointer"
            title="เพิ่มข้อมูลตัวอย่าง 5 รายการสำหรับทดสอบระบบ"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>{isSeeding ? 'กำลังสร้าง...' : 'จำลองข้อมูล (Demo)'}</span>
          </button>

          <button
            onClick={handleReset}
            disabled={isResetting}
            className="px-2.5 py-2 text-xs font-medium text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all border border-transparent hover:border-rose-200 cursor-pointer"
            title="ล้างข้อมูลทั้งหมดเพื่อเริ่มรอบใหม่"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Top 4 KPI Cards: White Background with Soft Pastel Accents */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Total Respondents */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">จำนวนผู้ตอบแบบสอบถาม</span>
            <span className="p-1.5 rounded-lg bg-sky-50 text-sky-600">
              <Users className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl sm:text-5xl font-extrabold text-slate-900 tabular-nums tracking-tight">
              {totalCount}
            </span>
            <span className="text-sm text-slate-500">คน</span>
          </div>
          <div className="mt-3 text-xs text-sky-700 flex items-center gap-1.5 font-medium">
            <span className="w-2 h-2 rounded-full bg-sky-400"></span>
            <span>บันทึกผ่านสมาร์ตโฟนเรียลไทม์</span>
          </div>
        </div>

        {/* KPI 2: Overall Score */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">คะแนนความพึงพอใจเฉลี่ยรวม</span>
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <Award className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl sm:text-5xl font-extrabold text-slate-900 tabular-nums tracking-tight">
              {overallAvg.toFixed(2)}
            </span>
            <span className="text-sm text-slate-400">/ 5.00</span>
          </div>
          <div className="mt-3 text-xs font-semibold text-emerald-700">
            ระดับ: {likert.label}
          </div>
        </div>

        {/* KPI 3: Top Rated Question */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">มิติที่ได้คะแนนสูงสุด</span>
            <span className="p-1.5 rounded-lg bg-purple-50 text-purple-600">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="text-sm sm:text-base font-semibold text-slate-800 truncate" title={bestQuestion?.title}>
            {bestQuestion ? bestQuestion.title.replace(/^\d+\.\s*/, '') : '-'}
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 tabular-nums">
              {bestQuestion ? bestQuestion.avg.toFixed(2) : '0.00'}
            </span>
            <span className="text-xs text-slate-500">คะแนนเฉลี่ย</span>
          </div>
        </div>

        {/* KPI 4: 5-level Academic Likert Criteria Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs text-[11px] text-slate-600 space-y-1">
          <div className="font-semibold text-slate-800 text-xs mb-2 flex items-center justify-between">
            <span>เกณฑ์การแปลผลคะแนน (Likert 5 ระดับ)</span>
          </div>
          {LIKERT_LEVELS.map((lvl) => (
            <div key={lvl.level} className="flex items-center justify-between">
              <span className="font-mono font-bold text-slate-800">{lvl.range}</span>
              <span className="text-slate-600">{lvl.label}</span>
            </div>
          ))}
        </div>

      </div>

      {/* Main Content Grid: Pastel Chart (7 cols) + Suggestions Feed (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left Column: Pastel Pie Chart / Bar Chart Card */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
          
          {/* Card Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#86efac]"></span>
                <h2 className="text-base font-bold text-slate-900">
                  ผลการประเมินแยกตามรายข้อ (Pastel Chart)
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                เปรียบเทียบค่าเฉลี่ยและสัดส่วนคะแนนด้วยกราฟวงกลมพาสเทล
              </p>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 font-medium shrink-0">
              <PieChartIcon className="w-3.5 h-3.5 text-emerald-600" />
              <span>กราฟวงกลม (Pie Chart)</span>
            </div>
          </div>

          {/* Sub-Filters for Pie Chart */}
          {totalCount > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap text-xs">
              <span className="text-slate-500 flex items-center gap-1 mr-1">
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>มุมมอง:</span>
              </span>

              <button
                type="button"
                onClick={() => setPieMode('questions')}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  pieMode === 'questions'
                    ? 'bg-slate-900 text-white font-medium shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                คะแนนเฉลี่ย 5 ข้อ
              </button>

              <button
                type="button"
                onClick={() => setPieMode('ratings')}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  pieMode === 'ratings'
                    ? 'bg-slate-900 text-white font-medium shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                สัดส่วนดาว 1-5
              </button>

              {questions.map((q, idx) => (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => setPieMode(q.id)}
                  className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                    pieMode === q.id
                      ? 'bg-slate-900 text-white font-medium shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                  title={q.title}
                >
                  ข้อ {idx + 1}
                </button>
              ))}
            </div>
          )}

          {/* Main Visualizer: Pastel Pie/Donut Chart */}
          {questions.length === 0 || totalCount === 0 ? (
            <div className="text-center py-16 text-slate-400 text-sm">
              ยังไม่มีผู้ตอบแบบประเมิน สแกน QR Code ด้านบนเพื่อส่งคะแนนแรก
            </div>
          ) : (
            <div className="pt-2">
              <PastelPieChart
                data={pieSlices}
                centerLabel={pieCenterLabel}
                centerValue={pieCenterValue}
                centerSubtext={pieCenterSubtext}
                isDonut={true}
              />
            </div>
          )}
        </div>

        {/* Right Column: Live Suggestions Stream (Feed) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col h-[560px]">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4 shrink-0">
            <div className="flex items-center gap-2">
              <MessageSquareQuote className="w-4 h-4 text-purple-600" />
              <h2 className="text-base font-bold text-slate-900">ข้อเสนอแนะล่าสุด</h2>
              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-purple-50 text-purple-700 border border-purple-200 tabular-nums">
                {recentSuggestions.length}
              </span>
            </div>
            <span className="text-xs text-slate-400">อัปเดตสด</span>
          </div>

          {/* Suggestions List */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {recentSuggestions.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 text-sm p-6">
                <MessageSquareQuote className="w-8 h-8 text-slate-300 mb-2 stroke-1" />
                <p>ยังไม่มีข้อเสนอแนะเพิ่มเติมจากผู้เข้าอบรม</p>
                <p className="text-xs text-slate-400 mt-1">ข้อเสนอแนะจะปรากฏที่นี่ทันทีที่มีผู้ส่งความคิดเห็น</p>
              </div>
            ) : (
              recentSuggestions.map((item) => {
                const date = new Date(item.timestamp);
                const timeStr = date.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
                return (
                  <div
                    key={item.id}
                    className="bg-slate-50/80 border border-slate-200 rounded-xl p-3.5 space-y-1.5 hover:border-slate-300 hover:bg-white transition-colors"
                  >
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span className="text-purple-700 font-medium">ผู้เข้าอบรม</span>
                      <div className="flex items-center gap-2">
                        <span className="tabular-nums">คะแนน {item.score.toFixed(1)}/5</span>
                        <span>·</span>
                        <span>เวลา {timeStr} น.</span>
                      </div>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-800 leading-relaxed break-words">
                      "{item.text}"
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
