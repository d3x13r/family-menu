import { useState, useEffect } from "react";
import { db } from "../firebase/config";
import { collection, getDocs, query, where, doc, setDoc, getDoc } from "firebase/firestore";
import { getWeekKey, getMenuDocId, formatWeekRange } from "../utils/weekUtils";

const DAYS = ["Понеделник", "Вторник", "Сряда", "Четвъртък", "Петък", "Събота", "Неделя"];
const MEALS = [
  { key: "закуска", label: "Закуска", color: "#E0A93B" },
  { key: "обяд", label: "Обяд", color: "#4FA06B" },
  { key: "вечеря", label: "Вечеря", color: "#5B6B8C" },
];
const CATEGORIES = ["Всички", "Закуски", "Основни ястия", "Месо", "Гарнитури", "Десерти"];

const CAT_COLORS = {
  "Закуски":       { bg: "#F5ECD7", color: "#8A6A2A" },
  "Основни ястия": { bg: "#E3EFE6", color: "#2E6B4F" },
  "Месо":          { bg: "#F3E1DB", color: "#9E4E38" },
  "Гарнитури":     { bg: "#EBEFDA", color: "#67762C" },
  "Десерти":       { bg: "#EFE2EC", color: "#8A4A77" },
};

function getWeekKeyWithOffset(offset) {
  const d = new Date();
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff + offset * 7);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

