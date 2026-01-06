import React, { useState, useEffect, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  CheckCircle2, 
  Circle, 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  List, 
  LayoutDashboard,
  Trophy,
  BookOpen,
  ExternalLink,
  X
} from 'lucide-react';
import { 
  format, 
  addDays, 
  eachDayOfInterval, 
  isSameDay, 
  isToday, 
  startOfMonth, 
  endOfMonth, 
  endOfWeek, 
  startOfWeek, 
  addMonths, 
  subMonths,
  isSameMonth,
  getYear
} from 'date-fns';
import { ko } from 'date-fns/locale';

// --- BIBLE READING DATA (Updated based on images) ---
const READING_DATA: Record<string, string> = {
  // January
  "2026-01-01": "창세기 1-4", "2026-01-02": "창세기 5-8", "2026-01-03": "창세기 9-12", "2026-01-04": "주일",
  "2026-01-05": "창세기 13-16", "2026-01-06": "창세기 17-20", "2026-01-07": "창세기 21-24", "2026-01-08": "창세기 25-28",
  "2026-01-09": "창세기 29-32", "2026-01-10": "창세기 33-36", "2026-01-11": "주일", "2026-01-12": "창세기 37-40",
  "2026-01-13": "창세기 41-44", "2026-01-14": "창세기 45-47", "2026-01-15": "창세기 48-50", "2026-01-16": "출애굽기 1-4",
  "2026-01-17": "출애굽기 5-8", "2026-01-18": "주일", "2026-01-19": "출애굽기 9-12", "2026-01-20": "출애굽기 13-16",
  "2026-01-21": "출애굽기 17-20", "2026-01-22": "출애굽기 21-24", "2026-01-23": "출애굽기 25-28", "2026-01-24": "출애굽기 29-32",
  "2026-01-25": "주일", "2026-01-26": "출애굽기 33-36", "2026-01-27": "출애굽기 37-40", "2026-01-28": "레위기 1-3",
  "2026-01-29": "레위기 4-6", "2026-01-30": "레위기 7-9", "2026-01-31": "레위기 10-12",
  // February
  "2026-02-01": "주일", "2026-02-02": "레위기 13-15", "2026-02-03": "레위기 16-18", "2026-02-04": "레위기 19-21",
  "2026-02-05": "레위기 22-24", "2026-02-06": "레위기 25-27", "2026-02-07": "민수기 1-3", "2026-02-08": "주일",
  "2026-02-09": "민수기 4-6", "2026-02-10": "민수기 7-8", "2026-02-11": "민수기 9-11", "2026-02-12": "민수기 12-14",
  "2026-02-13": "민수기 15-17", "2026-02-14": "민수기 18-20", "2026-02-15": "주일", "2026-02-16": "민수기 21-23",
  "2026-02-17": "민수기 24-26", "2026-02-18": "민수기 27-29", "2026-02-19": "민수기 30-32", "2026-02-20": "민수기 33-36",
  "2026-02-21": "신명기 1-3", "2026-02-22": "주일", "2026-02-23": "신명기 4-6", "2026-02-24": "신명기 7-9",
  "2026-02-25": "신명기 10-12", "2026-02-26": "신명기 13-15", "2026-02-27": "신명기 16-18", "2026-02-28": "신명기 19-21",
  // March
  "2026-03-01": "주일", "2026-03-02": "신명기 22-24", "2026-03-03": "신명기 25-27", "2026-03-04": "신명기 28-29",
  "2026-03-05": "신명기 30-31", "2026-03-06": "신명기 32-34", "2026-03-07": "여호수아 1-4", "2026-03-08": "주일",
  "2026-03-09": "여호수아 5-8", "2026-03-10": "여호수아 9-12", "2026-03-11": "여호수아 13-16", "2026-03-12": "여호수아 17-20",
  "2026-03-13": "여호수아 21-24", "2026-03-14": "사사기 1-3", "2026-03-15": "주일", "2026-03-16": "사사기 4-6",
  "2026-03-17": "사사기 7-9", "2026-03-18": "사사기 10-12", "2026-03-19": "사사기 13-15", "2026-03-20": "사사기 16-18",
  "2026-03-21": "사사기 19-21", "2026-03-22": "주일", "2026-03-23": "룻기 1-4", "2026-03-24": "사무엘상 1-3",
  "2026-03-25": "사무엘상 4-6", "2026-03-26": "사무엘상 7-9", "2026-03-27": "사무엘상 10-12", "2026-03-28": "사무엘상 13-15",
  "2026-03-29": "주일", "2026-03-30": "사무엘상 16-18", "2026-03-31": "사무엘상 19-21",
  // April
  "2026-04-01": "사무엘상 22-24", "2026-04-02": "사무엘상 25-27", "2026-04-03": "사무엘상 28-31", "2026-04-04": "사무엘하 1-3",
  "2026-04-05": "주일", "2026-04-06": "사무엘하 4-6", "2026-04-07": "사무엘하 7-9", "2026-04-08": "사무엘하 10-12",
  "2026-04-09": "사무엘하 13-15", "2026-04-10": "사무엘하 16-18", "2026-04-11": "사무엘하 19-21", "2026-04-12": "주일",
  "2026-04-13": "사무엘하 22-24", "2026-04-14": "열왕기상 1-2", "2026-04-15": "열왕기상 3-5", "2026-04-16": "열왕기상 6-8",
  "2026-04-17": "열왕기상 9-11", "2026-04-18": "열왕기상 12-14", "2026-04-19": "주일", "2026-04-20": "열왕기상 15-17",
  "2026-04-21": "열왕기상 18-20", "2026-04-22": "열왕기상 21-22", "2026-04-23": "열왕기하 1-3", "2026-04-24": "열왕기하 4-6",
  "2026-04-25": "열왕기하 7-9", "2026-04-26": "주일", "2026-04-27": "열왕기하 10-12", "2026-04-28": "열왕기하 13-15",
  "2026-04-29": "열왕기하 16-18", "2026-04-30": "열왕기하 19-22",
  // May
  "2026-05-01": "열왕기하 23-25", "2026-05-02": "역대상 1-3", "2026-05-03": "주일", "2026-05-04": "역대상 4-6",
  "2026-05-05": "역대상 7-9", "2026-05-06": "역대상 10-12", "2026-05-07": "역대상 13-16", "2026-05-08": "역대상 17-20",
  "2026-05-09": "역대상 21-23", "2026-05-10": "주일", "2026-05-11": "역대상 24-26", "2026-05-12": "역대상 27-29",
  "2026-05-13": "역대하 1-3", "2026-05-14": "역대하 4-6", "2026-05-15": "역대하 7-9", "2026-05-16": "역대하 10-12",
  "2026-05-17": "주일", "2026-05-18": "역대하 13-15", "2026-05-19": "역대하 16-18", "2026-05-20": "역대하 19-21",
  "2026-05-21": "역대하 22-24", "2026-05-22": "역대하 25-27", "2026-05-23": "역대하 28-30", "2026-05-24": "주일",
  "2026-05-25": "역대하 31-33", "2026-05-26": "역대하 34-36", "2026-05-27": "에스라 1-4", "2026-05-28": "에스라 5-7",
  "2026-05-29": "에스라 8-10", "2026-05-30": "느헤미야 1-3", "2026-05-31": "주일",
  // June
  "2026-06-01": "느헤미야 4-6", "2026-06-02": "느헤미야 7-8", "2026-06-03": "느헤미야 9-11", "2026-06-04": "느헤미야 12-13",
  "2026-06-05": "에스더 1-3", "2026-06-06": "에스더 4-6", "2026-06-07": "주일", "2026-06-08": "에스더 7-10",
  "2026-06-09": "욥기 1-5", "2026-06-10": "욥기 6-10", "2026-06-11": "욥기 11-14", "2026-06-12": "욥기 15-18",
  "2026-06-13": "욥기 19-22", "2026-06-14": "주일", "2026-06-15": "욥기 23-26", "2026-06-16": "욥기 27-30",
  "2026-06-17": "욥기 31-34", "2026-06-18": "욥기 35-38", "2026-06-19": "욥기 39-42", "2026-06-20": "시편 1-10",
  "2026-06-21": "주일", "2026-06-22": "시편 11-20", "2026-06-23": "시편 21-30", "2026-06-24": "시편 31-37",
  "2026-06-25": "시편 38-47", "2026-06-26": "시편 48-57", "2026-06-27": "시편 58-67", "2026-06-28": "주일",
  "2026-06-29": "시편 68-72", "2026-06-30": "시편 73-78",
  // July
  "2026-07-01": "시편 79-87", "2026-07-02": "시편 88-95", "2026-07-03": "시편 96-104", "2026-07-04": "시편 105-108",
  "2026-07-05": "주일", "2026-07-06": "시편 109-118", "2026-07-07": "시편 119", "2026-07-08": "시편 120-135",
  "2026-07-09": "시편 136-142", "2026-07-10": "시편 143-150", "2026-07-11": "잠언 1-4", "2026-07-12": "주일",
  "2026-07-13": "잠언 5-8", "2026-07-14": "잠언 9-12", "2026-07-15": "잠언 13-16", "2026-07-16": "잠언 17-20",
  "2026-07-17": "잠언 21-24", "2026-07-18": "잠언 25-28", "2026-07-19": "주일", "2026-07-20": "잠언 29-31",
  "2026-07-21": "전도서 1-4", "2026-07-22": "전도서 5-8", "2026-07-23": "전도서 9-12", "2026-07-24": "아가 1-4",
  "2026-07-25": "아가 5-8", "2026-07-26": "주일", "2026-07-27": "이사야 1-4", "2026-07-28": "이사야 5-8",
  "2026-07-29": "이사야 9-12", "2026-07-30": "이사야 13-16", "2026-07-31": "이사야 17-20",
  // August
  "2026-08-01": "이사야 21-24", "2026-08-02": "주일", "2026-08-03": "이사야 25-28", "2026-08-04": "이사야 29-32",
  "2026-08-05": "이사야 33-36", "2026-08-06": "이사야 37-40", "2026-08-07": "이사야 41-44", "2026-08-08": "이사야 45-48",
  "2026-08-09": "주일", "2026-08-10": "이사야 49-52", "2026-08-11": "이사야 53-56", "2026-08-12": "이사야 57-60",
  "2026-08-13": "이사야 61-63", "2026-08-14": "이사야 64-66", "2026-08-15": "예레미야 1-4", "2026-08-16": "주일",
  "2026-08-17": "예레미야 5-8", "2026-08-18": "예레미야 9-12", "2026-08-19": "예레미야 13-16", "2026-08-20": "예레미야 17-20",
  "2026-08-21": "예레미야 21-24", "2026-08-22": "예레미야 25-28", "2026-08-23": "주일", "2026-08-24": "예레미야 29-32",
  "2026-08-25": "예레미야 33-36", "2026-08-26": "예레미야 37-40", "2026-08-27": "예레미야 41-44", "2026-08-28": "예레미야 45-48",
  "2026-08-29": "예레미야 49-52", "2026-08-30": "주일", "2026-08-31": "예레미야애가 1-5",
  // September
  "2026-09-01": "에스겔 1-4", "2026-09-02": "에스겔 5-8", "2026-09-03": "에스겔 9-12", "2026-09-04": "에스겔 13-16",
  "2026-09-05": "에스겔 17-20", "2026-09-06": "주일", "2026-09-07": "에스겔 21-24", "2026-09-08": "에스겔 25-28",
  "2026-09-09": "에스겔 29-32", "2026-09-10": "에스겔 33-36", "2026-09-11": "에스겔 37-40", "2026-09-12": "에스겔 41-44",
  "2026-09-13": "주일", "2026-09-14": "에스겔 45-48", "2026-09-15": "다니엘 1-4", "2026-09-16": "다니엘 5-8",
  "2026-09-17": "다니엘 9-12", "2026-09-18": "호세아 1-5", "2026-09-19": "호세아 6-10", "2026-09-20": "주일",
  "2026-09-21": "호세아 11-14", "2026-09-22": "요엘 1-3", "2026-09-23": "아모스 1-5", "2026-09-24": "아모스 6-9",
  "2026-09-25": "오바댜 1, 요나 1-4", "2026-09-26": "미가 1-4", "2026-09-27": "주일", "2026-09-28": "미가 5-7",
  "2026-09-29": "나훔 1-3", "2026-09-30": "하박국 1-3",
  // October
  "2026-10-01": "스바냐 1-3, 학개 1-2", "2026-10-02": "스가랴 1-5", "2026-10-03": "스가랴 6-10", "2026-10-04": "주일",
  "2026-10-05": "스가랴 11-14", "2026-10-06": "말라기 1-4", "2026-10-07": "마태복음 1-4", "2026-10-08": "마태복음 5-8",
  "2026-10-09": "마태복음 9-12", "2026-10-10": "마태복음 13-16", "2026-10-11": "주일", "2026-10-12": "마태복음 17-20",
  "2026-10-13": "마태복음 21-24", "2026-10-14": "마태복음 25-28", "2026-10-15": "마가복음 1-4", "2026-10-16": "마가복음 5-8",
  "2026-10-17": "마가복음 9-12", "2026-10-18": "주일", "2026-10-19": "마가복음 13-16", "2026-10-20": "누가복음 1-4",
  "2026-10-21": "누가복음 5-8", "2026-10-22": "누가복음 9-12", "2026-10-23": "누가복음 13-16", "2026-10-24": "누가복음 17-20",
  "2026-10-25": "주일", "2026-10-26": "누가복음 21-24", "2026-10-27": "요한복음 1-3", "2026-10-28": "요한복음 4-6",
  "2026-10-29": "요한복음 7-9", "2026-10-30": "요한복음 10-12", "2026-10-31": "요한복음 13-15",
  // November
  "2026-11-01": "주일", "2026-11-02": "요한복음 16-18", "2026-11-03": "요한복음 19-21", "2026-11-04": "사도행전 1-4",
  "2026-11-05": "사도행전 5-8", "2026-11-06": "사도행전 9-12", "2026-11-07": "사도행전 13-16", "2026-11-08": "주일",
  "2026-11-09": "사도행전 17-20", "2026-11-10": "사도행전 21-24", "2026-11-11": "사도행전 25-28", "2026-11-12": "로마서 1-4",
  "2026-11-13": "로마서 5-8", "2026-11-14": "로마서 9-12", "2026-11-15": "주일", "2026-11-16": "로마서 13-16",
  "2026-11-17": "고린도전서 1-4", "2026-11-18": "고린도전서 5-8", "2026-11-19": "고린도전서 9-12", "2026-11-20": "고린도전서 13-16",
  "2026-11-21": "고린도후서 1-5", "2026-11-22": "주일", "2026-11-23": "고린도후서 6-9", "2026-11-24": "고린도후서 10-13",
  "2026-11-25": "갈라디아서 1-3", "2026-11-26": "갈라디아서 4-6", "2026-11-27": "에베소서 1-3", "2026-11-28": "에베소서 4-6",
  "2026-11-29": "주일", "2026-11-30": "빌립보서 1-4",
  // December
  "2026-12-01": "골로새서 1-4", "2026-12-02": "데살로니가전서 1-5", "2026-12-03": "데살로니가후서 1-3", "2026-12-04": "디모데전서 1-3",
  "2026-12-05": "디모데전서 4-6", "2026-12-06": "주일", "2026-12-07": "디모데후서 1-4", "2026-12-08": "디도서 1-3, 빌레몬서 1",
  "2026-12-09": "히브리서 1-3", "2026-12-10": "히브리서 4-7", "2026-12-11": "히브리서 8-10", "2026-12-12": "히브리서 11-13",
  "2026-12-13": "주일", "2026-12-14": "야고보서 1-5", "2026-12-15": "베드로전서 1-5", "2026-12-16": "베드로후서 1-3",
  "2026-12-17": "요한일서 1-5", "2026-12-18": "요한이, 삼, 유다서", "2026-12-19": "요한계시록 1-3", "2026-12-20": "주일",
  "2026-12-21": "요한계시록 4-6", "2026-12-22": "요한계시록 7-9", "2026-12-23": "요한계시록 10-12", "2026-12-24": "요한계시록 13-15",
  "2026-12-25": "요한계시록 16-19", "2026-12-26": "요한계시록 20-22", "2026-12-27": "주일"
};

