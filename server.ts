import express from 'express';
import type { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface Evaluation {
  id: string;
  timestamp: string;
  q1: number;
  q2: number;
  q3: number;
  q4: number;
  q5: number;
  suggestion?: string;
  clientToken?: string;
}

// Ensure writable data directory across all deployment environments (Cloud Run, Docker, serverless)
let DATA_DIR = path.join(__dirname, 'data');
try {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  // Test write access
  const probeFile = path.join(DATA_DIR, '.probe');
  fs.writeFileSync(probeFile, 'ok');
  fs.unlinkSync(probeFile);
} catch {
  // If root/applet directory is read-only in production container, fallback to /tmp
  DATA_DIR = path.join('/tmp', 'liveeval-data');
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch (err) {
    console.warn('Could not create writable DATA_DIR, will use in-memory storage only:', err);
  }
}
const DATA_FILE = path.join(DATA_DIR, 'evaluations.json');

// Default starter samples so dashboard always has rich demo data until respondents submit
const DEFAULT_INITIAL_SAMPLES: Evaluation[] = [
  {
    id: 'demo-1',
    timestamp: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    q1: 5,
    q2: 5,
    q3: 4,
    q4: 4,
    q5: 5,
    suggestion: 'วิทยากรอธิบายเข้าใจง่าย มีตัวอย่างประกอบชัดเจนมาก อยากให้มีคอร์สขั้นสูงต่อครับ',
    clientToken: 'demo-token-1'
  },
  {
    id: 'demo-2',
    timestamp: new Date(Date.now() - 1000 * 60 * 24).toISOString(),
    q1: 5,
    q2: 5,
    q3: 5,
    q4: 5,
    q5: 5,
    suggestion: 'การอบรมมีประโยชน์มาก นำไปปรับใช้กับการทำงานจริงได้ทันที เอกสารประกอบอ่านเข้าใจง่าย',
    clientToken: 'demo-token-2'
  },
  {
    id: 'demo-3',
    timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    q1: 4,
    q2: 5,
    q3: 4,
    q4: 4,
    q5: 4,
    suggestion: 'เวลาช่วงบ่ายกระชับไปนิดนึง ถ้ามีช่วง Workshop นานขึ้นจะเยี่ยมมากครับ',
    clientToken: 'demo-token-3'
  },
  {
    id: 'demo-4',
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    q1: 5,
    q2: 4,
    q3: 5,
    q4: 4,
    q5: 5,
    suggestion: 'สถานที่และอุปกรณ์พร้อมมาก วิทยากรตอบคำถามได้ตรงจุด ชอบมากค่ะ',
    clientToken: 'demo-token-4'
  }
];

let evaluations: Evaluation[] = [];

// Load from file or initialize with default samples
try {
  if (fs.existsSync(DATA_FILE)) {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      evaluations = parsed;
    } else {
      evaluations = [...DEFAULT_INITIAL_SAMPLES];
      fs.writeFileSync(DATA_FILE, JSON.stringify(evaluations, null, 2), 'utf-8');
    }
  } else {
    evaluations = [...DEFAULT_INITIAL_SAMPLES];
    fs.writeFileSync(DATA_FILE, JSON.stringify(evaluations, null, 2), 'utf-8');
  }
} catch (err) {
  console.warn('Notice loading evaluations file, using defaults:', err);
  evaluations = [...DEFAULT_INITIAL_SAMPLES];
}

function saveEvaluations() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(evaluations, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save evaluations to disk, maintaining in-memory copy:', err);
  }
}

// Helper to calculate Likert Thai interpretation
export function getLikertLevel(avg: number): { label: string; level: number; color: string } {
  if (avg >= 4.51) return { label: 'มากที่สุด (Highest)', level: 5, color: '#10b981' };
  if (avg >= 3.51) return { label: 'มาก (High)', level: 4, color: '#06b6d4' };
  if (avg >= 2.51) return { label: 'ปานกลาง (Moderate)', level: 3, color: '#f59e0b' };
  if (avg >= 1.51) return { label: 'น้อย (Low)', level: 2, color: '#f97316' };
  return { label: 'น้อยที่สุด (Lowest)', level: 1, color: '#ef4444' };
}

