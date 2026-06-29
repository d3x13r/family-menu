import { useState, useEffect } from "react";
import { db } from "../firebase/config";
import { doc, getDoc } from "firebase/firestore";

const DAYS = ["Понеделник", "Вторник", "Сряда", "Четвъртък", "Петък", "Събота", "Неделя"];
const MEALS = [
  { key: "закуска", label: "🌅 Закуска" },
  { key: "обяд", label: "☀️ Обяд" },
  { key: "вечеря", label: "🌙 Вечеря" },
];

export default function MenuView({ familyCode }) {
  const [menu, setMenu] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(null);

  useEffect(() => {
    loadMenu();
  }, []);

  const loadMenu = async () => {
    const ref = doc(db, "menus", familyCode);
    const snap = await getDoc(ref);
    if (snap.exists()) setMenu(snap.data().menu || {});
    setLoading(false);
  };

  if (loading) return (
    <div style={{ textAlign: "center", color: "#888", padding: "3rem" }}>
      Зареждане...
    </div>
  );

  // Детайлен изглед за един ден
  if (selectedDay) return (
    <div style={{ fontFamily: "sans-serif" }}>
      <button onClick={() => setSelectedDay(null)} style={backBtn}>
        ← Назад
      </button>
      <h2 style={{ color: "#4A7C59", marginBottom: "1.5rem" }}>📅 {selectedDay}</h2>
      {MEALS.map(({ key, label }) => {
        const dishes = menu[selectedDay]?.[key] || [];
        return (
          <div key={key} style={{ ...card, marginBottom: "1rem" }}>
            <h3 style={{ color: "#4A7C59", marginBottom: "0.75rem" }}>{label}</h3>
            {dishes.length === 0 ? (
              <p style={{ color: "#bbb", fontSize: "0.85rem" }}>Няма избрани ястия</p>
            ) : (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                {dishes.map((d) => (
                  <span key={d.id} style={dishTag}>{d.name}</span>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  // Седмичен изглед
  return (
    <div style={{ fontFamily: "sans-serif" }}>
      <h2 style={{ color: "#4A7C59", marginBottom: "1.5rem" }}>📅 Седмично меню</h2>
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
        gap: "1rem"
      }}>
        {DAYS.map((day) => {
          const dayMenu = menu[day] || {};
          const total = Object.values(dayMenu).flat().length;
          return (
            <div
              key={day}
              onClick={() => setSelectedDay(day)}
              style={{
                background: "white",
                borderRadius: "14px",
                padding: "1.2rem",
                cursor: "pointer",
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                borderTop: "4px solid #4A7C59",
                transition: "transform 0.15s",
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-2px)"}
              onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                <h3 style={{ color: "#4A7C59", fontSize: "1rem" }}>{day}</h3>
                <span style={{
                  fontSize: "0.7rem",
                  background: total > 0 ? "#EAF2EC" : "#f5f5f5",
                  color: total > 0 ? "#4A7C59" : "#bbb",
                  padding: "0.2rem 0.5rem",
                  borderRadius: "10px",
                  fontWeight: "600"
                }}>
                  {total} ястия
                </span>
              </div>
              {MEALS.map(({ key, label }) => {
                const dishes = dayMenu[key] || [];
                return (
                  <div key={key} style={{ marginBottom: "0.5rem" }}>
                    <div style={{ fontSize: "0.72rem", color: "#888", marginBottom: "0.2rem" }}>
                      {label}
                    </div>
                    {dishes.length === 0 ? (
                      <div style={{ fontSize: "0.78rem", color: "#ccc" }}>—</div>
                    ) : (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.3rem" }}>
                        {dishes.map((d) => (
                          <span key={d.id} style={smallTag}>{d.name}</span>
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

const card = {
  background: "white",
  borderRadius: "14px",
  padding: "1.25rem",
  boxShadow: "0 2px 8px rgba(0,0,0,0.06)"
};

const dishTag = {
  background: "#EAF2EC",
  color: "#4A7C59",
  padding: "0.3rem 0.8rem",
  borderRadius: "20px",
  fontSize: "0.85rem",
  fontWeight: "500"
};

const smallTag = {
  background: "#EAF2EC",
  color: "#4A7C59",
  padding: "0.15rem 0.5rem",
  borderRadius: "10px",
  fontSize: "0.72rem",
  fontWeight: "500"
};

const backBtn = {
  padding: "0.5rem 1rem",
  background: "white",
  color: "#4A7C59",
  border: "2px solid #4A7C59",
  borderRadius: "8px",
  fontSize: "0.85rem",
  fontWeight: "600",
  cursor: "pointer",
  marginBottom: "1rem"
};