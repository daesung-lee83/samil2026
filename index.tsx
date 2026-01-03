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

// --- BIBLE READING DATA ---
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
  "요한계시록": "REV"
};

const getBibleUrl = (passage: string) => {
  if (passage === "주일" || passage === "정보 없음") return null;
  try {
    const parts = passage.split(' ');
    const bookName = parts[0];
    const range = parts[1];
    const chapter = range ? range.split('-')[0] : '1';
    const code = BIBLE_CODES[bookName];
    if (code) {
      // YouVersion 개역한글(88) 링크 형식: https://www.bible.com/ko/bible/88/GEN.1.KRV
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
    const saved = localStorage.getItem('bible_reading_2026');
    if (saved) {
      try { setCompleted(JSON.parse(saved)); } catch (e) { console.error(e); }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('bible_reading_2026', JSON.stringify(completed));
  }, [completed]);

  const toggleComplete = (dateStr: string) => {
    setCompleted(prev => ({ ...prev, [dateStr]: !prev[dateStr] }));
  };

  const currentReadingKey = format(selectedDate, 'yyyy-MM-dd');
  const currentReading = READING_DATA[currentReadingKey] || "정보 없음";
  const isDone = !!completed[currentReadingKey];
  const totalCompleted = Object.values(completed).filter(Boolean).length;
  const progressPercent = Math.round((totalCompleted / 313) * 100);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-28 md:py-10 text-gray-800">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 md:mb-10">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-blue-900 tracking-tight">2026 삼일교회 성경통독</h1>
          <p className="text-blue-600 flex items-center gap-1.5 mt-1 text-sm md:text-base">
            <BookOpen size={16} /> 매일 말씀으로 승리하세요
          </p>
        </div>
        <div className="bg-white shadow-sm border border-blue-100 rounded-2xl px-4 py-3 flex items-center gap-4 self-start md:self-auto">
          <div className="text-right">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">진행률</p>
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

        {!isSamilSunday && (
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
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
      </div>

      {!isDone && !isSamilSunday && (
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
                {isFinished && READING_DATA[key] !== "주일" && <div className={`absolute bottom-1.5 sm:bottom-2 w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-green-500'}`}></div>}
                {READING_DATA[key] === "주일" && isCurrMonth && !isSelected && <div className="absolute top-1 right-1 w-1 h-1 rounded-full bg-red-400"></div>}
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
            <div className="bg-blue-50 px-5 py-3 border-b border-blue-100"><h3 className="text-lg font-black text-blue-900">{monthIdx + 1}월</h3></div>
            <div className="divide-y divide-gray-50 max-h-[350px] overflow-y-auto">
              {daysInMonth.map(day => {
                const key = format(day, 'yyyy-MM-dd');
                const isFinished = !!completed[key];
                const isSunday = day.getDay() === 0;
                const isSamilSunday = READING_DATA[key] === "주일";
                return (
                  <div key={key} className="flex items-center justify-between p-4 hover:bg-gray-50 cursor-pointer transition-colors" onClick={() => setSelectedDate(day)}>
                    <div className="flex items-center gap-4">
                      <div className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-black ${isSunday ? 'bg-red-50 text-red-500' : 'bg-gray-100 text-gray-400'}`}>{format(day, 'd')}</div>
                      <div>
                        <p className={`text-sm sm:text-base font-bold ${isSunday ? 'text-red-600' : 'text-gray-800'}`}>{READING_DATA[key] || "분량 정보 없음"}</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">{format(day, 'eeee', { locale: ko })}</p>
                      </div>
                    </div>
                    {!isSamilSunday && (
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