export default function MenuCreate({ familyCode }) {
  const [weekKey, setWeekKey] = useState(getWeekKey());
  const [activeDay, setActiveDay] = useState("Понеделник");
  const [activeMeal, setActiveMeal] = useState("закуска");
  const [dishes, setDishes] = useState([]);
  const [menu, setMenu] = useState({});
  const [recentDishIds, setRecentDishIds] = useState(new Set());
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [filterCategory, setFilterCategory] = useState("Всички");
  const [search, setSearch] = useState("");

  useEffect(() => { loadDishes(); }, []);
  useEffect(() => { loadMenu(); loadRecentDishes(); }, [weekKey]);

  const loadDishes = async () => {
    const q = query(collection(db, "dishes"), where("familyCode", "==", familyCode));
    const snap = await getDocs(q);
    setDishes(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  };

  const loadMenu = async () => {
    const ref = doc(db, "menus", getMenuDocId(familyCode, weekKey));
    const snap = await getDoc(ref);
    if (snap.exists()) setMenu(snap.data().menu || {});
    else setMenu({});
  };

  const loadRecentDishes = async () => {
    const recentIds = new Set();
    for (let i = 1; i <= 3; i++) {
      const pastKey = getWeekKeyWithOffset(-i);
      if (pastKey === weekKey) continue;
      const ref = doc(db, "menus", getMenuDocId(familyCode, pastKey));
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const pastMenu = snap.data().menu || {};
        for (const day of DAYS) {
          for (const meal of ["закуска", "обяд", "вечеря"]) {
            for (const d of pastMenu[day]?.[meal] || []) {
              recentIds.add(d.id);
            }
          }
        }
      }
    }
    setRecentDishIds(recentIds);
  };

  const toggleDish = async (dish) => {
    const current = menu[activeDay]?.[activeMeal] || [];
    const exists = current.find((d) => d.id === dish.id);
    const updated = exists
      ? current.filter((d) => d.id !== dish.id)
      : [...current, { id: dish.id, name: dish.name, category: dish.category }];
    const newMenu = { ...menu, [activeDay]: { ...menu[activeDay], [activeMeal]: updated } };
    setMenu(newMenu);
    setSaving(true);
    await setDoc(doc(db, "menus", getMenuDocId(familyCode, weekKey)), { menu: newMenu, weekKey });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const changeWeek = (offset) => {
    const current = new Date(weekKey);
    current.setMinutes(current.getMinutes() + current.getTimezoneOffset());
    current.setDate(current.getDate() + offset * 7);
    const y = current.getFullYear();
    const m = String(current.getMonth() + 1).padStart(2, "0");
    const d = String(current.getDate()).padStart(2, "0");
    setWeekKey(`${y}-${m}-${d}`);
  };

  const currentDishes = menu[activeDay]?.[activeMeal] || [];
  const activeMealObj = MEALS.find((m) => m.key === activeMeal);
  const isCurrentWeek = weekKey === getWeekKey();

  const allFiltered = dishes
    .filter((d) => filterCategory === "Всички" || d.category === filterCategory)
    .filter((d) => d.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => a.name.localeCompare(b.name, "bg"));

  const freshDishes = allFiltered.filter((d) => !recentDishIds.has(d.id));
  const recentDishes = allFiltered.filter((d) => recentDishIds.has(d.id));

  return (
    <div style={{ fontFamily: "'Manrope', sans-serif" }}>
      {/* Заглавие + навигация */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: "'Lora', serif", fontSize: "clamp(24px, 6vw, 34px)", fontWeight: 600, color: "#1E2A24", letterSpacing: "-0.015em" }}>
          Създай меню
        </h1>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10, marginTop: 8 }}>
          <p style={{ color: "#6F7B73", fontSize: 14, fontFamily: "'Manrope', sans-serif" }}>
            {formatWeekRange(weekKey)}
          </p>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button onClick={() => changeWeek(-1)} style={navBtn}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
            </button>
            {!isCurrentWeek && (
              <button onClick={() => setWeekKey(getWeekKey())} style={{ ...ghostBtn, padding: "8px 12px", fontSize: 13 }}>Тази седмица</button>
            )}
            <button onClick={() => changeWeek(1)} style={navBtn}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>
            {saving && <span style={{ color: "#6F7B73", fontSize: 13 }}>Запазване...</span>}
            {saved && <span style={{ color: "#2E6B4F", fontSize: 13, fontWeight: 600 }}>✓ Запазено</span>}
          </div>
        </div>
      </div>

      {/* Дни */}
      <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", color: "#6F7B73", textTransform: "uppercase", marginBottom: 8 }}>ДЕН</p>
      <div style={{ display: "flex", gap: 6, marginBottom: 20, overflowX: "auto", scrollbarWidth: "none", paddingBottom: 4 }}>
        {DAYS.map((day) => (
          <button key={day} onClick={() => setActiveDay(day)} style={{
            padding: "8px 14px", borderRadius: 999, border: "1.5px solid", flexShrink: 0,
            fontWeight: 600, fontSize: 13,
            borderColor: activeDay === day ? "#2E6B4F" : "#E2DDD3",
            background: activeDay === day ? "#2E6B4F" : "white",
            color: activeDay === day ? "white" : "#3A463F",
            transition: "all .15s",
          }}>
            {day}
          </button>
        ))}
      </div>

      {/* Хранения */}
      <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", color: "#6F7B73", textTransform: "uppercase", marginBottom: 8 }}>ХРАНЕНЕ</p>
      <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
        {MEALS.map(({ key, label, color }) => (
          <button key={key} onClick={() => setActiveMeal(key)} style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "8px 16px", borderRadius: 999, border: "1.5px solid",
            fontWeight: 600, fontSize: 13,
            borderColor: activeMeal === key ? "#2E6B4F" : "#E2DDD3",
            background: activeMeal === key ? "#2E6B4F" : "white",
            color: activeMeal === key ? "white" : "#3A463F",
            transition: "all .15s",
          }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: activeMeal === key ? "rgba(255,255,255,0.7)" : color }} />
            {label}
          </button>
        ))}
      </div>

      {/* Избрани */}
      <div style={{ background: "white", border: "1px solid #ECE8DF", borderRadius: 14, padding: "18px 20px", marginBottom: 20 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: "#6F7B73", marginBottom: 12 }}>
          Избрани за <strong style={{ color: "#1E2A24" }}>{activeDay}</strong> · {activeMealObj?.label}
        </p>
        {currentDishes.length === 0 ? (
          <p style={{ color: "#B6BAB2", fontSize: 14 }}>Изберете ястия от списъка по-долу</p>
        ) : (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {currentDishes.map((d) => (
              <span key={d.id} onClick={() => toggleDish(d)} style={{
                display: "flex", alignItems: "center", gap: 6,
                background: "#2E6B4F", color: "white",
                padding: "5px 12px", borderRadius: 999,
                fontSize: 13, fontWeight: 500, cursor: "pointer",
              }}>
                {d.name}
                <span style={{ background: "rgba(255,255,255,0.22)", borderRadius: "50%", width: 16, height: 16, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10 }}>✕</span>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Търсене */}
      <div style={{ position: "relative", marginBottom: 12 }}>
        <svg style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#9AA39B" }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          placeholder="Търси ястие..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: "100%", padding: "10px 14px 10px 40px", borderRadius: 10, border: "1.5px solid #E2DDD3", fontFamily: "'Manrope', sans-serif", fontSize: 14, color: "#1E2A24", outline: "none", boxSizing: "border-box", background: "white" }}
        />
      </div>

      {/* Филтър категории */}
      <div style={{ display: "flex", gap: 6, marginBottom: 20, overflowX: "auto", scrollbarWidth: "none", paddingBottom: 4 }}>
        {CATEGORIES.map((cat) => (
          <button key={cat} onClick={() => setFilterCategory(cat)} style={{
            padding: "6px 14px", borderRadius: 999, border: "1.5px solid", flexShrink: 0,
            fontWeight: 600, fontSize: 12,
            borderColor: filterCategory === cat ? "#2E6B4F" : "#E2DDD3",
            background: filterCategory === cat ? "#2E6B4F" : "white",
            color: filterCategory === cat ? "white" : "#3A463F",
            transition: "all .15s",
          }}>
            {cat}
          </button>
        ))}
      </div>

      {/* Свежи ястия */}
      {freshDishes.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))", gap: 14, marginBottom: recentDishes.length > 0 ? 24 : 0 }}>
          {freshDishes.map((dish) => {
            const selected = currentDishes.find((d) => d.id === dish.id);
            const catStyle = CAT_COLORS[dish.category] || { bg: "#F0EDE5", color: "#5E6B63" };
            return (
              <div key={dish.id} onClick={() => toggleDish(dish)} style={{
                background: selected ? "#2E6B4F" : "white",
                border: `1px solid ${selected ? "#2E6B4F" : "#ECE8DF"}`,
                borderRadius: 14, padding: 16, cursor: "pointer",
                boxShadow: "0 1px 2px rgba(30,42,36,0.04)",
                transition: "all .15s",
              }}>
                <span style={{ display: "inline-block", background: selected ? "rgba(255,255,255,0.2)" : catStyle.bg, color: selected ? "white" : catStyle.color, borderRadius: 6, padding: "2px 8px", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 8 }}>
                  {dish.category}
                </span>
                <p style={{ fontFamily: "'Lora', serif", fontSize: 16, fontWeight: 600, color: selected ? "white" : "#1E2A24" }}>
                  {dish.name}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* Наскоро използвани */}
      {recentDishes.length > 0 && (
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <div style={{ flex: 1, height: 1, background: "#E8E4DB" }} />
            <span style={{ fontSize: 12, fontWeight: 700, color: "#A7AEA6", letterSpacing: "0.06em", textTransform: "uppercase", whiteSpace: "nowrap" }}>
              Използвани през последните 3 седмици
            </span>
            <div style={{ flex: 1, height: 1, background: "#E8E4DB" }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))", gap: 14 }}>
            {recentDishes.map((dish) => {
              const selected = currentDishes.find((d) => d.id === dish.id);
              const catStyle = CAT_COLORS[dish.category] || { bg: "#F0EDE5", color: "#5E6B63" };
              return (
                <div key={dish.id} onClick={() => toggleDish(dish)} style={{
                  background: selected ? "#2E6B4F" : "white",
                  border: `1px solid ${selected ? "#2E6B4F" : "#ECE8DF"}`,
                  borderRadius: 14, padding: 16, cursor: "pointer",
                  opacity: selected ? 1 : 0.65,
                  boxShadow: "0 1px 2px rgba(30,42,36,0.04)",
                  transition: "all .15s",
                }}>
                  <span style={{ display: "inline-block", background: selected ? "rgba(255,255,255,0.2)" : catStyle.bg, color: selected ? "white" : catStyle.color, borderRadius: 6, padding: "2px 8px", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 8 }}>
                    {dish.category}
                  </span>
                  <p style={{ fontFamily: "'Lora', serif", fontSize: 16, fontWeight: 600, color: selected ? "white" : "#1E2A24" }}>
                    {dish.name}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {allFiltered.length === 0 && (
        <p style={{ color: "#B6BAB2", textAlign: "center", padding: "3rem" }}>Няма намерени ястия.</p>
      )}
    </div>
  );
}

const navBtn = {
  display: "flex", alignItems: "center", justifyContent: "center",
  width: 38, height: 38, borderRadius: 10,
  border: "1.5px solid #DDD8CE", background: "white",
  color: "#1E2A24", cursor: "pointer",
};

const ghostBtn = {
  display: "flex", alignItems: "center", gap: 6,
  padding: "8px 16px", borderRadius: 10,
  border: "1.5px solid #DDD8CE", background: "white",
  fontFamily: "'Manrope', sans-serif", fontWeight: 600, fontSize: 14,
  color: "#1E2A24", cursor: "pointer",
};