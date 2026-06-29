import { useState, useEffect } from "react";
import { db } from "../firebase/config";
import { doc, getDoc } from "firebase/firestore";

const DAYS = ["Понеделник", "Вторник", "Сряда", "Четвъртък", "Петък", "Събота", "Неделя"];
const MEALS = [
  { key: "закуска", label: "ЗАКУСКА", color: "#E0A93B" },
  { key: "обяд", label: "ОБЯД", color: "#4FA06B" },
  { key: "вечеря", label: "ВЕЧЕРЯ", color: "#5B6B8C" },
];

function pluralYastia(n) {
  return n === 1 ? "1 ястие" : `${n} ястия`;
}

export default function MenuView({ familyCode }) {
  const [menu, setMenu] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(null);

  useEffect(() => { loadMenu(); }, []);

  const loadMenu = async () => {
    const ref = doc(db, "menus", familyCode);
    const snap = await getDoc(ref);
    if (snap.exists()) setMenu(snap.data().menu || {});
    setLoading(false);
  };

  if (loading) return (
    <p style={{ color: "#6F7B73", fontFamily: "'Manrope', sans-serif" }}>Зареждане...</p>
  );

  if (selectedDay) {
    const dayMenu = menu[selectedDay] || {};
    return (
      <div>
        <button
          onClick={() => setSelectedDay(null)}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            background: "white", border: "1.5px solid #DDD8CE",
            borderRadius: 10, padding: "8px 16px",
            fontFamily: "'Manrope', sans-serif", fontWeight: 600,
            fontSize: 14, color: "#1E2A24", marginBottom: 24,
            transition: "background .15s",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
          </svg>
          Назад
        </button>

        <h1 style={{ fontFamily: "'Lora', serif", fontSize: 34, fontWeight: 600, color: "#1E2A24", marginBottom: 24 }}>
          {selectedDay}
        </h1>

        <div style={{ background: "white", border: "1px solid #ECE8DF", borderRadius: 16, overflow: "hidden", boxShadow: "0 1px 3px rgba(30,42,36,0.05)" }}>
          {MEALS.map(({ key, label, color }, i) => {
            const dishes = dayMenu[key] || [];
            return (
              <div key={key} style={{ padding: "18px 24px", borderTop: i === 0 ? "none" : "1px solid #F0EDE5" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: color, flexShrink: 0 }} />
                  <span style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: 12, letterSpacing: "0.05em", color: "#6F7B73" }}>
                    {label}
                  </span>
                </div>
                {dishes.length === 0 ? (
                  <p style={{ color: "#B6BAB2", fontSize: 14, fontFamily: "'Manrope', sans-serif" }}>Нищо планирано</p>
                ) : (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {dishes.map((d) => (
                      <span key={d.id} style={{
                        background: "#EEF3EF", color: "#234735",
                        borderRadius: 8, padding: "5px 12px",
                        fontFamily: "'Manrope', sans-serif", fontWeight: 500, fontSize: 13,
                      }}>
                        {d.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div>
      <p style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: 13, letterSpacing: "0.06em", color: "#2E6B4F", textTransform: "uppercase", marginBottom: 6 }}>
        ТАЗИ СЕДМИЦА
      </p>
      <h1 style={{ fontFamily: "'Lora', serif", fontSize: 34, fontWeight: 600, color: "#1E2A24", letterSpacing: "-0.015em", marginBottom: 28 }}>
        Седмично меню
      </h1>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(330px, 1fr))", gap: 18 }}>
        {DAYS.map((day) => {
          const dayMenu = menu[day] || {};
          const total = Object.values(dayMenu).flat().length;
          return (
            <div
              key={day}
              onClick={() => setSelectedDay(day)}
              style={{
                background: "white", border: "1px solid #ECE8DF",
                borderRadius: 16, padding: 22, cursor: "pointer",
                boxShadow: "0 1px 2px rgba(30,42,36,0.04)",
                transition: "transform .15s, box-shadow .15s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 6px 18px rgba(30,42,36,0.08)"; e.currentTarget.style.borderColor = "#2E6B4F"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 1px 2px rgba(30,42,36,0.04)"; e.currentTarget.style.borderColor = "#ECE8DF"; }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <h3 style={{ fontFamily: "'Lora', serif", fontSize: 21, fontWeight: 600, color: "#1E2A24", letterSpacing: "-0.01em" }}>
                  {day}
                </h3>
                <span style={{
                  fontFamily: "'Manrope', sans-serif", fontWeight: 600, fontSize: 12,
                  padding: "3px 10px", borderRadius: 999,
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
                          <span key={d.id} style={{
                            background: "#EEF3EF", color: "#234735",
                            borderRadius: 8, padding: "3px 10px",
                            fontFamily: "'Manrope', sans-serif", fontWeight: 500, fontSize: 12,
                          }}>
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