import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { CheckCircle2, Send, RotateCcw, ShieldCheck, Sparkles, AlertCircle } from 'lucide-react';
import { QUESTION_DEFINITIONS } from '../types.ts';

const LOCAL_STORAGE_KEY = 'liveeval_attendee_submission_v1';

const SCORE_LABELS: Record<number, { text: string; hint: string }> = {
  1: { text: '1', hint: 'น้อยที่สุด' },
  2: { text: '2', hint: 'น้อย' },
  3: { text: '3', hint: 'ปานกลาง' },
  4: { text: '4', hint: 'มาก' },
  5: { text: '5', hint: 'มากที่สุด' }
};

interface SurveyViewProps {
  onSubmittedSuccess?: () => void;
}

export const SurveyView: React.FC<SurveyViewProps> = ({ onSubmittedSuccess }) => {
  const [scores, setScores] = useState<Record<string, number>>({});
  const [suggestion, setSuggestion] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submittedData, setSubmittedData] = useState<{
    timestamp: string;
    avg: number;
  } | null>(null);

  // Check localStorage for previous submission
  useEffect(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        setSubmittedData(JSON.parse(stored));
      }
    } catch {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  }, []);

  const handleSelectScore = (questionId: string, val: number) => {
    setScores(prev => ({ ...prev, [questionId]: val }));
    if (errorMsg) setErrorMsg(null);
  };

  const handleResetForTesting = () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    setSubmittedData(null);
    setScores({});
    setSuggestion('');
    setErrorMsg(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Verify all 5 questions answered
    const missing = QUESTION_DEFINITIONS.filter(q => !scores[q.id]);
    if (missing.length > 0) {
      setErrorMsg(`กรุณาตอบแบบสอบถามให้ครบทั้ง 5 ข้อ (ยังขาดข้อ ${missing.map(m => m.id.replace('q', '')).join(', ')})`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    const payload = {
      q1: scores.q1,
      q2: scores.q2,
      q3: scores.q3,
      q4: scores.q4,
      q5: scores.q5,
      suggestion: suggestion.trim() || undefined,
      clientToken: `client-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`
    };

    try {
      const res = await fetch('/api/evaluations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'ไม่สามารถบันทึกข้อมูลได้');
      }

      // Calculate average for receipt
      const avg = Number(((scores.q1 + scores.q2 + scores.q3 + scores.q4 + scores.q5) / 5).toFixed(2));
      const submissionInfo = {
        timestamp: new Date().toISOString(),
        avg
      };

      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(submissionInfo));
      setSubmittedData(submissionInfo);

      // Confetti celebration
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {
        // ignore if confetti fails
      }

      onSubmittedSuccess?.();
    } catch (err: any) {
      setErrorMsg(err.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsSubmitting(false);
    }
  };

  // If already submitted on this device
  if (submittedData) {
    const formattedDate = new Date(submittedData.timestamp).toLocaleString('th-TH', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });

    return (
      <div className="max-w-md mx-auto px-4 py-8">
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 text-center shadow-xs">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-emerald-200">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <span className="inline-block text-xs font-semibold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 mb-3">
            บันทึกผลเรียบร้อย
          </span>

          <h2 className="text-xl font-bold text-slate-900 mb-2">ขอบคุณสำหรับความคิดเห็น!</h2>
          <p className="text-sm text-slate-600 leading-relaxed mb-6">
            ข้อมูลการประเมินของคุณถูกส่งขึ้นจอแสดงผลแบบเรียลไทม์เรียบร้อยแล้ว เสียงของคุณมีคุณค่าอย่างยิ่งในการพัฒนาการจัดอบรมครั้งต่อไป
          </p>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 mb-6 text-left space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>เวลาที่บันทึกข้อมูล:</span>
              <span className="text-slate-800 font-medium">{formattedDate}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>คะแนนเฉลี่ยที่คุณให้:</span>
              <span className="text-emerald-700 font-bold text-sm">{submittedData.avg.toFixed(2)} / 5.00</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 pt-2 border-t border-slate-200">
              <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
              <span>ป้องกันการตอบซ้ำ: อุปกรณ์นี้ทำแบบประเมินแล้ว</span>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={handleResetForTesting}
              type="button"
              className="inline-flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-700 font-medium transition-colors p-2 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>ทำแบบประเมินใหม่อีกครั้ง (สำหรับทดสอบ)</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-6 sm:py-8">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-medium mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>การประเมินความพึงพอใจการอบรม</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-1.5">
          แบบประเมินความพึงพอใจ
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
          กรุณาให้คะแนนความพึงพอใจตามความเป็นจริง ข้อมูลทั้งหมดไม่ระบุชื่อผู้ตอบ และแสดงผลบนจอแบบเรียลไทม์
        </p>

        <div className="mt-3 flex items-center justify-center gap-4 text-[11px] text-slate-400">
          <span>5 คำถาม</span>
          <span>·</span>
          <span>ใช้เวลา ~1 นาที</span>
          <span>·</span>
          <span>ไม่เก็บชื่อผู้ตอบ</span>
        </div>
      </div>

      {/* Error alert if missing fields */}
      {errorMsg && (
        <div className="mb-4 bg-rose-50 border border-rose-200 rounded-2xl p-3.5 text-xs text-rose-700 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
          <div className="leading-relaxed">{errorMsg}</div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {QUESTION_DEFINITIONS.map((q, index) => {
          const selected = scores[q.id];
          return (
            <div
              key={q.id}
              className={`bg-white border rounded-2xl p-4 transition-all shadow-xs ${
                selected ? 'border-indigo-300 ring-1 ring-indigo-100' : 'border-slate-200'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                  ข้อที่ {index + 1}
                </span>
                <span className="text-[11px] text-slate-500 font-medium">
                  {selected ? `เลือก: ${selected} คะแนน (${SCORE_LABELS[selected].hint})` : 'ยังไม่ได้ตอบ'}
                </span>
              </div>

              <h2 className="text-sm font-semibold text-slate-900 leading-snug mb-3">
                {q.title}
              </h2>

              {/* 5-scale touch buttons */}
              <div className="grid grid-cols-5 gap-1.5">
                {[1, 2, 3, 4, 5].map((val) => {
                  const isCurrent = selected === val;
                  const pastelBg = val === 5 ? '#86efac' : val === 4 ? '#7dd3fc' : val === 3 ? '#fde047' : val === 2 ? '#fdba74' : '#fca5a5';
                  return (
                    <button
                      key={val}
                      type="button"
                      onClick={() => handleSelectScore(q.id, val)}
                      style={isCurrent ? { backgroundColor: pastelBg, borderColor: '#00000020' } : {}}
                      className={`h-14 flex flex-col items-center justify-center rounded-xl border transition-all active:scale-95 cursor-pointer ${
                        isCurrent
                          ? 'text-slate-950 font-bold shadow-xs scale-[1.02]'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      <span className="text-lg font-bold leading-none">{val}</span>
                      <span className={`text-[10px] mt-1 leading-tight ${isCurrent ? 'text-slate-900 font-semibold' : 'text-slate-500'}`}>
                        {SCORE_LABELS[val].hint}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Suggestion Textarea */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <label htmlFor="suggestion-input" className="block text-sm font-semibold text-slate-900 mb-1.5">
            ข้อเสนอแนะเพิ่มเติมเพื่อการปรับปรุงและพัฒนา (ไม่บังคับ)
          </label>
          <p className="text-xs text-slate-500 mb-2.5">
            ความคิดเห็น สิ่งที่ประทับใจ หรือสิ่งที่ต้องการให้เพิ่มเติมในหลักสูตรหน้า
          </p>
          <textarea
            id="suggestion-input"
            rows={3}
            maxLength={500}
            value={suggestion}
            onChange={(e) => setSuggestion(e.target.value)}
            placeholder="พิมพ์ความคิดเห็นของคุณที่นี่..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500 transition-all resize-none"
          />
          <div className="flex justify-between items-center text-[11px] text-slate-400 mt-1">
            <span>ความคิดเห็นจะถูกแสดงบนจอโปรเจกเตอร์</span>
            <span>{suggestion.length}/500</span>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 px-6 rounded-2xl font-bold text-base bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 text-white shadow-md shadow-indigo-600/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {isSubmitting ? (
              <span className="inline-flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                <span>กำลังบันทึกข้อมูล...</span>
              </span>
            ) : (
              <>
                <span>ส่งแบบประเมินความพึงพอใจ</span>
                <Send className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

        <div className="text-center text-[11px] text-slate-400 pt-1 pb-4">
          กดส่งแล้วผลคะแนนจะถูกคำนวณและอัปเดตบนจอแดชบอร์ดทันที
        </div>
      </form>
    </div>
  );
};
