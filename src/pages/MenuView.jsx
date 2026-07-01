import { useState, useEffect } from "react";
import { db } from "../firebase/config";
import { doc, getDoc, collection, getDocs, query, where } from "firebase/firestore";
import { getWeekKey, formatWeekRange, getMenuDocId, getDaysOrderedFromToday } from "../utils/weekUtils";

const MEALS = [
  { key: "закуска", label: "ЗАКУСКА", color: "#E0A93B" },
  { key: "обяд", label: "ОБЯД", color: "#4FA06B" },
  { key: "вечеря", label: "ВЕЧЕРЯ", color: "#5B6B8C" },
];

const CAT_COLORS = {
  "Закуски":       { bg: "#F5ECD7", color: "#8A6A2A" },
  "Основни ястия": { bg: "#E3EFE6", color: "#2E6B4F" },
  "Месо":          { bg: "#F3E1DB", color: "#9E4E38" },
  "Гарнитури":     { bg: "#EBEFDA", color: "#67762C" },
  "Десерти":       { bg: "#EFE2EC", color: "#8A4A77" },
};

function pluralYastia(n) {
  return n === 1 ? "1 ястие" : `${n} ястия`;
}

function normalizeIngredients(dish) {
  if (!dish.ingredients) return [];
  if (dish.ingredients.length > 0 && typeof dish.ingredients[0] === "object") {
    return dish.ingredients;
  }
  return dish.ingredients.map((text) => {
    const match = text.match(/^(.+?)\s*-\s*(\d+(?:[.,]\d+)?)\s*(гр|г|мл|бр|л|кг)?\.?$/i);
    if (match) return { product: match[1].trim(), amount: match[2], unit: match[3] || "гр" };
    return { product: text, amount: "", unit: "" };
  });
}

