const MONTHS = ["януари", "февруари", "март", "април", "май", "юни", "юли", "август", "септември", "октомври", "ноември", "декември"];
const DAYS = ["Неделя", "Понеделник", "Вторник", "Сряда", "Четвъртък", "Петък", "Събота"];

export function getMonday(date = new Date()) {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
}

export function formatDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function getWeekKey(date = new Date()) {
  return formatDate(getMonday(date));
}

export function formatWeekRange(weekKey) {
  const [year, month, day] = weekKey.split("-").map(Number);
  const start = new Date(year, month - 1, day);
  const end = new Date(year, month - 1, day + 6);
  const fmt = (d) => `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}`;
  return `${fmt(start)} – ${fmt(end)}.${end.getFullYear()}`;
}

export function getMenuDocId(familyCode, weekKey) {
  return `${familyCode}_${weekKey}`;
}

// Връща масив от {name, date, dateLabel} за дните на седмицата, в реда Пон→Нед
export function getWeekDays(weekKey) {
  const [year, month, day] = weekKey.split("-").map(Number);
  const monday = new Date(year, month - 1, day);
  const names = ["Понеделник", "Вторник", "Сряда", "Четвъртък", "Петък", "Събота", "Неделя"];
  return names.map((name, i) => {
    const date = new Date(year, month - 1, day + i);
    return {
      name,
      date,
      dateLabel: `${date.getDate()} ${MONTHS[date.getMonth()]}`,
    };
  });
}

// Подрежда дните на седмицата започвайки от днес (само за текущата седмица)
export function getDaysOrderedFromToday(weekKey) {
  const days = getWeekDays(weekKey);
  const todayKey = getWeekKey();
  if (weekKey !== todayKey) return days; // само за текущата седмица подреждаме от днес

  const todayIndex = new Date().getDay(); // 0=Нед, 1=Пон...
  const mondayBasedIndex = todayIndex === 0 ? 6 : todayIndex - 1; // превръщаме в 0=Пон...6=Нед
  return [...days.slice(mondayBasedIndex), ...days.slice(0, mondayBasedIndex)];
}