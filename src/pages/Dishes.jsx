import { useState, useEffect } from "react";
import { db } from "../firebase/config";
import {
  collection, addDoc, getDocs, query, where,
  doc, updateDoc, deleteDoc, getDoc, setDoc,
} from "firebase/firestore";

const CATEGORIES = ["Закуски", "Основни ястия", "Месо", "Гарнитури", "Десерти"];
const UNITS = ["гр", "мл", "бр"];

const CAT_COLORS = {
  "Закуски":       { bg: "#F5ECD7", color: "#8A6A2A" },
  "Основни ястия": { bg: "#E3EFE6", color: "#2E6B4F" },
  "Месо":         { bg: "#F3E1DB", color: "#9E4E38" },
  "Гарнитури":     { bg: "#EBEFDA", color: "#67762C" },
  "Десерти":       { bg: "#EFE2EC", color: "#8A4A77" },
};

const emptyForm = { name: "", category: "Основни ястия", description: "", ingredients: [], steps: "" };
const emptyIngredient = { product: "", amount: "", unit: "гр" };

// Опитва да парсне стар текстов формат "Картофи - 200 гр." към {product, amount, unit}
function parseLegacyIngredient(text) {
  const match = text.match(/^(.+?)\s*-\s*(\d+(?:[.,]\d+)?)\s*(гр|г|мл|бр|л|кг)?\.?$/i);
  if (match) {
    let unit = (match[3] || "гр").toLowerCase();
    if (unit === "г") unit = "гр";
    if (unit === "л") unit = "мл";
    if (unit === "кг") unit = "гр";
    if (!UNITS.includes(unit)) unit = "гр";
    return { product: match[1].trim(), amount: match[2].replace(",", "."), unit };
  }
  return { product: text, amount: "", unit: "гр" };
}

function normalizeIngredients(dish) {
  if (!dish.ingredients) return [];
  // Вече в новия формат
  if (dish.ingredients.length > 0 && typeof dish.ingredients[0] === "object") {
    return dish.ingredients;
  }
  // Стар текстов формат — парсваме
  return dish.ingredients.map(parseLegacyIngredient);
}