// --- YouVersion 성경 권별 영문 코드 매핑 ---
const BIBLE_CODES: Record<string, string> = {
  "창세기": "GEN", "출애굽기": "EXO", "레위기": "LEV", "민수기": "NUM", "신명기": "DEU",
  "여호수아": "JOS", "사사기": "JDG", "룻기": "RUT", "사무엘상": "1SA", "사무엘하": "2SA",
  "열왕기상": "1KI", "열왕기하": "2KI", "역대상": "1CH", "역대하": "2CH", "에스라": "EZR",
  "느헤미야": "NEH", "에스더": "EST", "욥기": "JOB", "시편": "PSA", "잠언": "PRO",
  "전도서": "ECC", "아가": "SNG", "이사야": "ISA", "예레미야": "JER", "예레미야애가": "LAM",
  "에스겔": "EZK", "다니엘": "DAN", "호세아": "HOS", "요엘": "JOL", "아모스": "AMO",
  "오바댜": "OBA", "요나": "JON", "미가": "MIC", "나훔": "NAM", "하박국": "HAB",
  "스바냐": "ZEP", "학개": "HAG", "스가랴": "ZEC", "말라기": "MAL", "마태복음": "MAT",
  "마가복음": "MRK", "누가복음": "LUK", "요한복음": "JHN", "사도행전": "ACT", "로마서": "ROM",
  "고린도전서": "1CO", "고린도후서": "2CO", "갈라디아서": "GAL", "에베소서": "EPH", "빌립보서": "PHI",
  "골로새서": "COL", "데살로니가전서": "1TH", "데살로니가후서": "2TH", "디모데전서": "1TI", "디모데후서": "2TI",
  "디도서": "TIT", "빌레몬서": "PHM", "히브리서": "HEB", "야고보서": "JAS", "베드로전서": "1PE",
  "베드로후서": "2PE", "요한일서": "1JN", "요한이서": "2JN", "요한삼서": "3JN", "유다서": "JUD",
  "요한계시록": "REV", "요한이": "2JN" // Handles "요한이, 삼..."
};