function calculateSummary(items: Evaluation[]) {
  const count = items.length;
  if (count === 0) {
    return {
      totalCount: 0,
      overallAvg: 0,
      likert: getLikertLevel(0),
      questions: [
        { id: 'q1', title: '1. เนื้อหาตรงตามวัตถุประสงค์และประยุกต์ใช้ได้จริง', avg: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } },
        { id: 'q2', title: '2. วิทยากรมีความรู้ความเชี่ยวชาญและถ่ายทอดเข้าใจง่าย', avg: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } },
        { id: 'q3', title: '3. สื่อ อุปกรณ์ และเอกสารประกอบการอบรมมีความเหมาะสม', avg: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } },
        { id: 'q4', title: '4. การจัดสรรเวลาและสถานที่อบรมมีความเหมาะสม', avg: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } },
        { id: 'q5', title: '5. ความพึงพอใจโดยรวมในการเข้าร่วมการอบรม', avg: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } },
      ],
      scoreDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      recentSuggestions: []
    };
  }

  const qKeys: (keyof Pick<Evaluation, 'q1' | 'q2' | 'q3' | 'q4' | 'q5'>)[] = ['q1', 'q2', 'q3', 'q4', 'q5'];
  const titles = [
    '1. เนื้อหาตรงตามวัตถุประสงค์และประยุกต์ใช้ได้จริง',
    '2. วิทยากรมีความรู้ความเชี่ยวชาญและถ่ายทอดเข้าใจง่าย',
    '3. สื่อ อุปกรณ์ และเอกสารประกอบการอบรมมีความเหมาะสม',
    '4. การจัดสรรเวลาและสถานที่อบรมมีความเหมาะสม',
    '5. ความพึงพอใจโดยรวมในการเข้าร่วมการอบรม'
  ];

  let totalScoreSum = 0;
  const overallDist: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

  const questions = qKeys.map((key, idx) => {
    let sum = 0;
    const dist: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    items.forEach((item) => {
      const val = Math.max(1, Math.min(5, Number(item[key]) || 3));
      sum += val;
      dist[val] = (dist[val] || 0) + 1;
      overallDist[val] = (overallDist[val] || 0) + 1;
      totalScoreSum += val;
    });

    const avg = Number((sum / count).toFixed(2));
    return {
      id: key,
      title: titles[idx],
      avg,
      likert: getLikertLevel(avg),
      distribution: dist
    };
  });

  const overallAvg = Number((totalScoreSum / (count * 5)).toFixed(2));
  const likert = getLikertLevel(overallAvg);

  // Suggestions with non-empty text, newest first
  const recentSuggestions = items
    .filter(i => i.suggestion && i.suggestion.trim().length > 0)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 50)
    .map(i => {
      const avg = Number(((i.q1 + i.q2 + i.q3 + i.q4 + i.q5) / 5).toFixed(2));
      return {
        id: i.id,
        text: i.suggestion!.trim(),
        timestamp: i.timestamp,
        score: avg
      };
    });

  return {
    totalCount: count,
    overallAvg,
    likert,
    questions,
    scoreDistribution: overallDist,
    recentSuggestions
  };
}

// Server-Sent Events subscribers
const sseClients = new Set<Response>();

function broadcastUpdate(type: 'NEW_SUBMISSION' | 'RESET' | 'SEED', data: any) {
  const summary = calculateSummary(evaluations);
  const payload = `data: ${JSON.stringify({ type, timestamp: new Date().toISOString(), summary, detail: data })}\n\n`;
  for (const client of sseClients) {
    try {
      client.write(payload);
    } catch {
      sseClients.delete(client);
    }
  }
}

