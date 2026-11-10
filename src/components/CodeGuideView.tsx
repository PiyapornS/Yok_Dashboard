import React, { useState } from 'react';
import { Copy, Check, Download, FileCode, ExternalLink, HelpCircle, Flame, ShieldAlert, CheckCircle2 } from 'lucide-react';

export const CodeGuideView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'survey' | 'dashboard' | 'guide'>('guide');
  const [copiedSurvey, setCopiedSurvey] = useState(false);
  const [copiedDashboard, setCopiedDashboard] = useState(false);
  const [copiedRules, setCopiedRules] = useState(false);

  const handleCopyCode = async (file: 'survey' | 'dashboard') => {
    try {
      const res = await fetch(`/standalone/${file}.html`);
      const text = await res.text();
      await navigator.clipboard.writeText(text);
      if (file === 'survey') {
        setCopiedSurvey(true);
        setTimeout(() => setCopiedSurvey(false), 2000);
      } else {
        setCopiedDashboard(true);
        setTimeout(() => setCopiedDashboard(false), 2000);
      }
    } catch {
      alert('ไม่สามารถดึงโค้ดได้ กรุณาลองใหม่อีกครั้ง');
    }
  };

  const handleCopyRules = () => {
    const rules = JSON.stringify({
      rules: {
        ".read": true,
        ".write": true
      }
    }, null, 2);
    navigator.clipboard.writeText(rules).then(() => {
      setCopiedRules(true);
      setTimeout(() => setCopiedRules(false), 2000);
    });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <div className="flex items-center gap-2 text-amber-700 text-xs font-semibold uppercase tracking-wider mb-2">
          <Flame className="w-4 h-4 text-amber-600" />
          <span>โค้ดแยก 2 ไฟล์ & วิธีติดตั้ง Firebase Realtime Database</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          คู่มือการนำไปใช้งานแยกไฟล์ (Standalone Files)
        </h1>
        <p className="text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
          ดาวน์โหลดหรือคัดลอกไฟล์ HTML พร้อม JavaScript แยก 2 ไฟล์ เพื่อนำไปใช้งานกับ Firebase Realtime Database ของคุณเอง และเปิดออนไลน์ได้ฟรี 100%
        </p>

        {/* Tab selection */}
        <div className="flex items-center gap-2 mt-5">
          <button
            onClick={() => setActiveTab('guide')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer ${
              activeTab === 'guide'
                ? 'bg-amber-100 text-amber-900 font-semibold border border-amber-300'
                : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200 shadow-2xs'
            }`}
          >
            วิธีตั้งค่า Firebase & Deploy ทีละขั้น
          </button>

          <button
            onClick={() => setActiveTab('survey')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer ${
              activeTab === 'survey'
                ? 'bg-indigo-100 text-indigo-900 font-semibold border border-indigo-300'
                : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200 shadow-2xs'
            }`}
          >
            ไฟล์ 1: survey.html (หน้าตอบ)
          </button>

          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-emerald-100 text-emerald-900 font-semibold border border-emerald-300'
                : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200 shadow-2xs'
            }`}
          >
            ไฟล์ 2: dashboard.html (หน้าแดชบอร์ด)
          </button>
        </div>
      </div>

      {/* Tab: Step-by-step Setup Guide */}
      {activeTab === 'guide' && (
        <div className="space-y-6 text-sm text-slate-700">
          
          {/* Summary Box */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
            <h2 className="text-base font-bold text-slate-900 mb-2 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>ภาพรวมการทำงานของระบบ 2 ไฟล์</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs leading-relaxed text-slate-700 mt-3">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <span className="font-bold text-indigo-700 block mb-1">1. ไฟล์ survey.html</span>
                หน้าเว็บสำหรับผู้เข้าอบรมเปิดบนสมาร์ตโฟน มีปุ่มเลือกคะแนน 1-5 ทั้ง 5 ข้อ และช่องข้อเสนอแนะ เมื่อกดส่งจะบันทึกข้อมูลเข้า Firebase Realtime Database ผ่าน WebSocket ทันที พร้อมบันทึก LocalStorage เพื่อป้องกันการส่งซ้ำ
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <span className="font-bold text-emerald-700 block mb-1">2. ไฟล์ dashboard.html</span>
                หน้าจอสำหรับผู้จัดเปิดขึ้นโปรเจกเตอร์ เชื่อมต่อดักฟังการเปลี่ยนแปลง (Live Listener) ทันทีที่มีคนส่งคะแนนเข้ามา แดชบอร์ดจะอัปเดตตัวเลข กราฟแท่ง และข้อเสนอแนะอัตโนมัติโดยไม่ต้องกดรีเฟรชหน้าจอ
              </div>
            </div>
          </div>

          {/* Step 1 */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-700 font-bold text-xs flex items-center justify-center border border-indigo-200">1</span>
              <h3 className="font-bold text-slate-900 text-base">สร้างโปรเจกต์บน Firebase Console (ฟรี Spark Plan)</h3>
            </div>
            <ol className="list-decimal list-inside space-y-1.5 pl-2 text-slate-600 leading-relaxed text-xs sm:text-sm">
              <li>ไปที่ <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="text-indigo-600 underline font-medium">console.firebase.google.com</a> แล้วเข้าสู่ระบบด้วยบัญชี Google</li>
              <li>คลิกปุ่ม <strong>"Add project"</strong> (สร้างโปรเจกต์)</li>
              <li>ตั้งชื่อโปรเจกต์ เช่น <code className="bg-slate-100 px-2 py-0.5 rounded text-amber-800">training-feedback</code> แล้วกด <strong>Continue</strong></li>
              <li>ปิดหรือเปิด Google Analytics ตามต้องการ แล้วคลิก <strong>Create project</strong></li>
              <li>รอระบบเตรียมโปรเจกต์ประมาณ 20 วินาที เมื่อเสร็จแล้วกด <strong>Continue</strong></li>
            </ol>
          </div>

          {/* Step 2 */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-700 font-bold text-xs flex items-center justify-center border border-indigo-200">2</span>
              <h3 className="font-bold text-slate-900 text-base">เปิดใช้งาน Realtime Database & ตั้งค่า Security Rules</h3>
            </div>
            <ol className="list-decimal list-inside space-y-1.5 pl-2 text-slate-600 leading-relaxed text-xs sm:text-sm">
              <li>ที่เมนูด้านซ้าย เลือก <strong>Build</strong> แล้วคลิก <strong>Realtime Database</strong></li>
              <li>คลิกปุ่ม <strong>"Create Database"</strong></li>
              <li>เลือกตำแหน่งเซิร์ฟเวอร์ (แนะนำ <code className="bg-slate-100 px-2 py-0.5 rounded text-emerald-800">Singapore (asia-southeast1)</code> เพื่อความเร็วสูงสุดในไทย)</li>
              <li>ในขั้นตอน Security rules ให้เลือก <strong>"Start in test mode"</strong> แล้วกด <strong>Enable</strong></li>
              <li>สลับไปที่แท็บ <strong>Rules</strong> ด้านบน แล้วแก้ไขกฎให้อ่านและเขียนได้:</li>
            </ol>

            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 font-mono text-xs text-amber-300 relative">
              <pre>{`{
  "rules": {
    ".read": true,
    ".write": true
  }
}`}</pre>
              <button
                onClick={handleCopyRules}
                className="absolute top-3 right-3 px-2.5 py-1 text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 flex items-center gap-1 cursor-pointer"
              >
                {copiedRules ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedRules ? 'คัดลอกแล้ว' : 'คัดลอกกฎ'}</span>
              </button>
            </div>
            <p className="text-xs text-slate-500">เมื่อวางกฎแล้วให้กดปุ่ม <strong>"Publish"</strong> สีฟ้าด้านบนขวา</p>
          </div>

          {/* Step 3 */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-700 font-bold text-xs flex items-center justify-center border border-indigo-200">3</span>
              <h3 className="font-bold text-slate-900 text-base">นำค่า firebaseConfig มาใส่ในทั้ง 2 ไฟล์</h3>
            </div>
            <ol className="list-decimal list-inside space-y-1.5 pl-2 text-slate-600 leading-relaxed text-xs sm:text-sm">
              <li>คลิกไอคอนรูปเฟือง ⚙️ (Project settings) ที่มุมซ้ายบน</li>
              <li>เลื่อนลงมาด้านล่างสุดที่ส่วน <strong>"Your apps"</strong> แล้วคลิกไอคอน <strong>&lt;/&gt; (Web)</strong></li>
              <li>ตั้งชื่อแอป เช่น <code className="bg-slate-100 px-2 py-0.5 rounded text-indigo-800">training-web</code> แล้วคลิก <strong>Register app</strong></li>
              <li>คัดลอกชุดตัวแปร <code className="bg-slate-100 px-2 py-0.5 rounded text-amber-800">firebaseConfig</code> ทั้งก้อน</li>
              <li>นำไปวางแทนที่ <code className="bg-slate-100 px-2 py-0.5 rounded text-amber-800">const firebaseConfig = &#123; ... &#125;;</code> ในไฟล์ <strong>survey.html</strong> และ <strong>dashboard.html</strong></li>
            </ol>
          </div>

          {/* Step 4 */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-700 font-bold text-xs flex items-center justify-center border border-indigo-200">4</span>
              <h3 className="font-bold text-slate-900 text-base">ช่องทางนำขึ้นออนไลน์ (Deploy) ได้ฟรีตลอดชีพ</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-1">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-900 block mb-1 text-sm">วิธีที่ 1: GitHub Pages (แนะนำ ง่ายสุด)</span>
                <p className="text-slate-600 mb-2">สร้าง repository บน GitHub อัปโหลดทั้ง 2 ไฟล์ แล้วเปิด GitHub Pages ใน Settings จะได้ลิงก์ใช้งานทันที</p>
                <code className="text-emerald-700 block bg-white p-2 rounded text-[11px] border border-slate-200 font-mono">https://your-name.github.io/repo/survey.html</code>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-900 block mb-1 text-sm">วิธีที่ 2: Netlify Drop (ลากวางได้เลย)</span>
                <p className="text-slate-600 mb-2">รวมไฟล์ survey.html และ dashboard.html ไว้ในโฟลเดอร์เดียวกัน แล้วลากไปวางที่ netlify.com/drop ออนไลน์ภายใน 10 วินาที</p>
                <code className="text-sky-700 block bg-white p-2 rounded text-[11px] border border-slate-200 font-mono">https://app.netlify.com/drop</code>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* Tab: survey.html */}
      {activeTab === 'survey' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div>
              <div className="font-bold text-slate-900 text-base">ไฟล์ survey.html</div>
              <div className="text-xs text-slate-500">หน้าตอบแบบสอบถามสำหรับผู้เข้าอบรม (Mobile-First, สเกล 1-5, ป้องกันการส่งซ้ำ)</div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleCopyCode('survey')}
                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-medium transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                {copiedSurvey ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                <span>{copiedSurvey ? 'คัดลอกโค้ดแล้ว!' : 'คัดลอกโค้ด survey.html'}</span>
              </button>
              <a
                href="/standalone/survey.html"
                download="survey.html"
                className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 shadow-2xs"
              >
                <Download className="w-4 h-4" />
                <span>ดาวน์โหลดไฟล์</span>
              </a>
              <a
                href="/standalone/survey.html"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 shadow-2xs"
              >
                <ExternalLink className="w-4 h-4" />
                <span>เปิดดูตัวอย่าง</span>
              </a>
            </div>
          </div>

          <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 font-mono text-xs text-slate-300 overflow-x-auto max-h-[500px]">
            <p className="text-slate-500 mb-2">// ไฟล์ HTML แบบ Standalone ไม่ต้อง Build ใช้ Tailwind CDN และ Firebase CDN</p>
            <p className="text-slate-500 mb-4">// ดูโค้ดฉบับเต็มได้โดยการกดปุ่ม "คัดลอกโค้ด survey.html" หรือ "ดาวน์โหลดไฟล์" ด้านบน</p>
            <pre>{`<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>แบบประเมินความพึงพอใจการอบรม</title>
  <!-- Tailwind CSS CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <!-- Google Fonts: Prompt -->
  <link href="https://fonts.googleapis.com/css2?family=Prompt:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <!-- Firebase SDK -->
  <script src="https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js"></script>
  <script src="https://www.gstatic.com/firebasejs/8.10.1/firebase-database.js"></script>
