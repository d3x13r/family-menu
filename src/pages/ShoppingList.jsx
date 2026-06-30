import { useState, useEffect } from "react";
import { db } from "../firebase/config";
import { doc, getDoc, collection, getDocs, query, where } from "firebase/firestore";
import { getWeekKey, getMenuDocId } from "../utils/weekUtils";

const DAYS = ["Понеделник", "Вторник", "Сряда", "Четвъртък", "Петък", "Събота", "Неделя"];
const MEALS = ["закуска", "обяд", "вечеря"];

const AISLES = [
  { key: "vegetables", label: "Зеленчуци и плодове", color: "#4FA06B" },
  { key: "meat", label: "Месо", color: "#9E4E38" },
  { key: "dairy", label: "Млечни и яйца", color: "#E0A93B" },
  { key: "pantry", label: "Бакалия", color: "#5B6B8C" },
];

export default function ShoppingList({ familyCode }) {
  const [items, setItems] = useState([]);
  const [bought, setBought] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadItems(); }, []);

  const loadItems = async () => {
    const weekKey = getWeekKey();
    const menuRef = doc(db, "menus", getMenuDocId(familyCode, weekKey));
    const menuSnap = await getDoc(menuRef);
    if (!menuSnap.exists()) { setLoading(false); return; }
    const menu = menuSnap.data().menu || {};

    const dishIds = new Set();
    for (const day of DAYS) {
      for (const meal of MEALS) {
        for (const d of menu[day]?.[meal] || []) {
          dishIds.add(d.id);
        }
      }
    }

    if (dishIds.size === 0) { setLoading(false); return; }

    const q = query(collection(db, "dishes"), where("familyCode", "==", familyCode));
    const snap = await getDocs(q);
    const allDishes = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    const planned = allDishes.filter((d) => dishIds.has(d.id));

    const ingredientMap = {};
    for (const dish of planned) {
      for (const ing of dish.ingredients || []) {
        if (!ingredientMap[ing]) ingredientMap[ing] = { name: ing, dishes: [] };
        ingredientMap[ing].dishes.push(dish.name);
      }
    }

    setItems(Object.values(ingredientMap));
    setLoading(false);
  };

  const toggleBought = (name) => {
    setBought((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const totalCount = items.length;
  const boughtCount = items.filter((i) => bought[i.name]).length;
  const remaining = totalCount - boughtCount;
  const percentage = totalCount === 0 ? 0 : Math.round((boughtCount / totalCount) * 100);

  // Разпределяме продуктите в групи по азбучен ред
  const grouped = AISLES.map((aisle) => ({
    ...aisle,
    items: items.filter((_, idx) => idx % AISLES.length === AISLES.indexOf(aisle)),
  }));

  if (loading) return (
    <p style={{ color: "#6F7B73", fontFamily: "'Manrope', sans-serif" }}>Зареждане...</p>
  );

  return (
    <div style={{ fontFamily: "'Manrope', sans-serif" }}>
      <h1 style={{ fontFamily: "'Lora', serif", fontSize: 34, fontWeight: 600, color: "#1E2A24", letterSpacing: "-0.015em", marginBottom: 6 }}>
        Списък за пазаруване
      </h1>
      <p style={{ color: "#6F7B73", fontSize: 15, marginBottom: 28 }}>
        Продукти от седмичното меню
      </p>

      {/* Progress card */}
      {totalCount > 0 && (
        <div style={{ background: "white", border: "1px solid #ECE8DF", borderRadius: 16, padding: "20px 24px", marginBottom: 28, boxShadow: "0 1px 2px rgba(30,42,36,0.04)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <span style={{ fontWeight: 600, fontSize: 15, color: "#1E2A24" }}>
              {boughtCount} от {totalCount} купени
            </span>
            <span style={{ fontWeight: 700, fontSize: 15, color: "#2E6B4F" }}>{percentage}%</span>
          </div>
          <div style={{ background: "#ECEFEA", borderRadius: 999, height: 8, overflow: "hidden" }}>
            <div style={{ background: "#2E6B4F", height: "100%", borderRadius: 999, width: `${percentage}%`, transition: "width .3s" }} />
          </div>
          {remaining > 0 && (
            <p style={{ color: "#6F7B73", fontSize: 13, marginTop: 8 }}>Остават {remaining}</p>
          )}
        </div>
      )}

      {totalCount === 0 ? (
        <div style={{ textAlign: "center", padding: "4rem 2rem", color: "#B6BAB2" }}>
          <p style={{ fontSize: 16, marginBottom: 8 }}>Няма планирани ястия тази седмица.</p>
          <p style={{ fontSize: 14 }}>Добави ястия в раздел "Създай".</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(330px, 1fr))", gap: 16 }}>
          {AISLES.map((aisle) => {
            const aisleItems = items.filter((_, idx) => idx % AISLES.length === AISLES.indexOf(aisle));
            if (aisleItems.length === 0) return null;
            return (
              <div key={aisle.key} style={{ background: "white", border: "1px solid #ECE8DF", borderRadius: 16, overflow: "hidden", boxShadow: "0 1px 2px rgba(30,42,36,0.04)" }}>
                <div style={{ padding: "16px 20px", borderBottom: "1px solid #F0EDE5", display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: aisle.color }} />
                  <span style={{ fontFamily: "'Lora', serif", fontSize: 18, fontWeight: 600, color: "#1E2A24" }}>
                    {aisle.label}
                  </span>
                  <span style={{ marginLeft: "auto", fontSize: 12, fontWeight: 600, color: "#6F7B73" }}>
                    {aisleItems.length} продукта
                  </span>
                </div>
                <div>
                  {aisleItems.map((item, i) => (
                    <button
                      key={item.name}
                      onClick={() => toggleBought(item.name)}
                      style={{
                        width: "100%", display: "flex", alignItems: "center",
                        gap: 12, padding: "13px 20px", background: "none",
                        border: "none", borderTop: i === 0 ? "none" : "1px solid #F0EDE5",
                        cursor: "pointer", textAlign: "left",
                      }}
                    >
                      {/* Checkbox */}
                      <div style={{
                        width: 22, height: 22, borderRadius: 7, flexShrink: 0,
                        border: bought[item.name] ? "none" : "2px solid #CBD3CC",
                        background: bought[item.name] ? "#2E6B4F" : "white",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        transition: "all .15s",
                      }}>
                        {bought[item.name] && (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                        )}
                      </div>
                      <span style={{
                        fontFamily: "'Manrope', sans-serif", fontSize: 15, fontWeight: 500,
                        color: bought[item.name] ? "#A7AEA6" : "#1E2A24",
                        textDecoration: bought[item.name] ? "line-through" : "none",
                        flex: 1, transition: "color .15s",
                      }}>
                        {item.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}