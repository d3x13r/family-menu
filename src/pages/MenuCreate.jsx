import { useState, useEffect } from "react";
import { db } from "../firebase/config";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  setDoc,
  getDoc,
} from "firebase/firestore";

const DAYS = ["Понеделник", "Вторник", "Сряда", "Четвъртък", "Петък", "Събота", "Неделя"];
const MEALS = ["закуска", "обяд", "вечеря"];
const MEAL_LABELS = { закуска: "🌅 Закуска", обяд: "☀️ Обяд", вечеря: "🌙 Вечеря" };
const CATEGORIES = ["Всички", "Закуски", "Основни ястия", "Месни", "Гарнитури", "Десерти"];

export default function MenuCreate({ familyCode }) {
  const [activeDay, setActiveDay] = useState("Понеделник");
  const [activeMeal, setActiveMeal] = useState("закуска");
  const [dishes, setDishes] = useState([]);
  const [menu, setMenu] = useState({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [filterCategory, setFilterCategory] = useState("Всички");

  useEffect(() => {
    loadDishes();
    loadMenu();
  }, []);

  const loadDishes = async () => {
    const q = query(collection(db, "dishes"), where("familyCode", "==", familyCode));
    const snap = await getDocs(q);
    setDishes(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  };

  const loadMenu = async () => {
    const ref = doc(db, "menus", familyCode);
    const snap = await getDoc(ref);
    if (snap.exists()) setMenu(snap.data().menu || {});
  };

  const toggleDish = async (dish) => {
    const current = menu[activeDay]?.[activeMeal] || [];
    const exists = current.find((d) => d.id === dish.id);
    const updated = exists
      ? current.filter((d) => d.id !== dish.id)
      : [...current, { id: dish.id, name: dish.name, category: dish.category }];

    const newMenu = {
      ...menu,
      [activeDay]: {
        ...menu[activeDay],
        [activeMeal]: updated,
      },
    };
    setMenu(newMenu);
    setSaving(true);
    await setDoc(doc(db, "menus", familyCode), { menu: newMenu });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const currentDishes = menu[activeDay]?.[activeMeal] || [];
  const filteredDishes = filterCategory === "Всички"
    ? dishes
    : dishes.filter((d) => d.category === filterCategory);

  return (
    <div style={{ fontFamily: "sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h2 style={{ color: "#4A7C59" }}>✏️ Създай меню</h2>
        {saving && <span style={{ color: "#888", fontSize: "0.85rem" }}>Запазване...</span>}
        {saved && <span style={{ color: "#4A7C59", fontSize: "0.85rem" }}>✓ Запазено</span>}
      </div>

      {/* Дни */}
      <div style={{ display: "flex", gap: "0.4rem", marginBottom: "1.25rem", flexWrap: "wrap" }}>
        {DAYS.map((day) => (
          <button
            key={day}
            onClick={() => setActiveDay(day)}
            style={{
              padding: "0.45rem 0.85rem",
              borderRadius: "20px",
              border: "none",
              cursor: "pointer",
              fontWeight: "600",
              fontSize: "0.8rem",
              background: activeDay === day ? "#4A7C59" : "white",
              color: activeDay === day ? "white" : "#4A7C59",
            }}
          >
            {day}
          </button>
        ))}
      </div>

      {/* Хранения */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem" }}>
        {MEALS.map((meal) => (
          <button
            key={meal}
            onClick={() => setActiveMeal(meal)}
            style={{
              padding: "0.5rem 1.1rem",
              borderRadius: "8px",
              border: "2px solid #4A7C59",
              cursor: "pointer",
              fontWeight: "600",
              fontSize: "0.85rem",
              background: activeMeal === meal ? "#4A7C59" : "white",
              color: activeMeal === meal ? "white" : "#4A7C59",
            }}
          >
            {MEAL_LABELS[meal]}
          </button>
        ))}
      </div>

      {/* Избрани ястия */}
      {currentDishes.length > 0 && (
        <div style={{ marginBottom: "1.5rem" }}>
          <div style={{ fontSize: "0.8rem", color: "#888", marginBottom: "0.5rem" }}>
            Избрани за {activeDay} — {MEAL_LABELS[activeMeal]}:
          </div>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            {currentDishes.map((d) => (
              <span
                key={d.id}
                onClick={() => toggleDish(d)}
                style={{
                  background: "#4A7C59",
                  color: "white",
                  padding: "0.3rem 0.8rem",
                  borderRadius: "20px",
                  fontSize: "0.82rem",
                  cursor: "pointer",
                  fontWeight: "500"
                }}
              >
                {d.name} ✕
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Филтър категории */}
      <div style={{ display: "flex", gap: "0.4rem", marginBottom: "1rem", flexWrap: "wrap" }}>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            style={{
              padding: "0.3rem 0.7rem",
              borderRadius: "20px",
              border: "none",
              cursor: "pointer",
              fontWeight: "600",
              fontSize: "0.75rem",
              background: filterCategory === cat ? "#C9622F" : "white",
              color: filterCategory === cat ? "white" : "#C9622F",
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Списък ястия */}
      {filteredDishes.length === 0 ? (
        <div style={{ textAlign: "center", color: "#aaa", padding: "3rem" }}>
          Няма ястия в тази категория.
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "0.75rem" }}>
          {filteredDishes.map((dish) => {
            const selected = currentDishes.find((d) => d.id === dish.id);
            return (
              <div
                key={dish.id}
                onClick={() => toggleDish(dish)}
                style={{
                  background: selected ? "#4A7C59" : "white",
                  color: selected ? "white" : "#1C1C1C",
                  borderRadius: "12px",
                  padding: "1rem",
                  cursor: "pointer",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                  borderLeft: `4px solid ${selected ? "#2d5a3d" : "#4A7C59"}`,
                }}
              >
                <div style={{ fontSize: "0.7rem", opacity: 0.7, marginBottom: "0.2rem" }}>
                  {dish.category}
                </div>
                <div style={{ fontWeight: "600" }}>{dish.name}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}