import { useState, useEffect } from "react";
import { db } from "../firebase/config";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  doc,
  updateDoc,
  deleteDoc,
  getDoc,
  setDoc,
} from "firebase/firestore";

const CATEGORIES = ["Закуски", "Основни ястия", "Месо", "Гарнитури", "Десерти"];

const emptyForm = {
  name: "",
  category: "Основни ястия",
  description: "",
  ingredients: "",
  steps: "",
};

export default function Dishes({ familyCode }) {
  const [dishes, setDishes] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [activeCategory, setActiveCategory] = useState("Всички");
  const [selectedDish, setSelectedDish] = useState(null);
  const [editingDish, setEditingDish] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    loadDishes();
  }, []);

  const loadDishes = async () => {
    const q = query(
      collection(db, "dishes"),
      where("familyCode", "==", familyCode)
    );
    const snap = await getDocs(q);
    setDishes(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  };

  const saveDish = async () => {
    if (!form.name.trim()) return;
    const data = {
      ...form,
      familyCode,
      ingredients: form.ingredients.split("\n").filter(Boolean),
      steps: form.steps.split("\n").filter(Boolean),
    };
    if (editingDish) {
      await updateDoc(doc(db, "dishes", editingDish.id), data);
    } else {
      await addDoc(collection(db, "dishes"), data);
    }
    setForm(emptyForm);
    setShowForm(false);
    setEditingDish(null);
    loadDishes();
  };

const deleteDish = async () => {
  await deleteDoc(doc(db, "dishes", selectedDish.id));
  
  // Премахване от менюто
  const menuRef = doc(db, "menus", familyCode);
  const menuSnap = await getDoc(menuRef);
  if (menuSnap.exists()) {
    const currentMenu = menuSnap.data().menu || {};
    const updatedMenu = {};
    for (const day in currentMenu) {
      updatedMenu[day] = {};
      for (const meal in currentMenu[day]) {
        updatedMenu[day][meal] = currentMenu[day][meal].filter(
          (d) => d.id !== selectedDish.id
        );
      }
    }
    await setDoc(menuRef, { menu: updatedMenu });
  }

  setSelectedDish(null);
  setConfirmDelete(false);
  loadDishes();
};

  const startEdit = (dish) => {
    setEditingDish(dish);
    setForm({
      name: dish.name,
      category: dish.category,
      description: dish.description || "",
      ingredients: dish.ingredients.join("\n"),
      steps: dish.steps.join("\n"),
    });
    setSelectedDish(null);
    setShowForm(true);
  };

  const filtered = activeCategory === "Всички"
    ? dishes
    : dishes.filter((d) => d.category === activeCategory);

  // Страница на ястие
  if (selectedDish) return (
    <div style={{ fontFamily: "sans-serif" }}>
      <button onClick={() => { setSelectedDish(null); setConfirmDelete(false); }} style={backBtn}>
        ← Назад
      </button>
      <div style={card}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: "0.75rem", color: "#888", marginBottom: "0.25rem" }}>
              {selectedDish.category}
            </div>
            <h2 style={{ color: "#4A7C59", marginBottom: "0.5rem" }}>{selectedDish.name}</h2>
          </div>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button onClick={() => startEdit(selectedDish)} style={editBtn}>
              ✏️ Редактирай
            </button>
            <button onClick={() => setConfirmDelete(true)} style={deleteBtn}>
              🗑️ Изтрий
            </button>
          </div>
        </div>

        {confirmDelete && (
          <div style={{
            background: "#fff3f3",
            border: "1.5px solid #ffaaaa",
            borderRadius: "10px",
            padding: "1rem",
            marginBottom: "1rem"
          }}>
            <p style={{ color: "#c0392b", fontWeight: "600", marginBottom: "0.75rem" }}>
              Сигурен ли си че искаш да изтриеш "{selectedDish.name}"?
            </p>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button onClick={deleteDish} style={deleteBtn}>Да, изтрий</button>
              <button onClick={() => setConfirmDelete(false)} style={editBtn}>Отказ</button>
            </div>
          </div>
        )}

        {selectedDish.description && (
          <p style={{ color: "#555", marginBottom: "1.5rem" }}>{selectedDish.description}</p>
        )}

        <h3 style={{ color: "#4A7C59", marginBottom: "0.75rem" }}>🥕 Съставки</h3>
        <ul style={{ paddingLeft: "1.2rem", marginBottom: "1.5rem" }}>
          {selectedDish.ingredients.map((ing, i) => (
            <li key={i} style={{ marginBottom: "0.3rem", color: "#333" }}>{ing}</li>
          ))}
        </ul>

        <h3 style={{ color: "#4A7C59", marginBottom: "0.75rem" }}>📝 Рецепта</h3>
        <ol style={{ paddingLeft: "1.2rem" }}>
          {selectedDish.steps.map((step, i) => (
            <li key={i} style={{ marginBottom: "0.5rem", color: "#333" }}>{step}</li>
          ))}
        </ol>
      </div>
    </div>
  );

  return (
    <div style={{ fontFamily: "sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h2 style={{ color: "#4A7C59" }}>🍲 Ястия</h2>
        <button onClick={() => {
          setShowForm(!showForm);
          setEditingDish(null);
          setForm(emptyForm);
        }} style={btnStyle}>
          {showForm ? "✕ Затвори" : "➕ Ново ястие"}
        </button>
      </div>

      {showForm && (
        <div style={{ ...card, marginBottom: "1.5rem" }}>
          <h3 style={{ color: "#4A7C59", marginBottom: "1rem" }}>
            {editingDish ? "Редактирай ястие" : "Ново ястие"}
          </h3>
          <input
            placeholder="Название"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            style={inputStyle}
          />
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            style={inputStyle}
          >
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
          <input
            placeholder="Описание (по избор)"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            style={inputStyle}
          />
          <textarea
            placeholder="Съставки (всяка на нов ред)"
            value={form.ingredients}
            onChange={(e) => setForm({ ...form, ingredients: e.target.value })}
            rows={4}
            style={inputStyle}
          />
          <textarea
            placeholder="Стъпки на рецептата (всяка на нов ред)"
            value={form.steps}
            onChange={(e) => setForm({ ...form, steps: e.target.value })}
            rows={4}
            style={inputStyle}
          />
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button onClick={saveDish} style={btnStyle}>💾 Запази</button>
            <button onClick={() => { setShowForm(false); setEditingDish(null); setForm(emptyForm); }} style={editBtn}>
              Отказ
            </button>
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
        {["Всички", ...CATEGORIES].map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            style={{
              padding: "0.4rem 0.9rem",
              borderRadius: "20px",
              border: "none",
              cursor: "pointer",
              fontWeight: "600",
              fontSize: "0.8rem",
              background: activeCategory === cat ? "#4A7C59" : "white",
              color: activeCategory === cat ? "white" : "#4A7C59",
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", color: "#aaa", padding: "3rem" }}>
          Няма ястия в тази категория. Добави първото! 🍽️
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "1rem" }}>
          {filtered.map((dish) => (
            <div
              key={dish.id}
              onClick={() => setSelectedDish(dish)}
              style={{
                background: "white",
                borderRadius: "12px",
                padding: "1.2rem",
                cursor: "pointer",
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                borderLeft: "4px solid #4A7C59"
              }}
            >
              <div style={{ fontSize: "0.7rem", color: "#888", marginBottom: "0.25rem" }}>{dish.category}</div>
              <div style={{ fontWeight: "600", color: "#1C1C1C" }}>{dish.name}</div>
              {dish.description && (
                <div style={{ fontSize: "0.8rem", color: "#666", marginTop: "0.3rem" }}>
                  {dish.description.substring(0, 60)}...
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const card = {
  background: "white",
  borderRadius: "14px",
  padding: "1.5rem",
  boxShadow: "0 2px 8px rgba(0,0,0,0.06)"
};

const inputStyle = {
  width: "100%",
  padding: "0.75rem",
  marginBottom: "0.75rem",
  borderRadius: "8px",
  border: "1.5px solid #D8E4DA",
  fontSize: "0.9rem",
  outline: "none",
  boxSizing: "border-box",
  fontFamily: "sans-serif"
};

const btnStyle = {
  padding: "0.6rem 1.2rem",
  background: "#4A7C59",
  color: "white",
  border: "none",
  borderRadius: "8px",
  fontSize: "0.9rem",
  fontWeight: "600",
  cursor: "pointer"
};

const editBtn = {
  padding: "0.5rem 1rem",
  background: "white",
  color: "#4A7C59",
  border: "2px solid #4A7C59",
  borderRadius: "8px",
  fontSize: "0.85rem",
  fontWeight: "600",
  cursor: "pointer"
};

const deleteBtn = {
  padding: "0.5rem 1rem",
  background: "white",
  color: "#c0392b",
  border: "2px solid #c0392b",
  borderRadius: "8px",
  fontSize: "0.85rem",
  fontWeight: "600",
  cursor: "pointer"
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