export default function Navbar({ activePage, setActivePage, familyCode }) {
  return (
    <nav style={{
      background: "white",
      padding: "0.75rem 1rem",
      boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
      fontFamily: "sans-serif",
    }}>
      {/* Ред 1 */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.6rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
          <span style={{ fontSize: "1.2rem" }}>🍽️</span>
          <span style={{ fontWeight: "700", color: "#4A7C59", fontSize: "0.95rem" }}>
            Семейно Меню
          </span>
        </div>
        <div style={{
          fontSize: "0.72rem",
          color: "#888",
          background: "#EAF2EC",
          padding: "0.25rem 0.6rem",
          borderRadius: "6px",
        }}>
          Код: <strong style={{ color: "#4A7C59" }}>{familyCode}</strong>
        </div>
      </div>

      {/* Ред 2 */}
      <div style={{ display: "flex", gap: "0.4rem" }}>
        {[
          { id: "menu", label: "📅 Меню" },
          { id: "create", label: "✏️ Създай" },
          { id: "dishes", label: "🍲 Ястия" },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setActivePage(item.id)}
            style={{
              padding: "0.4rem 0.75rem",
              borderRadius: "8px",
              border: "none",
              cursor: "pointer",
              fontWeight: "600",
              fontSize: "0.78rem",
              background: activePage === item.id ? "#4A7C59" : "#EAF2EC",
              color: activePage === item.id ? "white" : "#4A7C59",
            }}
          >
            {item.label}
          </button>
        ))}
      </div>
    </nav>
  );
}