const getBibleUrl = (passage: string) => {
  if (passage === "주일" || passage === "정보 없음" || !passage) return null;
  try {
    const firstBookMatch = Object.keys(BIBLE_CODES).find(book => passage.includes(book));
    if (firstBookMatch) {
      const code = BIBLE_CODES[firstBookMatch];
      const passageAfterBook = passage.split(firstBookMatch)[1];
      const chapterMatch = passageAfterBook ? passageAfterBook.match(/\d+/) : null;
      const chapter = chapterMatch ? chapterMatch[0] : '1';
      return `https://www.bible.com/ko/bible/88/${code}.${chapter}.KRV`;
    }
  } catch (e) {
    console.error("Link generation failed", e);
  }
  return `https://www.bible.com/ko/bible/88/GEN.1.KRV`;
};

const App: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    const now = new Date();
    if (getYear(now) === 2026) return now;
    return new Date(2026, 0, 1);
  });
  const [completed, setCompleted] = useState<Record<string, boolean>>({});
  const [view, setView] = useState<'daily' | 'calendar' | 'list'>('daily');

  useEffect(() => {
    const saved = localStorage.getItem('bible_reading_2026_samil');
    if (saved) {
      try { setCompleted(JSON.parse(saved)); } catch (e) { console.error(e); }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('bible_reading_2026_samil', JSON.stringify(completed));
  }, [completed]);

  const toggleComplete = (dateStr: string) => {
    setCompleted(prev => ({ ...prev, [dateStr]: !prev[dateStr] }));
  };

  const currentReadingKey = format(selectedDate, 'yyyy-MM-dd');
  const currentReading = READING_DATA[currentReadingKey] || "정보 없음";
  const isDone = !!completed[currentReadingKey];
  
  const totalReadingsCount = useMemo(() => 
    Object.values(READING_DATA).filter(v => v !== "주일" && v !== "정보 없음").length, 
  []);
  
  const totalCompleted = useMemo(() => 
    Object.entries(completed).filter(([key, done]) => done && READING_DATA[key] && READING_DATA[key] !== "주일").length, 
  [completed]);

  const progressPercent = Math.round((totalCompleted / totalReadingsCount) * 100);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-28 md:py-10 text-gray-800">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 md:mb-10">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-blue-900 tracking-tight leading-tight">2026 삼일교회 성경통독</h1>
          <p className="text-blue-600 flex items-center gap-1.5 mt-1 text-sm md:text-base">
            <BookOpen size={16} /> 매일 말씀으로 승리하세요
          </p>
        </div>
        <div className="bg-white shadow-sm border border-blue-100 rounded-2xl px-4 py-3 flex items-center gap-4 self-start md:self-auto">
          <div className="text-right">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">전체 진행률</p>
            <p className="text-xl font-black text-blue-800 leading-none">{progressPercent > 100 ? 100 : progressPercent}%</p>
          </div>
          <div className="w-12 h-12 relative">
             <svg className="w-12 h-12 transform -rotate-90">
              <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-blue-50" />
              <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" 
                strokeDasharray={2 * Math.PI * 20}
                strokeDashoffset={2 * Math.PI * 20 * (1 - (progressPercent > 100 ? 100 : progressPercent) / 100)}
                className="text-blue-600 transition-all duration-1000 ease-out" 
              />
            </svg>
            <Trophy className="absolute inset-0 m-auto text-blue-600" size={16} />
          </div>
        </div>
      </header>

      <main>
        {view === 'daily' && (
          <DailyView 
            selectedDate={selectedDate} setSelectedDate={setSelectedDate}
            reading={currentReading} isDone={isDone} toggleComplete={toggleComplete}
          />
        )}
        {view === 'calendar' && (
          <CalendarView selectedDate={selectedDate} setSelectedDate={setSelectedDate} completed={completed} setView={setView} />
        )}
        {view === 'list' && (
          <ListView completed={completed} toggleComplete={toggleComplete} setSelectedDate={(d) => { setSelectedDate(d); setView('daily'); }} />
        )}
      </main>

      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-md border border-gray-200 shadow-2xl rounded-full px-2 py-1.5 flex items-center gap-1 z-50 max-w-[90%] sm:max-w-none">
        <NavButton active={view === 'daily'} onClick={() => setView('daily')} icon={<LayoutDashboard size={20} />} label="홈" />
        <NavButton active={view === 'calendar'} onClick={() => setView('calendar')} icon={<CalendarIcon size={20} />} label="달력" />
        <NavButton active={view === 'list'} onClick={() => setView('list')} icon={<List size={20} />} label="목록" />
      </nav>
    </div>
  );
};