export default function MenuView({ familyCode }) {
  const [weekKey, setWeekKey] = useState(getWeekKey());
  const [menu, setMenu] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedDish, setSelectedDish] = useState(null);
  const [allDishes, setAllDishes] = useState([]);

  useEffect(() => { loadMenu(); loadDishes(); }, [weekKey]);

  const loadMenu = async () => {
    setLoading(true);
    const ref = doc(db, "menus", getMenuDocId(familyCode, weekKey));
    const snap = await getDoc(ref);
    setMenu(snap.exists() ? snap.data().menu || {} : {});
    setLoading(false);
  };

  const loadDishes = async () => {
    const q = query(collection(db, "dishes"), where("familyCode", "==", familyCode));
    const snap = await getDocs(q);
    setAllDishes(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  };

  const changeWeek = (offset) => {
    const d = new Date(weekKey);
    d.setMinutes(d.getMinutes() + d.getTimezoneOffset());
    d.setDate(d.getDate() + offset * 7);
    setWeekKey(getWeekKey(d));
    setSelectedDay(null);
    setSelectedDish(null);
  };

  const getDishDetails = (dishId) => allDishes.find((d) => d.id === dishId);

  const days = getDaysOrderedFromToday(weekKey);
  const isCurrentWeek = weekKey === getWeekKey();

  if (loading) return <p style={{ color: "#6F7B73", fontFamily: "'Manrope', sans-serif" }}>Зареждане...</p>;

  // Страница на ястие
  if (selectedDish) {
    const catStyle = CAT_COLORS[selectedDish.category] || { bg: "#F0EDE5", color: "#5E6B63" };
    const ingredients = normalizeIngredients(selectedDish);
    return (
      <div>
        <button onClick={() => setSelectedDish(null)} style={ghostBtn}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
          </svg>
          Назад към {selectedDay?.name}
        </button>

        <div style={{ background: "white", border: "1px solid #ECE8DF", borderRadius: 16, overflow: "hidden", boxShadow: "0 1px 3px rgba(30,42,36,0.05)", marginTop: 16 }}>
          <div style={{ padding: "30px 34px", borderBottom: "1px solid #F0EDE5" }}>
            <span style={{ display: "inline-block", background: catStyle.bg, color: catStyle.color, borderRadius: 6, padding: "3px 10px", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>
              {selectedDish.category}
            </span>
            <h1 style={{ fontFamily: "'Lora', serif", fontSize: 32, fontWeight: 600, color: "#1E2A24", letterSpacing: "-0.015em" }}>
              {selectedDish.name}
            </h1>
            {selectedDish.description && (
              <p style={{ color: "#6F7B73", fontSize: 15, marginTop: 8, fontFamily: "'Manrope', sans-serif" }}>{selectedDish.description}</p>
            )}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
            <div style={{ padding: "28px 34px", borderRight: "1px solid #F0EDE5" }}>
              <p style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: 13, letterSpacing: "0.06em", textTransform: "uppercase", color: "#6F7B73", marginBottom: 16 }}>
                СЪСТАВКИ
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
                {ingredients.length === 0 ? (
                  <p style={{ color: "#B6BAB2", fontSize: 14 }}>Няма добавени съставки.</p>
                ) : ingredients.map((ing, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#2E6B4F", marginTop: 6, flexShrink: 0 }} />
                    <span style={{ fontFamily: "'Manrope', sans-serif", fontSize: 15, color: "#1E2A24" }}>
                      {ing.product}{ing.amount ? ` — ${ing.amount} ${ing.unit}` : ""}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ padding: "28px 34px", borderTop: "1px solid #F0EDE5" }}>
              <p style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: 13, letterSpacing: "0.06em", textTransform: "uppercase", color: "#6F7B73", marginBottom: 16 }}>
                РЕЦЕПТА
              </p>
              {!selectedDish.steps || selectedDish.steps.length === 0 ? (
                <p style={{ color: "#B6BAB2", fontSize: 14 }}>Все още няма добавена рецепта.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {selectedDish.steps.map((step, i) => (
                    <div key={i} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                      <div style={{ width: 26, height: 26, borderRadius: "50%", background: "#EBF1ED", color: "#2E6B4F", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
                        {i + 1}
                      </div>
                      <span style={{ fontFamily: "'Manrope', sans-serif", fontSize: 15, color: "#1E2A24", lineHeight: 1.6 }}>{step}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Детайл на ден
  if (selectedDay) {
    const dayMenu = menu[selectedDay.name] || {};
    return (
      <div>
        <button onClick={() => setSelectedDay(null)} style={ghostBtn}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
          </svg>
          Назад
        </button>

        <h1 style={{ fontFamily: "'Lora', serif", fontSize: 34, fontWeight: 600, color: "#1E2A24", marginBottom: 4, marginTop: 16 }}>
          {selectedDay.name}
        </h1>
        <p style={{ color: "#6F7B73", fontSize: 15, marginBottom: 24, fontFamily: "'Manrope', sans-serif" }}>
          {selectedDay.dateLabel}
        </p>

        <div style={{ background: "white", border: "1px solid #ECE8DF", borderRadius: 16, overflow: "hidden", boxShadow: "0 1px 3px rgba(30,42,36,0.05)" }}>
          {MEALS.map(({ key, label, color }, i) => {
            const dishes = dayMenu[key] || [];
            return (
              <div key={key} style={{ padding: "18px 24px", borderTop: i === 0 ? "none" : "1px solid #F0EDE5" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: color, flexShrink: 0 }} />
                  <span style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: 12, letterSpacing: "0.05em", color: "#6F7B73" }}>
                    {label}
                  </span>
                </div>
                {dishes.length === 0 ? (
                  <p style={{ color: "#B6BAB2", fontSize: 14, fontFamily: "'Manrope', sans-serif" }}>Нищо планирано</p>
                ) : (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {dishes.map((d) => {
                      const dishDetails = getDishDetails(d.id);
                      return (
                        <button
                          key={d.id}
                          onClick={() => dishDetails && setSelectedDish(dishDetails)}
                          style={{
                            background: "#EEF3EF", color: "#234735",
                            borderRadius: 8, padding: "6px 14px",
                            fontFamily: "'Manrope', sans-serif", fontWeight: 500, fontSize: 13,
                            border: "1px solid transparent",
                            cursor: dishDetails ? "pointer" : "default",
                            transition: "all .15s",
                            display: "flex", alignItems: "center", gap: 6,
                          }}
                          onMouseEnter={(e) => { if (dishDetails) { e.currentTarget.style.background = "#2E6B4F"; e.currentTarget.style.color = "white"; }}}
                          onMouseLeave={(e) => { e.currentTarget.style.background = "#EEF3EF"; e.currentTarget.style.color = "#234735"; }}
                        >
                          {d.name}
                          {dishDetails && (
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="9 18 15 12 9 6"/>
                            </svg>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Седмичен изглед
  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: "'Lora', serif", fontSize: 34, fontWeight: 600, color: "#1E2A24", letterSpacing: "-0.015em" }}>
          Седмично меню
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
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(330px, 1fr))", gap: 18 }}>
        {days.map((day) => {
          const dayMenu = menu[day.name] || {};
          const total = Object.values(dayMenu).flat().length;
          const isToday = isCurrentWeek && day.name === days[0].name;
          return (
            <div
              key={day.name}
              onClick={() => setSelectedDay(day)}
              style={{
                background: "white",
                border: `1px solid ${isToday ? "#2E6B4F" : "#ECE8DF"}`,
                borderRadius: 16, padding: 22, cursor: "pointer",
                boxShadow: "0 1px 2px rgba(30,42,36,0.04)",
                transition: "transform .15s, box-shadow .15s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 6px 18px rgba(30,42,36,0.08)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 1px 2px rgba(30,42,36,0.04)"; }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <h3 style={{ fontFamily: "'Lora', serif", fontSize: 21, fontWeight: 600, color: "#1E2A24" }}>
                      {day.name}
                    </h3>
                    {isToday && (
                      <span style={{ background: "#2E6B4F", color: "white", fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 999, fontFamily: "'Manrope', sans-serif" }}>
                        ДНЕС
                      </span>
                    )}
                  </div>
                  <p style={{ color: "#9AA39B", fontSize: 13, fontFamily: "'Manrope', sans-serif", marginTop: 2 }}>
                    {day.dateLabel}
                  </p>
                </div>
                <span style={{
                  fontFamily: "'Manrope', sans-serif", fontWeight: 600, fontSize: 12,
                  padding: "3px 10px", borderRadius: 999, flexShrink: 0,
                  background: total > 0 ? "#E3EFE6" : "#F0EDE5",
                  color: total > 0 ? "#2E6B4F" : "#A7AEA6",
                }}>
                  {total === 0 ? "празно" : pluralYastia(total)}
                </span>
              </div>

              {MEALS.map(({ key, label, color }, i) => {
                const dishes = dayMenu[key] || [];
                return (
                  <div key={key} style={{ borderTop: i === 0 ? "none" : "1px solid #F0EDE5", paddingTop: i === 0 ? 0 : 13, marginTop: i === 0 ? 0 : 13 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: color, flexShrink: 0 }} />
                      <span style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: 11, letterSpacing: "0.05em", color: "#6F7B73", textTransform: "uppercase" }}>
                        {label}
                      </span>
                    </div>
                    {dishes.length === 0 ? (
                      <p style={{ color: "#B6BAB2", fontSize: 13, fontFamily: "'Manrope', sans-serif" }}>Нищо планирано</p>
                    ) : (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {dishes.map((d) => (
                          <span key={d.id} style={{ background: "#EEF3EF", color: "#234735", borderRadius: 8, padding: "3px 10px", fontFamily: "'Manrope', sans-serif", fontWeight: 500, fontSize: 12 }}>
                            {d.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const ghostBtn = {
  display: "flex", alignItems: "center", gap: 6,
  padding: "8px 16px", borderRadius: 10,
  border: "1.5px solid #DDD8CE", background: "white",
  fontFamily: "'Manrope', sans-serif", fontWeight: 600, fontSize: 14,
  color: "#1E2A24", cursor: "pointer",
};

const navBtn = {
  display: "flex", alignItems: "center", justifyContent: "center",
  width: 38, height: 38, borderRadius: 10,
  border: "1.5px solid #DDD8CE", background: "white",
  color: "#1E2A24", cursor: "pointer",
};