</head>
<body class="bg-slate-900 text-slate-100">
  ... (ส่วนแสดงคำถาม 5 ข้อ และช่องข้อเสนอแนะ) ...
  <script>
    const firebaseConfig = {
      apiKey: "YOUR_API_KEY",
      databaseURL: "https://YOUR_PROJECT.firebaseio.com",
      projectId: "YOUR_PROJECT",
      ...
    };
    firebase.initializeApp(firebaseConfig);
    const db = firebase.database();
    // บันทึกคำตอบ: db.ref('evaluations').push(payload);
  </script>
</body>
</html>`}</pre>
          </div>
        </div>
      )}

      {/* Tab: dashboard.html */}
      {activeTab === 'dashboard' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div>
              <div className="font-bold text-slate-900 text-base">ไฟล์ dashboard.html</div>
              <div className="text-xs text-slate-500">หน้าแดชบอร์ดสรุปผลแบบเรียลไทม์ขึ้นจอโปรเจกเตอร์ (กราฟแท่ง, สรุปเกณฑ์ 5 ระดับ, QR Code, Export CSV)</div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleCopyCode('dashboard')}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-medium transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                {copiedDashboard ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                <span>{copiedDashboard ? 'คัดลอกโค้ดแล้ว!' : 'คัดลอกโค้ด dashboard.html'}</span>
              </button>
              <a
                href="/standalone/dashboard.html"
                download="dashboard.html"
                className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 shadow-2xs"
              >
                <Download className="w-4 h-4" />
                <span>ดาวน์โหลดไฟล์</span>
              </a>
              <a
                href="/standalone/dashboard.html"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 shadow-2xs"
              >
                <ExternalLink className="w-4 h-4" />
                <span>เปิดดูตัวอย่าง</span>
              </a>
            </div>
          </div>

          <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 font-mono text-xs text-slate-300 overflow-x-auto max-h-[500px]">
            <p className="text-slate-500 mb-2">// ไฟล์ Dashboard แดชบอร์ดเรียลไทม์สำหรับโปรเจกเตอร์</p>
            <p className="text-slate-500 mb-4">// ดูโค้ดฉบับเต็มได้โดยการกดปุ่ม "คัดลอกโค้ด dashboard.html" หรือ "ดาวน์โหลดไฟล์" ด้านบน</p>
            <pre>{`<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <title>Live Training Evaluation Dashboard</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://cdn.jsdelivr.net/npm/qrcode@1.5.4/build/qrcode.min.js"></script>
  <script src="https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js"></script>
  <script src="https://www.gstatic.com/firebasejs/8.10.1/firebase-database.js"></script>
</head>
<body class="bg-slate-950 text-slate-100">
  ... (การ์ด KPI ขนาดใหญ่, กราฟแท่งรายข้อ, ฟีดข้อเสนอแนะล่าสุด, QR Code Modal) ...
  <script>
    firebase.initializeApp(firebaseConfig);
    const db = firebase.database();
    // ดักฟังการส่งข้อมูลแบบเรียลไทม์:
    db.ref('evaluations').on('value', snapshot => {
      const data = snapshot.val();
      renderDashboard(data); // คำนวณค่าเฉลี่ยและเรนเดอร์กราฟทันที
    });
  </script>
</body>
</html>`}</pre>
          </div>
        </div>
      )}

    </div>
  );
};