async function startServer() {
  const app = express();
  // Support Cloud Run / dynamic PORT, defaulting to port 3000
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  // Middleware
  app.use(express.json());

  // CORS and preflight handling for all environments
  app.use((_req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Cache-Control');
    if (_req.method === 'OPTIONS') {
      res.sendStatus(200);
      return;
    }
    next();
  });

  // Health endpoint
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
      status: 'ok',
      count: evaluations.length,
      timestamp: new Date().toISOString()
    });
  });

  // Get current summary and evaluations list
  app.get('/api/evaluations', (_req: Request, res: Response) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    const summary = calculateSummary(evaluations);
    res.json({
      summary,
      evaluations: evaluations.slice().reverse()
    });
  });

  // Post evaluation
  app.post('/api/evaluations', (req: Request, res: Response) => {
    const { q1, q2, q3, q4, q5, suggestion, clientToken } = req.body;

    if (!q1 || !q2 || !q3 || !q4 || !q5) {
      res.status(400).json({ error: 'กรุณาให้คะแนนให้ครบทั้ง 5 ข้อ' });
      return;
    }

    const newEval: Evaluation = {
      id: `eval-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      q1: Math.min(5, Math.max(1, Number(q1))),
      q2: Math.min(5, Math.max(1, Number(q2))),
      q3: Math.min(5, Math.max(1, Number(q3))),
      q4: Math.min(5, Math.max(1, Number(q4))),
      q5: Math.min(5, Math.max(1, Number(q5))),
      suggestion: typeof suggestion === 'string' ? suggestion.trim().substring(0, 1000) : '',
      clientToken: typeof clientToken === 'string' ? clientToken : undefined
    };

    evaluations.push(newEval);
    saveEvaluations();

    // Broadcast to all connected dashboards immediately
    broadcastUpdate('NEW_SUBMISSION', newEval);

    res.status(201).json({
      success: true,
      id: newEval.id,
      timestamp: newEval.timestamp,
      count: evaluations.length
    });
  });

  // Server-Sent Events stream for real-time dashboard updates
  app.get('/api/stream', (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');

    if (typeof res.flushHeaders === 'function') {
      res.flushHeaders();
    }

    // Immediate unbuffered comment ping for Cloud Run / reverse proxies
    res.write(': stream-connected\n\n');

    // Send initial snapshot
    const initialPayload = `data: ${JSON.stringify({ type: 'INIT', summary: calculateSummary(evaluations) })}\n\n`;
    res.write(initialPayload);

    sseClients.add(res);

    // Heartbeat every 15s to keep connection alive through proxies
    const intervalId = setInterval(() => {
      try {
        res.write(': keepalive\n\n');
      } catch {
        clearInterval(intervalId);
        sseClients.delete(res);
      }
    }, 15000);

    req.on('close', () => {
      clearInterval(intervalId);
      sseClients.delete(res);
    });
  });

  // Reset evaluations (for trainer/admin)
  app.post('/api/reset', (_req: Request, res: Response) => {
    evaluations = [];
    saveEvaluations();
    broadcastUpdate('RESET', null);
    res.json({ success: true, message: 'ล้างข้อมูลการประเมินเรียบร้อยแล้ว' });
  });

  // Seed sample data for testing & preview
  app.post('/api/seed-sample', (_req: Request, res: Response) => {
    const sampleComments = [
      'ชอบตัวอย่างจริงที่วิทยากรยกมา ทำให้เห็นภาพชัดเจนมาก',
      'เอกสารประกอบดีมากครับ มีเช็คลิสต์ให้ดาวน์โหลดด้วย',
      'เนื้อหาดีมาก อยากให้อบรมเพิ่มเป็น 2 วันเพื่อเจาะลึก',
      'วิทยากรให้คำแนะนำและตอบข้อสงสัยได้กระจ่างมาก',
      'ประทับใจความพร้อมของทีมงานและสถานที่'
    ];

    const newSamples: Evaluation[] = Array.from({ length: 5 }).map((_, i) => ({
      id: `eval-${Date.now()}-${i}`,
      timestamp: new Date(Date.now() - (5 - i) * 1000 * 60).toISOString(),
      q1: Math.floor(Math.random() * 2) + 4,
      q2: 5,
      q3: Math.floor(Math.random() * 2) + 4,
      q4: Math.floor(Math.random() * 2) + 4,
      q5: 5,
      suggestion: sampleComments[i] || '',
      clientToken: `sample-token-${Date.now()}-${i}`
    }));

    evaluations.push(...newSamples);
    saveEvaluations();
    broadcastUpdate('SEED', newSamples);
    res.json({ success: true, count: evaluations.length });
  });

  // Export CSV with UTF-8 BOM for Thai Excel compatibility
  app.get('/api/export-csv', (_req: Request, res: Response) => {
    const BOM = '\uFEFF';
    const headers = [
      'ลำดับ',
      'วันที่-เวลา',
      'ข้อ 1: เนื้อหาและหลักสูตร',
      'ข้อ 2: วิทยากรผู้สอน',
      'ข้อ 3: สื่อและเอกสารประกอบ',
      'ข้อ 4: การบริหารเวลาและสถานที่',
      'ข้อ 5: ภาพรวมความพึงพอใจ',
      'คะแนนเฉลี่ย',
      'ระดับความพึงพอใจ',
      'ข้อเสนอแนะเพิ่มเติม'
    ];

    const rows = evaluations.map((item, index) => {
      const avg = ((item.q1 + item.q2 + item.q3 + item.q4 + item.q5) / 5).toFixed(2);
      const likert = getLikertLevel(Number(avg));
      const formattedDate = new Date(item.timestamp).toLocaleString('th-TH', {
        timeZone: 'Asia/Bangkok'
      });
      const escape = (str: string) => `"${(str || '').replace(/"/g, '""')}"`;

      return [
        index + 1,
        escape(formattedDate),
        item.q1,
        item.q2,
        item.q3,
        item.q4,
        item.q5,
        avg,
        escape(likert.label),
        escape(item.suggestion || '-')
      ].join(',');
    });

    const csvContent = BOM + [headers.join(','), ...rows].join('\r\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="training_evaluation_${new Date().toISOString().slice(0, 10)}.csv"`);
    res.send(csvContent);
  });

  // Mount Vite middleware in dev or static files in production
  const isProduction = process.env.NODE_ENV === 'production';
  const distPath = path.join(__dirname, 'dist');
  const hasDist = fs.existsSync(distPath) && fs.existsSync(path.join(distPath, 'index.html'));

  if (!isProduction || !hasDist) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Live Training Evaluation Server running on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