const NavButton: React.FC<{ active: boolean, onClick: () => void, icon: React.ReactNode, label: string }> = ({ active, onClick, icon, label }) => (
  <button onClick={onClick} className={`flex items-center gap-2 px-4 sm:px-6 py-2 rounded-full transition-all ${active ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-100'}`}>
    {icon}
    <span className="font-bold text-sm sm:text-base">{label}</span>
  </button>
);

const DailyView: React.FC<{ 
  selectedDate: Date, setSelectedDate: (d: Date) => void,
  reading: string, isDone: boolean, toggleComplete: (s: string) => void
}> = ({ selectedDate, setSelectedDate, reading, isDone, toggleComplete }) => {
  const dateStr = format(selectedDate, 'yyyy-MM-dd');
  const isSamilSunday = reading === "주일";
  const bibleUrl = getBibleUrl(reading);

  return (
    <div className="space-y-4 md:space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100">
        <button onClick={() => setSelectedDate(addDays(selectedDate, -1))} className="p-3 hover:bg-gray-100 rounded-xl transition-colors">
          <ChevronLeft size={20} className="text-gray-600" />
        </button>
        <div className="text-center">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">{format(selectedDate, 'yyyy')}</p>
          <p className="text-base md:text-xl font-black text-gray-800">{format(selectedDate, 'M월 d일 (eeee)', { locale: ko })}</p>
        </div>
        <button onClick={() => setSelectedDate(addDays(selectedDate, 1))} className="p-3 hover:bg-gray-100 rounded-xl transition-colors">
          <ChevronRight size={20} className="text-gray-600" />
        </button>
      </div>

      <div className={`relative overflow-hidden rounded-[2rem] md:rounded-[2.5rem] p-6 sm:p-10 md:p-14 text-center transition-all duration-500 ${
        isDone ? 'bg-green-50 text-green-900 border-2 border-green-200' : 
        isSamilSunday ? 'bg-orange-50 text-orange-900 border-2 border-orange-100' : 'bg-white shadow-xl border border-blue-50'
      }`}>
        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
          <BookOpen size={160} />
        </div>

        <p className={`text-sm font-bold mb-2 tracking-wide uppercase ${isDone ? 'text-green-600' : 'text-blue-500'}`}>
          {isDone ? '읽기 완료!' : 'TODAY\'S BIBLE'}
        </p>
        <h2 className={`text-3xl sm:text-5xl md:text-7xl font-black mb-8 tracking-tighter leading-tight ${isSamilSunday ? 'text-orange-600' : 'text-gray-900'}`}>
          {reading}
        </h2>

        {reading !== "정보 없음" && !isSamilSunday && (
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6 relative z-10">
            {bibleUrl && (
              <a href={bibleUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 px-5 py-3 bg-white border-2 border-blue-600 text-blue-600 font-black rounded-xl hover:bg-blue-50 transition-all shadow-sm text-sm sm:text-base">
                <ExternalLink size={18} /> 본문 읽기
              </a>
            )}
            <button onClick={() => toggleComplete(dateStr)} className={`flex items-center justify-center gap-2 px-8 py-3 rounded-xl text-lg font-black transition-all transform active:scale-95 shadow-lg ${
              isDone ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}>
              {isDone ? <CheckCircle2 size={22} /> : <Circle size={22} />}
              <span>{isDone ? '완료 취소' : '읽기 완료 체크'}</span>
            </button>
          </div>
        )}

        {isSamilSunday && <p className="mt-4 text-orange-600 font-bold italic text-base">"거룩한 주일, 안식하며 예배하세요"</p>}
        {reading === "정보 없음" && <p className="mt-4 text-gray-400 font-bold italic text-base">"올해의 통독 일정이 마무리되었습니다. 수고하셨습니다!"</p>}
      </div>

      {!isDone && !isSamilSunday && reading !== "정보 없음" && (
        <div className="bg-blue-50/50 border border-blue-100 p-5 rounded-2xl flex items-start gap-4">
          <div className="bg-blue-600 p-2 rounded-lg text-white shrink-0"><BookOpen size={16} /></div>
          <div>
            <h4 className="font-bold text-blue-900 mb-1 text-sm">성경 읽기 안내</h4>
            <p className="text-blue-800/80 text-[13px] leading-snug font-medium">
              본문 읽기를 누르면 YouVersion 성경 읽기 페이지로 연결됩니다. 말씀을 읽으신 후 완료 체크를 잊지 마세요.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

const CalendarView: React.FC<{ 
  selectedDate: Date, setSelectedDate: (d: Date) => void,
  completed: Record<string, boolean>, setView: (v: 'daily') => void
}> = ({ selectedDate, setSelectedDate, completed, setView }) => {
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(selectedDate));
  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth));
    const end = endOfWeek(endOfMonth(currentMonth));
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);
  const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

  return (
    <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-300">
      <div className="bg-blue-600 p-5 text-white flex items-center justify-between">
        <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 hover:bg-white/10 rounded-full transition-colors"><ChevronLeft /></button>
        <h2 className="text-lg font-black">{format(currentMonth, 'yyyy년 M월')}</h2>
        <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 hover:bg-white/10 rounded-full transition-colors"><ChevronRight /></button>
      </div>
      <div className="p-4 sm:p-6">
        <div className="grid grid-cols-7 mb-3">
          {weekDays.map(d => (
            <div key={d} className={`text-center font-black text-xs ${d === '일' ? 'text-red-500' : 'text-gray-400'}`}>{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {days.map(day => {
            const key = format(day, 'yyyy-MM-dd');
            const content = READING_DATA[key];
            const isFinished = !!completed[key];
            const isSelected = isSameDay(day, selectedDate);
            const isCurrMonth = isSameMonth(day, currentMonth);
            const isTodayDate = isToday(day);
            return (
              <button 
                key={key} onClick={() => { setSelectedDate(day); setView('daily'); }}
                className={`aspect-square relative flex flex-col items-center justify-center rounded-xl sm:rounded-2xl transition-all ${!isCurrMonth ? 'opacity-10 pointer-events-none' : ''} ${isSelected ? 'bg-blue-600 text-white shadow-md' : 'hover:bg-gray-50'}`}
              >
                <span className={`text-base sm:text-lg font-black ${
                  isSelected 
                    ? 'text-white' 
                    : (isTodayDate ? 'text-blue-600' : 'text-gray-800')
                }`}>
                  {format(day, 'd')}
                </span>
                {isFinished && content !== "주일" && <div className={`absolute bottom-1.5 sm:bottom-2 w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-green-500'}`}></div>}
                {content === "주일" && isCurrMonth && !isSelected && <div className="absolute top-1 right-1 w-1 h-1 rounded-full bg-red-400"></div>}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const ListView: React.FC<{ 
  completed: Record<string, boolean>, toggleComplete: (s: string) => void, setSelectedDate: (d: Date) => void
}> = ({ completed, toggleComplete, setSelectedDate }) => {
  const months = Array.from({ length: 12 }, (_, i) => i);
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
      {months.map(monthIdx => {
        const monthDate = new Date(2026, monthIdx, 1);
        const daysInMonth = eachDayOfInterval({ start: startOfMonth(monthDate), end: endOfMonth(monthDate) });
        return (
          <div key={monthIdx} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-blue-50 px-5 py-3 border-b border-blue-100 flex justify-between items-center">
              <h3 className="text-lg font-black text-blue-900">{monthIdx + 1}월</h3>
            </div>
            <div className="divide-y divide-gray-50 max-h-[350px] overflow-y-auto">
              {daysInMonth.map(day => {
                const key = format(day, 'yyyy-MM-dd');
                const content = READING_DATA[key];
                if (!content) return null;
                const isFinished = !!completed[key];
                const isSunday = day.getDay() === 0;
                const isSamilSunday = content === "주일";
                return (
                  <div key={key} className="flex items-center justify-between p-4 hover:bg-gray-50 cursor-pointer transition-colors" onClick={() => setSelectedDate(day)}>
                    <div className="flex items-center gap-4">
                      <div className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-black ${isSunday ? 'bg-red-50 text-red-500' : 'bg-gray-100 text-gray-400'}`}>{format(day, 'd')}</div>
                      <div>
                        <p className={`text-sm sm:text-base font-bold ${isSunday ? 'text-red-600' : 'text-gray-800'}`}>{content}</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">{format(day, 'eeee', { locale: ko })}</p>
                      </div>
                    </div>
                    {!isSamilSunday && content !== "정보 없음" && (
                      <button onClick={(e) => { e.stopPropagation(); toggleComplete(key); }} className={`p-2 rounded-xl transition-colors ${isFinished ? 'text-green-600 bg-green-50' : 'text-gray-200'}`}>
                        {isFinished ? <CheckCircle2 size={22} /> : <Circle size={22} />}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);