export default function Dishes({ familyCode }) {
  const [dishes, setDishes] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [activeCategory, setActiveCategory] = useState("Всички");
  const [selectedDish, setSelectedDish] = useState(null);
  const [editingDish, setEditingDish] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => { loadDishes(); }, []);

  const loadDishes = async () => {
    const q = query(collection(db, "dishes"), where("familyCode", "==", familyCode));
    const snap = await getDocs(q);
    setDishes(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  };

  const addIngredientRow = () => {
    setForm({ ...form, ingredients: [...form.ingredients, { ...emptyIngredient }] });
  };

  const updateIngredientRow = (idx, field, value) => {
    const updated = [...form.ingredients];
    updated[idx] = { ...updated[idx], [field]: value };
    setForm({ ...form, ingredients: updated });
  };

  const removeIngredientRow = (idx) => {
    setForm({ ...form, ingredients: form.ingredients.filter((_, i) => i !== idx) });
  };

  const saveDish = async () => {
    if (!form.name.trim()) return;
    const cleanIngredients = form.ingredients
      .filter((i) => i.product.trim())
      .map((i) => ({ product: i.product.trim(), amount: i.amount || "", unit: i.unit }));
    const data = {
      ...form, familyCode,
      ingredients: cleanIngredients,
      steps: form.steps.split("\n").filter(Boolean),
    };
    if (editingDish) {
      await updateDoc(doc(db, "dishes", editingDish.id), data);
    } else {
      await addDoc(collection(db, "dishes"), data);
    }
    setForm(emptyForm); setShowForm(false); setEditingDish(null);
    loadDishes();
  };

  const deleteDish = async () => {
    await deleteDoc(doc(db, "dishes", selectedDish.id));
    const menuRef = doc(db, "menus", familyCode);
    const menuSnap = await getDoc(menuRef);
    if (menuSnap.exists()) {
      const currentMenu = menuSnap.data().menu || {};
      const updatedMenu = {};
      for (const day in currentMenu) {
        updatedMenu[day] = {};
        for (const meal in currentMenu[day]) {
          updatedMenu[day][meal] = currentMenu[day][meal].filter((d) => d.id !== selectedDish.id);
        }
      }
      await setDoc(menuRef, { menu: updatedMenu });
    }
    setSelectedDish(null); setConfirmDelete(false); loadDishes();
  };

  const startEdit = (dish) => {
    setEditingDish(dish);
    setForm({
      name: dish.name, category: dish.category,
      description: dish.description || "",
      ingredients: normalizeIngredients(dish),
      steps: dish.steps.join("\n"),
    });
    setSelectedDish(null); setShowForm(true);
  };

  const filtered = activeCategory === "Всички" ? dishes : dishes.filter((d) => d.category === activeCategory);

  if (selectedDish) {
    const catStyle = CAT_COLORS[selectedDish.category] || { bg: "#F0EDE5", color: "#5E6B63" };
    const ingredients = normalizeIngredients(selectedDish);
    return (
      <div>
        <button onClick={() => { setSelectedDish(null); setConfirmDelete(false); }} style={ghostBtn}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
          </svg>
          Назад
        </button>

        <div style={{ background: "white", border: "1px solid #ECE8DF", borderRadius: 16, overflow: "hidden", boxShadow: "0 1px 3px rgba(30,42,36,0.05)", marginTop: 16 }}>
          <div style={{ padding: "30px 34px", borderBottom: "1px solid #F0EDE5", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
            <div>
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
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => startEdit(selectedDish)} style={ghostBtn}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
                Редактирай
              </button>
              <button onClick={() => setConfirmDelete(true)} style={dangerBtn}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                </svg>
                Изтрий
              </button>
            </div>
          </div>

          {confirmDelete && (
            <div style={{ background: "#F7ECE8", border: "1px solid #E4C4BB", margin: "20px 34px", borderRadius: 10, padding: "16px 20px" }}>
              <p style={{ color: "#A0432E", fontWeight: 600, marginBottom: 12, fontFamily: "'Manrope', sans-serif" }}>
                Сигурен ли си че искаш да изтриеш "{selectedDish.name}"?
              </p>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={deleteDish} style={dangerBtn}>Да, изтрий</button>
                <button onClick={() => setConfirmDelete(false)} style={ghostBtn}>Отказ</button>
              </div>
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 0 }}>
            <div style={{ padding: "28px 34px", borderRight: "1px solid #F0EDE5" }}>
              <p style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: 13, letterSpacing: "0.06em", textTransform: "uppercase", color: "#6F7B73", marginBottom: 16 }}>
                СЪСТАВКИ
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
                {ingredients.map((ing, i) => (
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
              {selectedDish.steps.length === 0 ? (
                <p style={{ color: "#B6BAB2", fontSize: 14, textAlign: "center", fontFamily: "'Manrope', sans-serif" }}>
                  Все още няма добавена рецепта за това ястие.
                </p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {selectedDish.steps.map((step, i) => (
                    <div key={i} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                      <div style={{ width: 26, height: 26, borderRadius: "50%", background: "#EBF1ED", color: "#2E6B4F", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13, flexShrink: 0, fontFamily: "'Manrope', sans-serif" }}>
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

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
        <h1 style={{ fontFamily: "'Lora', serif", fontSize: 34, fontWeight: 600, color: "#1E2A24", letterSpacing: "-0.015em" }}>
          Ястия
        </h1>
          <button onClick={() => { setShowForm(!showForm); setEditingDish(null); setForm(emptyForm); }} style={primaryBtn}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              {showForm ? (
                <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>
              ) : (
                <><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>
              )}
            </svg>
            {showForm ? "Затвори" : "Ново ястие"}
          </button>
      </div>

      {showForm && (
        <div style={{ background: "white", border: "1px solid #ECE8DF", borderRadius: 16, padding: "24px 28px", marginBottom: 24 }}>
          <h3 style={{ fontFamily: "'Lora', serif", fontSize: 22, fontWeight: 600, color: "#1E2A24", marginBottom: 20 }}>
            {editingDish ? "Редактирай ястие" : "Ново ястие"}
          </h3>
          <input placeholder="Название" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={inputStyle} />
          <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} style={inputStyle}>
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
          <input placeholder="Описание (по избор)" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} style={inputStyle} />

          {/* Съставки */}
          <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", color: "#6F7B73", textTransform: "uppercase", marginTop: 16, marginBottom: 8 }}>
            СЪСТАВКИ
          </p>
          {form.ingredients.map((ing, idx) => (
            <div key={idx} style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "center" }}>
              <input
                placeholder="Продукт"
                value={ing.product}
                onChange={(e) => updateIngredientRow(idx, "product", e.target.value)}
                style={{ ...inputStyle, marginBottom: 0, flex: 2 }}
              />
              <input
                placeholder="Кол."
                type="number"
                value={ing.amount}
                onChange={(e) => updateIngredientRow(idx, "amount", e.target.value)}
                style={{ ...inputStyle, marginBottom: 0, flex: 1, minWidth: 70 }}
              />
              <select
                value={ing.unit}
                onChange={(e) => updateIngredientRow(idx, "unit", e.target.value)}
                style={{ ...inputStyle, marginBottom: 0, flex: 1, minWidth: 80 }}
              >
                {UNITS.map((u) => <option key={u}>{u}</option>)}
              </select>
              <button onClick={() => removeIngredientRow(idx)} style={{ ...dangerBtn, padding: "10px 12px", flexShrink: 0 }}>✕</button>
            </div>
          ))}
          <button onClick={addIngredientRow} style={{ ...ghostBtn, marginBottom: 16 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Добави продукт
          </button>

          <textarea placeholder="Стъпки на рецептата (всяка на нов ред)" value={form.steps} onChange={(e) => setForm({ ...form, steps: e.target.value })} rows={4} style={inputStyle} />
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={saveDish} style={primaryBtn}>Запази</button>
            <button onClick={() => { setShowForm(false); setEditingDish(null); setForm(emptyForm); }} style={ghostBtn}>Отказ</button>
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 20 }}>
        {["Всички", ...CATEGORIES].map((cat) => (
          <button key={cat} onClick={() => setActiveCategory(cat)} style={{
            padding: "6px 14px", borderRadius: 999, border: "1.5px solid",
            fontWeight: 600, fontSize: 12, fontFamily: "'Manrope', sans-serif",
            borderColor: activeCategory === cat ? "#2E6B4F" : "#E2DDD3",
            background: activeCategory === cat ? "#2E6B4F" : "white",
            color: activeCategory === cat ? "white" : "#3A463F",
            transition: "all .15s",
          }}>
            {cat}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p style={{ textAlign: "center", color: "#B6BAB2", padding: "3rem", fontFamily: "'Manrope', sans-serif" }}>
          Няма ястия в тази категория. Добави първото!
        </p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))", gap: 16 }}>
          {filtered.map((dish) => {
            const catStyle = CAT_COLORS[dish.category] || { bg: "#F0EDE5", color: "#5E6B63" };
            return (
              <div key={dish.id} onClick={() => setSelectedDish(dish)} style={{
                background: "white", border: "1px solid #ECE8DF", borderRadius: 16,
                padding: 20, cursor: "pointer",
                boxShadow: "0 1px 2px rgba(30,42,36,0.04)",
                transition: "transform .15s, box-shadow .15s, border-color .15s",
              }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 6px 18px rgba(30,42,36,0.08)"; e.currentTarget.style.borderColor = "#2E6B4F"; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 1px 2px rgba(30,42,36,0.04)"; e.currentTarget.style.borderColor = "#ECE8DF"; }}
              >
                <span style={{ display: "inline-block", background: catStyle.bg, color: catStyle.color, borderRadius: 6, padding: "2px 8px", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 10 }}>
                  {dish.category}
                </span>
                <p style={{ fontFamily: "'Lora', serif", fontSize: 18, fontWeight: 600, color: "#1E2A24" }}>
                  {dish.name}
                </p>
                {dish.description && (
                  <p style={{ color: "#6F7B73", fontSize: 13, marginTop: 6, fontFamily: "'Manrope', sans-serif" }}>
                    {dish.description.substring(0, 60)}...
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const primaryBtn = {
  display: "flex", alignItems: "center", gap: 6,
  padding: "9px 18px", borderRadius: 11, border: "none",
  background: "#2E6B4F", color: "white",
  fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: 14,
  cursor: "pointer",
};

const ghostBtn = {
  display: "flex", alignItems: "center", gap: 6,
  padding: "8px 16px", borderRadius: 10,
  border: "1.5px solid #DDD8CE", background: "white",
  fontFamily: "'Manrope', sans-serif", fontWeight: 600, fontSize: 14,
  color: "#1E2A24", cursor: "pointer",
};

const dangerBtn = {
  display: "flex", alignItems: "center", gap: 6,
  padding: "8px 16px", borderRadius: 10,
  border: "1.5px solid #E4C4BB", background: "white",
  fontFamily: "'Manrope', sans-serif", fontWeight: 600, fontSize: 14,
  color: "#A0432E", cursor: "pointer",
};

const inputStyle = {
  width: "100%", padding: "10px 14px", marginBottom: 12,
  borderRadius: 10, border: "1.5px solid #E2DDD3",
  fontFamily: "'Manrope', sans-serif", fontSize: 14,
  color: "#1E2A24", outline: "none", boxSizing: "border-box",
  background: "white",
};