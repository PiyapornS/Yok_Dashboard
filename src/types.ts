export interface Evaluation {
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

export interface LikertInfo {
  label: string;
  level: number;
  color: string;
}

export interface QuestionSummary {
  id: string;
  title: string;
  avg: number;
  likert: LikertInfo;
  distribution: Record<number, number>;
}

export interface RecentSuggestion {
  id: string;
  text: string;
  timestamp: string;
  score: number;
}

export interface DashboardSummary {
  totalCount: number;
  overallAvg: number;
  likert: LikertInfo;
  questions: QuestionSummary[];
  scoreDistribution: Record<number, number>;
  recentSuggestions: RecentSuggestion[];
}

export const QUESTION_DEFINITIONS = [
  {
    id: 'q1',
    title: '1. เนื้อหาหลักสูตรตรงตามวัตถุประสงค์ ชัดเจน และนำไปประยุกต์ใช้ได้จริง',
    shortTitle: 'เนื้อหาหลักสูตร',
    category: 'Content & Practicality',
    pastelColor: '#86efac', // Pastel Mint
    pastelHoverColor: '#a7f3d0',
    pastelBorder: '#4ade80'
  },
  {
    id: 'q2',
    title: '2. วิทยากรมีความรู้ความเชี่ยวชาญ เทคนิคการถ่ายทอดน่าสนใจและเข้าใจง่าย',
    shortTitle: 'วิทยากรผู้สอน',
    category: 'Speaker & Instruction',
    pastelColor: '#c4b5fd', // Pastel Lavender
    pastelHoverColor: '#ddd6fe',
    pastelBorder: '#a78bfa'
  },
  {
    id: 'q3',
    title: '3. สื่อ อุปกรณ์ สไลด์ และเอกสารประกอบการอบรมมีความเหมาะสม',
    shortTitle: 'สื่อและเอกสาร',
    category: 'Materials & Equipment',
    pastelColor: '#7dd3fc', // Pastel Sky Blue
    pastelHoverColor: '#bae6fd',
    pastelBorder: '#38bdf8'
  },
  {
    id: 'q4',
    title: '4. การบริหารเวลาและสถานที่จัดอบรมมีความเหมาะสม ราบรื่น',
    shortTitle: 'เวลาและสถานที่',
    category: 'Time & Logistics',
    pastelColor: '#fdba74', // Pastel Peach
    pastelHoverColor: '#fed7aa',
    pastelBorder: '#fb923c'
  },
  {
    id: 'q5',
    title: '5. ความพึงพอใจในภาพรวมต่อการเข้าร่วมโครงการอบรมครั้งนี้',
    shortTitle: 'ภาพรวมความพึงพอใจ',
    category: 'Overall Satisfaction',
    pastelColor: '#f472b6', // Pastel Pink / Rose
    pastelHoverColor: '#fbcfe8',
    pastelBorder: '#ec4899'
  }
];

export const LIKERT_LEVELS = [
  { range: '4.51 - 5.00', label: 'มากที่สุด (Highest)', level: 5, color: 'text-emerald-300', bg: 'bg-emerald-400/80', pastel: '#86efac' },
  { range: '3.51 - 4.50', label: 'มาก (High)', level: 4, color: 'text-sky-300', bg: 'bg-sky-400/80', pastel: '#7dd3fc' },
  { range: '2.51 - 3.50', label: 'ปานกลาง (Moderate)', level: 3, color: 'text-yellow-300', bg: 'bg-yellow-400/80', pastel: '#fde047' },
  { range: '1.51 - 2.50', label: 'น้อย (Low)', level: 2, color: 'text-orange-300', bg: 'bg-orange-400/80', pastel: '#fdba74' },
  { range: '1.00 - 1.50', label: 'น้อยที่สุด (Lowest)', level: 1, color: 'text-rose-300', bg: 'bg-rose-400/80', pastel: '#fca5a5' },
];

export const PASTEL_STAR_COLORS: Record<number, { color: string; hover: string; label: string }> = {
  5: { color: '#86efac', hover: '#a7f3d0', label: '5 ดาว (มากที่สุด)' },
  4: { color: '#7dd3fc', hover: '#bae6fd', label: '4 ดาว (มาก)' },
  3: { color: '#fde047', hover: '#fef08a', label: '3 ดาว (ปานกลาง)' },
  2: { color: '#fdba74', hover: '#fed7aa', label: '2 ดาว (น้อย)' },
  1: { color: '#fca5a5', hover: '#fecdd3', label: '1 ดาว (น้อยที่สุด)' }
};
